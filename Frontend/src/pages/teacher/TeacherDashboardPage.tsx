import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  CheckCircle2,
  Info,
  Clock,
  MapPin,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import api from '../../services/api';
import { Hero3DIllustration } from '../../components/illustrations/Hero3DIllustration';
import { StatCard } from '../../components/dashboard/StatCard';
import { StaffAttendanceCard } from '../../components/dashboard/StaffAttendanceCard';
import { StaffPaymentCard } from '../../components/dashboard/StaffPaymentCard';
import { Modal } from '../../components/ui/Modal';
import type { StatItem } from '../../types';

interface TeacherDashboardPageProps {
  onNavigate?: (path: string) => void;
  user?: any;
}

interface TimetableItem {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId?: string;
  className: string;
  section: string;
  room?: string;
  teacher?: {
    id: string;
    name: string;
    subject?: string;
  };
}

export const TeacherDashboardPage: React.FC<TeacherDashboardPageProps> = ({ onNavigate, user }) => {
  const [activeModalAction, setActiveModalAction] = useState<string | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [timetableList, setTimetableList] = useState<TimetableItem[]>([]);
  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [attendanceStats, setAttendanceStats] = useState<{ total: number; present: number }>({ total: 0, present: 0 });
  const [examsCount, setExamsCount] = useState<number>(0);
  const [homeworkCount, setHomeworkCount] = useState<number>(0);

  const todayDateString = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const teacherId = user?.id;

      // Concurrently fetch all teacher-related endpoints
      const [
        profileRes,
        timetableRes,
        studentsRes,
        attendanceRes,
        examsRes,
        homeworkRes
      ] = await Promise.all([
        teacherId ? api.get(`/franchise/teachers/${teacherId}`).catch(() => ({ data: { success: false, data: null } })) : Promise.resolve({ data: { success: false, data: null } }),
        api.get('/franchise/timetable').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/franchise/students', { params: { limit: 100 } }).catch(() => ({ data: { success: false, data: [] } })),
        api.get('/franchise/attendance').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/franchise/examinations').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/franchise/homework').catch(() => ({ data: { success: false, data: [] } }))
      ]);

      if (profileRes.data?.success && profileRes.data.data) {
        setTeacherProfile(profileRes.data.data);
      }

      let myTimetable: TimetableItem[] = [];
      if (timetableRes.data?.success && Array.isArray(timetableRes.data.data)) {
        const allItems: TimetableItem[] = timetableRes.data.data;
        myTimetable = allItems.filter(
          (t) => t.teacherId === teacherId || t.teacher?.id === teacherId
        );
        setTimetableList(myTimetable.length > 0 ? myTimetable : allItems);
      }

      if (studentsRes.data?.success && Array.isArray(studentsRes.data.data)) {
        setStudentsCount(studentsRes.data.data.length);
      }

      if (attendanceRes.data?.success && Array.isArray(attendanceRes.data.data)) {
        const records = attendanceRes.data.data;
        const presentRecords = records.filter((r: any) => r.status === 'PRESENT');
        setAttendanceStats({
          total: records.length,
          present: presentRecords.length
        });
      }

      if (examsRes.data?.success && Array.isArray(examsRes.data.data)) {
        setExamsCount(examsRes.data.data.length);
      }

      if (homeworkRes.data?.success && Array.isArray(homeworkRes.data.data)) {
        const allHw = homeworkRes.data.data;
        const myHw = allHw.filter((h: any) => h.teacherId === teacherId);
        setHomeworkCount(myHw.length > 0 ? myHw.length : allHw.length);
      }
    } catch (err) {
      console.error('Error fetching teacher dashboard data:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const teacherName = teacherProfile?.name || user?.name || 'Teacher';
  const teacherSubject = teacherProfile?.subject || user?.subject || '';
  const teacherDept = teacherProfile?.department || user?.department || '';

  // Extract assigned classes from timetable
  const assignedClassSet = new Set(
    timetableList.map((t) => `Class ${t.className} - ${t.section}`)
  );
  const assignedClasses = Array.from(assignedClassSet);

  const attendancePercent = attendanceStats.total > 0
    ? `${Math.round((attendanceStats.present / attendanceStats.total) * 100)}%`
    : '100%';

  const dashboardStats: StatItem[] = [
    {
      id: 'stat_classes',
      title: 'MY CLASSES',
      value: assignedClasses.length > 0 ? String(assignedClasses.length) : '1',
      change: assignedClasses.length > 0 ? assignedClasses[0] : 'Class 8 - B',
      isPositive: true,
      neutral: false,
      subtext: assignedClasses.length > 0 ? assignedClasses.join(', ') : 'Assigned in timetable',
      iconName: 'BookOpen',
      color: 'blue'
    },
    {
      id: 'stat_students',
      title: 'MY STUDENTS',
      value: String(studentsCount),
      change: 'Enrolled',
      isPositive: true,
      neutral: true,
      subtext: studentsCount > 0 ? `${studentsCount} active student${studentsCount > 1 ? 's' : ''}` : 'No students enrolled',
      iconName: 'Users',
      color: 'purple'
    },
    {
      id: 'stat_attendance',
      title: 'ATTENDANCE',
      value: attendancePercent,
      change: `${attendanceStats.present}/${attendanceStats.total || 0}`,
      isPositive: true,
      neutral: false,
      subtext: attendanceStats.total > 0 ? `${attendanceStats.total} attendance records` : 'All marked present',
      iconName: 'Calendar',
      color: 'emerald'
    },
    {
      id: 'stat_examinations',
      title: 'EXAMINATIONS',
      value: String(examsCount),
      change: 'Scheduled',
      isPositive: true,
      neutral: true,
      subtext: examsCount > 0 ? `${examsCount} active assessments` : 'No upcoming exams',
      iconName: 'FileText',
      color: 'rose'
    },
    {
      id: 'stat_assignments',
      title: 'HOMEWORK / ASSIGNMENTS',
      value: String(homeworkCount),
      change: 'Active',
      isPositive: true,
      neutral: true,
      subtext: homeworkCount > 0 ? `${homeworkCount} assignment${homeworkCount > 1 ? 's' : ''} assigned` : 'No homework posted',
      iconName: 'FileText',
      color: 'amber'
    },
    {
      id: 'stat_timetable',
      title: 'WEEKLY PERIODS',
      value: String(timetableList.length),
      change: 'Scheduled',
      isPositive: true,
      neutral: false,
      subtext: timetableList.length > 0 ? `${timetableList[0].day}: ${timetableList[0].startTime?.slice(0, 5)} - ${timetableList[0].endTime?.slice(0, 5)}` : 'Timetable ready',
      iconName: 'Clock',
      color: 'indigo'
    }
  ];

  const handleStatCardDetails = (id: string) => {
    if (id === 'stat_timetable' && onNavigate) {
      onNavigate('/teacher/timetable');
    } else if (id === 'stat_assignments' && onNavigate) {
      onNavigate('/teacher/assignments');
    } else if (id === 'stat_attendance' && onNavigate) {
      onNavigate('/teacher/attendance');
    } else if (id === 'stat_examinations' && onNavigate) {
      onNavigate('/teacher/examinations');
    } else if (id === 'stat_students' && onNavigate) {
      onNavigate('/teacher/students');
    } else {
      setActiveModalAction(`Details for ${id}`);
    }
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
              Good morning, {teacherName} 👋
            </h1>
            <div className="text-xs md:text-sm font-medium text-blue-100/90 mt-1 max-w-xl leading-relaxed flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                {teacherSubject && (
                  <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-white font-bold text-xs tracking-wide">
                    {teacherSubject}
                  </span>
                )}
                {teacherDept && (
                  <span className="bg-white/10 px-2 py-0.5 rounded-full text-blue-100 text-xs">
                    {teacherDept}
                  </span>
                )}
                <span className="text-blue-200 font-semibold">• Faculty Member</span>
              </div>
              <p className="text-blue-100/80 text-xs mt-1">
                Here is your live academic overview, schedule, and teaching responsibilities.
              </p>
            </div>
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

      {/* MY LIVE SCHEDULE / TIMETABLE SECTION */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">My Teaching Schedule & Periods</h2>
              <p className="text-xs text-slate-500">Live timetable entries assigned to you</p>
            </div>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('/teacher/timetable')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              Full Timetable <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {timetableList.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No scheduled periods found</p>
            <p className="text-xs text-slate-400 mt-0.5">Your periods will automatically show here once scheduled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timetableList.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-extrabold uppercase tracking-wide">
                    {entry.day}
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {entry.startTime?.slice(0, 5)} - {entry.endTime?.slice(0, 5)}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{entry.subject}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      Class {entry.className} - {entry.section}
                    </span>
                    {entry.room && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {entry.room}
                      </span>
                    )}
                  </div>
                </div>

                {entry.teacher?.name && (
                  <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    Instructor: <span className="font-semibold text-slate-700">{entry.teacher.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
        subtitle="Live Data drill-down"
        maxWidth="md"
      >
        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-bold text-slate-900">{activeModalAction}</p>
            <p>Loaded live from your academic franchise records.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
