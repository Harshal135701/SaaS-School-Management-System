import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
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
  onLogout?: () => void;
  onNavigate: (path: string) => void;
  onOpenAddFranchiseModal?: () => void;
  user?: any;
  franchises?: any[];
}

export const SuperAdminTopHeader: React.FC<SuperAdminTopHeaderProps> = ({
  onToggleMobileSidebar,
  onNavigate,
  // user,
  franchises = []
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Deriving active school count
  const activeSchoolsCount = franchises.filter(
    f => f.status === 'ACTIVE' || f.status === 'Active'
  ).length;

  // Deriving notifications
  const derivedNotifications = React.useMemo(() => {
    const notifs: any[] = [];
    const now = new Date();

    franchises.forEach(f => {
      // New franchise in last 7 days
      if (f.createdAt) {
        const createdDate = new Date(f.createdAt);
        const diffDays = Math.ceil((now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays <= 7) {
          notifs.push({
            id: `new-${f.id}`,
            title: 'New Franchise Registered',
            description: `${f.name} (${f.code}) completed onboarding.`,
            severity: 'success',
            read: false,
            timestamp: diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
          });
        }
      }

      // Overdue royalty
      if (f.monthlyRoyalties) {
        f.monthlyRoyalties.forEach((r: any) => {
          if (r.status === 'OVERDUE') {
            notifs.push({
              id: `royalty-${r.id || f.id}`,
              title: 'Royalty Payment Overdue',
              description: `${f.name} (${f.code}) has an overdue payment.`,
              severity: 'danger',
              read: false,
              timestamp: r.dueDate ? `Due ${new Date(r.dueDate).toLocaleDateString()}` : 'Recently'
            });
          }
        });
      }

      // Contract expiring soon
      if (f.contracts) {
        f.contracts.forEach((c: any) => {
          if (c.endDate) {
            const endDate = new Date(c.endDate);
            const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
            if (diffDays > 0 && diffDays <= 60) {
              notifs.push({
                id: `contract-${c.id || f.id}`,
                title: 'Contract Expiring Soon',
                description: `${f.name} (${f.code}) contract ends in ${diffDays} days.`,
                severity: 'warning',
                read: false,
                timestamp: 'Upcoming'
              });
            }
          }
        });
      }
    });

    // Sort notifications, newest first (simplified sort based on ID or we can just reverse)
    return notifs.reverse();
  }, [franchises]);

  const unreadCount = derivedNotifications.length; // Assume all derived are unread or just count all

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return franchises.filter(f => 
      f.name?.toLowerCase().includes(q) || 
      f.code?.toLowerCase().includes(q) || 
      f.admin?.name?.toLowerCase().includes(q) || 
      f.admin?.email?.toLowerCase().includes(q)
    ).slice(0, 5); // top 5
  }, [searchQuery, franchises]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(false);
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full bg-slate-100/90 border border-transparent rounded-2xl pl-10 pr-4 py-2 text-xs md:text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          />
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchQuery.trim() !== '' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
              {searchResults.length > 0 ? (
                <div className="max-h-64 overflow-y-auto py-2">
                  {searchResults.map((f: any) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setShowSearchResults(false);
                        setSearchQuery('');
                        onNavigate(`/super-admin/franchises/${f.id}`);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex flex-col cursor-pointer"
                    >
                      <span className="text-sm font-bold text-slate-900">{f.name}</span>
                      <span className="text-xs text-slate-500">{f.code} {f.admin?.name ? `• ${f.admin.name}` : ''}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm font-medium text-slate-500">
                  No franchises found
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">

        {/* Platform Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200/80 text-xs font-bold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SaaS Platform: <strong className="text-emerald-800">{activeSchoolsCount} Schools Live</strong></span>
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
                {derivedNotifications.length > 0 ? derivedNotifications.map((n) => (
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
                )) : (
                  <div className="text-center text-xs text-slate-500 py-4">No new notifications</div>
                )}
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

        {/* System Settings Button at Top Right */}
        <button
          onClick={() => onNavigate('/super-admin/settings')}
          className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:text-blue-600 bg-slate-100/90 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 rounded-2xl transition-all cursor-pointer shadow-2xs group"
          title="System Settings"
          aria-label="System Settings"
        >
          <Settings className="w-4 h-4 text-slate-600 group-hover:text-blue-600 group-hover:rotate-45 transition-transform duration-300" />
          <span className="text-xs font-extrabold hidden sm:inline">Settings</span>
        </button>
      </div>
    </header>
  );
};
