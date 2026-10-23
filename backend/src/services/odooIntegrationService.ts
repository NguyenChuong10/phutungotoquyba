import crypto from "crypto";
import prisma from "../config/db";
import { ensureSystemSettingsTable } from "./settingService";

interface OdooIntegrationDetails {
  apiKey: string;
  isCustomKey: boolean;
  syncEnabled: boolean;
  lastSyncedAt: string | null;
  lastSyncCount: number | null;
  lastSyncStatus: string | null;
  lastSyncMessage: string | null;
}

// In-memory cache for fast auth validation without hitting PostgreSQL on every sync request
let cachedSecret: string | null = null;
let cachedSyncEnabled: boolean | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export class OdooIntegrationService {
  private static getFallbackSecret(): string {
    return (process.env.ODOO_SHARED_SECRET || "qba_odoo_enterprise_m2m_hmac_secret_2026_super_secure").trim();
  }

  /**
   * Get the active Odoo shared secret / API Key.
   * Priority: Database (system_settings: odoo_shared_secret) -> Environment Variable -> Default.
   */
  static async getActiveSecret(): Promise<string> {
    const now = Date.now();
    if (cachedSecret && now < cacheExpiresAt) {
      return cachedSecret;
    }

    await ensureSystemSettingsTable();
    try {
      const record = await prisma.systemSetting.findUnique({
        where: { key: "odoo_shared_secret" },
      });

      if (record && record.value && record.value.trim().length > 0) {
        cachedSecret = record.value.trim();
      } else {
        cachedSecret = this.getFallbackSecret();
      }
    } catch (err) {
      cachedSecret = this.getFallbackSecret();
    }

    cacheExpiresAt = now + CACHE_TTL_MS;
    return cachedSecret;
  }

  /**
   * Check if Odoo sync integration is currently enabled
   */
  static async isSyncEnabled(): Promise<boolean> {
    await ensureSystemSettingsTable();
    try {
      const record = await prisma.systemSetting.findUnique({
        where: { key: "odoo_sync_enabled" },
      });

      return record ? record.value !== "false" : true;
    } catch (err) {
      return true;
    }
  }

  /**
   * Invalidate in-memory cache
   */
  static invalidateCache() {
    cachedSecret = null;
    cachedSyncEnabled = null;
    cacheExpiresAt = 0;
  }

  /**
   * Get full Odoo Integration Details for Admin UI
   */
  static async getIntegrationDetails(): Promise<OdooIntegrationDetails> {
    await ensureSystemSettingsTable();

    const keys = [
      "odoo_shared_secret",
      "odoo_sync_enabled",
      "odoo_last_synced_at",
      "odoo_last_sync_count",
      "odoo_last_sync_status",
      "odoo_last_sync_message",
    ];

    const records = await prisma.systemSetting.findMany({
      where: { key: { in: keys } },
    });

    const settingsMap = new Map<string, string>();
    for (const r of records) {
      settingsMap.set(r.key, r.value);
    }

    const dbSecret = settingsMap.get("odoo_shared_secret");
    const isCustomKey = Boolean(dbSecret && dbSecret.trim().length > 0);
    const apiKey = isCustomKey ? dbSecret!.trim() : this.getFallbackSecret();

    const syncEnabledVal = settingsMap.get("odoo_sync_enabled");
    const syncEnabled = syncEnabledVal !== undefined ? syncEnabledVal !== "false" : true;

    const lastSyncedAt = settingsMap.get("odoo_last_synced_at") || null;
    const lastSyncCountStr = settingsMap.get("odoo_last_sync_count");
    const lastSyncCount = lastSyncCountStr ? parseInt(lastSyncCountStr, 10) : null;
    const lastSyncStatus = settingsMap.get("odoo_last_sync_status") || null;
    const lastSyncMessage = settingsMap.get("odoo_last_sync_message") || null;

    return {
      apiKey,
      isCustomKey,
      syncEnabled,
      lastSyncedAt,
      lastSyncCount,
      lastSyncStatus,
      lastSyncMessage,
    };
  }

  /**
   * Generate a fresh, cryptographically secure API Key
   */
  static async regenerateApiKey(): Promise<{ apiKey: string }> {
    await ensureSystemSettingsTable();

    // Standard high-entropy API key format: qba_live_<48 hex chars>
    const randomHex = crypto.randomBytes(24).toString("hex");
    const newKey = `qba_live_${randomHex}`;

    await prisma.systemSetting.upsert({
      where: { key: "odoo_shared_secret" },
      update: { value: newKey },
      create: { key: "odoo_shared_secret", value: newKey },
    });

    this.invalidateCache();
    return { apiKey: newKey };
  }

  /**
   * Update Odoo Integration Settings (manual key, enable/disable toggle)
   */
  static async updateSettings(data: {
    apiKey?: string;
    syncEnabled?: boolean;
  }): Promise<OdooIntegrationDetails> {
    await ensureSystemSettingsTable();

    const updates: any[] = [];

    if (data.apiKey !== undefined) {
      const cleanKey = data.apiKey.trim();
      updates.push(
        prisma.systemSetting.upsert({
          where: { key: "odoo_shared_secret" },
          update: { value: cleanKey },
          create: { key: "odoo_shared_secret", value: cleanKey },
        })
      );
    }

    if (data.syncEnabled !== undefined) {
      const boolStr = data.syncEnabled ? "true" : "false";
      updates.push(
        prisma.systemSetting.upsert({
          where: { key: "odoo_sync_enabled" },
          update: { value: boolStr },
          create: { key: "odoo_sync_enabled", value: boolStr },
        })
      );
    }

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    this.invalidateCache();
    return await this.getIntegrationDetails();
  }

  /**
   * Record sync outcome after Odoo finishes calling syncBySku
   */
  static async recordSyncResult(params: {
    matchedCount: number;
    unmatchedCount: number;
    status?: "success" | "warning" | "error";
    message?: string;
  }) {
    try {
      await ensureSystemSettingsTable();
      const nowIso = new Date().toISOString();
      const status = params.status || "success";
      const defaultMsg = `Đồng bộ thành công ${params.matchedCount} sản phẩm (${params.unmatchedCount} chưa khớp SKU).`;

      const entries = [
        { key: "odoo_last_synced_at", value: nowIso },
        { key: "odoo_last_sync_count", value: String(params.matchedCount) },
        { key: "odoo_last_sync_status", value: status },
        { key: "odoo_last_sync_message", value: params.message || defaultMsg },
      ];

      await prisma.$transaction(
        entries.map((item) =>
          prisma.systemSetting.upsert({
            where: { key: item.key },
            update: { value: item.value },
            create: { key: item.key, value: item.value },
          })
        )
      );
    } catch (err) {
      console.error("[OdooIntegrationService] Failed to record sync result:", err);
    }
  }
}

