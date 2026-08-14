import React, { useState } from 'react';
import { Hero3DIllustration } from '../../components/illustrations/Hero3DIllustration';
import { StatCard } from '../../components/dashboard/StatCard';
import { AttendanceChart } from '../../components/dashboard/AttendanceChart';
import { FeeCollectionChart } from '../../components/dashboard/FeeCollectionChart';
import { StudentDistributionChart } from '../../components/dashboard/StudentDistributionChart';
import { UpcomingEvents } from '../../components/dashboard/UpcomingEvents';
import { RecentNotices } from '../../components/dashboard/RecentNotices';
import { RecentActivities } from '../../components/dashboard/RecentActivities';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { mockStatCards } from '../../data/mockData';
import { Modal } from '../../components/ui/Modal';
import { Calendar, Sparkles, TrendingUp, CheckCircle2, Info } from 'lucide-react';

interface AdminDashboardPageProps {
  onOpenStaffModal: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onOpenStaffModal }) => {
  const [activeModalAction, setActiveModalAction] = useState<string | null>(null);

  // Dynamic today's date formatted according to standard locale
  const todayDateString = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const handleStatCardDetails = (id: string) => {
    setActiveModalAction(`Metric drill-down view for: ${id}`);
  };

  return (
    <div className="space-y-6">
      {/* HERO BANNER */}
      <div className="relative w-full rounded-3xl overflow-hidden hero-gradient p-6 md:p-8 text-white shadow-xl shadow-blue-600/15 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Background Soft Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-12 -translate-y-12" />

        <div className="relative z-10 max-w-2xl space-y-4">
          {/* Top Pill Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md font-semibold text-white/90 border border-white/20">
              <Calendar className="w-3.5 h-3.5 text-blue-200" />
              {todayDateString}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 backdrop-blur-md font-semibold text-emerald-200 border border-emerald-300/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Academic Session 2026–27
            </span>
          </div>

          {/* Heading & Subtitle */}
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Welcome, Krishna Patil 👋
            </h1>
            <p className="text-xs md:text-sm font-medium text-blue-100/90 mt-1 max-w-xl leading-relaxed">
              Here's what's happening across your school ecosystem today. <strong className="text-white font-bold">94.5%</strong> overall attendance recorded so far.
            </p>
          </div>

          {/* Bottom Chips */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-sm text-xs font-semibold text-white">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              Admissions up <strong className="text-white font-bold">+8.2%</strong> this month
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-sm text-xs font-semibold text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              All 24 Classrooms Active
            </span>
          </div>
        </div>

        {/* 3D Illustration Graphic on Right */}
        <div className="relative z-10 shrink-0">
          <Hero3DIllustration />
        </div>
      </div>

      {/* 6 STAT CARDS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {mockStatCards.map((stat) => (
          <StatCard key={stat.id} stat={stat} onViewDetails={handleStatCardDetails} />
        ))}
      </div>

      {/* QUICK ACTIONS BAR */}
      <QuickActions
        onOpenStaffModal={onOpenStaffModal}
        onOpenActionModal={(key) => setActiveModalAction(key)}
      />

      {/* ANALYTICS ROW 1: Attendance Chart + Fee Collection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceChart />
        </div>
        <div className="lg:col-span-1">
          <FeeCollectionChart />
        </div>
      </div>

      {/* ANALYTICS ROW 2: Students distribution by class + Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StudentDistributionChart />
        </div>
        <div className="lg:col-span-1">
          <UpcomingEvents />
        </div>
      </div>

      {/* OPERATIONS ROW 3: Recent Notices + Live Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentNotices />
        <RecentActivities />
      </div>

      {/* Interactive Modal Preview for Quick Actions */}
      <Modal
        isOpen={!!activeModalAction}
        onClose={() => setActiveModalAction(null)}
        title={activeModalAction || 'Quick Action'}
        subtitle="Prototype Action Handler • Read-only view for initial phase"
        maxWidth="md"
      >
        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-bold text-slate-900">{activeModalAction}</p>
            <p>This action is ready to be linked with Spring Boot REST endpoints in the next phase of development.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
