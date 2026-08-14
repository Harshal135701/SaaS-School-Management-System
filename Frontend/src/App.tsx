import { useState } from 'react';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { StudentsPage } from './pages/admin/StudentsPage';
import { TeachersPage } from './pages/admin/TeachersPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { StaffRegistrationModal } from './components/modals/StaffRegistrationModal';
import type { StaffRegistrationInput } from './types';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>('/login');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPath('/admin/dashboard');
    showToast('Welcome back, Krishna Patil! Signed in as Super Admin.');
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

  // Dashboard views
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
