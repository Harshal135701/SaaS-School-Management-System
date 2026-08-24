import React, { useEffect, useState } from 'react';
import api from '../../services/api';

import { Hero3DIllustration } from '../../components/illustrations/Hero3DIllustration';
import { StatCard } from '../../components/dashboard/StatCard';
import { AttendanceChart } from '../../components/dashboard/AttendanceChart';
import { FeeCollectionChart } from '../../components/dashboard/FeeCollectionChart';
import { StudentDistributionChart } from '../../components/dashboard/StudentDistributionChart';
import { UpcomingEvents } from '../../components/dashboard/UpcomingEvents';
import { RecentNotices } from '../../components/dashboard/RecentNotices';
import { RecentActivities } from '../../components/dashboard/RecentActivities';
import { QuickActions } from '../../components/dashboard/QuickActions';

import {
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

import type { Franchise } from '../../types/superAdmin';
import type { StatItem } from '../../types';

interface AdminDashboardPageProps {
  onOpenStaffModal: () => void;
  franchise?: Franchise | null;
  onNavigate?: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onOpenStaffModal,
  franchise,
  onNavigate,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dashboardStats, setDashboardStats] = useState<StatItem[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [feeData, setFeeData] = useState<any[]>([]);

  const [liveStudentCount, setLiveStudentCount] = useState(0);
  const [liveTeacherCount, setLiveTeacherCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          studentsRes,
          teachersRes,
          parentsRes,
          attendanceRes,
          feesRes,
        ] = await Promise.all([
          api.get('/franchise/students'),
          api.get('/franchise/teachers'),
          api.get('/franchise/parents'),
          api.get('/franchise/attendance'),
          api.get('/franchise/fees'),
        ]);

        const totalStudents =
          studentsRes.data?.pagination?.total ||
          studentsRes.data?.data?.length ||
          0;

        const totalTeachers =
          teachersRes.data?.pagination?.total ||
          teachersRes.data?.data?.length ||
          0;

        const totalParents =
          parentsRes.data?.pagination?.total ||
          parentsRes.data?.data?.length ||
          0;

        setLiveStudentCount(totalStudents);
        setLiveTeacherCount(totalTeachers);

        /*
         * STAFF + TEACHERS ARE COMBINED.
         * We intentionally do NOT show a separate Staff card.
         */
        const stats: StatItem[] = [
          {
            id: 'stat_students',
            title: 'TOTAL STUDENTS',
            value: totalStudents.toLocaleString(),
            change: '+0%',
            isPositive: true,
            subtext: 'Live count',
            iconName: 'GraduationCap',
          },
          {
            id: 'stat_teachers_staff',
            title: 'TEACHERS & STAFF',
            value: totalTeachers.toLocaleString(),
            change: '+0%',
            isPositive: true,
            subtext: 'Live count',
            iconName: 'Presentation',
          },
          {
            id: 'stat_parents',
            title: 'TOTAL PARENTS',
            value: totalParents.toLocaleString(),
            change: '+0%',
            isPositive: true,
            subtext: 'Live count',
            iconName: 'Users',
          },
          {
            id: 'stat_classes',
            title: 'TOTAL CLASSES',
            value: '—',
            change: '0%',
            isPositive: true,
            subtext: 'Not available',
            iconName: 'Building2',
          },
          {
            id: 'stat_admissions',
            title: 'PENDING ADMISSIONS',
            value: '—',
            change: '0%',
            isPositive: true,
            subtext: 'Not available',
            iconName: 'UserPlus',
          },
        ];

        setDashboardStats(stats);

        setAttendanceData(attendanceRes.data?.data || []);
        setFeeData(feesRes.data?.data || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(
          'Failed to load dashboard data. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const adminName = franchise?.adminName || 'Admin';
  const schoolName = franchise?.name || 'your school';
  const schoolCode = franchise?.code || '';

  /*
   * Quick Actions will use App.tsx navigation.
   *
   * We do NOT use window.location.href because your application
   * uses React state-based navigation.
   */
  const handleQuickAction = (actionKey: string) => {
    switch (actionKey) {
      case 'add_student':
        onNavigate?.('/admin/students');
        break;

      case 'add_teacher':
        onNavigate?.('/admin/teachers');
        break;

      case 'add_parent':
        // Parent page is not available yet.
        console.log('Add Parent clicked');
        break;

      case 'create_notice':
        console.log('Create Notice clicked');
        break;

      case 'create_exam':
        console.log('Create Exam clicked');
        break;

      case 'record_payment':
        console.log('Record Payment clicked');
        break;

      case 'create_class':
        console.log('Create Class clicked');
        break;

      case 'generate_report':
        console.log('Generate Report clicked');
        break;

      default:
        console.log('Unknown quick action:', actionKey);
    }
  };

  return (
    <div className="space-y-6">

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
              Academic Session 2026–27
            </span>

            {schoolCode && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md font-semibold text-white/80 border border-white/20">
                {schoolCode}
              </span>
            )}

          </div>

          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Welcome, {adminName} 👋
            </h1>

            <p className="text-xs md:text-sm font-medium text-blue-100/90 mt-1 max-w-xl leading-relaxed">
              Here's what's happening at{' '}
              <strong className="text-white font-bold">
                {schoolName}
              </strong>{' '}
              today. Overall attendance recorded so far.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-sm text-xs font-semibold text-white">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              {liveStudentCount.toLocaleString()} Students Enrolled
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-sm text-xs font-semibold text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {liveTeacherCount} Teachers & Staff
            </span>

          </div>

        </div>

        <div className="relative z-10 shrink-0">
          <Hero3DIllustration />
        </div>

      </div>

      {/* LOADING */}
      {loading ? (

        <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-3xl">

          <div className="text-center space-y-3">

            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />

            <p className="text-sm font-bold text-slate-500">
              Syncing live dashboard data...
            </p>

          </div>

        </div>

      ) : error ? (

        <div className="p-6 bg-rose-50 text-rose-700 rounded-3xl border border-rose-100 font-bold text-center">
          {error}
        </div>

      ) : (

        <>

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {dashboardStats.map((stat) => (
              <StatCard
                key={stat.id}
                stat={stat}
              />
            ))}
          </div>

          {/* QUICK ACTIONS */}
          <QuickActions
            onOpenStaffModal={onOpenStaffModal}
            onOpenActionModal={handleQuickAction}
          />

          {/* ANALYTICS ROW 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2">
              <AttendanceChart
                attendances={attendanceData}
              />
            </div>

            <div className="lg:col-span-1">
              <FeeCollectionChart
                fees={feeData}
              />
            </div>

          </div>

          {/* ANALYTICS ROW 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2">
              <StudentDistributionChart />
            </div>

            <div className="lg:col-span-1">
              <UpcomingEvents />
            </div>

          </div>

          {/* OPERATIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <RecentNotices />

            <RecentActivities />

          </div>

        </>

      )}

    </div>
  );
};