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
  
  const { sendMessage, selectedUser, setTypingStatus, saveDraft, getDraft } = useChatStore();

  // Load draft when selected user changes
  useEffect(() => {
    if (selectedUser) {
      const draft = getDraft(selectedUser._id);
      if (draft) {
        setText(draft);
      } else {
        setText("");
      }
    }
  }, [selectedUser, getDraft]);

  // Save draft when text changes
  useEffect(() => {
    if (selectedUser && text !== getDraft(selectedUser._id)) {
      saveDraft(selectedUser._id, text);
    }
  }, [text, selectedUser, saveDraft, getDraft]);

  // Handle typing indicators
  useEffect(() => {
    if (text.trim() && !isTyping) {
      setIsTyping(true);
      setTypingStatus(selectedUser._id, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        setTypingStatus(selectedUser._id, false);
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [text, isTyping, selectedUser, setTypingStatus]);

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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    setIsSending(true);
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      setTypingStatus(selectedUser._id, false);
    }

    try {
      const processedText = processEmojiShortcuts(text.trim());
      
      await sendMessage({
        text: processedText,
        image: imagePreview,
      });

      // Clear form and draft
      setText("");
      setImagePreview(null);
      saveDraft(selectedUser._id, "");
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
        <div className="mb-3 flex items-center gap-2 animate-fadeIn">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700 transition-transform hover:scale-105"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center hover:bg-red-500 transition-colors"
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
              className="w-full input input-bordered rounded-lg input-sm sm:input-md 
                       transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              placeholder="Type a message..."
              value={text}
              onChange={handleTextChange}
              onKeyPress={handleKeyPress}
            />
            
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div 
                ref={emojiPickerRef}
                className="absolute bottom-full mb-2 right-0 bg-base-100 border border-base-300 
                         rounded-lg shadow-lg p-3 w-64 z-50 animate-slideUp"
              >
                <div className="grid grid-cols-6 gap-2">
                  {COMMON_EMOJIS.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleEmojiSelect(emoji)}
                      className="p-2 hover:bg-base-200 rounded transition-colors text-lg"
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
            className={`hidden sm:flex btn btn-circle transition-all duration-200
                     ${imagePreview ? "text-emerald-500 scale-110" : "text-zinc-400 hover:text-zinc-300"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>

          <button
            type="button"
            className="hidden sm:flex btn btn-circle transition-all duration-200 hover:scale-110"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={20} className={showEmojiPicker ? "text-yellow-400" : "text-zinc-400"} />
          </button>
        </div>
        
        <button
          type="submit"
          className={`btn btn-sm btn-circle transition-all duration-200 
                    ${isSending ? "loading" : "hover:scale-110"}
                    ${(!text.trim() && !imagePreview) ? "opacity-50" : "hover:bg-primary hover:text-primary-content"}`}
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