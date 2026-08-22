import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import api from './services/api';

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
import type { Franchise } from './types/superAdmin';

// Super Admin email — the only hardcoded check needed


export function App() {
  const [currentPath, setCurrentPath] = useState<string>('/login');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('Super Admin');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Super Admin Modal States
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [editFranchise, setEditFranchise] = useState<Franchise | null>(null);

  // Shared franchise list (all schools registered in the platform)
  const [franchises, setFranchises] = useState<Franchise[]>([]);

  // The franchise that the currently logged-in franchise admin belongs to
  const [loggedInFranchise, setLoggedInFranchise] = useState<Franchise | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    // Check active session in the current browser tab
    const token = sessionStorage.getItem('token');

    if (!token) {
      // Clear any legacy persistent token so new sessions always start at Login page
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setCurrentPath('/login');
      return;
    }

    try {
      const decoded: { role?: string; exp?: number } = jwtDecode(token);

      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setCurrentPath('/login');
        return;
      }

      if (decoded.role === 'SYSTEM_ADMIN') {
        setUserRole('Super Admin');
        setCurrentPath('/super-admin/dashboard');
        setIsAuthenticated(true);
        // Fetch real franchises from backend on load
        api.get('/system-admin/franchises').then(res => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setFranchises(res.data.data);
          }
        }).catch(() => {/* keep mock data if fetch fails */});
      } else if (decoded.role === 'FRANCHISE_ADMIN') {
        setUserRole('Franchise Admin');
        setCurrentPath('/admin/dashboard');
        setIsAuthenticated(true);
      } else {
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setCurrentPath('/login');
      }
    } catch (error) {
      console.error('Invalid authentication token:', error);
      sessionStorage.removeItem('token');
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setCurrentPath('/login');
    }
  }, []);

  const handleLoginSuccess = (user?: any) => {
  setIsAuthenticated(true);

  // System Admin / Super Admin
  if (user?.role === 'SYSTEM_ADMIN') {
    setUserRole('Super Admin');
    setLoggedInFranchise(null);
    setCurrentPath('/super-admin/dashboard');
    // Fetch real franchises from backend immediately after login
    api.get('/system-admin/franchises').then(res => {
      if (res.data?.success && Array.isArray(res.data.data)) {
        setFranchises(res.data.data);
      }
    }).catch(() => {/* keep mock data if fetch fails */});

    showToast(
      `Welcome back, ${user.name || 'Super Admin'}! Signed in as SaaS Super Admin.`
    );
    return;
  }

  // Franchise / School Admin
  if (user?.role === 'FRANCHISE_ADMIN') {
    setUserRole('Franchise Admin');

    // Find the school/franchise associated with this admin.
    // Match by admin email when the franchise data is available.
    const matchedFranchise = franchises.find(
      f =>
        f.adminEmail &&
        user.email &&
        f.adminEmail.toLowerCase() === user.email.toLowerCase()
    );

    setLoggedInFranchise(matchedFranchise || null);
    setCurrentPath('/admin/dashboard');

    if (matchedFranchise) {
      showToast(
        `Welcome, ${matchedFranchise.adminName}! Signed in to ${matchedFranchise.name}.`
      );
    } else {
      showToast(
        `Signed in successfully as Franchise Admin (${user.email}).`
      );
    }

    return;
  }

  // Unknown / invalid role
  setIsAuthenticated(false);
  setLoggedInFranchise(null);
  setCurrentPath('/login');

  showToast('Invalid user role.');
};

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setLoggedInFranchise(null);
    setCurrentPath('/login');
    showToast('Signed out successfully.');
  };

  const handleStaffRegistered = (data: StaffRegistrationInput) => {
    showToast(`Staff member ${data.fullName} (${data.role}) provisioned successfully! Credentials dispatched to ${data.email}.`);
  };

  const handleFranchiseAdded = async (franchise: Franchise) => {
    try {
      const res = await api.post('/system-admin/franchises', {
        name: franchise.name,
        code: franchise.code,
        email: franchise.email,
        phone: franchise.phone,
        address: franchise.address,
        city: franchise.city,
        state: franchise.state,
        pincode: '400001', // Dummy pincode since UI doesn't have it
        planId: franchise.plan // The UI now sets the real UUID here
      });
      
      // Use returned ID if available
      if (res.data?.data?.id) {
        franchise.id = res.data.data.id;
      }
    } catch (error) {
      console.warn('Backend franchise creation note:', error);
    }
    
    setFranchises(prev => [...prev, franchise]);
    showToast(`Franchise school "${franchise.name}" (${franchise.code}) created successfully!`);
  };

  const handleFranchiseUpdated = (franchise: Franchise) => {
    setFranchises(prev => prev.map(f => f.id === franchise.id ? franchise : f));
    showToast(`Franchise school "${franchise.name}" updated successfully!`);
  };

  const handleAdminAdded = (data: { schoolId: string; adminName: string; adminEmail: string; adminPhone: string; adminPassword: string }) => {
    setFranchises(prev =>
      prev.map(f => {
        if (f.id === data.schoolId || String(f.id) === String(data.schoolId) || f.code === data.schoolId) {
          return {
            ...f,
            adminName: data.adminName,
            adminEmail: data.adminEmail,
            adminPhone: data.adminPhone,
            adminPassword: data.adminPassword,
            admin: {
              name: data.adminName,
              email: data.adminEmail
            }
          };
        }
        return f;
      })
    );
    showToast(`Franchise Admin "${data.adminName}" assigned to school successfully!`);
  };

  const handleOpenEditSchoolModal = (franchise: Franchise) => {
    setEditFranchise(franchise);
    setIsAddSchoolModalOpen(true);
  };

  const handleCloseSchoolModal = () => {
    setIsAddSchoolModalOpen(false);
    setEditFranchise(null);
  };

  // ── AUTH PAGES ──
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

  // ── 1. SUPER ADMIN VIEWS ──
  if (userRole === 'Super Admin' || currentPath.startsWith('/super-admin')) {
    const renderSuperAdminContent = () => {
      if (currentPath === '/super-admin/franchises') {
        return (
          <FranchisesPage
            onNavigate={(p) => setCurrentPath(p)}
            onOpenAddFranchiseModal={() => setIsAddSchoolModalOpen(true)}
            subView="all"
          />
        );
      }
      if (currentPath === '/super-admin/franchise-admins') {
        return (
          <FranchisesPage
            onNavigate={(p) => setCurrentPath(p)}
            onOpenAddFranchiseModal={() => setIsAddSchoolModalOpen(true)}
            subView="admins"
          />
        );
      }
      if (currentPath.startsWith('/super-admin/franchises/')) {
        const id = currentPath.split('/super-admin/franchises/')[1];
        return <FranchiseDetailPage franchiseId={id} franchiseList={franchises} onNavigate={(p) => setCurrentPath(p)} />;
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

      return (
        <SuperAdminDashboardPage
          onNavigate={(p) => setCurrentPath(p)}
          onOpenAddSchoolModal={() => setIsAddSchoolModalOpen(true)}
          onOpenAddAdminModal={() => setIsAddAdminModalOpen(true)}
          onEditFranchise={handleOpenEditSchoolModal}
          franchiseList={franchises}
        />
      );
    };

    return (
      <SuperAdminLayout
        currentPath={currentPath}
        onNavigate={(path) => setCurrentPath(path)}
        onLogout={handleLogout}
        isAddSchoolModalOpen={isAddSchoolModalOpen}
        onOpenAddSchoolModal={() => setIsAddSchoolModalOpen(true)}
        onCloseAddSchoolModal={handleCloseSchoolModal}
        editFranchise={editFranchise}
        onFranchiseAdded={handleFranchiseAdded}
        onFranchiseUpdated={handleFranchiseUpdated}
        onAdminAdded={handleAdminAdded}
        isAddAdminModalOpen={isAddAdminModalOpen}
        onOpenAddAdminModal={() => setIsAddAdminModalOpen(true)}
        onCloseAddAdminModal={() => setIsAddAdminModalOpen(false)}
        franchises={franchises}
      >
        {renderSuperAdminContent()}

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

  // ── 2. FRANCHISE / SCHOOL ADMIN VIEWS ──
  // loggedInFranchise holds the specific school for this admin
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
        return (
          <AdminDashboardPage
            onOpenStaffModal={() => setIsStaffModalOpen(true)}
            // Pass the logged-in franchise data so the dashboard is personalized
            franchise={loggedInFranchise}
          />
        );
    }
  };

  return (
    <>
      <DashboardLayout
        currentPath={currentPath}
        onNavigate={(path) => setCurrentPath(path)}
        onLogout={handleLogout}
        onStaffRegistered={handleStaffRegistered}
        // Pass franchise info to layout so sidebar/header can show school name
        franchise={loggedInFranchise}
      >
        {renderDashboardContent()}
      </DashboardLayout>

      <StaffRegistrationModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onStaffRegistered={handleStaffRegistered}
      />

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
