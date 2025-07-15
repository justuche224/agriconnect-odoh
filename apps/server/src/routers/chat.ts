import { eq, desc, asc, sql, count, and, or, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import z from "zod";
import { db } from "../db";
import { protectedProcedure } from "../lib/orpc";
import { user } from "../db/schema/auth";
import {
  conversations,
  conversationParticipants,
  messages,
  messageReads,
} from "../db/schema/chat";
import { wsManager } from "../lib/websocket-manager";
import type {
  MessageNewEvent,
  ConversationUpdatedEvent,
} from "../types/websocket";

export const chatRouter = {
  getConversations: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().max(50).default(20),
      })
    )
    .handler(async ({ input, context }) => {
      const offset = (input.page - 1) * input.limit;
      const userId = context.session.user.id;

      const otherParticipant = alias(user, "other_participant");
      const lastMessage = alias(messages, "last_message");
      const lastSender = alias(user, "last_sender");

      const userConversations = await db
        .select({
          conversation: {
            id: conversations.id,
            title: conversations.title,
            type: conversations.type,
            createdAt: conversations.createdAt,
            lastMessageAt: conversations.lastMessageAt,
          },
          otherParticipant: {
            id: otherParticipant.id,
            name: otherParticipant.name,
            email: otherParticipant.email,
            image: otherParticipant.image,
          },
          lastMessage: {
            id: lastMessage.id,
            content: lastMessage.content,
            messageType: lastMessage.messageType,
            imageUrl: lastMessage.imageUrl,
            createdAt: lastMessage.createdAt,
            senderId: lastMessage.senderId,
            senderName: lastSender.name,
          },
          unreadCount: sql<number>`
            COALESCE((
              SELECT COUNT(*)
              FROM ${messages} m
              LEFT JOIN ${messageReads} mr ON m.id = mr.message_id AND mr.user_id = ${userId}
              WHERE m.conversation_id = ${conversations.id} 
                AND m.sender_id != ${userId}
                AND mr.id IS NULL
                AND m.is_deleted = false
            ), 0)
          `,
        })
        .from(conversationParticipants)
        .innerJoin(
          conversations,
          eq(conversationParticipants.conversationId, conversations.id)
        )
        .leftJoin(
          otherParticipant,
          and(
            eq(
              otherParticipant.id,
              sql`(
                SELECT cp2.user_id 
                FROM ${conversationParticipants} cp2 
                WHERE cp2.conversation_id = ${conversations.id} 
                  AND cp2.user_id != ${userId} 
                LIMIT 1
              )`
            )
          )
        )
        .leftJoin(
          lastMessage,
          eq(
            lastMessage.id,
            sql`(
              SELECT m.id 
              FROM ${messages} m 
              WHERE m.conversation_id = ${conversations.id} 
                AND m.is_deleted = false
              ORDER BY m.created_at DESC 
              LIMIT 1
            )`
          )
        )
        .leftJoin(lastSender, eq(lastMessage.senderId, lastSender.id))
        .where(eq(conversationParticipants.userId, userId))
        .orderBy(desc(conversations.lastMessageAt))
        .limit(input.limit)
        .offset(offset);

      const [totalCount] = await db
        .select({ count: count() })
        .from(conversationParticipants)
        .where(eq(conversationParticipants.userId, userId));

      return {
        conversations: userConversations,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: totalCount.count,
          totalPages: Math.ceil(totalCount.count / input.limit),
        },
      };
    }),

  createOrGetConversation: protectedProcedure
    .input(
      z.object({
        participantId: z.string(),
        title: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      if (userId === input.participantId) {
        throw new Error("Cannot create conversation with yourself");
      }

      const existingConversation = await db
        .select({
          conversationId: conversationParticipants.conversationId,
        })
        .from(conversationParticipants)
        .where(
          sql`${conversationParticipants.conversationId} IN (
            SELECT cp1.conversation_id 
            FROM ${conversationParticipants} cp1
            INNER JOIN ${conversationParticipants} cp2 ON cp1.conversation_id = cp2.conversation_id
            WHERE cp1.user_id = ${userId} AND cp2.user_id = ${input.participantId}
              AND cp1.conversation_id IN (
                SELECT conversation_id 
                FROM ${conversationParticipants} 
                GROUP BY conversation_id 
                HAVING COUNT(*) = 2
              )
          )`
        )
        .limit(1);

      if (existingConversation.length > 0) {
        return { conversationId: existingConversation[0].conversationId };
      }

      const [newConversation] = await db
        .insert(conversations)
        .values({
          title: input.title,
          type: "direct",
        })
        .returning();

      await db.insert(conversationParticipants).values([
        {
          conversationId: newConversation.id,
          userId: userId,
        },
        {
          conversationId: newConversation.id,
          userId: input.participantId,
        },
      ]);

      return { conversationId: newConversation.id };
    }),

  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        page: z.number().default(1),
        limit: z.number().max(100).default(50),
      })
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const offset = (input.page - 1) * input.limit;

      const participation = await db
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, input.conversationId),
            eq(conversationParticipants.userId, userId)
          )
        )
        .limit(1);

      if (participation.length === 0) {
        throw new Error("Access denied to this conversation");
      }

      const sender = alias(user, "sender");
      const conversationMessages = await db
        .select({
          id: messages.id,
          content: messages.content,
          messageType: messages.messageType,
          imageUrl: messages.imageUrl,
          createdAt: messages.createdAt,
          isEdited: messages.isEdited,
          sender: {
            id: sender.id,
            name: sender.name,
            email: sender.email,
            image: sender.image,
          },
          isOwn: sql<boolean>`${messages.senderId} = ${userId}`,
        })
        .from(messages)
        .innerJoin(sender, eq(messages.senderId, sender.id))
        .where(
          and(
            eq(messages.conversationId, input.conversationId),
            eq(messages.isDeleted, false)
          )
        )
        .orderBy(desc(messages.createdAt))
        .limit(input.limit)
        .offset(offset);

      const unreadMessageIds = conversationMessages
        .filter((msg) => !msg.isOwn)
        .map((msg) => msg.id);

      if (unreadMessageIds.length > 0) {
        await db
          .insert(messageReads)
          .values(
            unreadMessageIds.map((messageId) => ({
              messageId,
              userId,
            }))
          )
          .onConflictDoNothing();
      }

      const [totalCount] = await db
        .select({ count: count() })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, input.conversationId),
            eq(messages.isDeleted, false)
          )
        );

      return {
        messages: conversationMessages.reverse(),
        pagination: {
          page: input.page,
          limit: input.limit,
          total: totalCount.count,
          totalPages: Math.ceil(totalCount.count / input.limit),
        },
      };
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string().optional(),
        messageType: z.enum(["text", "image"]).default("text"),
        imageUrl: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      if (input.messageType === "text" && !input.content?.trim()) {
        throw new Error("Text message cannot be empty");
      }

      if (input.messageType === "image" && !input.imageUrl) {
        throw new Error("Image URL is required for image messages");
      }

      const participation = await db
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, input.conversationId),
            eq(conversationParticipants.userId, userId)
          )
        )
        .limit(1);

      if (participation.length === 0) {
        throw new Error("Access denied to this conversation");
      }

      const [newMessage] = await db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          senderId: userId,
          content: input.content,
          messageType: input.messageType,
          imageUrl: input.imageUrl,
        })
        .returning();

      await db
        .update(conversations)
        .set({
          lastMessageAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(conversations.id, input.conversationId));

      // Get sender information for WebSocket event
      const [senderInfo] = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      // Broadcast new message to conversation participants
      const messageEvent: MessageNewEvent = {
        type: "MESSAGE_NEW",
        data: {
          conversationId: input.conversationId,
          message: {
            id: newMessage.id,
            content: newMessage.content,
            messageType: newMessage.messageType,
            imageUrl: newMessage.imageUrl,
            createdAt: newMessage.createdAt,
            isEdited: newMessage.isEdited,
            sender: senderInfo,
            isOwn: false, // Will be determined by the client
          },
        },
        timestamp: new Date(),
      };

      wsManager.broadcastToConversation(
        input.conversationId,
        messageEvent,
        userId // Exclude sender
      );

      // Broadcast conversation update
      const conversationEvent: ConversationUpdatedEvent = {
        type: "CONVERSATION_UPDATED",
        data: {
          conversationId: input.conversationId,
          lastMessageAt: new Date(),
          lastMessage: {
            id: newMessage.id,
            content: newMessage.content,
            messageType: newMessage.messageType,
            imageUrl: newMessage.imageUrl,
            createdAt: newMessage.createdAt,
            senderId: userId,
            senderName: senderInfo.name,
          },
        },
        timestamp: new Date(),
      };

      wsManager.broadcastToConversation(
        input.conversationId,
        conversationEvent
      );

      return newMessage;
    }),

  getParticipants: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      const participation = await db
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, input.conversationId),
            eq(conversationParticipants.userId, userId)
          )
        )
        .limit(1);

      if (participation.length === 0) {
        throw new Error("Access denied to this conversation");
      }

      const participant = alias(user, "participant");
      const participants = await db
        .select({
          id: participant.id,
          name: participant.name,
          email: participant.email,
          image: participant.image,
          role: participant.role,
          joinedAt: conversationParticipants.joinedAt,
          isAdmin: conversationParticipants.isAdmin,
        })
        .from(conversationParticipants)
        .innerJoin(
          participant,
          eq(conversationParticipants.userId, participant.id)
        )
        .where(
          eq(conversationParticipants.conversationId, input.conversationId)
        )
        .orderBy(conversationParticipants.joinedAt);

      return participants;
    }),

  searchUsers: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().max(20).default(10),
      })
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      const users = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        })
        .from(user)
        .where(
          and(
            sql`${user.name} ILIKE ${`%${input.query}%`} OR ${
              user.email
            } ILIKE ${`%${input.query}%`}`,
            sql`${user.id} != ${userId}`
          )
        )
        .limit(input.limit);

      return users;
    }),
};
