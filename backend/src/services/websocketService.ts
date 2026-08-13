import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

let wss: WebSocketServer | null = null;

/**
 * Initialize WebSocket Server attached to backend HTTP Server
 */
export function initWebSocketServer(server: HTTPServer) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    // Send initial handshake confirmation
    ws.send(JSON.stringify({ type: "CONNECTED", message: "Connected to Q.BA Real-Time WebSocket Server" }));

    // Keep connection alive with ping-pong
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);

    ws.on("close", () => {
      clearInterval(pingInterval);
    });
  });

  console.log("⚡ [Q.BA WebSocket] Real-Time Service initialized on /ws");
}

/**
 * Broadcast NEW Order Request to all connected clients (Admin Dashboard)
 */
export function broadcastNewOrder(orderData: any) {
  if (!wss) return;

  const payload = JSON.stringify({
    type: "NEW_ORDER",
    data: orderData,
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

/**
 * Broadcast Order Status Update to all connected clients
 */
export function broadcastOrderStatusUpdate(orderId: number | string, newStatus: string) {
  if (!wss) return;

  const payload = JSON.stringify({
    type: "ORDER_STATUS_UPDATED",
    orderId: String(orderId),
    newStatus,
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
