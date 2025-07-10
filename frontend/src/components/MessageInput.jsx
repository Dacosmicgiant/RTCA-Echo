import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";

// Emoji shortcuts mapping
const EMOJI_SHORTCUTS = {
  ':)': '😊',
  ':-)': '😊',
  ':(': '😢',
  ':-(': '😢',
  ':D': '😃',
  ':-D': '😃',
  ':P': '😛',
  ':-P': '😛',
  ';)': '😉',
  ';-)': '😉',
  ':o': '😮',
  ':-o': '😮',
  ':heart:': '❤️',
  ':love:': '❤️',
  ':thumbs_up:': '👍',
  ':thumbs_down:': '👎',
  ':clap:': '👏',
  ':fire:': '🔥',
  ':rocket:': '🚀',
  ':star:': '⭐',
  ':laugh:': '😂',
  ':cry:': '😭',
  ':angry:': '😠',
  ':surprised:': '😲',
  ':cool:': '😎',
  ':wink:': '😉',
  ':kiss:': '😘',
  ':hug:': '🤗',
  ':thinking:': '🤔',
  ':party:': '🎉',
  ':coffee:': '☕',
  ':pizza:': '🍕',
  ':beer:': '🍺',
  ':music:': '🎵',
  ':sun:': '☀️',
  ':moon:': '🌙',
  ':rainbow:': '🌈'
};

// Common emojis for picker
const COMMON_EMOJIS = [
  '😊', '😂', '😍', '😭', '😘', '😎', '🤔', '😮', '😢', '😠',
  '👍', '👎', '👏', '🙌', '💪', '🤝', '👋', '🔥', '⭐', '🎉',
  '❤️', '💕', '💯', '✨', '🚀', '☕', '🍕', '🎵', '☀️', '🌙'
];

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  
  const { sendMessage, selectedUser } = useChatStore();

  // Draft management functions
  const saveDraft = (userId, draftText) => {
    try {
      const drafts = JSON.parse(localStorage.getItem('chat-drafts') || '{}');
      drafts[userId] = draftText;
      localStorage.setItem('chat-drafts', JSON.stringify(drafts));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const getDraft = (userId) => {
    try {
      const drafts = JSON.parse(localStorage.getItem('chat-drafts') || '{}');
      return drafts[userId] || '';
    } catch (error) {
      console.error('Failed to get draft:', error);
      return '';
    }
  };

  const clearDraft = (userId) => {
    try {
      const drafts = JSON.parse(localStorage.getItem('chat-drafts') || '{}');
      delete drafts[userId];
      localStorage.setItem('chat-drafts', JSON.stringify(drafts));
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  // Typing indicator functions
  const emitTyping = (isTypingNow) => {
    // This would emit to socket when backend is ready
    // For now, just console log
    console.log(`User is typing: ${isTypingNow}`);
  };

  // Load draft when selected user changes
  useEffect(() => {
    if (selectedUser) {
      const draft = getDraft(selectedUser._id);
      setText(draft);
    }
  }, [selectedUser]);

  // Save draft when text changes
  useEffect(() => {
    if (selectedUser && text !== getDraft(selectedUser._id)) {
      saveDraft(selectedUser._id, text);
    }
  }, [text, selectedUser]);

  // Handle typing indicators
  useEffect(() => {
    if (text.trim() && !isTyping) {
      setIsTyping(true);
      emitTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        emitTyping(false);
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [text, isTyping, selectedUser]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Basic image compression
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 800px width/height)
      const maxSize = 800;
      let { width, height } = img;
      
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with compression
      const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
      setImagePreview(compressedImage);
    };
    
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processEmojiShortcuts = (inputText) => {
    let processedText = inputText;
    
    // Sort shortcuts by length (longest first) to avoid partial replacements
    const sortedShortcuts = Object.keys(EMOJI_SHORTCUTS).sort((a, b) => b.length - a.length);
    
    sortedShortcuts.forEach(shortcut => {
      const regex = new RegExp(shortcut.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      processedText = processedText.replace(regex, EMOJI_SHORTCUTS[shortcut]);
    });
    
    return processedText;
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    // Process emoji shortcuts on space or enter
    const lastChar = newText[newText.length - 1];
    if (lastChar === ' ' || lastChar === '\n') {
      const processedText = processEmojiShortcuts(newText);
      if (processedText !== newText) {
        setText(processedText);
      }
    }
  };

  const handleEmojiSelect = (emoji) => {
    const cursorPosition = inputRef.current.selectionStart;
    const newText = text.slice(0, cursorPosition) + emoji + text.slice(cursorPosition);
    setText(newText);
    
    // Focus back to input and set cursor position
    setTimeout(() => {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(cursorPosition + emoji.length, cursorPosition + emoji.length);
    }, 0);
    
    setShowEmojiPicker(false);
  };

  const playNotificationSound = () => {
    try {
      const soundEnabled = JSON.parse(localStorage.getItem('chat-sound-enabled') ?? 'true');
      if (!soundEnabled) return;

      const selectedSound = localStorage.getItem('chat-selected-sound') || 'default';
      const volume = parseFloat(localStorage.getItem('chat-volume') || '0.5');

      if (selectedSound === 'none') return;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const frequencies = {
        default: 800,
        pop: 1000,
        chime: 600,
        ding: 1200
      };
      
      oscillator.frequency.value = frequencies[selectedSound] || 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    setIsSending(true);
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      emitTyping(false);
    }

    try {
      const processedText = processEmojiShortcuts(text.trim());
      
      await sendMessage({
        text: processedText,
        image: imagePreview,
      });

      // Play sound on send
      playNotificationSound();

      // Clear form and draft
      setText("");
      setImagePreview(null);
      clearDraft(selectedUser._id);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="p-4 w-full relative">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2" style={{animation: 'fadeIn 0.3s ease-in-out'}}>
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              style={{transition: 'transform 0.2s', cursor: 'pointer'}}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center hover:bg-red-500"
              style={{transition: 'background-color 0.2s'}}
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2 relative">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              className="w-full input input-bordered rounded-lg input-sm sm:input-md"
              style={{transition: 'all 0.2s'}}
              placeholder="Type a message..."
              value={text}
              onChange={handleTextChange}
              onKeyPress={handleKeyPress}
            />
            
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div 
                ref={emojiPickerRef}
                className="absolute bottom-full mb-2 right-0 bg-base-100 border border-base-300 rounded-lg shadow-lg p-3 w-64 z-50"
                style={{animation: 'slideUp 0.2s ease-out'}}
              >
                <div className="grid grid-cols-6 gap-2">
                  {COMMON_EMOJIS.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleEmojiSelect(emoji)}
                      className="p-2 hover:bg-base-200 rounded text-lg"
                      style={{transition: 'background-color 0.2s'}}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-base-300 text-xs text-base-content/60">
                  Try shortcuts: :) :heart: :fire: :thumbs_up:
                </div>
              </div>
            )}
          </div>
          
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            style={{transition: 'all 0.2s'}}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>

          <button
            type="button"
            className="hidden sm:flex btn btn-circle"
            style={{transition: 'all 0.2s'}}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={20} className={showEmojiPicker ? "text-yellow-400" : "text-zinc-400"} />
          </button>
        </div>
        
        <button
          type="submit"
          className={`btn btn-sm btn-circle ${isSending ? "loading" : ""} ${(!text.trim() && !imagePreview) ? "opacity-50" : ""}`}
          style={{transition: 'all 0.2s'}}
          onMouseEnter={(e) => !isSending && (e.target.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          disabled={(!text.trim() && !imagePreview) || isSending}
        >
          {isSending ? (
            <div className="loading loading-spinner loading-sm"></div>
          ) : (
            <Send size={22} />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;