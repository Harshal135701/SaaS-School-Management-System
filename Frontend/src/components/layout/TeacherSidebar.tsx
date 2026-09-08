import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar,
  FileText,
  Clock,
  BookMarked,
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  X,
  User,
  ChevronUp,
  GraduationCap
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Tooltip } from '../ui/Tooltip';

interface TeacherSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  user?: any;
}

export const TeacherSidebar: React.FC<TeacherSidebarProps> = ({
  currentPath,
  onNavigate,
  onLogout,
  isMobileOpen,
  onCloseMobile,
  user
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuSections = [
    {
      title: 'DASHBOARD',
      items: [
        { id: 't_dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/teacher/dashboard' }
      ]
    },
    {
      title: 'ACADEMICS',
      items: [
        { id: 't_classes', label: 'My Classes', icon: BookOpen, path: '/teacher/classes' },
        { id: 't_students', label: 'My Students', icon: Users, path: '/teacher/students' },
        { id: 't_attendance', label: 'Attendance', icon: Calendar, path: '/teacher/attendance' },
        { id: 't_examinations', label: 'Examinations', icon: FileText, path: '/teacher/examinations' },
        { id: 't_assignments', label: 'Homework / Assignments', icon: BookMarked, path: '/teacher/assignments' },
        { id: 't_timetable', label: 'Timetable', icon: Clock, path: '/teacher/timetable' }
      ]
    }
  ];

  const teacherName = user?.name || 'Teacher';
  const teacherEmail = user?.email || 'teacher@school.com';

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white relative">
      {/* Brand Header */}
      <div className={`p-4 flex items-center border-b border-slate-100 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white font-black text-lg tracking-tighter">E</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">
                EduSphere <span className="text-blue-600">SaaS</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                Teacher Portal
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center w-6 h-6 rounded-md hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            {!isCollapsed && (
              <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2 px-3">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
                return (
                  <li key={item.id}>
                    <Tooltip content={isCollapsed ? item.label : ''} position="right">
                      <button
                        onClick={() => {
                          onNavigate(item.path);
                          onCloseMobile?.();
                        }}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer
                          ${isActive 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                            : 'text-slate-600 hover:bg-blue-50/80 hover:text-blue-700'
                          }
                          ${isCollapsed ? 'justify-center' : ''}
                        `}
                      >
                        <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </button>
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* USER PROFILE BOTTOM CARD */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/80 relative shrink-0">
        <AnimatePresence>
          {showProfileMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50"
            >
              <div className="p-3 border-b border-slate-100 bg-slate-50/50 rounded-xl mb-1">
                <p className="text-xs font-bold text-slate-900">{teacherName}</p>
                <p className="text-[11px] text-slate-500 truncate">{teacherEmail}</p>
              </div>

              <button
                onClick={() => {
                  onNavigate('/teacher/profile');
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Profile</span>
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
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`
            w-full flex items-center gap-3 p-2 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-100/70 transition-all cursor-pointer shadow-xs text-left
            ${isCollapsed ? 'justify-center p-1.5' : ''}
          `}
        >
          <Avatar name={teacherName} size={isCollapsed ? 'sm' : 'md'} status="online" />
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-extrabold text-slate-900 truncate">
                {teacherName}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <GraduationCap className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="text-[10px] font-bold text-indigo-500 tracking-wider uppercase truncate">
                  TEACHER
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
      <aside className={`hidden md:block transition-all duration-300 ease-in-out border-r border-slate-200/80 shrink-0 ${isCollapsed ? 'w-20' : 'w-64'} z-30`}>
        {SidebarContent}
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[80vw] z-50 md:hidden shadow-2xl"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
