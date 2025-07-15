"use client";

import { authClient } from "@/lib/auth-client";
import { Loader } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { convertBlobUrlToFile } from "@/lib/convert-blob-url-to-file";
import { uploadImage } from "@/lib/supabase/storage/client";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { toast } from "sonner";
import Image from "next/image";
import {
  MessageCircle,
  Send,
  ImageIcon,
  X,
  Search,
  Plus,
  Users,
} from "lucide-react";

const page = () => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  if (isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }
  if (!session || !session.user) {
    router.push("/login");
    return null;
  }
  return <InboxPage userId={session.user.id} />;
};

export default page;

interface Conversation {
  conversation: {
    id: string;
    title: string | null;
    type: string;
    createdAt: Date;
    lastMessageAt: Date | null;
  };
  otherParticipant: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  lastMessage: {
    id: string | null;
    content: string | null;
    messageType: string | null;
    imageUrl: string | null;
    createdAt: Date | null;
    senderId: string | null;
    senderName: string | null;
  } | null;
  unreadCount: number;
}

const InboxPage = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messageText, setMessageText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const MAX_FILE_SIZE = 4 * 1024 * 1024;

  // WebSocket connection - only enable after component stabilizes
  const [wsEnabled, setWsEnabled] = useState(false);

  useEffect(() => {
    // Enable WebSocket after a short delay to prevent React Strict Mode issues
    const timer = setTimeout(() => setWsEnabled(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const {
    status: wsStatus,
    sendTyping,
    isConnected,
  } = useWebSocket({
    url: `${process.env.NEXT_PUBLIC_SERVER_URL}/ws`,
    enabled: wsEnabled,
    onConnect: () => {
      console.log("Connected to WebSocket");
    },
    onDisconnect: () => {
      console.log("Disconnected from WebSocket");
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedConversation) {
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedConversation]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        handleTyping(false);
      }
    };
  }, [selectedConversation]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const updateSelectedConversation = (conversationId: string | null) => {
    setSelectedConversation(conversationId);
    const params = new URLSearchParams(searchParams.toString());
    if (conversationId) {
      params.set("chat", conversationId);
    } else {
      params.delete("chat");
    }
    router.replace(`/dashboard/inbox?${params.toString()}`, { scroll: false });
  };

  const { data: conversationsData, isLoading: conversationsLoading } = useQuery(
    {
      queryKey: ["conversations"],
      queryFn: async () =>
        await orpc.chat.getConversations.call({ page: 1, limit: 50 }),
    }
  );

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return null;
      return await orpc.chat.getMessages.call({
        conversationId: selectedConversation,
        page: 1,
        limit: 100,
      });
    },
    enabled: !!selectedConversation,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["search-users", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      return await orpc.chat.searchUsers.call({
        query: searchQuery,
        limit: 10,
      });
    },
    enabled: searchQuery.trim().length > 0,
  });

  useEffect(() => {
    const chatParam = searchParams.get("chat");
    if (chatParam && chatParam !== selectedConversation && conversationsData) {
      const conversations = conversationsData.conversations || [];
      const existingConversation = conversations.find(
        (c) => c.conversation.id === chatParam
      );

      if (existingConversation) {
        setSelectedConversation(chatParam);
      } else {
        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            chatParam
          );

        if (isUUID) {
          toast.error("Conversation not found", {
            description:
              "The conversation may have been deleted or you don't have access to it.",
          });
          const params = new URLSearchParams(searchParams.toString());
          params.delete("chat");
          router.replace(`/dashboard/inbox?${params.toString()}`, {
            scroll: false,
          });
        } else {
          createConversationMutation.mutate(chatParam);
        }
      }
    }
  }, [searchParams, conversationsData, selectedConversation]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({
      conversationId,
      content,
      messageType,
      imageUrl,
    }: {
      conversationId: string;
      content?: string;
      messageType: "text" | "image";
      imageUrl?: string;
    }) => {
      return await orpc.chat.sendMessage.call({
        conversationId,
        content,
        messageType,
        imageUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", selectedConversation],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setMessageText("");
      setSelectedImage(null);
      scrollToBottom();
    },
    onError: (error) => {
      toast.error("Failed to send message", {
        description: error.message,
      });
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: async (participantId: string) => {
      return await orpc.chat.createOrGetConversation.call({
        participantId,
      });
    },
    onSuccess: (data) => {
      updateSelectedConversation(data.conversationId);
      setIsNewChatOpen(false);
      setSearchQuery("");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      toast.error("Failed to create conversation", {
        description: error.message,
      });
    },
  });

  const handleSendMessage = async () => {
    if (!selectedConversation) return;

    if (selectedImage) {
      try {
        const imageFile = await convertBlobUrlToFile(selectedImage);
        const { imageUrl, error } = await uploadImage({
          file: imageFile,
          bucket: process.env.NEXT_PUBLIC_SUPABASE_BUCKET!,
          folder: "messages",
        });

        if (error) throw new Error(`Failed to upload image: ${error}`);

        sendMessageMutation.mutate({
          conversationId: selectedConversation,
          content: messageText.trim() || undefined,
          messageType: "image",
          imageUrl,
        });
      } catch (error) {
        toast.error("Failed to upload image");
      }
    } else if (messageText.trim()) {
      sendMessageMutation.mutate({
        conversationId: selectedConversation,
        content: messageText.trim(),
        messageType: "text",
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setImageError("File size must be less than 4MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file");
      return;
    }

    setImageError("");
    setSelectedImage(URL.createObjectURL(file));
  };

  // Handle typing indicators with debouncing
  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (selectedConversation && isConnected) {
        sendTyping(selectedConversation, isTyping);
      }
    },
    [selectedConversation, isConnected, sendTyping]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);

    // Send typing indicator with debouncing
    if (e.target.value.trim() && selectedConversation && isConnected) {
      handleTyping(true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        handleTyping(false);
      }, 2000);
    } else if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      handleTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      // Stop typing indicator when sending
      handleTyping(false);
    }
  };

  const formatTime = (date: Date | string) => {
    const now = new Date();
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    const diffInHours =
      Math.abs(now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return dateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return dateObj.toLocaleDateString();
    }
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.conversation.title) {
      return conversation.conversation.title;
    }
    return conversation.otherParticipant?.name || "Unknown User";
  };

  const conversations = conversationsData?.conversations || [];
  const messages = messagesData?.messages || [];

  // Scroll to bottom when messages change (including WebSocket updates)
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure new messages are rendered
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length, messages, scrollToBottom]);

  return (
    <div className="container max-w-7xl mx-auto mt-10">
      <div className="flex h-[calc(100vh-8rem)] bg-card rounded-lg shadow-lg overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-1/3 bg-card/50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" />
                Messages
              </h2>
              <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    New Chat
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start a New Conversation</DialogTitle>
                    <DialogDescription>
                      Search for users to start chatting with
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {searchLoading && (
                      <div className="flex justify-center">
                        <Loader className="animate-spin h-4 w-4" />
                      </div>
                    )}
                    {searchResults && searchResults.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {searchResults
                          .filter((user: any) => user.id !== userId)
                          .map((user: any) => (
                            <div
                              key={user.id}
                              className="flex items-center p-3 hover:bg-card/50 rounded-lg cursor-pointer"
                              onClick={() =>
                                createConversationMutation.mutate(user.id)
                              }
                            >
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={user.image || ""} />
                                <AvatarFallback>
                                  {user.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-gray-500">
                                  {user.email}
                                </p>
                                <Badge
                                  variant="outline"
                                  className="text-xs mt-1"
                                >
                                  {user.role}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                    {searchQuery &&
                      !searchLoading &&
                      (!searchResults ||
                        searchResults.filter((user: any) => user.id !== userId)
                          .length === 0) && (
                        <p className="text-center text-gray-500">
                          No users found
                        </p>
                      )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversationsLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader className="animate-spin" />
              </div>
            ) : conversations.length > 0 ? (
              <div className="space-y-1 p-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conversation.conversation.id
                        ? "bg-card/50 border-blue-300"
                        : "hover:bg-card/50"
                    }`}
                    onClick={() =>
                      updateSelectedConversation(conversation.conversation.id)
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={conversation.otherParticipant?.image || ""}
                        />
                        <AvatarFallback>
                          {conversation.otherParticipant?.name
                            ?.charAt(0)
                            .toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">
                            {getConversationTitle(conversation)}
                          </p>
                          <div className="flex items-center space-x-2">
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                            {conversation.lastMessage &&
                              conversation.lastMessage.createdAt && (
                                <span className="text-xs text-gray-500">
                                  {formatTime(
                                    conversation.lastMessage.createdAt
                                  )}
                                </span>
                              )}
                          </div>
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conversation.lastMessage.messageType ===
                            "image" ? (
                              <span className="flex items-center">
                                <ImageIcon className="h-3 w-3 mr-1" />
                                Photo
                              </span>
                            ) : (
                              conversation.lastMessage.content
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="h-12 w-12 mb-4" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a new chat to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-card">
                {(() => {
                  const conversation = conversations.find(
                    (c) => c.conversation.id === selectedConversation
                  );
                  return conversation ? (
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={conversation.otherParticipant?.image || ""}
                        />
                        <AvatarFallback>
                          {conversation.otherParticipant?.name
                            ?.charAt(0)
                            .toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {getConversationTitle(conversation)}
                          </h3>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isConnected ? "bg-green-500" : "bg-gray-400"
                            }`}
                            title={isConnected ? "Connected" : "Disconnected"}
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          {conversation.otherParticipant?.email}
                        </p>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card">
                {messagesLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader className="animate-spin" />
                  </div>
                ) : messages.length > 0 ? (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.isOwn ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isOwn
                              ? "bg-blue-500 text-white"
                              : "bg-white text-gray-900 border"
                          }`}
                        >
                          {!message.isOwn && (
                            <p className="text-xs font-medium mb-1 opacity-70">
                              {message.sender.name}
                            </p>
                          )}

                          {message.messageType === "image" &&
                            message.imageUrl && (
                              <div className="mb-2">
                                <Image
                                  src={message.imageUrl}
                                  alt="Sent image"
                                  width={300}
                                  height={200}
                                  className="rounded-md max-w-full h-auto"
                                />
                              </div>
                            )}

                          {message.content && (
                            <p className="whitespace-pre-wrap">
                              {message.content}
                            </p>
                          )}

                          <p
                            className={`text-xs mt-1 ${
                              message.isOwn ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {formatTime(message.createdAt)}
                            {message.isEdited && " (edited)"}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageCircle className="h-12 w-12 mb-4" />
                    <p>No messages yet</p>
                    <p className="text-sm">
                      Send a message to start the conversation
                    </p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-card">
                {selectedImage && (
                  <div className="mb-3 relative inline-block">
                    <Image
                      src={selectedImage}
                      alt="Selected image"
                      width={100}
                      height={100}
                      className="rounded-md object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {imageError && (
                  <Alert variant="destructive" className="mb-3">
                    {imageError}
                  </Alert>
                )}

                <div className="flex items-end space-x-2">
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sendMessageMutation.isPending || !!selectedImage}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>

                  <Textarea
                    placeholder={
                      isConnected ? "Type a message..." : "Connecting..."
                    }
                    value={messageText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    className="flex-1 resize-none"
                    rows={1}
                    disabled={sendMessageMutation.isPending || !isConnected}
                  />

                  <Button
                    onClick={handleSendMessage}
                    disabled={
                      sendMessageMutation.isPending ||
                      (!messageText.trim() && !selectedImage)
                    }
                    size="sm"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <Users className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Select a conversation
              </h3>
              <p className="text-center">
                Choose a conversation from the left to start messaging
                <br />
                or start a new chat
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
