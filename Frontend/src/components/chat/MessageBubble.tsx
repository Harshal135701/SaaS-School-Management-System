import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../../types/chat';
import { MoreVertical, Edit2, Trash2, Trash, Ban, Check, X } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
  onEdit: (id: string, text: string) => void;
  onDeleteForMe: (id: string) => void;
  onDeleteForEveryone: (id: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isMe, 
  onEdit, 
  onDeleteForMe, 
  onDeleteForEveryone 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.message);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isWithinTwoMinutes = (dateString: string) => {
    const timeDiff = new Date().getTime() - new Date(dateString).getTime();
    return timeDiff <= 2 * 60 * 1000;
  };

  const handleEditSubmit = () => {
    if (editText.trim() && editText.trim() !== message.message) {
      onEdit(message.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditText(message.message);
    setIsEditing(false);
  };

  const allowEditAndEveryoneDelete = isMe && isWithinTwoMinutes(message.createdAt) && !message.isDeletedForEveryone;

  if (message.isDeletedForEveryone) {
    return (
      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} w-full`}>
        <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2 shadow-sm italic flex items-center gap-2 ${
          isMe ? 'bg-blue-600/60 text-white/80 rounded-br-sm' : 'bg-slate-100 text-slate-500 rounded-bl-sm border border-slate-200'
        }`}>
          <Ban className="w-4 h-4 opacity-70" />
          <p className="text-[14px]">This message was deleted</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group w-full relative`}>
      <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2 shadow-sm flex items-start gap-2 relative ${
        isMe 
          ? 'bg-blue-600 text-white rounded-br-sm' 
          : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
      }`}>
        
        {isEditing ? (
          <div className="flex flex-col gap-2 w-full min-w-[200px]">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full text-slate-900 rounded p-1 text-sm resize-none"
              rows={2}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={handleEditCancel} className="p-1 hover:bg-slate-200/20 rounded text-white/80">
                <X className="w-4 h-4" />
              </button>
              <button onClick={handleEditSubmit} className="p-1 hover:bg-slate-200/20 rounded text-white">
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed flex-1">
            {message.message}
          </p>
        )}

        {!isEditing && (
          <div className={`relative ${isMe ? 'ml-1' : ''}`} ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`p-1 -mr-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                isMe ? 'hover:bg-blue-700 text-white' : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className={`absolute z-20 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1 ${
                isMe ? 'right-0' : 'left-0'
              }`}>
                {allowEditAndEveryoneDelete && (
                  <button 
                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit message
                  </button>
                )}
                
                <button 
                  onClick={() => { onDeleteForMe(message.id); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Trash className="w-4 h-4" />
                  Delete for me
                </button>

                {allowEditAndEveryoneDelete && (
                  <button 
                    onClick={() => { onDeleteForEveryone(message.id); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete for everyone
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-1 px-1">
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
          {formatTime(message.createdAt)}
          {message.isEdited && <span className="italic opacity-80">(edited)</span>}
        </span>
      </div>
    </div>
  );
};
