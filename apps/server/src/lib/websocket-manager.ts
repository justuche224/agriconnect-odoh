import type {
  WebSocketConnection,
  WebSocketEventUnion,
} from "../types/websocket";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { conversationParticipants } from "../db/schema/chat";

class WebSocketManager {
  private connections = new Map<string, WebSocketConnection>();
  private userConnections = new Map<string, Set<string>>(); // userId -> Set of connectionIds
  private conversationRooms = new Map<string, Set<string>>(); // conversationId -> Set of connectionIds

  addConnection(connection: WebSocketConnection) {
    this.connections.set(connection.connectionId, connection);

    // Track user connections
    if (!this.userConnections.has(connection.userId)) {
      this.userConnections.set(connection.userId, new Set());
    }
    this.userConnections.get(connection.userId)!.add(connection.connectionId);

    // Add to conversation rooms
    this.updateUserConversationRooms(
      connection.userId,
      connection.connectionId
    );

    console.log(
      `WebSocket connection added: ${connection.connectionId} for user ${connection.userId}`
    );
  }

  removeConnection(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Remove from user connections
    const userConnections = this.userConnections.get(connection.userId);
    if (userConnections) {
      userConnections.delete(connectionId);
      if (userConnections.size === 0) {
        this.userConnections.delete(connection.userId);
      }
    }

    // Remove from conversation rooms
    connection.conversationIds.forEach((conversationId) => {
      const room = this.conversationRooms.get(conversationId);
      if (room) {
        room.delete(connectionId);
        if (room.size === 0) {
          this.conversationRooms.delete(conversationId);
        }
      }
    });

    this.connections.delete(connectionId);
    console.log(`WebSocket connection removed: ${connectionId}`);
  }

  private async updateUserConversationRooms(
    userId: string,
    connectionId: string
  ) {
    try {
      // Get user's conversations
      const userConversations = await db
        .select({ conversationId: conversationParticipants.conversationId })
        .from(conversationParticipants)
        .where(eq(conversationParticipants.userId, userId));

      const connection = this.connections.get(connectionId);
      if (!connection) return;

      // Add connection to each conversation room
      userConversations.forEach(({ conversationId }) => {
        if (!this.conversationRooms.has(conversationId)) {
          this.conversationRooms.set(conversationId, new Set());
        }
        this.conversationRooms.get(conversationId)!.add(connectionId);
        connection.conversationIds.add(conversationId);
      });
    } catch (error) {
      console.error("Error updating user conversation rooms:", error);
    }
  }

  broadcastToConversation(
    conversationId: string,
    event: WebSocketEventUnion,
    excludeUserId?: string
  ) {
    const room = this.conversationRooms.get(conversationId);
    if (!room) return;

    const message = JSON.stringify(event);
    let sentCount = 0;

    room.forEach((connectionId) => {
      const connection = this.connections.get(connectionId);
      if (!connection || !connection.isAlive) {
        this.removeConnection(connectionId);
        return;
      }

      // Skip the sender if excludeUserId is provided
      if (excludeUserId && connection.userId === excludeUserId) {
        return;
      }

      try {
        connection.ws.send(message);
        sentCount++;
      } catch (error) {
        console.error(
          `Error sending WebSocket message to ${connectionId}:`,
          error
        );
        this.removeConnection(connectionId);
      }
    });

    console.log(
      `Broadcasted ${event.type} to conversation ${conversationId}: ${sentCount} recipients`
    );
  }

  broadcastToUser(userId: string, event: WebSocketEventUnion) {
    const userConnections = this.userConnections.get(userId);
    if (!userConnections) return;

    const message = JSON.stringify(event);
    let sentCount = 0;

    userConnections.forEach((connectionId) => {
      const connection = this.connections.get(connectionId);
      if (!connection || !connection.isAlive) {
        this.removeConnection(connectionId);
        return;
      }

      try {
        connection.ws.send(message);
        sentCount++;
      } catch (error) {
        console.error(
          `Error sending WebSocket message to ${connectionId}:`,
          error
        );
        this.removeConnection(connectionId);
      }
    });

    console.log(
      `Broadcasted ${event.type} to user ${userId}: ${sentCount} connections`
    );
  }

  broadcastToAll(event: WebSocketEventUnion) {
    const message = JSON.stringify(event);
    let sentCount = 0;

    this.connections.forEach((connection, connectionId) => {
      if (!connection.isAlive) {
        this.removeConnection(connectionId);
        return;
      }

      try {
        connection.ws.send(message);
        sentCount++;
      } catch (error) {
        console.error(
          `Error sending WebSocket message to ${connectionId}:`,
          error
        );
        this.removeConnection(connectionId);
      }
    });

    console.log(`Broadcasted ${event.type} to all: ${sentCount} connections`);
  }

  isUserOnline(userId: string): boolean {
    return this.userConnections.has(userId);
  }

  getOnlineUsers(): string[] {
    return Array.from(this.userConnections.keys());
  }

  getConnectionCount(): number {
    return this.connections.size;
  }

  // Heartbeat to check connection health
  heartbeat() {
    this.connections.forEach((connection, connectionId) => {
      if (!connection.isAlive) {
        this.removeConnection(connectionId);
        return;
      }

      // Check if WebSocket is still open
      if (connection.ws.readyState !== connection.ws.OPEN) {
        this.removeConnection(connectionId);
        return;
      }

      connection.isAlive = false;
      // Send a heartbeat message
      try {
        connection.ws.send(
          JSON.stringify({ type: "HEARTBEAT", timestamp: new Date() })
        );
      } catch (error) {
        this.removeConnection(connectionId);
      }
    });
  }

  markConnectionAlive(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.isAlive = true;
    }
  }
}

export const wsManager = new WebSocketManager();

// Start heartbeat interval
setInterval(() => {
  wsManager.heartbeat();
}, 30000); // Every 30 seconds
