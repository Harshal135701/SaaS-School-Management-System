import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  MessageSquare, 
  Menu, 
  Calendar 
} from 'lucide-react';
import api from '../../services/api';

interface TopHeaderProps {
  onToggleMobileSidebar: () => void;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleMobileSidebar,
  onNavigate
}) => {
  const [selectedSession, setSelectedSession] = useState('2026–27');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);

  const sessions = ['2026–27', '2025–26', '2024–25'];

  const fetchRecentChats = async () => {
    try {
      setLoadingChats(true);
      const res = await api.get('/franchise/chat/my').catch(() => ({ data: { success: false, data: [] } }));
      if (res.data?.success && Array.isArray(res.data.data)) {
        setRecentChats(res.data.data);
      } else {
        setRecentChats([]);
      }
    } catch {
      setRecentChats([]);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchRecentChats();
  }, []);

  const handleOpenChat = () => {
    setShowMessages(false);
    const isTeacher = window.location.pathname.startsWith('/teacher');
    onNavigate(isTeacher ? '/teacher/chat' : '/admin/chat');
  };

  return (
    <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search students, teachers, parents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100/80 border border-transparent rounded-2xl pl-10 pr-4 py-2 text-xs md:text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {/* Academic Session Selector */}
        <div className="relative hidden sm:block">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/80 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 border border-slate-200/60 cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Session: <strong className="text-blue-700">{selectedSession}</strong></span>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            >
              {sessions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Notification Bell (Truthful: no fake pulse dot) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowMessages(false);
            }}
            className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* Notification Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                <span className="text-[11px] text-slate-400 font-semibold">0 New</span>
              </div>
              <div className="py-6 text-center text-xs text-slate-500">
                <Bell className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No notifications available</p>
                <p className="text-[11px] text-slate-400 mt-0.5">You're all caught up!</p>
              </div>
            </div>
          )}
        </div>

        {/* Messages Icon (Truthful: badge only if real chats exist) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowMessages(!showMessages);
              setShowNotifications(false);
              if (!showMessages) fetchRecentChats();
            }}
            className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Messages"
          >
            <MessageSquare className="w-5 h-5" />
            {recentChats.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            )}
          </button>

          {/* Messages Popover */}
          {showMessages && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">Staff Communications</h4>
                <button
                  onClick={handleOpenChat}
                  className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  Open Chat
                </button>
              </div>
              {loadingChats ? (
                <div className="py-6 text-xs text-slate-400 text-center">Loading communications...</div>
              ) : recentChats.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  <MessageSquare className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No recent messages</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Start communicating in Staff Chat</p>
                  <button
                    onClick={handleOpenChat}
                    className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                  >
                    Go to Chat
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {recentChats.slice(0, 5).map((chat) => (
                    <div
                      key={chat.id}
                      onClick={handleOpenChat}
                      className="py-2.5 px-1 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {chat.user?.name || chat.name || 'Staff Member'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {chat.lastMessage?.content || 'Click to view conversation'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
