import React, { useState, useEffect } from 'react';
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
import api from '../../services/api';


interface HODDashboardPageProps {
  onNavigate?: (path: string) => void;
  user?: any;
}


export const HODDashboardPage: React.FC<HODDashboardPageProps> = ({ user }) => {
  const [activeModalAction, setActiveModalAction] = useState<string | null>(null);
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    classes: 0,
    attendance: '0' as string,
    examinations: 0,
    timetable: 0
  });

  const [salaryData, setSalaryData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          teachersRes,
          studentsRes,
          classesRes,
          attendanceRes,
          examsRes,
          timetableRes,
          mySalaryRes
        ] = await Promise.all([
          api.get('/franchise/teachers', { params: { limit: 1 } }).catch(() => ({ data: { pagination: { total: 0 } } })),
          api.get('/franchise/students', { params: { limit: 1 } }).catch(() => ({ data: { pagination: { total: 0 } } })),
          api.get('/franchise/classes').catch(() => ({ data: { data: [] } })),
          api.get('/franchise/attendance').catch(() => ({ error: true, data: { data: [] } })),
          api.get('/franchise/examinations').catch(() => ({ data: { data: [] } })),
          api.get('/franchise/timetable').catch(() => ({ data: { data: [] } })),
          api.get('/teacher/me/salary').catch(() => ({ data: { data: null } }))
        ]);

        const totalTeachers = teachersRes.data?.pagination?.total || 0;
        const totalStudents = studentsRes.data?.pagination?.total || 0;
        const totalClasses = Array.isArray(classesRes.data?.data) ? classesRes.data.data.length : 0;
        const totalExams = Array.isArray(examsRes.data?.data) ? examsRes.data.data.length : 0;
        const totalTimetable = Array.isArray(timetableRes.data?.data) ? timetableRes.data.data.length : 0;

        let attendancePercent = 'Not marked';
        if ((attendanceRes as any).error) {
          attendancePercent = 'API Error';
        } else if (Array.isArray(attendanceRes.data?.data) && attendanceRes.data.data.length > 0) {
          const records = attendanceRes.data.data;
          const present = records.filter((r: any) => r.status === 'PRESENT').length;
          attendancePercent = `${((present / records.length) * 100).toFixed(2).replace(/\.00$/, '')}%`;
        }

        setStats({
          teachers: totalTeachers,
          students: totalStudents,
          classes: totalClasses,
          attendance: attendancePercent,
          examinations: totalExams,
          timetable: totalTimetable
        });

                if (mySalaryRes.data?.success && mySalaryRes.data.data) {
          const salaryInfo = mySalaryRes.data.data;
          let formattedSalaryData = null;

          if (salaryInfo.salaryProfile || salaryInfo.latestPayment) {
            formattedSalaryData = {} as any;

            if (salaryInfo.salaryProfile) {
              const basic = parseFloat(salaryInfo.salaryProfile.basicSalary) || 0;
              const allowances = parseFloat(salaryInfo.salaryProfile.allowances) || 0;
              const deductions = parseFloat(salaryInfo.salaryProfile.deductions) || 0;
              const netSalary = basic + allowances - deductions;

              formattedSalaryData.salaryProfile = {
                basicSalary: basic,
                allowances: allowances,
                deductions: deductions,
                netSalary: netSalary,
                isActive: salaryInfo.salaryProfile.isActive
              };
            }

            if (salaryInfo.latestPayment) {
              formattedSalaryData.latestPayment = {
                amount: parseFloat(salaryInfo.latestPayment.amount) || 0,
                date: salaryInfo.latestPayment.paymentDate,
                status: salaryInfo.latestPayment.status
              };
            }
          }
          setSalaryData(formattedSalaryData);
        }

      } catch (err) {
        console.error('Error fetching HOD dashboard data:', err);
      }
    };
    fetchDashboardData();
  }, []);


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
      value: stats.teachers.toString(),
      change: 'Teachers',
      isPositive: true,
      neutral: true,
      subtext: 'Registered staff',
      iconName: 'UserCheck',
      color: 'blue'
    },
    {
      id: 'stat_students',
      title: 'DEPARTMENT STUDENTS',
      value: stats.students.toString(),
      change: 'Students',
      isPositive: true,
      neutral: true,
      subtext: 'Enrolled students',
      iconName: 'Users',
      color: 'purple'
    },
    {
      id: 'stat_classes',
      title: 'DEPARTMENT CLASSES',
      value: stats.classes.toString(),
      change: 'Classes',
      isPositive: true,
      neutral: true,
      subtext: 'Active sections',
      iconName: 'BookOpen',
      color: 'indigo'
    },
    {
      id: 'stat_attendance',
      title: 'DEPARTMENT ATTENDANCE',
      value: stats.attendance,
      change: 'Avg',
      isPositive: true,
      neutral: true,
      subtext: 'Today\'s attendance',
      iconName: 'Calendar',
      color: 'emerald'
    },
    {
      id: 'stat_examinations',
      title: 'EXAMINATIONS',
      value: stats.examinations.toString(),
      change: 'Exams',
      isPositive: true,
      neutral: true,
      subtext: 'Scheduled exams',
      iconName: 'FileText',
      color: 'rose'
    },
    {
      id: 'stat_timetable',
      title: 'DEPARTMENT TIMETABLE',
      value: stats.timetable.toString(),
      change: 'Periods',
      isPositive: true,
      neutral: true,
      subtext: 'Scheduled periods',
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
          <StaffAttendanceCard isApiAvailable={true} data={null} />
          <StaffPaymentCard isApiAvailable={true} data={salaryData} />
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
