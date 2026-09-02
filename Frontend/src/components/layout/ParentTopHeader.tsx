import React from 'react';
import { Bell, Menu, Search, User } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface ParentTopHeaderProps {
  onMenuClick: () => void;
  user?: any;
}

export const ParentTopHeader: React.FC<ParentTopHeaderProps> = ({ 
  onMenuClick,
  user
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden md:flex items-center gap-2 text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all w-64">
          <Search className="w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <button className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-slate-900 leading-none">{user?.name || 'Parent'}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{user?.email || 'parent@school.com'}</p>
          </div>
          <Avatar name={user?.name || 'Parent'} size="md" status="online" className="shadow-sm border border-slate-200" />
        </div>
      </div>
    </header>
  );
};
