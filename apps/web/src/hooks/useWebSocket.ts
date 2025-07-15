import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error";

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

interface UseWebSocketOptions {
  url: string;
  enabled?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket({
  url,
  enabled = true,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions) {
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  // Send message function
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Send typing indicator
  const sendTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "MESSAGE_TYPING",
            conversationId,
            isTyping,
          })
        );
      }
    },
    []
  );

  // Handle incoming messages
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        // Convert timestamp if it exists
        if (message.timestamp && typeof message.timestamp === "string") {
          message.timestamp = new Date(message.timestamp).toISOString();
        }

        setLastMessage(message);

        switch (message.type) {
          case "MESSAGE_NEW":
            // Update messages cache
            queryClient.setQueryData(
              ["messages", message.data.conversationId],
              (old: any) => {
                if (!old) return old;

                // Check if message already exists to avoid duplicates
                const messageExists = old.messages.some(
                  (msg: any) => msg.id === message.data.message.id
                );
                if (messageExists) return old;

                // Convert date strings to Date objects
                const newMessage = {
                  ...message.data.message,
                  createdAt: new Date(message.data.message.createdAt),
                  isOwn: false,
                };

                return {
                  ...old,
                  messages: [...old.messages, newMessage],
                };
              }
            );

            // Update conversations cache
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            break;

          case "CONVERSATION_UPDATED":
            // Update conversations list
            queryClient.setQueryData(["conversations"], (old: any) => {
              if (!old) return old;

              return {
                ...old,
                conversations: old.conversations.map((conv: any) =>
                  conv.conversation.id === message.data.conversationId
                    ? {
                        ...conv,
                        conversation: {
                          ...conv.conversation,
                          lastMessageAt: new Date(message.data.lastMessageAt),
                        },
                        lastMessage: message.data.lastMessage
                          ? {
                              ...message.data.lastMessage,
                              createdAt: new Date(
                                message.data.lastMessage.createdAt
                              ),
                            }
                          : null,
                      }
                    : conv
                ),
              };
            });
            break;

          case "MESSAGE_TYPING":
            // Handle typing indicator
            // This would typically update some local state
            console.log("User typing:", message.data);
            break;

          case "CONNECTION_ESTABLISHED":
            console.log("WebSocket connection established:", message.data);
            break;

          case "HEARTBEAT":
            // Respond to heartbeat using direct ws reference to avoid dependency loop
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({ type: "HEARTBEAT_RESPONSE" })
              );
            }
            break;

          default:
            console.log("Unknown message type:", message.type);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    },
    [] // Remove dependencies to prevent infinite loops - using refs instead
  );

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Prevent multiple simultaneous connections
    if (
      !enabled ||
      wsRef.current?.readyState === WebSocket.CONNECTING ||
      wsRef.current?.readyState === WebSocket.OPEN
    ) {
      return;
    }

    try {
      setStatus("connecting");

      // Create WebSocket with credentials
      const wsUrl = url.replace("http", "ws");
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setStatus("connected");
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = handleMessage;

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setStatus("disconnected");
        wsRef.current = null;
        onDisconnect?.();

        // Only attempt to reconnect for unexpected disconnections
        // 1000 = normal closure, 1001 = going away, 1008 = policy violation (unauthorized)
        if (
          enabled &&
          event.code !== 1000 &&
          event.code !== 1001 &&
          event.code !== 1008 &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current++;
          console.log(
            `Reconnecting in ${reconnectInterval}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (event.code === 1008) {
          console.log("WebSocket closed due to authentication failure");
          toast.error("Authentication failed", {
            description: "Please refresh the page and log in again.",
          });
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.log("Max reconnection attempts reached");
          toast.error("Connection lost", {
            description:
              "Unable to reconnect to the server. Please refresh the page.",
          });
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setStatus("error");
        onError?.(error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setStatus("error");
    }
  }, [enabled, url]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect");
      wsRef.current = null;
    }

    setStatus("disconnected");
  }, []);

  // Setup connection on mount
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled]); // Remove connect/disconnect from dependencies to prevent infinite loops

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    status,
    lastMessage,
    sendMessage,
    sendTyping,
    connect,
    disconnect,
    isConnected: status === "connected",
  };
}
