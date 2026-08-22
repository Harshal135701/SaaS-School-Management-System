import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '../ui/Tooltip';
import { Avatar } from '../ui/Avatar';
import { currentUser } from '../../data/mockData';
import type { Franchise } from '../../types/superAdmin';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  HeartHandshake, 
  UserPlus,
  BookOpen, 
  Building2, 
  BookMarked, 
  CalendarDays, 
  CheckCircle2, 
  FileText, 
  ClipboardList, 
  CalendarOff, 
  CreditCard, 
  Library, 
  Bus, 
  Bell, 
  MessageSquare, 
  BarChart3, 
  ShieldCheck, 
  History, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  User,
  ChevronUp
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onOpenStaffModal: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  franchise?: Franchise | null; // logged-in franchise admin's school
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  onLogout,
  onOpenStaffModal,
  isMobileOpen = false,
  onCloseMobile,
  franchise
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuSections = [
    {
      title: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' }
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { id: 'students', label: 'Students', icon: GraduationCap, path: '/admin/students' },
        { id: 'teachers', label: 'Teachers & Staff', icon: Users, path: '/admin/teachers' },
        { id: 'parents', label: 'Parents', icon: HeartHandshake, path: '/admin/parents' },
        { id: 'staff_mgmt', label: 'Staff Management', icon: UserPlus, path: '#staff-provision', action: onOpenStaffModal, badge: 'Admin' }
      ]
    },
    {
      title: 'ACADEMICS',
      items: [
        { id: 'acad_mgmt', label: 'Academic Management', icon: BookOpen, path: '/admin/academics' },
        { id: 'classes', label: 'Classes & Sections', icon: Building2, path: '/admin/classes' },
        { id: 'subjects', label: 'Subjects', icon: BookMarked, path: '/admin/subjects' },
        { id: 'timetable', label: 'Timetable', icon: CalendarDays, path: '/admin/timetable' }
      ]
    },
    {
      title: 'STUDENT LIFE',
      items: [
        { id: 'attendance', label: 'Attendance', icon: CheckCircle2, path: '/admin/attendance' },
        { id: 'examination', label: 'Examination', icon: FileText, path: '/admin/exams' },
        { id: 'homework', label: 'Homework', icon: ClipboardList, path: '/admin/homework' },
        { id: 'leave', label: 'Leave Management', icon: CalendarOff, path: '/admin/leaves' }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'fees', label: 'Fees', icon: CreditCard, path: '/admin/fees' },
        { id: 'library', label: 'Library', icon: Library, path: '/admin/library' },
        { id: 'transport', label: 'Transport', icon: Bus, path: '/admin/transport' },
        { id: 'notices', label: 'Notices', icon: Bell, path: '/admin/notices' },
        { id: 'notifications', label: 'Notifications', icon: MessageSquare, path: '/admin/notifications' }
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { id: 'reports', label: 'Reports', icon: BarChart3, path: '/admin/reports' }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'users', label: 'User Management', icon: ShieldCheck, path: '/admin/users' },
        { id: 'audit', label: 'Audit Logs', icon: History, path: '/admin/audit' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' }
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
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 shadow-xs relative">
      {/* Brand Header */}
      <div className="h-20 px-5 flex items-center justify-between border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            E
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="whitespace-nowrap"
            >
              <h1 className="text-lg font-extrabold text-slate-900 leading-none tracking-tight truncate max-w-[160px]">
                {franchise ? franchise.name : 'EduSphere'}
              </h1>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mt-0.5">
                {franchise ? `${franchise.code} · SCHOOL ADMIN` : 'SCHOOL ADMIN'}
              </span>
            </motion.div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed ? (
              <h3 className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
            ) : (
              <div className="h-2 border-t border-slate-100 my-2" />
            )}

            {section.items.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPath === item.path;

              const buttonElement = (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer
                    ${isCollapsed ? 'justify-center px-0' : ''}
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' 
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'}
                  `}
                >
                  <IconComponent className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  
                  {!isCollapsed && (
                    <div className="flex items-center justify-between w-full overflow-hidden">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-indigo-100 text-indigo-700 rounded-md uppercase shrink-0">
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

      {/* LEFT BOTTOM USER PROFILE AREA */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/80 relative shrink-0">
        {/* Dropup Profile Menu */}
        {showProfileMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
            <div className="p-3 border-b border-slate-100 bg-slate-50/50 rounded-xl mb-1">
              <p className="text-xs font-bold text-slate-900">{franchise ? franchise.adminName : currentUser.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{franchise ? franchise.adminEmail : currentUser.email}</p>
              {franchise && (
                <p className="text-[10px] font-semibold text-blue-600 mt-0.5">{franchise.name}</p>
              )}
            </div>

            <button
              onClick={() => {
                onNavigate('/admin/settings');
                setShowProfileMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => {
                onNavigate('/admin/settings');
                setShowProfileMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Settings</span>
            </button>

            <div className="my-1 border-t border-slate-100" />

            <button
              onClick={() => {
                setShowProfileMenu(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
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
            w-full flex items-center gap-3 p-2 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-100/70 transition-all cursor-pointer shadow-xs text-left
            ${isCollapsed ? 'justify-center p-1.5' : ''}
          `}
        >
          <Avatar src={currentUser.avatar} name={franchise ? franchise.adminName : currentUser.name} size={isCollapsed ? 'sm' : 'md'} status="online" />
          
          {!isCollapsed && (
            <div className="text-left flex-1 min-w-0">
              <div className="text-xs font-extrabold text-slate-900 truncate">
                {franchise ? franchise.adminName : currentUser.name}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase truncate">
                  {franchise ? 'FRANCHISE ADMIN' : 'ADMINISTRATOR'}
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
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
          />
          <aside className="relative w-72 h-full z-10 bg-white">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
