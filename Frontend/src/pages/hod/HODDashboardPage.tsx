import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { Hero3DIllustration } from '../../components/illustrations/Hero3DIllustration';
import { StatCard } from '../../components/dashboard/StatCard';
import { StaffAttendanceCard } from '../../components/dashboard/StaffAttendanceCard';
import { StaffPaymentCard } from '../../components/dashboard/StaffPaymentCard';
import { Modal } from '../../components/ui/Modal';
import type { StatItem } from '../../types';

interface HODDashboardPageProps {
  onNavigate?: (path: string) => void;
  user?: any;
}

export const HODDashboardPage: React.FC<HODDashboardPageProps> = ({ user }) => {
  const [activeModalAction, setActiveModalAction] = useState<string | null>(null);

  const todayDateString = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const hodName = user?.name || 'HOD';
  const hodDepartment = user?.department || 'Department information not available yet';

  const dashboardStats: StatItem[] = [
    {
      id: 'stat_teachers',
      title: 'DEPARTMENT TEACHERS',
      value: '-',
      change: 'Teachers',
      isPositive: true,
      neutral: true,
      subtext: 'Not available yet',
      iconName: 'UserCheck',
      color: 'blue'
    },
    {
      id: 'stat_students',
      title: 'DEPARTMENT STUDENTS',
      value: '-',
      change: 'Students',
      isPositive: true,
      neutral: true,
      subtext: 'Not available yet',
      iconName: 'Users',
      color: 'purple'
    },
    {
      id: 'stat_classes',
      title: 'DEPARTMENT CLASSES',
      value: '-',
      change: 'Classes',
      isPositive: true,
      neutral: true,
      subtext: 'Not available yet',
      iconName: 'BookOpen',
      color: 'indigo'
    },
    {
      id: 'stat_attendance',
      title: 'DEPARTMENT ATTENDANCE',
      value: '-',
      change: '0%',
      isPositive: true,
      neutral: true,
      subtext: 'Not available yet',
      iconName: 'Calendar',
      color: 'emerald'
    },
    {
      id: 'stat_examinations',
      title: 'EXAMINATIONS',
      value: '-',
      change: '0',
      isPositive: true,
      neutral: true,
      subtext: 'Not available yet',
      iconName: 'FileText',
      color: 'rose'
    },
    {
      id: 'stat_timetable',
      title: 'DEPARTMENT TIMETABLE',
      value: '-',
      change: '0',
      isPositive: true,
      neutral: true,
      subtext: 'Not available yet',
      iconName: 'Clock',
      color: 'amber'
    }
  ];

  const handleStatCardDetails = (id: string) => {
    setActiveModalAction(`Metric drill-down view for: ${id}`);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* HERO BANNER */}
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
              Good morning, {hodName} 👋
            </h1>
            <p className="text-xs md:text-sm font-medium text-blue-100/90 mt-1 max-w-xl leading-relaxed flex flex-col gap-1">
              <span>{hodDepartment} • Head of Department</span>
              <span>Here's an overview of your department's performance and activities.</span>
            </p>
          </div>
        </div>

        <div className="relative z-10 shrink-0">
          <Hero3DIllustration />
        </div>
      </div>

      {/* 6 STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.id} stat={stat} onViewDetails={handleStatCardDetails} />
        ))}
      </div>

      {/* PERSONAL STAFF DETAILS SECTION */}
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
        subtitle={`Scope: ${hodDepartment}`}
        maxWidth="md"
      >
        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-bold text-slate-900">{activeModalAction}</p>
            <p>Department-specific data will appear here when the backend API is ready.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
