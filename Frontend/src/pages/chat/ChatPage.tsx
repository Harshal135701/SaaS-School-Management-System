import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../../services/api';
import type { Conversation, ChatMessage } from '../../types/chat';
import { ConversationList } from '../../components/chat/ConversationList';
import { ChatWindow } from '../../components/chat/ChatWindow';

interface ChatPageProps {
  user: any;
}

export const ChatPage: React.FC<ChatPageProps> = ({ user }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load conversations and connect socket
  useEffect(() => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    
    const newSocket = io(socketUrl, {
      auth: { token }
    });

    newSocket.on("connect", () => {
      console.log("Chat socket connected");
      setErrorMessage(null);
    });
    
    newSocket.on("connect_error", (err) => {
      console.error("Chat socket connection error:", err);
    });

    newSocket.on("chat_error", (err: { message: string }) => {
      console.error("Chat error from server:", err);
      setErrorMessage(err.message || "A chat error occurred");
    });

    setSocket(newSocket);

    // Fetch real user's conversations from backend
    api.get('/franchise/chat/my')
      .then(res => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          const sorted = [...res.data.data].sort((a: Conversation, b: Conversation) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          setConversations(sorted);
        }
      })
      .catch(err => {
        console.error("Failed to load conversations:", err);
      })
      .finally(() => setIsLoading(false));

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Handle Socket.IO real-time event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: ChatMessage) => {
      // 1. If message belongs to current active conversation, add to message stream
      if (selectedConversation && String(newMessage.conversationId) === String(selectedConversation.id)) {
        setMessages(prev => {
          if (prev.some(m => String(m.id) === String(newMessage.id))) return prev;
          return [...prev, newMessage];
        });
      }

      // 2. Update conversation list timestamp and move to top
      setConversations(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(c => String(c.id) === String(newMessage.conversationId));
        if (idx !== -1) {
          const [conv] = updated.splice(idx, 1);
          conv.updatedAt = newMessage.createdAt;
          updated.unshift(conv);
        }
        return updated;
      });
    };

    const handleMessageEdited = (editedMsg: ChatMessage) => {
      setMessages(prev => prev.map(m => String(m.id) === String(editedMsg.id) ? editedMsg : m));
    };

    const handleMessageDeletedForMe = (data: { messageId: string | number }) => {
      setMessages(prev => prev.filter(m => String(m.id) !== String(data.messageId)));
    };

    const handleMessageDeletedForEveryone = (deletedMsg: ChatMessage) => {
      setMessages(prev => prev.map(m => String(m.id) === String(deletedMsg.id) ? deletedMsg : m));
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_edited", handleMessageEdited);
    socket.on("message_deleted_for_me", handleMessageDeletedForMe);
    socket.on("message_deleted_for_everyone", handleMessageDeletedForEveryone);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_edited", handleMessageEdited);
      socket.off("message_deleted_for_me", handleMessageDeletedForMe);
      socket.off("message_deleted_for_everyone", handleMessageDeletedForEveryone);
    };
  }, [socket, selectedConversation]);

  // Handle conversation selection & joining socket room
  useEffect(() => {
    if (selectedConversation && socket) {
      setIsLoadingMessages(true);
      
      // Join Socket.IO conversation room
      socket.emit("join_conversation", selectedConversation.id);

      // Load messages from backend API
      api.get(`/franchise/chat/${selectedConversation.id}/messages`)
        .then(res => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setMessages(res.data.data);
          }
        })
        .catch(err => {
          console.error("Failed to load messages:", err);
        })
        .finally(() => setIsLoadingMessages(false));
    }
  }, [selectedConversation, socket]);

  const handleSendMessage = (text: string) => {
    if (!socket || !selectedConversation || !text.trim()) return;
    socket.emit("send_message", {
      conversationId: selectedConversation.id,
      message: text.trim()
    });
  };

  const handleEditMessage = (messageId: string | number, text: string) => {
    if (!socket || !text.trim()) return;
    socket.emit("edit_message", { messageId, message: text.trim() });
  };

  const handleDeleteForMe = (messageId: string | number) => {
    if (!socket) return;
    socket.emit("delete_message_for_me", { messageId });
  };

  const handleDeleteForEveryone = (messageId: string | number) => {
    if (!socket) return;
    socket.emit("delete_message_for_everyone", { messageId });
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setIsMobileListVisible(false);
  };

  const handleBackToList = () => {
    setIsMobileListVisible(true);
    setSelectedConversation(null);
  };

  return (
    <div className="h-full flex flex-col md:flex-row p-4 md:p-6 gap-4 max-h-screen">
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-rose-600 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-2 font-bold hover:opacity-80">✕</button>
        </div>
      )}

      {/* Conversation List (Hidden on mobile if chat is open) */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${!isMobileListVisible ? 'hidden md:flex' : 'flex'}`}>
        <ConversationList 
          conversations={conversations} 
          selectedConversationId={selectedConversation?.id}
          onSelect={handleSelectConversation}
          isLoading={isLoading}
          user={user}
        />
      </div>

      {/* Chat Window (Hidden on mobile if list is visible) */}
      <div className={`flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${isMobileListVisible ? 'hidden md:flex' : 'flex'}`}>
        <ChatWindow 
          conversation={selectedConversation}
          messages={messages}
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          onDeleteForMe={handleDeleteForMe}
          onDeleteForEveryone={handleDeleteForEveryone}
          isLoading={isLoadingMessages}
          user={user}
          onBack={handleBackToList}
        />
      </div>
    </div>
  );
};

