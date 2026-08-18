import React, { useState } from 'react';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { SuperAdminTopHeader } from './SuperAdminTopHeader';
import { AddFranchiseModal } from '../superAdmin/AddFranchiseModal';
import type { Franchise } from '../../types/superAdmin';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onFranchiseAdded?: (newFranchise: Franchise) => void;
  isAddFranchiseModalOpen?: boolean;
  onOpenAddFranchiseModal?: () => void;
  onCloseAddFranchiseModal?: () => void;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
  onLogout,
  onFranchiseAdded,
  isAddFranchiseModalOpen: externalIsOpen,
  onOpenAddFranchiseModal: externalOnOpen,
  onCloseAddFranchiseModal: externalOnClose
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleOpenModal = externalOnOpen || (() => setInternalIsOpen(true));
  const handleCloseModal = externalOnClose || (() => setInternalIsOpen(false));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased selection:bg-blue-600 selection:text-white">
      {/* Super Admin Left Sidebar */}
      <SuperAdminSidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onOpenAddFranchiseModal={handleOpenModal}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Right Shell Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <SuperAdminTopHeader
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onLogout={onLogout}
          onNavigate={onNavigate}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Add Franchise Modal */}
      <AddFranchiseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onFranchiseAdded={(franchise) => {
          if (onFranchiseAdded) onFranchiseAdded(franchise);
          handleCloseModal();
        }}
      />
    </div>
  );
};
