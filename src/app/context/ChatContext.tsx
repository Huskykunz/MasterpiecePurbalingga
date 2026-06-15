import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { ChatConversation, ChatMessage } from "../types";

interface ChatContextType {
  conversations: ChatConversation[];
  getConversation: (id: string) => ChatConversation | undefined;
  getConversationsByUser: (userId: string) => ChatConversation[];
  getConversationsBySeller: (sellerId: string) => ChatConversation[];
  startConversation: (customerId: string, customerName: string, sellerId: string, sellerName: string, productId?: string, productName?: string) => ChatConversation;
  sendMessage: (conversationId: string, senderId: string, senderName: string, senderRole: "customer" | "craftsman" | "admin", message: string) => void;
  markAsRead: (conversationId: string, userId: string) => void;
  getUnreadCount: (userId: string) => number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const loadConversations = (): ChatConversation[] => {
  try {
    return JSON.parse(localStorage.getItem("chatConversations") || "[]");
  } catch {
    return [];
  }
};

const saveConversations = (convs: ChatConversation[]) => {
  localStorage.setItem("chatConversations", JSON.stringify(convs));
};

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<ChatConversation[]>(loadConversations);

  const refresh = useCallback((updater: (prev: ChatConversation[]) => ChatConversation[]) => {
    setConversations((prev) => {
      const next = updater(prev);
      saveConversations(next);
      return next;
    });
  }, []);

  const getConversation = (id: string) => conversations.find((c) => c.id === id);

  const getConversationsByUser = (userId: string) =>
    conversations.filter((c) => c.customerId === userId);

  const getConversationsBySeller = (sellerId: string) =>
    conversations.filter((c) => c.sellerId === sellerId);

  const startConversation = (
    customerId: string,
    customerName: string,
    sellerId: string,
    sellerName: string,
    productId?: string,
    productName?: string
  ): ChatConversation => {
    const existing = conversations.find(
      (c) => c.customerId === customerId && c.sellerId === sellerId && c.productId === productId
    );
    if (existing) return existing;

    const newConv: ChatConversation = {
      id: `conv-${Date.now()}`,
      customerId,
      customerName,
      sellerId,
      sellerName,
      productId,
      productName,
      unreadCount: 0,
      messages: [],
    };

    refresh((prev) => [...prev, newConv]);
    return newConv;
  };

  const sendMessage = (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderRole: "customer" | "craftsman" | "admin",
    message: string
  ) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      senderName,
      senderRole,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    };

    refresh((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          messages: [...c.messages, newMsg],
          lastMessage: message,
          lastMessageAt: newMsg.createdAt,
          unreadCount: c.unreadCount + 1,
        };
      })
    );
  };

  const markAsRead = (conversationId: string, _userId: string) => {
    refresh((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0, messages: c.messages.map((m) => ({ ...m, read: true })) } : c
      )
    );
  };

  const getUnreadCount = (userId: string) => {
    return conversations
      .filter((c) => c.customerId === userId || c.sellerId === userId)
      .reduce((sum, c) => sum + c.unreadCount, 0);
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        getConversation,
        getConversationsByUser,
        getConversationsBySeller,
        startConversation,
        sendMessage,
        markAsRead,
        getUnreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be within ChatProvider");
  return ctx;
}
