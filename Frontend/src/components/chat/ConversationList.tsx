import React from 'react';
import type { Conversation } from '../../types/chat';
import { MessageSquare, User } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelect: (conv: Conversation) => void;
  isLoading: boolean;
  user: any;
}

export const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  selectedConversationId, 
  onSelect, 
  isLoading,
  user 
}) => {
  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getCounterpartInfo = (conv: Conversation) => {
    const isTeacher = user?.role === 'TEACHER';
    const title = conv.student ? `Student: ${conv.student.name}` : (isTeacher ? 'Parent' : 'Teacher');
    const subtitle = isTeacher ? 'Parent' : 'Teacher';
    return { title, subtitle };
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Messages
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
            <MessageSquare className="w-12 h-12 mb-3 text-slate-300" />
            <p className="font-semibold text-slate-700">No conversations yet</p>
            <p className="text-sm mt-1">Your conversations with teachers/parents will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {conversations.map(conv => {
              const { title, subtitle } = getCounterpartInfo(conv);
              const isSelected = conv.id === selectedConversationId;

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex gap-3 ${isSelected ? 'bg-blue-50 hover:bg-blue-50' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-lg ${isSelected ? 'bg-blue-600' : 'bg-slate-400'}`}>
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`font-semibold truncate pr-2 ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                        {title}
                      </h3>
                      <span className={`text-xs whitespace-nowrap ${isSelected ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
                        {formatTime(conv.updatedAt)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${isSelected ? 'text-blue-700/80' : 'text-slate-500'}`}>
                      {subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
