import "dotenv/config";
import { RPCHandler } from "@orpc/server/fetch";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";
import { auth } from "./lib/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createBunWebSocket } from "hono/bun";
import { wsManager } from "./lib/websocket-manager";
import type { WebSocketConnection } from "./types/websocket";

const { upgradeWebSocket, websocket } = createBunWebSocket();
const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: process.env.CORS_ORIGIN || "",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

const handler = new RPCHandler(appRouter);
app.use("/rpc/*", async (c, next) => {
  const context = await createContext({ context: c });
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }
  await next();
});

// WebSocket upgrade handler with auth middleware
app.get(
  "/ws",
  async (c, next) => {
    // Pre-check authentication before WebSocket upgrade
    const context = await createContext({ context: c });
    if (!context.session?.user) {
      return c.text("Unauthorized", 401);
    }
    await next();
  },
  upgradeWebSocket((c) => {
    return {
      async onOpen(event, ws) {
        try {
          // Get session from context - check auth on connection
          const context = await createContext({ context: c });

          if (!context.session?.user) {
            console.log("WebSocket connection rejected: No valid session");
            ws.close(1008, "Unauthorized");
            return;
          }

          const userId = context.session.user.id;
          const connectionId = crypto.randomUUID();

          const connection: WebSocketConnection = {
            ws: ws as any,
            userId,
            connectionId,
            isAlive: true,
            conversationIds: new Set(),
          };

          wsManager.addConnection(connection);

          // Send connection confirmation
          ws.send(
            JSON.stringify({
              type: "CONNECTION_ESTABLISHED",
              data: { connectionId, userId },
              timestamp: new Date(),
            })
          );
        } catch (error) {
          console.error("WebSocket authentication error:", error);
          ws.close(1011, "Internal Server Error");
        }
      },

      async onMessage(event, ws) {
        try {
          const data = JSON.parse(event.data.toString());

          // Handle heartbeat response
          if (data.type === "HEARTBEAT_RESPONSE") {
            // TODO: Implement heartbeat tracking
            console.log("Heartbeat response received");
            return;
          }

          // Handle typing events
          if (data.type === "MESSAGE_TYPING") {
            // TODO: Implement typing indicator
            console.log("Typing event received:", data);
          }
        } catch (error) {
          console.error("WebSocket message error:", error);
        }
      },

      onClose() {
        // TODO: Implement connection tracking
        console.log("WebSocket connection closed");
      },

      onError(event, ws) {
        console.error("WebSocket error:", event);
      },
    };
  })
);

app.get("/", (c) => {
  return c.text("OK");
});

export default {
  fetch: app.fetch,
  websocket,
};
