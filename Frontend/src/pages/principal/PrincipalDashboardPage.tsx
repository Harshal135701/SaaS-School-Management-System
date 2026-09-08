import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2,
  Info,
  Building2,
  GraduationCap,
  ClipboardList,
  Wallet,
  Clock
} from 'lucide-react';
import { Hero3DIllustration } from '../../components/illustrations/Hero3DIllustration';
import { StatCard } from '../../components/dashboard/StatCard';
import { StaffAttendanceCard } from '../../components/dashboard/StaffAttendanceCard';
import { StaffPaymentCard } from '../../components/dashboard/StaffPaymentCard';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import type { StatItem } from '../../types';

interface PrincipalDashboardPageProps {
  onNavigate?: (path: string) => void;
  user?: any;
}

export const PrincipalDashboardPage: React.FC<PrincipalDashboardPageProps> = ({ user }) => {
  const [activeModalAction, setActiveModalAction] = useState<string | null>(null);

  const todayDateString = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const principalName = user?.name || 'Principal';
  const schoolName = user?.schoolName || 'School Information Not Available';

  // KPIs
  const dashboardStats: StatItem[] = [
    { id: 'stat_students', title: 'TOTAL STUDENTS', value: '-', change: 'Students', isPositive: true, neutral: true, subtext: 'Not available yet', iconName: 'Users', color: 'blue' },
    { id: 'stat_teachers', title: 'TOTAL TEACHERS', value: '-', change: 'Teachers', isPositive: true, neutral: true, subtext: 'Not available yet', iconName: 'UserCheck', color: 'purple' },
    { id: 'stat_staff', title: 'TOTAL STAFF', value: '-', change: 'Staff', isPositive: true, neutral: true, subtext: 'Not available yet', iconName: 'Briefcase', color: 'emerald' },
    { id: 'stat_hods', title: 'TOTAL HODs', value: '-', change: 'HODs', isPositive: true, neutral: true, subtext: 'Not available yet', iconName: 'Star', color: 'amber' },
    { id: 'stat_departments', title: 'DEPARTMENTS', value: '-', change: 'Depts', isPositive: true, neutral: true, subtext: 'Not available yet', iconName: 'Building', color: 'rose' },
    { id: 'stat_classes', title: 'CLASSES', value: '-', change: 'Classes', isPositive: true, neutral: true, subtext: 'Not available yet', iconName: 'BookOpen', color: 'indigo' }
  ];

  const handleStatCardDetails = (id: string) => {
    setActiveModalAction(`Metric drill-down view for: ${id}`);
  };

  const UnavailableSection = ({ title, icon: Icon, message }: { title: string, icon: any, message: string }) => (
    <Card className="p-6 h-full flex flex-col justify-center items-center text-center space-y-3 bg-slate-50 border-dashed">
      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-2">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      <p className="text-xs text-slate-500 max-w-[250px]">{message}</p>
    </Card>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* 1. HERO BANNER */}
      <div className="relative w-full rounded-3xl overflow-hidden hero-gradient p-6 md:p-8 text-white shadow-xl shadow-blue-600/15 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-12 -translate-y-12" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md font-semibold text-white/90 border border-white/20">
              <Calendar className="w-3.5 h-3.5 text-blue-200" />
              {todayDateString}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 backdrop-blur-md font-semibold text-emerald-200 border border-emerald-300/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Academic Session 2026-27
            </span>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Good morning, {principalName} 👋
            </h1>
            <p className="text-xs md:text-sm font-medium text-blue-100/90 mt-1 max-w-xl leading-relaxed flex flex-col gap-1">
              <span>{schoolName} • School Principal</span>
              <span>Here's the overall status and performance of your school today.</span>
            </p>
          </div>
        </div>

        <div className="relative z-10 shrink-0">
          <Hero3DIllustration />
        </div>
      </div>

      {/* 2. SCHOOL KPIs */}
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 px-1 mb-4">School Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {dashboardStats.map((stat) => (
            <StatCard key={stat.id} stat={stat} onViewDetails={handleStatCardDetails} />
          ))}
        </div>
      </div>

      {/* 3. SCHOOL ATTENDANCE & 4. STUDENT OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UnavailableSection 
          title="School-wide Attendance" 
          icon={ClipboardList} 
          message="School-wide student and staff attendance aggregation API is not available yet." 
        />
        <UnavailableSection 
          title="Student Performance Overview" 
          icon={GraduationCap} 
          message="Student metrics and performance APIs are not available yet." 
        />
      </div>

      {/* 5. DEPARTMENT/STAFF & 6. EXAMINATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UnavailableSection 
          title="Departments & Staff" 
          icon={Building2} 
          message="Department distribution and HOD insights are not available yet." 
        />
        <UnavailableSection 
          title="Examinations & Results" 
          icon={ClipboardList} 
          message="School-wide examination results API is not available yet." 
        />
      </div>

      {/* 7. FEES & 8. TIMETABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UnavailableSection 
          title="Financial Overview" 
          icon={Wallet} 
          message="School-level fee collection and finance API is not available yet." 
        />
        <UnavailableSection 
          title="School Timetable & Homework" 
          icon={Clock} 
          message="Global timetable and assignment tracking APIs are not available yet." 
        />
      </div>

      {/* 11 & 12. PERSONAL STAFF ATTENDANCE & PAYMENT */}
      <div className="pt-6 border-t border-slate-200 mt-8 space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 px-1">My Personal Staff Details</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StaffAttendanceCard isApiAvailable={false} />
          <StaffPaymentCard isApiAvailable={false} />
        </div>
      </div>

      <Modal
        isOpen={!!activeModalAction}
        onClose={() => setActiveModalAction(null)}
        title={activeModalAction || 'View Details'}
        subtitle="School-wide Scope"
        maxWidth="md"
      >
        <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-bold text-slate-900">{activeModalAction}</p>
            <p>School-wide aggregated data will appear here when the backend API is ready.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};