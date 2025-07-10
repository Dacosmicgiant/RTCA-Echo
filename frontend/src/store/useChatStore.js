import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  typingUsers: {}, // { userId: boolean }
  drafts: {}, // { userId: draftText }

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      
      // Add message with animation trigger
      const newMessage = { ...res.data, isNew: true };
      set({ messages: [...messages, newMessage] });
      
      // Remove animation flag after a short delay
      setTimeout(() => {
        set(state => ({
          messages: state.messages.map(msg => 
            msg._id === newMessage._id ? { ...msg, isNew: false } : msg
          )
        }));
      }, 500);
      
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      // Add new message with animation flag
      const messageWithAnimation = { ...newMessage, isNew: true };
      set({
        messages: [...get().messages, messageWithAnimation],
      });

      // Remove animation flag after animation completes
      setTimeout(() => {
        set(state => ({
          messages: state.messages.map(msg => 
            msg._id === messageWithAnimation._id ? { ...msg, isNew: false } : msg
          )
        }));
      }, 500);
    });

    // Listen for typing indicators
    socket.on("userTyping", ({ userId, isTyping }) => {
      set(state => ({
        typingUsers: {
          ...state.typingUsers,
          [userId]: isTyping
        }
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("userTyping");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  // Typing indicators
  setTypingStatus: (userId, isTyping) => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("typing", { userId, isTyping });
    }
  },

  getTypingStatus: (userId) => {
    const { typingUsers } = get();
    return typingUsers[userId] || false;
  },

  // Draft management
  saveDraft: (userId, text) => {
    set(state => ({
      drafts: {
        ...state.drafts,
        [userId]: text
      }
    }));
    
    // Also save to localStorage for persistence
    try {
      const existingDrafts = JSON.parse(localStorage.getItem('chat-drafts') || '{}');
      existingDrafts[userId] = text;
      localStorage.setItem('chat-drafts', JSON.stringify(existingDrafts));
    } catch (error) {
      console.error('Failed to save draft to localStorage:', error);
    }
  },

  getDraft: (userId) => {
    const { drafts } = get();
    
    // First check in-memory drafts
    if (drafts[userId] !== undefined) {
      return drafts[userId];
    }
    
    // Then check localStorage
    try {
      const existingDrafts = JSON.parse(localStorage.getItem('chat-drafts') || '{}');
      const draft = existingDrafts[userId] || '';
      
      // Update in-memory draft
      set(state => ({
        drafts: {
          ...state.drafts,
          [userId]: draft
        }
      }));
      
      return draft;
    } catch (error) {
      console.error('Failed to load draft from localStorage:', error);
      return '';
    }
  },

  clearDraft: (userId) => {
    set(state => ({
      drafts: {
        ...state.drafts,
        [userId]: ''
      }
    }));
    
    // Also clear from localStorage
    try {
      const existingDrafts = JSON.parse(localStorage.getItem('chat-drafts') || '{}');
      delete existingDrafts[userId];
      localStorage.setItem('chat-drafts', JSON.stringify(existingDrafts));
    } catch (error) {
      console.error('Failed to clear draft from localStorage:', error);
    }
  },

  // Initialize drafts from localStorage
  initializeDrafts: () => {
    try {
      const existingDrafts = JSON.parse(localStorage.getItem('chat-drafts') || '{}');
      set({ drafts: existingDrafts });
    } catch (error) {
      console.error('Failed to initialize drafts:', error);
      set({ drafts: {} });
    }
  }
}));