"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchApi } from "@/config/api";
import ToastNotification, { ToastMessage } from "@/components/ui/ToastNotification";

export interface AdminNotificationItem {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface AdminNotificationContextType {
  pendingCount: number;
  unreadNotificationsCount: number;
  notifications: AdminNotificationItem[];
  playChimeSound: () => void;
  refreshNotifications: () => Promise<void>;
  markAllAsRead: () => void;
  triggerToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | null>(null);

let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!globalAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === "suspended") {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
}

export function playChimeSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tone 1: C5 (523.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Tone 2: E5 (659.25Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(659.25, now + 0.12);
    gain2.gain.setValueAtTime(0.45, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);

    // Tone 3: G5 (783.99Hz) Chime Ring
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(783.99, now + 0.25);
    gain3.gain.setValueAtTime(0.5, now + 0.25);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.25);
    osc3.stop(now + 0.85);
  } catch {}
}

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [toastState, setToastState] = useState<ToastMessage | null>(null);
  const [lastKnownMaxOrderId, setLastKnownMaxOrderId] = useState<number | null>(null);

  const triggerToast = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastState({
      id: String(Date.now()),
      type,
      title,
      message,
    });
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const res = await fetchApi("/orders/admin?limit=20");
      if (res.ok && res.data) {
        const orders: any[] = res.data;
        const pending = orders.filter((o) => o.status === "pending").length;

        // Map notifications list from recent pending orders
        const notificationItems: AdminNotificationItem[] = orders.slice(0, 10).map((o) => {
          const formattedTime = new Date(o.createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return {
            id: String(o.id),
            orderCode: o.orderCode,
            customerName: o.customerName || "Khách hàng Q.BA",
            customerPhone: o.customerPhone,
            title: `Yêu cầu báo giá [${o.orderCode}]`,
            message: `${o.customerName || "Khách hàng"} (${o.customerPhone}) - ${o.items?.length || 1} mã phụ tùng`,
            time: formattedTime,
            isRead: o.status !== "pending",
          };
        });

        setNotifications(notificationItems);
        setPendingCount(pending);

        // Detect NEW incoming quotation request order by Max Order ID!
        const maxId = orders.length > 0 ? Math.max(...orders.map((o) => Number(o.id))) : 0;

        if (lastKnownMaxOrderId !== null && maxId > lastKnownMaxOrderId) {
          playChimeSound();
          const latestOrder = orders[0];
          triggerToast(
            "🔔 BÁO GIÁ MỚI GỬI ĐẾN!",
            `Đã nhận đơn báo giá [${latestOrder?.orderCode || 'MỚI'}] từ ${latestOrder?.customerName || 'Khách'} (${latestOrder?.customerPhone})!`,
            "success"
          );
          setUnreadNotificationsCount((prev) => prev + (maxId - lastKnownMaxOrderId));
        } else if (lastKnownMaxOrderId === null) {
          setUnreadNotificationsCount(pending > 0 ? pending : 0);
        }

        if (lastKnownMaxOrderId === null || maxId > lastKnownMaxOrderId) {
          setLastKnownMaxOrderId(maxId);
        }
      }
    } catch {
      // Keep existing
    }
  }, [lastKnownMaxOrderId, triggerToast]);

  // Initial fetch, 3-second fast polling, user interaction unlocker & cross-tab BroadcastChannel
  useEffect(() => {
    refreshNotifications();

    // Auto-unlock AudioContext on first user interaction in Admin
    const handleUserInteraction = () => {
      getAudioContext();
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("pointerdown", handleUserInteraction);
    };

    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);
    window.addEventListener("pointerdown", handleUserInteraction);

    const interval = setInterval(() => {
      refreshNotifications();
    }, 8000);

    const handleNewOrder = () => {
      refreshNotifications();
    };

    window.addEventListener("quyba_new_order", handleNewOrder);
    window.addEventListener("focus", handleNewOrder);

    // Cross-tab BroadcastChannel listener
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("quyba_order_channel");
      bc.onmessage = (event) => {
        if (event.data && event.data.type === "NEW_ORDER") {
          refreshNotifications();
        }
      };
    } catch {}

    // Storage event listener for cross-tab fallback
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "quyba_new_order_ping") {
        refreshNotifications();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("quyba_new_order", handleNewOrder);
      window.removeEventListener("focus", handleNewOrder);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("pointerdown", handleUserInteraction);
      if (bc) bc.close();
    };
  }, [refreshNotifications]);

  const markAllAsRead = useCallback(() => {
    setUnreadNotificationsCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  return (
    <AdminNotificationContext.Provider
      value={{
        pendingCount,
        unreadNotificationsCount,
        notifications,
        playChimeSound,
        refreshNotifications,
        markAllAsRead,
        triggerToast,
      }}
    >
      {children}
      <ToastNotification toast={toastState} onClose={() => setToastState(null)} />
    </AdminNotificationContext.Provider>
  );
}

export function useAdminNotification() {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    throw new Error("useAdminNotification must be used within an AdminNotificationProvider");
  }
  return context;
}
