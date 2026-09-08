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

  // Load conversations and connect socket
  useEffect(() => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const newSocket = io("http://localhost:5000", {
      auth: { token }
    });

    newSocket.on("connect", () => console.log("Chat socket connected"));
    newSocket.on("connect_error", (err) => console.error("Chat socket error", err));
    newSocket.on("chat_error", (err) => console.error("Chat error", err));

    setSocket(newSocket);

    api.get('/chat/my')
      .then(res => {
        if (res.data?.success) {
          // Sort descending by updatedAt
          const sorted = res.data.data.sort((a: Conversation, b: Conversation) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          setConversations(sorted);
        }
      })
      .catch(err => console.error("Failed to load conversations", err))
      .finally(() => setIsLoading(false));

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Handle new messages globally to update conversation list and selected messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: ChatMessage) => {
      // 1. If it belongs to selected conversation, add it to messages list
      if (selectedConversation && message.conversationId === selectedConversation.id) {
        setMessages(prev => {
          // Deduplicate
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }

      // 2. Update conversation list timestamp (bring to top)
      setConversations(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(c => c.id === message.conversationId);
        if (idx !== -1) {
          const [conv] = updated.splice(idx, 1);
          conv.updatedAt = message.createdAt; // or message.updatedAt
          updated.unshift(conv);
        }
        return updated;
      });
    };

    socket.on("new_message", handleNewMessage);
    const handleMessageEdited = (editedMsg: ChatMessage) => {
      setMessages(prev => prev.map(m => m.id === editedMsg.id ? editedMsg : m));
    };

    const handleMessageDeletedForMe = (data: { messageId: string }) => {
      setMessages(prev => prev.filter(m => m.id !== data.messageId));
    };

    const handleMessageDeletedForEveryone = (deletedMsg: ChatMessage) => {
      setMessages(prev => prev.map(m => m.id === deletedMsg.id ? deletedMsg : m));
    };

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

  // Handle conversation selection
  useEffect(() => {
    if (selectedConversation && socket) {
      setIsLoadingMessages(true);
      
      // Join room
      socket.emit("join_conversation", selectedConversation.id);

      // Load messages
      api.get(`/chat/${selectedConversation.id}/messages`)
        .then(res => {
          if (res.data?.success) {
            setMessages(res.data.data);
          }
        })
        .catch(err => console.error("Failed to load messages", err))
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

  
  const handleEditMessage = (messageId: string, text: string) => {
    if (!socket) return;
    socket.emit("edit_message", { messageId, message: text });
  };

  const handleDeleteForMe = (messageId: string) => {
    if (!socket) return;
    socket.emit("delete_message_for_me", { messageId });
  };

  const handleDeleteForEveryone = (messageId: string) => {
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
