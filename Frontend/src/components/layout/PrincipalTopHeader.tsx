import React from 'react';
import { Menu, Search, Bell, Settings } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface PrincipalTopHeaderProps {
  onMenuClick: () => void;
  user?: any;
}

export const PrincipalTopHeader: React.FC<PrincipalTopHeaderProps> = ({ 
  onMenuClick,
  user
}) => {
  return (
    <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 shrink-0">
      <div className="flex items-center justify-between h-full px-4 md:px-8">
        
        {/* Left Side: Mobile Menu + Search */}
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:flex items-center w-full max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input 
              type="text" 
              placeholder="Search students, teachers, or reports..." 
              className="w-full pl-9 pr-4 py-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors hidden sm:block">
            <Settings className="w-5 h-5" />
          </button>
          
          <button className="relative p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
            <Bell className="w-5 h-5" />
          </button>

          <div className="h-8 w-px bg-slate-200 mx-1 md:mx-2 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">{user?.name || 'Principal'}</p>
              <p className="text-[10px] font-medium text-slate-500">School Principal</p>
            </div>
            <Avatar name={user?.name || 'Principal'} size="sm" status="online" />
          </div>
        </div>
      </div>
    </header>
  );
};