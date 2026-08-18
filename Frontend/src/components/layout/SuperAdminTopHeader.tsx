import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { mockSuperAdminNotifications, superAdminProfile } from '../../data/superAdminMockData';
import { 
  Search, 
  Bell, 
  Menu, 
  CheckCircle2,
  AlertTriangle,
  Clock,
  Info,
  Settings
} from 'lucide-react';

interface SuperAdminTopHeaderProps {
  onToggleMobileSidebar: () => void;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  onOpenAddFranchiseModal?: () => void;
}

export const SuperAdminTopHeader: React.FC<SuperAdminTopHeaderProps> = ({
  onToggleMobileSidebar,
  onNavigate
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifications = mockSuperAdminNotifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/super-admin/franchises?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-16 md:h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global SaaS Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search schools, franchise admins, contracts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100/90 border border-transparent rounded-2xl pl-10 pr-4 py-2 text-xs md:text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          />
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">

        {/* Platform Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200/80 text-xs font-bold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SaaS Platform: <strong className="text-emerald-800">24 Schools Live</strong></span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Super Admin Notification Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-88 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-slate-900">SaaS System Notifications</h4>
                  <Badge variant="blue" size="sm">{unreadCount} New</Badge>
                </div>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 py-3 max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-2.5 rounded-xl border text-xs flex items-start gap-3 transition-colors ${
                      n.severity === 'danger' ? 'bg-rose-50/70 border-rose-200 text-rose-900' :
                      n.severity === 'warning' ? 'bg-amber-50/70 border-amber-200 text-amber-900' :
                      n.severity === 'success' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' :
                      'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {n.severity === 'danger' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                      {n.severity === 'warning' && <Clock className="w-4 h-4 text-amber-600" />}
                      {n.severity === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {n.severity === 'info' && <Info className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold leading-tight">{n.title}</p>
                      <p className="text-[11px] font-medium text-slate-600 mt-0.5 leading-relaxed">{n.description}</p>
                      <span className="text-[9px] font-semibold text-slate-400 mt-1 block">{n.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate('/super-admin/franchises');
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  View All SaaS Activities →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* System Settings Icon */}
        <button
          onClick={() => onNavigate('/super-admin/settings')}
          className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="System Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-200 hidden md:block mx-1"></div>

        {/* Super Admin Avatar Badge */}
        <div 
          onClick={() => onNavigate('/super-admin/settings')}
          className="flex items-center gap-2 pl-2 border-l border-slate-200/80 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <Avatar src={superAdminProfile.avatar} name={superAdminProfile.name} size="sm" status="online" />
          <div className="hidden xl:block text-left">
            <p className="text-xs font-extrabold text-slate-900 leading-tight">{superAdminProfile.name}</p>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};
