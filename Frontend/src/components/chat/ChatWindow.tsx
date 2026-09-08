import React, { useRef, useEffect, useState } from 'react';
import type { Conversation, ChatMessage } from '../../types/chat';
import { MessageBubble } from './MessageBubble';
import { ArrowLeft, Send, MessageSquare } from 'lucide-react';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onEditMessage: (messageId: string, text: string) => void;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForEveryone: (messageId: string) => void;
  isLoading: boolean;
  user: any;
  onBack: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  onSendMessage,
  onEditMessage,
  onDeleteForMe,
  onDeleteForEveryone,
  isLoading,
  user,
  onBack
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-500 p-6 text-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
          <MessageSquare className="w-8 h-8 text-blue-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-700 mb-2">Select a conversation</h3>
        <p className="max-w-xs">Choose a conversation from the list to view messages.</p>
      </div>
    );
  }

  const isTeacher = user?.role === 'TEACHER';
  const headerTitle = conversation.student ? `Student: ${conversation.student.name}` : (isTeacher ? 'Parent' : 'Teacher');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white shrink-0 shadow-sm z-10">
        <button 
          onClick={onBack}
          className="md:hidden p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">
          {headerTitle.charAt(0)}
        </div>
        <div>
          <h2 className="font-bold text-slate-800 leading-tight">{headerTitle}</h2>
          <p className="text-xs text-slate-500">{isTeacher ? 'Parent' : 'Teacher'}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 custom-scrollbar space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 pb-10">
            <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
            <p className="font-medium text-slate-500">Start the conversation</p>
            <p className="text-sm">Send a message to begin.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderType === user?.role && msg.senderId === user?.id;
            return (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isMe={isMe}
                onEdit={onEditMessage}
                onDeleteForMe={onDeleteForMe}
                onDeleteForEveryone={onDeleteForEveryone}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="p-3 md:p-4 bg-white border-t border-slate-100 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 max-h-32 min-h-[44px] p-3 rounded-2xl bg-slate-100 border-transparent focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 resize-none transition-all outline-none text-slate-700"
            rows={1}
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:bg-slate-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all active:scale-95"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
};
