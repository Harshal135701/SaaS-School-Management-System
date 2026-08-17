import { useState } from 'react';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// School/Franchise Admin Existing Imports
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { StudentsPage } from './pages/admin/StudentsPage';
import { TeachersPage } from './pages/admin/TeachersPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { StaffRegistrationModal } from './components/modals/StaffRegistrationModal';
import type { StaffRegistrationInput, UserRole } from './types';

// Super Admin Imports
import { SuperAdminLayout } from './components/layout/SuperAdminLayout';
import { SuperAdminDashboardPage } from './pages/superAdmin/SuperAdminDashboardPage';
import { FranchisesPage } from './pages/superAdmin/FranchisesPage';
import { FranchiseDetailPage } from './pages/superAdmin/FranchiseDetailPage';
import { RoyaltyPage } from './pages/superAdmin/RoyaltyPage';
import { ContractsPage } from './pages/superAdmin/ContractsPage';
import { SuperAdminSettingsPage } from './pages/superAdmin/SuperAdminSettingsPage';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>('/login');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('Super Admin');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [isAddFranchiseModalOpen, setIsAddFranchiseModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLoginSuccess = (loginEmail?: string) => {
    setIsAuthenticated(true);

    // Determine Role
    const isSuper = !loginEmail || loginEmail === 'krishna.admin@edusphere.edu';
    if (isSuper) {
      setUserRole('Super Admin');
      setCurrentPath('/super-admin/dashboard');
      showToast('Welcome back, Krishna Patil! Signed in as SaaS Super Admin.');
    } else {
      setUserRole('Franchise Admin');
      setCurrentPath('/admin/dashboard');
      showToast(`Signed in successfully as Franchise Admin (${loginEmail})`);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPath('/login');
    showToast('Signed out successfully.');
  };

  const handleStaffRegistered = (data: StaffRegistrationInput) => {
    showToast(`Staff member ${data.fullName} (${data.role}) provisioned successfully! Credentials dispatched to ${data.email}.`);
  };

  // Auth pages view
  if (!isAuthenticated || currentPath === '/login' || currentPath === '/register' || currentPath === '/forgot-password') {
    if (currentPath === '/register') {
      return (
        <RegisterPage
          onRegisterSuccess={() => {
            showToast('Unified Account created successfully! Please sign in.');
            setCurrentPath('/login');
          }}
          onNavigateLogin={() => setCurrentPath('/login')}
        />
      );
    }

    if (currentPath === '/forgot-password') {
      return (
        <ForgotPasswordPage
          onNavigateLogin={() => setCurrentPath('/login')}
        />
      );
    }

    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateRegister={() => setCurrentPath('/register')}
        onNavigateForgotPassword={() => setCurrentPath('/forgot-password')}
      />
    );
  }

  // 1. SUPER ADMIN VIEWS
  if (userRole === 'Super Admin' || currentPath.startsWith('/super-admin')) {
    const renderSuperAdminContent = () => {
      if (currentPath === '/super-admin/franchises') {
        return (
          <FranchisesPage
            onNavigate={(p) => setCurrentPath(p)}
            onOpenAddFranchiseModal={() => setIsAddFranchiseModalOpen(true)}
            subView="all"
          />
        );
      }
      if (currentPath === '/super-admin/franchise-admins') {
        return (
          <FranchisesPage
            onNavigate={(p) => setCurrentPath(p)}
            onOpenAddFranchiseModal={() => setIsAddFranchiseModalOpen(true)}
            subView="admins"
          />
        );
      }
      if (currentPath.startsWith('/super-admin/franchises/')) {
        const id = currentPath.split('/super-admin/franchises/')[1];
        return <FranchiseDetailPage franchiseId={id} onNavigate={(p) => setCurrentPath(p)} />;
      }
      if (currentPath === '/super-admin/royalty') {
        return <RoyaltyPage onNavigate={(p) => setCurrentPath(p)} subView="overview" />;
      }
      if (currentPath === '/super-admin/royalty/config') {
        return <RoyaltyPage onNavigate={(p) => setCurrentPath(p)} subView="config" />;
      }
      if (currentPath === '/super-admin/royalty/monthly') {
        return <RoyaltyPage onNavigate={(p) => setCurrentPath(p)} subView="monthly" />;
      }
      if (currentPath === '/super-admin/royalty/paid') {
        return <RoyaltyPage onNavigate={(p) => setCurrentPath(p)} subView="paid" />;
      }
      if (currentPath === '/super-admin/royalty/pending') {
        return <RoyaltyPage onNavigate={(p) => setCurrentPath(p)} subView="pending" />;
      }
      if (currentPath === '/super-admin/royalty/overdue') {
        return <RoyaltyPage onNavigate={(p) => setCurrentPath(p)} subView="overdue" />;
      }
      if (currentPath === '/super-admin/royalty/reports') {
        return <RoyaltyPage onNavigate={(p) => setCurrentPath(p)} subView="reports" />;
      }
      if (currentPath === '/super-admin/contracts') {
        return <ContractsPage onNavigate={(p) => setCurrentPath(p)} subView="all" />;
      }
      if (currentPath === '/super-admin/contracts/active') {
        return <ContractsPage onNavigate={(p) => setCurrentPath(p)} subView="active" />;
      }
      if (currentPath === '/super-admin/contracts/expiring') {
        return <ContractsPage onNavigate={(p) => setCurrentPath(p)} subView="expiring" />;
      }
      if (currentPath === '/super-admin/contracts/expired') {
        return <ContractsPage onNavigate={(p) => setCurrentPath(p)} subView="expired" />;
      }
      if (currentPath === '/super-admin/settings') {
        return <SuperAdminSettingsPage onNavigate={(p) => setCurrentPath(p)} defaultTab="profile" />;
      }

      // Default Super Admin Dashboard
      return (
        <SuperAdminDashboardPage
          onNavigate={(p) => setCurrentPath(p)}
          onOpenAddFranchiseModal={() => setIsAddFranchiseModalOpen(true)}
        />
      );
    };

    return (
      <SuperAdminLayout
        currentPath={currentPath}
        onNavigate={(path) => setCurrentPath(path)}
        onLogout={handleLogout}
        isAddFranchiseModalOpen={isAddFranchiseModalOpen}
        onOpenAddFranchiseModal={() => setIsAddFranchiseModalOpen(true)}
        onCloseAddFranchiseModal={() => setIsAddFranchiseModalOpen(false)}
        onFranchiseAdded={(newFranchise) => {
          showToast(`Franchise ${newFranchise.name} (${newFranchise.code}) provisioned successfully! Admin credentials sent to ${newFranchise.adminEmail}.`);
        }}
      >
        {renderSuperAdminContent()}

        {/* Global Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
            <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </SuperAdminLayout>
    );
  }

  // 2. FRANCHISE / SCHOOL ADMIN VIEWS (EXISTING DASHBOARD UNTOUCHED)
  const renderDashboardContent = () => {
    switch (currentPath) {
      case '/admin/students':
        return <StudentsPage />;
      case '/admin/teachers':
        return <TeachersPage onOpenStaffModal={() => setIsStaffModalOpen(true)} />;
      case '/admin/settings':
        return <SettingsPage />;
      case '/admin/dashboard':
      default:
        return <AdminDashboardPage onOpenStaffModal={() => setIsStaffModalOpen(true)} />;
    }
  };

  return (
    <>
      <DashboardLayout
        currentPath={currentPath}
        onNavigate={(path) => setCurrentPath(path)}
        onLogout={handleLogout}
        onStaffRegistered={handleStaffRegistered}
      >
        {renderDashboardContent()}
      </DashboardLayout>

      {/* Global Staff Modal */}
      <StaffRegistrationModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onStaffRegistered={handleStaffRegistered}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
