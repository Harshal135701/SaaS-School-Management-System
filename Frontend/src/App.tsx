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
import { ParentsPage } from './pages/admin/ParentsPage';
import { ClassesPage } from './pages/admin/ClassesPage';
import { ExaminationPage } from './pages/admin/ExaminationPage';
import { FeesPage } from './pages/admin/FeesPage';
import { AttendancePage } from './pages/admin/AttendancePage';
import { HomeworkPage } from './pages/admin/HomeworkPage';
import { TimetablePage } from './pages/admin/TimetablePage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { SubjectsPage } from './pages/admin/SubjectsPage';
import { LibraryPage } from './pages/admin/LibraryPage';
import { TransportPage } from './pages/admin/TransportPage';
import { StaffRegistrationModal } from './components/modals/StaffRegistrationModal';
import { Bell, BarChart3, CalendarOff, MessageSquare } from 'lucide-react';
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

// Teacher Imports
import { TeacherLayout } from './components/layout/TeacherLayout';
import { TeacherDashboardPage } from './pages/teacher/TeacherDashboardPage';

// HOD Imports
import { HODLayout } from './components/layout/HODLayout';
import { HODDashboardPage } from './pages/hod/HODDashboardPage';

// Principal Imports
import { PrincipalLayout } from './components/layout/PrincipalLayout';
import { PrincipalDashboardPage } from './pages/principal/PrincipalDashboardPage';

// Parent Imports
import { ParentLayout } from './components/layout/ParentLayout';
import { ParentDashboardPage } from './pages/parent/ParentDashboardPage';
import { ChatPage } from './pages/chat/ChatPage';

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

  const [currentUser, setCurrentUser] = useState<any>(null);

  // Shared franchise list (all schools registered in the platform)
  const [franchises, setFranchises] = useState<Franchise[]>([]);

  // The franchise that the currently logged-in franchise admin belongs to
  const [loggedInFranchise, setLoggedInFranchise] = useState<Franchise | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };
  const loadFranchiseDashboard = async (user?: any) => {
  try {
    const res = await api.get('/franchise/dashboard/');

    if (res.data?.success && res.data?.data?.franchise) {
      const backendFranchise = res.data.data.franchise;

      const franchise: Franchise = {
        id: backendFranchise.id,
        code: backendFranchise.code,
        name: backendFranchise.name,
        email: backendFranchise.email,
        phone: backendFranchise.phone,
        address: backendFranchise.address || '',
        city: backendFranchise.city,
        state: backendFranchise.state,
        country: backendFranchise.country || 'India',

        plan: 'Basic',

        adminName: user?.name || 'Admin',
        adminEmail: user?.email || '',
        adminPhone: user?.phone || '',

        studentCount: 0,
        teacherCount: 0,

        contractStatus: 'Active',
        royaltyStatus: 'Pending',
        status: 'Active',

        joinedDate: '',
        contractStartDate: '',
        contractEndDate: '',

        monthlyRoyalty: 0,
      };

      setLoggedInFranchise(franchise);

      return franchise;
    }

    setLoggedInFranchise(null);
    return null;

  } catch (error) {
    console.error('Failed to fetch franchise dashboard:', error);
    setLoggedInFranchise(null);
    return null;
  }
};

  useEffect(() => {
    // Check active session in the current browser tab
    const token = sessionStorage.getItem('token');

    if (!token) {
      // Clear any legacy persistent token so new sessions always start at Login page
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setCurrentPath('/login');
      return;
    }

    try {
      const decoded: { role?: string; exp?: number } = jwtDecode(token);

      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setCurrentPath('/login');
        return;
      }

        let storedUser = null;
        try {
          const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
          if (userStr) {
            storedUser = JSON.parse(userStr);
          }
        } catch (e) {}

        if (storedUser) {
          setCurrentUser(storedUser);
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
        loadFranchiseDashboard(storedUser);
      } else if (decoded.role === 'PRINCIPAL') {
        setUserRole('Principal');
        setCurrentPath('/principal/dashboard');
        setIsAuthenticated(true);
      } else if (decoded.role === 'HOD') {
        setUserRole('HOD');
        setCurrentPath('/hod/dashboard');
        setIsAuthenticated(true);
      } else if (decoded.role === 'TEACHER') {
        setUserRole('Teacher');
        setCurrentPath('/teacher/dashboard');
        setIsAuthenticated(true);
      } else if (decoded.role === 'PARENT') {
        setUserRole('Parent');
        setCurrentPath('/parent/dashboard');
        setIsAuthenticated(true);
      } else {
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setCurrentPath('/login');
      }
    } catch (error) {
      console.error('Invalid authentication token:', error);
      sessionStorage.removeItem('token');
      localStorage.removeItem('token');
      sessionStorage.removeItem('user');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setCurrentPath('/login');
    }
  }, []);

 const handleLoginSuccess = async (user?: any) => {
  console.log('USER RECEIVED IN APP:', user);
  setIsAuthenticated(true);
  if (user) setCurrentUser(user);

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
    console.log('FRANCHISE ADMIN USER:', user);
  setUserRole('Franchise Admin');

  try {
    // Fetch the actual school/franchise belonging to
    // the currently logged-in Franchise Admin.
    const res = await api.get('/franchise/dashboard/');

    if (res.data?.success && res.data?.data?.franchise) {
      const backendFranchise = res.data.data.franchise;

      const franchise: Franchise = {
        id: backendFranchise.id,
        code: backendFranchise.code,
        name: backendFranchise.name,
        email: backendFranchise.email,
        phone: backendFranchise.phone,
        address: backendFranchise.address || '',
        city: backendFranchise.city,
        state: backendFranchise.state,
        country: backendFranchise.country || 'India',

        plan: 'Basic',

        adminName: user.name || 'Admin',
        adminEmail: user.email || '',
        adminPhone: user.phone || '',

        studentCount: 0,
        teacherCount: 0,

        contractStatus: 'Active',
        royaltyStatus: 'Pending',
        status: 'Active',

        joinedDate: '',
        contractStartDate: '',
        contractEndDate: '',

        monthlyRoyalty: 0,
      };
      console.log('FRANCHISE CREATED FOR DASHBOARD:', franchise);
      setLoggedInFranchise(franchise);

      setCurrentPath('/admin/dashboard');

      showToast(
        `Welcome, ${user.name || 'Admin'}! Signed in to ${franchise.name}.`
      );
    } else {
      setLoggedInFranchise(null);
      setCurrentPath('/admin/dashboard');

      showToast(
        `Signed in successfully as Franchise Admin (${user.email}).`
      );
    }
  } catch (error) {
    console.error('Failed to fetch franchise dashboard:', error);

    setLoggedInFranchise(null);
    setCurrentPath('/admin/dashboard');

    showToast(
      `Signed in successfully as Franchise Admin (${user.email}).`
    );
  }

  return;
}

  // Principal
  if (user?.role === 'PRINCIPAL') {
    setUserRole('Principal');
    setLoggedInFranchise(null);
    setCurrentPath('/principal/dashboard');
    showToast(`Welcome back, ${user.name || 'Principal'}!`);
    return;
  }

  // HOD
  if (user?.role === 'HOD') {
    setUserRole('HOD');
    setLoggedInFranchise(null);
    setCurrentPath('/hod/dashboard');
    showToast(`Welcome back, ${user.name || 'HOD'}!`);
    return;
  }

  // Teacher
  if (user?.role === 'TEACHER') {
    setUserRole('Teacher');
    setLoggedInFranchise(null);
    setCurrentPath('/teacher/dashboard');
    showToast(`Welcome back, ${user.name || 'Teacher'}!`);
    return;
  }

  // Parent
  if (user?.role === 'PARENT') {
    setUserRole('Parent');
    setLoggedInFranchise(null); // Parent doesn't manage the franchise
    setCurrentPath('/parent/dashboard');
    showToast(`Welcome back, ${user.name || 'Parent'}!`);
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
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
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
      
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Server rejected creation');
      }

      // Use returned data if available
      const newFranchise = res.data?.data || franchise;
      setFranchises(prev => [...prev, newFranchise]);
      showToast(`Franchise school "${newFranchise.name}" (${newFranchise.code}) created successfully!`);
    } catch (error: any) {
      console.error('Backend franchise creation failed:', error);
      showToast(error.response?.data?.message || error.message || 'Failed to create franchise');
      throw error;
    }
  };

  const handleFranchiseUpdated = async (franchise: Franchise) => {
    try {
      const res = await api.patch(`/system-admin/franchises/${franchise.id}`, {
        name: franchise.name,
        code: franchise.code,
        email: franchise.email,
        phone: franchise.phone,
        address: franchise.address,
        city: franchise.city,
        state: franchise.state
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Server rejected update');
      }

      const refreshRes = await api.get('/system-admin/franchises');
      if (refreshRes.data?.success && Array.isArray(refreshRes.data.data)) {
        setFranchises(refreshRes.data.data);
      }

      const updatedFranchise = res.data?.data || franchise;
      showToast(`Franchise school "${updatedFranchise.name}" updated successfully!`);
    } catch (error: any) {
      console.error('Backend franchise update failed:', error);
      showToast(error.response?.data?.message || error.message || 'Failed to update franchise');
      throw error;
    }
  };

  const handleFranchiseDeleted = async (id: string) => {
    try {
      const res = await api.delete(`/system-admin/franchises/${id}`);
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Server rejected deletion');
      }
      setFranchises(prev => prev.filter(f => f.id !== id));
      showToast(`Franchise deleted successfully!`);
    } catch (error: any) {
      console.error('Backend franchise deletion failed:', error);
      showToast(error.response?.data?.message || error.message || 'Failed to delete franchise (Endpoint likely missing)');
      throw error;
    }
  };

  const handleAdminAdded = async (data: {
  schoolId: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminPassword: string;
}) => {
  try {
    const response = await api.post(
      `/system-admin/franchises/${data.schoolId}/admin`,
      {
        name: data.adminName,
        email: data.adminEmail,
        password: data.adminPassword,
      }
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to create franchise admin');
    }

    const createdAdmin = response.data.data;

    setFranchises(prev =>
      prev.map(f => {
        if (
          String(f.id) === String(data.schoolId) ||
          f.code === data.schoolId
        ) {
          return {
            ...f,
            adminName: createdAdmin.name,
            adminEmail: createdAdmin.email,
            adminPhone: data.adminPhone,
            admin: {
              id: createdAdmin.id,
              name: createdAdmin.name,
              email: createdAdmin.email,
              isActive: createdAdmin.isActive,
            },
          };
        }

        return f;
      })
    );

    showToast(
      `Franchise Admin "${createdAdmin.name}" assigned to school successfully!`
    );
  } catch (error: any) {
    console.error('Failed to create franchise admin:', error);

    showToast(
      error.response?.data?.message ||
      'Failed to create franchise admin'
    );
  }
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
            onOpenAddAdminModal={() => setIsAddAdminModalOpen(true)}
            onEditFranchise={handleOpenEditSchoolModal}
            onDeleteFranchise={handleFranchiseDeleted}
            subView="all"
          />
        );
      }
      if (currentPath === '/super-admin/franchise-admins') {
        return (
          <FranchisesPage
            onNavigate={(p) => setCurrentPath(p)}
            onOpenAddFranchiseModal={() => setIsAddSchoolModalOpen(true)}
            onOpenAddAdminModal={() => setIsAddAdminModalOpen(true)}
            onEditFranchise={handleOpenEditSchoolModal}
            onDeleteFranchise={handleFranchiseDeleted}
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
          onDeleteFranchise={handleFranchiseDeleted}
          franchiseList={franchises}
        />
      );
    };

    return (
      <SuperAdminLayout
        user={currentUser}
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

  // ── 2. PRINCIPAL VIEWS ──
  if (userRole === 'Principal' || currentPath.startsWith('/principal')) {
    return (
      <PrincipalLayout
        currentPath={currentPath}
        onNavigate={(path) => setCurrentPath(path)}
        onLogout={handleLogout}
        user={currentUser}
      >
        {currentPath === '/principal/dashboard' || currentPath === '/principal' ? (
          <PrincipalDashboardPage user={currentUser} onNavigate={(path) => setCurrentPath(path)} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 font-medium">
            Page not found in Principal Portal.
          </div>
        )}

        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
            <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {toastMessage}
            </div>
          </div>
        )}
      </PrincipalLayout>
    );
  }

  // ── 3. HOD VIEWS ──
  if (userRole === 'HOD' || currentPath.startsWith('/hod')) {
    return (
      <HODLayout
        currentPath={currentPath}
        onNavigate={(path) => setCurrentPath(path)}
        onLogout={handleLogout}
        user={currentUser}
      >
        {currentPath === '/hod/dashboard' || currentPath === '/hod' ? (
          <HODDashboardPage user={currentUser} onNavigate={(path) => setCurrentPath(path)} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 font-medium">
            Page not found in HOD Portal.
          </div>
        )}

        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
            <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </HODLayout>
    );
  }

  // ── 4. TEACHER VIEWS ──
  if (userRole === 'Teacher' || currentPath.startsWith('/teacher')) {
    return (
      <TeacherLayout
        currentPath={currentPath}
        onNavigate={(path) => setCurrentPath(path)}
        onLogout={handleLogout}
        user={currentUser}
      >
        {currentPath === '/teacher/dashboard' || currentPath === '/teacher' ? (
          <TeacherDashboardPage user={currentUser} onNavigate={(path) => setCurrentPath(path)} />
        ) : currentPath === '/teacher/chat' ? (
          <ChatPage user={currentUser} />
        ) : currentPath === '/teacher/timetable' ? (
          <TimetablePage />
        ) : currentPath === '/teacher/assignments' ? (
          <HomeworkPage />
        ) : currentPath === '/teacher/attendance' ? (
          <AttendancePage />
        ) : currentPath === '/teacher/examinations' ? (
          <ExaminationPage />
        ) : currentPath === '/teacher/classes' ? (
          <ClassesPage />
        ) : currentPath === '/teacher/students' ? (
          <StudentsPage />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 font-medium">
            Page not found in Teacher Portal.
          </div>
        )}

        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
            <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </TeacherLayout>
    );
  }

  // ── 5. PARENT VIEWS ──
  if (userRole === 'Parent' || currentPath.startsWith('/parent')) {
    return (
      <ParentLayout
        currentPath={currentPath}
        onNavigate={(path) => setCurrentPath(path)}
        onLogout={handleLogout}
        user={currentUser}
      >
        {currentPath === '/parent/dashboard' || currentPath === '/parent' ? (
          <ParentDashboardPage user={currentUser} onNavigate={(path) => setCurrentPath(path)} />
          ) : currentPath === '/parent/chat' ? (
            <ChatPage user={currentUser} />
          ) : (
          <div className="flex items-center justify-center h-full text-slate-500 font-medium">
            Page not found in Parent Portal.
          </div>
        )}

        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
            <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </ParentLayout>
    );
  }

  // ── 3. FRANCHISE / SCHOOL ADMIN VIEWS ──
  // loggedInFranchise holds the specific school for this admin
  const renderDashboardContent = () => {
    switch (currentPath) {
      case '/admin/students':
        return <StudentsPage />;
      case '/admin/teachers':
        return <TeachersPage />;
      case '/admin/parents':
        return <ParentsPage />;
      case '/admin/classes':
        return <ClassesPage />;
      case '/admin/examinations':
        return <ExaminationPage />;
      case '/admin/fees':
        return <FeesPage />;
      case '/admin/attendance':
        return <AttendancePage />;
      case '/admin/homework':
        return <HomeworkPage />;
      case '/admin/timetable':
        return <TimetablePage />;
      case '/admin/subjects':
        return <SubjectsPage />;
      case '/admin/library':
        return <LibraryPage />;
      case '/admin/transport':
        return <TransportPage />;
      case '/admin/chat':
        return <ChatPage user={currentUser} />;
      case '/admin/settings':
        return <SettingsPage />;
      case '/admin/leaves':
        return (
          <div className="space-y-6">
            <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm text-center max-w-2xl mx-auto my-12">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CalendarOff className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Leave Management</h2>
              <p className="text-sm text-slate-500 mb-6">
                Staff and student leave tracking and approval workflow. Backend leave management service is not yet provisioned.
              </p>
              <button
                type="button"
                onClick={() => setCurrentPath('/admin/dashboard')}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      case '/admin/notifications':
        return (
          <div className="space-y-6">
            <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm text-center max-w-2xl mx-auto my-12">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Automated Notifications</h2>
              <p className="text-sm text-slate-500 mb-6">
                Automated SMS, push notifications, and parent alerts. Dedicated notification delivery engine is not yet provisioned in the backend.
              </p>
              <button
                type="button"
                onClick={() => setCurrentPath('/admin/dashboard')}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      case '/admin/notices':
        return (
          <div className="space-y-6">
            <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm text-center max-w-2xl mx-auto my-12">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">School Notices & Circulars</h2>
              <p className="text-sm text-slate-500 mb-6">
                Official circulars and announcements management. Backend notification and circulars service is not yet provisioned.
              </p>
              <button
                type="button"
                onClick={() => setCurrentPath('/admin/dashboard')}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      case '/admin/reports':
        return (
          <div className="space-y-6">
            <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm text-center max-w-2xl mx-auto my-12">
              <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Analytics & Reports</h2>
              <p className="text-sm text-slate-500 mb-6">
                Comprehensive reporting and data exports. Dedicated report generation service is not yet provisioned in the backend.
              </p>
              <button
                type="button"
                onClick={() => setCurrentPath('/admin/dashboard')}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      case '/admin/dashboard':
      default:
        return (
          <AdminDashboardPage
            onOpenStaffModal={() => setIsStaffModalOpen(true)}
            onNavigate={(path) => setCurrentPath(path)}
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
