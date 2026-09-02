import React, { useState } from 'react';
import { HODSidebar } from './HODSidebar';
import { HODTopHeader } from './HODTopHeader';
import { LogOut } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface HODLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  user?: any;
}

export const HODLayout: React.FC<HODLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
  onLogout,
  user
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    onLogout();
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      <HODSidebar 
        currentPath={currentPath}
        onNavigate={onNavigate}
        onLogout={() => setIsLogoutModalOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        user={user}
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 relative">
        <HODTopHeader 
          onMenuClick={() => setIsMobileMenuOpen(true)}
          user={user}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto relative custom-scrollbar">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 pointer-events-none" />
          <div className="relative h-full">
            {children}
          </div>
        </main>
      </div>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Sign Out"
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8 text-rose-600 ml-1" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to leave?</h3>
          <p className="text-slate-500 mb-6">
            You are about to sign out of the HOD Portal. You will need to log in again to access your account.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-600/20 transition-all active:scale-95 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
