"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchApi, WS_BASE_URL } from "@/config/api";
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
  totalProductsCount: number;
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
    globalAudioCtx.resume().catch(() => { });
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
  } catch { }
}

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [totalProductsCount, setTotalProductsCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [toastState, setToastState] = useState<ToastMessage | null>(null);

  const triggerToast = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastState({
      id: String(Date.now()),
      type,
      title,
      message,
    });
  }, []);

  // Fetch initial notifications ONCE on mount
  const refreshNotifications = useCallback(async () => {
    try {
      // Fetch products count
      const prodRes = await fetchApi("/admin/products?limit=1");
      if (prodRes.ok) {
        const total = prodRes.pagination?.total || (Array.isArray(prodRes.data) ? prodRes.data.length : 0);
        setTotalProductsCount(total);
      }

      const res = await fetchApi("/orders/admin?limit=50");
      if (res.ok && res.data) {
        const rawOrders = Array.isArray(res.data) ? res.data : (res.data.orders || []);

        const lastReadTime = typeof window !== "undefined"
          ? Number(localStorage.getItem("quyba_admin_last_read_time") || 0)
          : 0;

        // Deduplicate orders by unique id
        const uniqueOrdersMap = new Map<string, any>();
        rawOrders.forEach((o: any) => {
          if (o.id && !uniqueOrdersMap.has(String(o.id))) {
            uniqueOrdersMap.set(String(o.id), o);
          }
        });
        const uniqueOrders = Array.from(uniqueOrdersMap.values());

        // Map notifications list from unique recent orders
        const notificationItems: AdminNotificationItem[] = uniqueOrders.slice(0, 10).map((o) => {
          const orderTimeMs = o.createdAt ? new Date(o.createdAt).getTime() : 0;
          const formattedTime = new Date(o.createdAt || Date.now()).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const isUnreadPending = o.status === "pending" && orderTimeMs > lastReadTime;

          return {
            id: String(o.id),
            orderCode: o.orderCode,
            customerName: o.customerName || "Khách hàng Q.BA",
            customerPhone: o.customerPhone,
            title: `Yêu cầu báo giá [${o.orderCode}]`,
            message: `${o.customerName || "Khách hàng"} (${o.customerPhone}) - ${o.items?.length || 1} mã phụ tùng`,
            time: formattedTime,
            isRead: !isUnreadPending,
          };
        });

        const unreadCount = notificationItems.filter((n) => !n.isRead).length;

        setNotifications(notificationItems);
        setPendingCount(unreadCount);
        setUnreadNotificationsCount(unreadCount);
      }
    } catch {
      // Keep existing
    }
  }, []);

  // 100% Real-Time WebSocket state push (NO REPETITIVE HTTP FETCHES)
  useEffect(() => {
    let isUnmounted = false;
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    // Fetch initial state once on mount
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

    // Setup WebSocket Client Connection
    const connectWebSocket = () => {
      if (isUnmounted) return;

      try {
        const wsUrl = typeof window !== "undefined"
          ? (WS_BASE_URL.startsWith("ws") ? WS_BASE_URL : `ws://${window.location.hostname}:5000/ws`)
          : "ws://localhost:5000/ws";

        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (!isUnmounted) {
            console.log("⚡ [Admin WebSocket] Real-Time WebSocket connected successfully!");
          }
        };

        ws.onmessage = (event) => {
          if (isUnmounted) return;
          try {
            const message = JSON.parse(event.data);

            if (message.type === "NEW_ORDER" && message.data) {
              const newOrder = message.data;

              playChimeSound();
              triggerToast(
                "🔔 BÁO GIÁ MỚI GỬI ĐẾN!",
                `Đã nhận đơn báo giá [${newOrder?.orderCode || 'MỚI'}] từ ${newOrder?.customerName || 'Khách'} (${newOrder?.customerPhone})!`,
                "success"
              );

              // 1. Direct local state update via WebSocket (Zero HTTP Call)
              const formattedTime = new Date(newOrder.createdAt || Date.now()).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              });

              const newNotifItem: AdminNotificationItem = {
                id: String(newOrder.id),
                orderCode: newOrder.orderCode,
                customerName: newOrder.customerName || "Khách hàng Q.BA",
                customerPhone: newOrder.customerPhone,
                title: `Yêu cầu báo giá [${newOrder.orderCode}]`,
                message: `${newOrder.customerName || "Khách hàng"} (${newOrder.customerPhone}) - ${newOrder.items?.length || 1} mã phụ tùng`,
                time: formattedTime,
                isRead: false,
              };

              setNotifications((prev) => {
                const exists = prev.some((item) => item.id === newNotifItem.id);
                if (exists) return prev;
                return [newNotifItem, ...prev.slice(0, 9)];
              });

              setPendingCount((prev) => prev + 1);
              setUnreadNotificationsCount((prev) => prev + 1);

              // Dispatch custom event for child pages with payload
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("quyba_ws_new_order", { detail: newOrder }));
              }
            } else if (message.type === "ORDER_STATUS_UPDATED" && message.orderId) {
              const { orderId, newStatus } = message;

              // 2. Direct local status update via WebSocket (Zero HTTP Call)
              setNotifications((prev) =>
                prev.map((item) =>
                  item.id === String(orderId) ? { ...item, isRead: newStatus !== "pending" } : item
                )
              );

              if (newStatus !== "pending") {
                setPendingCount((prev) => Math.max(0, prev - 1));
                setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
              }

              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("quyba_ws_status_update", { detail: message }));
              }
            }
          } catch { }
        };

        ws.onclose = () => {
          if (isUnmounted) return;
          reconnectTimeout = setTimeout(() => {
            connectWebSocket();
          }, 5000);
        };

        ws.onerror = () => { };
      } catch { }
    };

    connectWebSocket();

    return () => {
      isUnmounted = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      }
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("pointerdown", handleUserInteraction);
    };
  }, [refreshNotifications, triggerToast]);

  const markAllAsRead = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("quyba_admin_last_read_time", Date.now().toString());
    }
    setUnreadNotificationsCount(0);
    setPendingCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  return (
    <AdminNotificationContext.Provider
      value={{
        pendingCount,
        unreadNotificationsCount,
        totalProductsCount,
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
