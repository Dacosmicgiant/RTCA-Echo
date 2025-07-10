import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // Enhanced message listener with notifications
    socket.on("newMessage", (newMessage) => {
      // Play notification sound using a simple approach
      get().playNotificationSound();

      // Show browser notification if page is not focused
      if (document.hidden && Notification.permission === 'granted') {
        // Get sender name from the message or fallback
        const senderName = newMessage.senderName || newMessage.senderFullName || 'Someone';
        
        const notification = new Notification(`New message from ${senderName}`, {
          body: newMessage.text || 'Sent an image',
          icon: newMessage.senderProfilePic || '/avatar.png',
          tag: `message-${newMessage.senderId}`,
          requireInteraction: false,
          silent: false
        });

        // Auto-close notification after 4 seconds
        setTimeout(() => {
          notification.close();
        }, 4000);

        // Handle notification click to focus window
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    });

    // Listen for typing events from backend
    socket.on("userTyping", ({ userId, isTyping, userName }) => {
      // This will be handled by the chat store
      // We just need to emit this to the chat store
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
      set({ socket: null });
    }
  },

  // Simple notification sound function
  playNotificationSound: () => {
    try {
      // Check if sounds are enabled in localStorage
      const soundEnabled = JSON.parse(localStorage.getItem('chat-sound-enabled') ?? 'true');
      if (!soundEnabled) return;

      // Get selected sound and volume from localStorage
      const selectedSound = localStorage.getItem('chat-selected-sound') || 'default';
      const volume = parseFloat(localStorage.getItem('chat-volume') || '0.5');

      if (selectedSound === 'none') return;

      // Create audio context and play sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set frequency based on sound type
      const frequencies = {
        default: 800,
        pop: 1000,
        chime: 600,
        ding: 1200
      };
      
      oscillator.frequency.value = frequencies[selectedSound] || 800;
      oscillator.type = 'sine';
      
      // Apply volume
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  },

  // Request notification permission
  requestNotificationPermission: async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
}));