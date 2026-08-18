import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '../ui/Tooltip';
import { Avatar } from '../ui/Avatar';
import { superAdminProfile } from '../../data/superAdminMockData';
import { 
  LayoutDashboard, 
  Building2, 
  PlusCircle, 
  Users, 
  BadgePercent, 
  SlidersHorizontal, 
  CalendarClock, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  FileCheck2, 
  FileX2, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  User, 
  Shield, 
  Layers,
  BarChart3,
  Globe
} from 'lucide-react';

interface SuperAdminSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onOpenAddFranchiseModal?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({
  currentPath,
  onNavigate,
  onLogout,
  onOpenAddFranchiseModal,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuSections = [
    {
      title: 'SUPER ADMIN MAIN',
      items: [
        { id: 'sa_dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/super-admin/dashboard' }
      ]
    },
    {
      title: 'FRANCHISE MANAGEMENT',
      items: [
        { id: 'sa_all_franchises', label: 'All Franchises', icon: Building2, path: '/super-admin/franchises' },
        { 
          id: 'sa_add_franchise', 
          label: 'Add Franchise', 
          icon: PlusCircle, 
          path: '#add-franchise', 
          action: onOpenAddFranchiseModal,
          badge: 'New'
        },
        { id: 'sa_franchise_admins', label: 'Franchise Admins', icon: Users, path: '/super-admin/franchise-admins' }
      ]
    },
    {
      title: 'ROYALTY MANAGEMENT',
      items: [
        { id: 'sa_royalty_overview', label: 'Royalty Overview', icon: BadgePercent, path: '/super-admin/royalty' },
        { id: 'sa_royalty_config', label: 'Royalty Configuration', icon: SlidersHorizontal, path: '/super-admin/royalty/config' },
        { id: 'sa_monthly_royalty', label: 'Monthly Royalty', icon: CalendarClock, path: '/super-admin/royalty/monthly' },
        { id: 'sa_royalty_paid', label: 'Paid Payments', icon: CheckCircle2, path: '/super-admin/royalty/paid' },
        { id: 'sa_royalty_pending', label: 'Pending Payments', icon: Clock, path: '/super-admin/royalty/pending' },
        { id: 'sa_royalty_overdue', label: 'Overdue Payments', icon: AlertTriangle, path: '/super-admin/royalty/overdue', badge: 'Alert' },
        { id: 'sa_royalty_reports', label: 'Royalty Reports', icon: BarChart3, path: '/super-admin/royalty/reports' }
      ]
    },
    {
      title: 'CONTRACT MANAGEMENT',
      items: [
        { id: 'sa_all_contracts', label: 'All Contracts', icon: FileText, path: '/super-admin/contracts' },
        { id: 'sa_active_contracts', label: 'Active Contracts', icon: FileCheck2, path: '/super-admin/contracts/active' },
        { id: 'sa_expiring_contracts', label: 'Expiring Soon', icon: Clock, path: '/super-admin/contracts/expiring', badge: '3' },
        { id: 'sa_expired_contracts', label: 'Expired Contracts', icon: FileX2, path: '/super-admin/contracts/expired' }
      ]
    }
  ];

  const handleItemClick = (item: any) => {
    if (item.action) {
      item.action();
    } else {
      onNavigate(item.path);
    }
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800 shadow-xl relative">
      {/* Brand Header */}
      <div className="h-20 px-5 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
            S
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="whitespace-nowrap"
            >
              <h1 className="text-lg font-extrabold text-white leading-none tracking-tight flex items-center gap-1.5">
                EduSphere <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-400/30">SAAS</span>
              </h1>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mt-1">
                SUPER ADMIN PLATFORM
              </span>
            </motion.div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed ? (
              <h3 className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
            ) : (
              <div className="h-2 border-t border-slate-800 my-2" />
            )}

            {section.items.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPath === item.path || (item.path !== '/super-admin/dashboard' && currentPath.startsWith(item.path) && item.path.length > 15);

              const buttonElement = (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer
                    ${isCollapsed ? 'justify-center px-0' : ''}
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 border border-blue-500/30' 
                      : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'}
                  `}
                >
                  <IconComponent className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  
                  {!isCollapsed && (
                    <div className="flex items-center justify-between w-full overflow-hidden">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-md uppercase shrink-0 ${
                          item.badge === 'Alert' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          item.badge === 'New' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );

              return isCollapsed ? (
                <Tooltip key={item.id} content={item.label} position="right">
                  {buttonElement}
                </Tooltip>
              ) : (
                buttonElement
              );
            })}
          </div>
        ))}
      </div>

      {/* USER PROFILE BOTTOM CARD */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 relative shrink-0">
        {/* Dropup Profile Menu */}
        {showProfileMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-2 z-50 animate-in fade-in slide-in-from-bottom-2 text-slate-100">
            <div className="p-3 border-b border-slate-800 bg-slate-800/40 rounded-xl mb-1">
              <p className="text-xs font-bold text-white">{superAdminProfile.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{superAdminProfile.email}</p>
            </div>

            <button
              onClick={() => {
                onNavigate('/super-admin/settings');
                setShowProfileMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Super Admin Profile</span>
            </button>

            <button
              onClick={() => {
                onNavigate('/super-admin/settings');
                setShowProfileMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>System Settings</span>
            </button>

            <div className="my-1 border-t border-slate-800" />

            <button
              onClick={() => {
                setShowProfileMenu(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Profile Card Button */}
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`
            w-full flex items-center gap-3 p-2 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:bg-slate-800 transition-all cursor-pointer shadow-2xs text-left
            ${isCollapsed ? 'justify-center p-1.5' : ''}
          `}
        >
          <Avatar src={superAdminProfile.avatar} name={superAdminProfile.name} size={isCollapsed ? 'sm' : 'md'} status="online" />
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-extrabold text-white truncate">
                {superAdminProfile.name}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase truncate">
                  SUPER ADMIN
                </span>
              </div>
            </div>
          )}

          {!isCollapsed && <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Animated Sidebar Container */}
      <motion.aside
        animate={{ width: isCollapsed ? 76 : 260 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden md:block h-screen sticky top-0 z-30 shrink-0"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />
          <aside className="relative w-72 h-full z-10 bg-slate-900">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
