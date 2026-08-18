import React, { useState } from 'react';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { SuperAdminTopHeader } from './SuperAdminTopHeader';
import { AddFranchiseSchoolModal } from '../superAdmin/AddFranchiseSchoolModal';
import { AddFranchiseAdminModal } from '../superAdmin/AddFranchiseAdminModal';
import { mockFranchises } from '../../data/superAdminMockData';
import type { Franchise } from '../../types/superAdmin';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onFranchiseAdded?: (newFranchise: Franchise) => void;
  onFranchiseUpdated?: (franchise: Franchise) => void;
  // School modal
  isAddSchoolModalOpen?: boolean;
  onOpenAddSchoolModal?: () => void;
  onCloseAddSchoolModal?: () => void;
  editFranchise?: Franchise | null;
  // Admin modal
  isAddAdminModalOpen?: boolean;
  onOpenAddAdminModal?: () => void;
  onCloseAddAdminModal?: () => void;
  // Franchise list (for admin modal school selector)
  franchises?: Franchise[];
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
  onLogout,
  onFranchiseAdded,
  onFranchiseUpdated,
  isAddSchoolModalOpen: externalSchoolOpen,
  onOpenAddSchoolModal: externalOpenSchool,
  onCloseAddSchoolModal: externalCloseSchool,
  editFranchise,
  isAddAdminModalOpen: externalAdminOpen,
  onOpenAddAdminModal: externalOpenAdmin,
  onCloseAddAdminModal: externalCloseAdmin,
  franchises = mockFranchises
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [internalSchoolOpen, setInternalSchoolOpen] = useState(false);
  const [internalAdminOpen, setInternalAdminOpen] = useState(false);

  const isSchoolModalOpen = externalSchoolOpen !== undefined ? externalSchoolOpen : internalSchoolOpen;
  const handleOpenSchool = externalOpenSchool || (() => setInternalSchoolOpen(true));
  const handleCloseSchool = externalCloseSchool || (() => setInternalSchoolOpen(false));

  const isAdminModalOpen = externalAdminOpen !== undefined ? externalAdminOpen : internalAdminOpen;
  const handleOpenAdmin = externalOpenAdmin || (() => setInternalAdminOpen(true));
  const handleCloseAdmin = externalCloseAdmin || (() => setInternalAdminOpen(false));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased selection:bg-blue-600 selection:text-white">
      {/* Super Admin Left Sidebar */}
      <SuperAdminSidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onOpenAddSchoolModal={handleOpenSchool}
        onOpenAddAdminModal={handleOpenAdmin}
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

      {/* Add Franchise School Modal */}
      <AddFranchiseSchoolModal
        isOpen={isSchoolModalOpen}
        onClose={handleCloseSchool}
        editFranchise={editFranchise}
        onSave={(franchise) => {
          if (editFranchise && onFranchiseUpdated) {
            onFranchiseUpdated(franchise);
          } else if (onFranchiseAdded) {
            onFranchiseAdded(franchise);
          }
          handleCloseSchool();
        }}
      />

      {/* Add Franchise Admin Modal */}
      <AddFranchiseAdminModal
        isOpen={isAdminModalOpen}
        onClose={handleCloseAdmin}
        franchises={franchises}
        onSave={() => {
          handleCloseAdmin();
        }}
      />
    </div>
  );
};
