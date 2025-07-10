import { create } from "zustand";

// Simple notification sounds using Web Audio API
const createNotificationSound = (frequency = 800, duration = 200, type = 'sine') => {
  return () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  };
};

const NOTIFICATION_SOUNDS = {
  default: createNotificationSound(800, 200, 'sine'),
  pop: createNotificationSound(1000, 150, 'sine'),
  chime: createNotificationSound(600, 300, 'triangle'),
  ding: createNotificationSound(1200, 100, 'square'),
  none: () => {} // Silent option
};

export const useNotificationStore = create((set, get) => ({
  soundEnabled: JSON.parse(localStorage.getItem('chat-sound-enabled') ?? 'true'),
  selectedSound: localStorage.getItem('chat-selected-sound') || 'default',
  volume: parseFloat(localStorage.getItem('chat-volume') || '0.5'),

  setSoundEnabled: (enabled) => {
    localStorage.setItem('chat-sound-enabled', JSON.stringify(enabled));
    set({ soundEnabled: enabled });
  },

  setSelectedSound: (sound) => {
    localStorage.setItem('chat-selected-sound', sound);
    set({ selectedSound: sound });
  },

  setVolume: (volume) => {
    localStorage.setItem('chat-volume', volume.toString());
    set({ volume });
  },

  playNotification: () => {
    const { soundEnabled, selectedSound } = get();
    if (soundEnabled && NOTIFICATION_SOUNDS[selectedSound]) {
      NOTIFICATION_SOUNDS[selectedSound]();
    }
  },

  testSound: (soundName) => {
    if (NOTIFICATION_SOUNDS[soundName]) {
      NOTIFICATION_SOUNDS[soundName]();
    }
  }
}));