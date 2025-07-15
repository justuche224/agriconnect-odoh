export interface WebSocketUser {
  id: string;
  connectionId: string;
  conversationIds: string[];
}

export interface WebSocketMessage {
  type:
    | "MESSAGE_NEW"
    | "MESSAGE_TYPING"
    | "USER_ONLINE"
    | "USER_OFFLINE"
    | "CONVERSATION_UPDATED";
  data: any;
  timestamp: Date;
}

export interface MessageNewEvent {
  type: "MESSAGE_NEW";
  data: {
    conversationId: string;
    message: {
      id: string;
      content: string | null;
      messageType: string;
      imageUrl: string | null;
      createdAt: Date;
      isEdited: boolean;
      sender: {
        id: string;
        name: string;
        email: string;
        image: string | null;
      };
      isOwn: boolean;
    };
  };
  timestamp: Date;
}

export interface MessageTypingEvent {
  type: "MESSAGE_TYPING";
  data: {
    conversationId: string;
    userId: string;
    userName: string;
    isTyping: boolean;
  };
  timestamp: Date;
}

export interface UserOnlineEvent {
  type: "USER_ONLINE";
  data: {
    userId: string;
    userName: string;
  };
  timestamp: Date;
}

export interface UserOfflineEvent {
  type: "USER_OFFLINE";
  data: {
    userId: string;
  };
  timestamp: Date;
}

export interface ConversationUpdatedEvent {
  type: "CONVERSATION_UPDATED";
  data: {
    conversationId: string;
    lastMessageAt: Date;
    lastMessage: {
      id: string | null;
      content: string | null;
      messageType: string | null;
      imageUrl: string | null;
      createdAt: Date | null;
      senderId: string | null;
      senderName: string | null;
    } | null;
  };
  timestamp: Date;
}

export type WebSocketEventUnion =
  | MessageNewEvent
  | MessageTypingEvent
  | UserOnlineEvent
  | UserOfflineEvent
  | ConversationUpdatedEvent;

export interface WebSocketConnection {
  ws: WebSocket;
  userId: string;
  connectionId: string;
  isAlive: boolean;
  conversationIds: Set<string>;
}
