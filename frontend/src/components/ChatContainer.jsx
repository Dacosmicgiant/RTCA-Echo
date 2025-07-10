import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState(new Set());

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    // Listen for typing events (simulated for now)
    const handleTypingEvent = (event) => {
      if (event.detail && event.detail.userId !== authUser._id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (event.detail.isTyping) {
            newSet.add(event.detail.userId);
          } else {
            newSet.delete(event.detail.userId);
          }
          return newSet;
        });
      }
    };

    window.addEventListener('userTyping', handleTypingEvent);

    return () => {
      unsubscribeFromMessages();
      window.removeEventListener('userTyping', handleTypingEvent);
    };
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages, authUser._id]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingUsers]);

  const isUserTyping = typingUsers.has(selectedUser._id);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            style={{
              animation: message.isNew ? 'messageSlideIn 0.4s ease-out' : 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="chat-image avatar">
              <div 
                className="size-10 rounded-full border"
                style={{transition: 'transform 0.2s'}}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                  className="rounded-full"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time 
                className="text-xs opacity-50 ml-1"
                style={{transition: 'opacity 0.2s'}}
                onMouseEnter={(e) => e.target.style.opacity = '0.75'}
                onMouseLeave={(e) => e.target.style.opacity = '0.5'}
              >
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div 
              className={`chat-bubble flex flex-col ${
                message.senderId === authUser._id 
                  ? "bg-primary text-primary-content" 
                  : "bg-base-200"
              }`}
              style={{
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (message.senderId === authUser._id) {
                  e.target.style.backgroundColor = 'oklch(var(--p) / 0.9)';
                } else {
                  e.target.style.backgroundColor = 'oklch(var(--b3) / 0.8)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '';
              }}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer"
                  style={{transition: 'transform 0.3s ease'}}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  onClick={() => {
                    window.open(message.image, '_blank');
                  }}
                />
              )}
              {message.text && <p className="break-words">{message.text}</p>}
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isUserTyping && (
          <div 
            className="chat chat-start"
            style={{animation: 'fadeIn 0.3s ease-in-out'}}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt="profile pic"
                  className="rounded-full"
                />
              </div>
            </div>
            <div className="chat-bubble bg-base-300 flex items-center space-x-2">
              <span className="text-sm opacity-70">{selectedUser.fullName} is typing</span>
              <div className="flex space-x-1">
                <div 
                  className="w-1 h-1 bg-current rounded-full"
                  style={{
                    animation: 'bounce 1.4s infinite ease-in-out',
                    animationDelay: '0ms'
                  }}
                ></div>
                <div 
                  className="w-1 h-1 bg-current rounded-full"
                  style={{
                    animation: 'bounce 1.4s infinite ease-in-out',
                    animationDelay: '150ms'
                  }}
                ></div>
                <div 
                  className="w-1 h-1 bg-current rounded-full"
                  style={{
                    animation: 'bounce 1.4s infinite ease-in-out',
                    animationDelay: '300ms'
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;