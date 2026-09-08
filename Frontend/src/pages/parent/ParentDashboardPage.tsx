import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { Hero3DIllustration } from '../../components/illustrations/Hero3DIllustration';
import { StatCard } from '../../components/dashboard/StatCard';
import { Modal } from '../../components/ui/Modal';
import type { StatItem } from '../../types';

interface ParentDashboardPageProps {
  onNavigate?: (path: string) => void;
  user?: any;
}

export const ParentDashboardPage: React.FC<ParentDashboardPageProps> = ({ user }) => {
  const [activeModalAction, setActiveModalAction] = useState<string | null>(null);

  const todayDateString = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const parentName = user?.name || 'Parent';

  const dashboardStats: StatItem[] = [
    {
      id: 'stat_info',
      title: 'STUDENT INFORMATION',
      value: '-',
      change: 'Profile',
      isPositive: true,
      neutral: true,
      subtext: 'Not available',
      iconName: 'GraduationCap',
      color: 'blue'
    },
    {
      id: 'stat_attendance',
      title: 'ATTENDANCE',
      value: '-',
      change: '0%',
      isPositive: true,
      neutral: true,
      subtext: 'Not available',
      iconName: 'Calendar',
      color: 'emerald'
    },
    {
      id: 'stat_academic',
      title: 'ACADEMIC PERFORMANCE',
      value: '-',
      change: '0%',
      isPositive: true,
      neutral: true,
      subtext: 'Not available',
      iconName: 'BookOpen',
      color: 'purple'
    },
    {
      id: 'stat_fees',
      title: 'FEES',
      value: '-',
      change: '0',
      isPositive: true,
      neutral: true,
      subtext: 'Not available',
      iconName: 'CreditCard',
      color: 'amber'
    },
    {
      id: 'stat_exams',
      title: 'EXAMS & ASSIGNMENTS',
      value: '-',
      change: '0',
      isPositive: true,
      neutral: true,
      subtext: 'Not available',
      iconName: 'FileText',
      color: 'indigo'
    },
    {
      id: 'stat_timetable',
      title: 'TIMETABLE',
      value: '-',
      change: '0',
      isPositive: true,
      neutral: true,
      subtext: 'Not available',
      iconName: 'Clock',
      color: 'rose'
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
              Welcome, {parentName} 👋
            </h1>
            <p className="text-xs md:text-sm font-medium text-blue-100/90 mt-1 max-w-xl leading-relaxed">
              Here's an overview of your child's school journey.
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

      <Modal
        isOpen={!!activeModalAction}
        onClose={() => setActiveModalAction(null)}
        title={activeModalAction || 'View Details'}
        subtitle="Prototype Action Handler"
        maxWidth="md"
      >
        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-bold text-slate-900">{activeModalAction}</p>
            <p>Data will appear here when the backend API is ready.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
