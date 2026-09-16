import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Calendar,
  CheckCircle2,
  BookOpen,
  Clock,
  Users,
  UserCheck,
  MapPin,
  Phone,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import { Hero3DIllustration } from '../../components/illustrations/Hero3DIllustration';
import { StatCard } from '../../components/dashboard/StatCard';
import { Modal } from '../../components/ui/Modal';
import type { StatItem } from '../../types';

interface ParentDashboardPageProps {
  onNavigate?: (path: string) => void;
  user?: any;
}

interface StudentSummary {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  classId?: string;
  sectionId?: string;
  status?: string;
  className?: string;
  sectionName?: string;
  relationship?: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
  remarks?: string;
}

interface ExamItem {
  id: string;
  name: string;
  subject: string;
  examDate: string;
  totalMarks: number;
  passingMarks: number;
  status: string;
  description?: string;
}

interface ExamResultItem {
  id: string;
  marksObtained: number;
  grade?: string;
  percentage?: number;
  remarks?: string;
  examination?: {
    id: string;
    name: string;
    subject: string;
    totalMarks: number;
  };
}

interface FeeItem {
  id: string;
  title?: string;
  amount: number;
  paidAmount?: number;
  dueDate: string;
  status: string;
}

interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: string;
  description?: string;
}

interface TimetableItem {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  room?: string;
}

export const ParentDashboardPage: React.FC<ParentDashboardPageProps> = ({ user }) => {
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Multi-child support
  const [childrenList, setChildrenList] = useState<StudentSummary[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const childrenListRef = useRef<StudentSummary[]>([]);
  childrenListRef.current = childrenList;

  // Selected child real metrics
  const [activeStudent, setActiveStudent] = useState<StudentSummary | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [examResults, setExamResults] = useState<ExamResultItem[]>([]);
  const [feesList, setFeesList] = useState<FeeItem[]>([]);
  const [examsList, setExamsList] = useState<ExamItem[]>([]);
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([]);
  const [timetableList, setTimetableList] = useState<TimetableItem[]>([]);

  const todayDateString = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const parentName = user?.name || 'Parent';

  // ────────────────────────────────────────────────────────────
  // 1. DISCOVER LINKED CHILDREN FOR LOGGED-IN PARENT
  // ────────────────────────────────────────────────────────────
  const discoverChildren = useCallback(async (): Promise<StudentSummary[]> => {
    let discovered: StudentSummary[] = [];

    // Check if user session already contains linked students
    if (user?.students && Array.isArray(user.students) && user.students.length > 0) {
      discovered = user.students.map((s: any) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        classId: s.classId,
        sectionId: s.sectionId,
        className: s.class?.name || s.className,
        sectionName: s.section?.name || s.sectionName,
        relationship: s.relationship
      }));
      return discovered;
    }

    if (user?.student && typeof user.student === 'object') {
      discovered = [{
        id: user.student.id,
        name: user.student.name || 'Child',
        email: user.student.email,
        classId: user.student.classId,
        sectionId: user.student.sectionId
      }];
      return discovered;
    }

    if (user?.studentId) {
      discovered = [{
        id: user.studentId,
        name: user.studentName || 'Child'
      }];
      return discovered;
    }

    // Try parent children endpoints if provided by backend
    try {
      const parentStudentsRes = await api.get('/parent/students').catch(() => null);
      if (parentStudentsRes?.data?.success && Array.isArray(parentStudentsRes.data.data) && parentStudentsRes.data.data.length > 0) {
        return parentStudentsRes.data.data;
      }

      const parentChildrenRes = await api.get('/parent/children').catch(() => null);
      if (parentChildrenRes?.data?.success && Array.isArray(parentChildrenRes.data.data) && parentChildrenRes.data.data.length > 0) {
        return parentChildrenRes.data.data;
      }

      const chatRes = await api.get('/franchise/chat/my').catch(() => null);
      if (chatRes?.data?.success && Array.isArray(chatRes.data.data)) {
        const studentMap = new Map<string, StudentSummary>();
        chatRes.data.data.forEach((c: any) => {
          if (c.student?.id && c.student?.name) {
            studentMap.set(c.student.id, {
              id: c.student.id,
              name: c.student.name
            });
          }
        });
        if (studentMap.size > 0) {
          return Array.from(studentMap.values());
        }
      }
    } catch (e) {
      console.warn('Child discovery endpoint check warning:', e);
    }

    return discovered;
  }, [user]);

  // ────────────────────────────────────────────────────────────
  // 2. FETCH REAL CHILD DATA
  // ────────────────────────────────────────────────────────────
  const fetchChildData = useCallback(async (childId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Concurrently query real backend APIs for this child
      const [
        studentRes,
        attendanceRes,
        timetableRes,
        feesRes,
        examResultsRes,
        homeworkRes,
        examsRes
      ] = await Promise.all([
        api.get(`/franchise/students/parent/${childId}`).catch((err) => {
          console.warn('Student profile fetch warning:', err);
          return { data: { success: false, data: null } };
        }),
        api.get(`/franchise/attendance/parent/student/${childId}`).catch((err) => {
          console.warn('Attendance fetch warning:', err);
          return { data: { success: false, data: [] } };
        }),
        api.get(`/franchise/timetable/parent/student/${childId}`).catch((err) => {
          console.warn('Timetable fetch warning:', err);
          return { data: { success: false, data: [] } };
        }),
        api.get(`/franchise/fees/parent/student/${childId}`).catch((err) => {
          console.warn('Fees fetch warning:', err);
          return { data: { success: false, data: [] } };
        }),
        api.get(`/franchise/exam-results/parent/student/${childId}`).catch((err) => {
          console.warn('Exam results fetch warning:', err);
          return { data: { success: false, data: [] } };
        }),
        api.get('/franchise/homework/parent/list').catch((err) => {
          console.warn('Homework fetch warning:', err);
          return { data: { success: false, data: [] } };
        }),
        api.get('/franchise/examinations/parent/list').catch((err) => {
          console.warn('Examinations fetch warning:', err);
          return { data: { success: false, data: [] } };
        })
      ]);

      // Set Student Profile
      if (studentRes.data?.success && studentRes.data.data) {
        setActiveStudent(studentRes.data.data);
      } else {
        // Fallback to minimal summary from childrenListRef
        const matched = childrenListRef.current.find((c) => c.id === childId);
        setActiveStudent(matched || { id: childId, name: 'Student' });
      }

      // Set Attendance Records
      if (attendanceRes.data?.success && Array.isArray(attendanceRes.data.data)) {
        setAttendanceRecords(attendanceRes.data.data);
      } else {
        setAttendanceRecords([]);
      }

      // Set Timetable
      if (timetableRes.data?.success && Array.isArray(timetableRes.data.data)) {
        setTimetableList(timetableRes.data.data);
      } else {
        setTimetableList([]);
      }

      // Set Fees
      if (feesRes.data?.success && Array.isArray(feesRes.data.data)) {
        setFeesList(feesRes.data.data);
      } else {
        setFeesList([]);
      }

      // Set Exam Results
      if (examResultsRes.data?.success && Array.isArray(examResultsRes.data.data)) {
        setExamResults(examResultsRes.data.data);
      } else {
        setExamResults([]);
      }

      // Set Homework
      if (homeworkRes.data?.success && Array.isArray(homeworkRes.data.data)) {
        setHomeworkList(homeworkRes.data.data);
      } else {
        setHomeworkList([]);
      }

      // Set Examinations
      if (examsRes.data?.success && Array.isArray(examsRes.data.data)) {
        setExamsList(examsRes.data.data);
      } else {
        setExamsList([]);
      }

    } catch (err: any) {
      console.error('Error fetching child dashboard data:', err);
      setError('Failed to load child data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load: discover children then load data for selected child
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const kids = await discoverChildren();
      if (!isMounted) return;
      childrenListRef.current = kids;
      setChildrenList(kids);
      if (kids.length > 0) {
        const initialId = kids[0].id;
        setSelectedChildId(initialId);
        await fetchChildData(initialId);
      } else {
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.email]);

  // Handle Child Switch (Multi-Child)
  const handleSelectChild = (childId: string) => {
    if (childId === selectedChildId) return;
    setSelectedChildId(childId);
    fetchChildData(childId);
  };

  // ────────────────────────────────────────────────────────────
  // 3. COMPUTE STATS FROM REAL DATA
  // ────────────────────────────────────────────────────────────
  const attendanceStats = useMemo(() => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter((r) => r.status === 'PRESENT').length;
    const pct = total > 0 ? `${Math.round((present / total) * 100)}%` : '100%';
    return { total, present, pct };
  }, [attendanceRecords]);

  const academicStats = useMemo(() => {
    if (examResults.length === 0) {
      return { value: 'Good', change: 'On Track', subtext: 'Academic standing good' };
    }
    const totalMarksPct = examResults.reduce((acc, curr) => {
      if (curr.percentage !== undefined) return acc + curr.percentage;
      if (curr.examination?.totalMarks) {
        return acc + (curr.marksObtained / curr.examination.totalMarks) * 100;
      }
      return acc;
    }, 0);
    const avgPct = Math.round(totalMarksPct / examResults.length);
    return {
      value: `${avgPct}%`,
      change: `${examResults.length} Graded`,
      subtext: 'Average marks obtained'
    };
  }, [examResults]);

  const feesStats = useMemo(() => {
    if (feesList.length === 0) {
      return { value: '₹0', change: 'Cleared', subtext: 'No pending fee dues' };
    }
    const pendingTotal = feesList.reduce((acc, curr) => {
      const paid = curr.paidAmount || 0;
      const balance = Math.max(curr.amount - paid, 0);
      return acc + balance;
    }, 0);

    if (pendingTotal > 0) {
      return {
        value: `₹${pendingTotal.toLocaleString('en-IN')}`,
        change: 'Pending',
        subtext: 'Outstanding fee balance'
      };
    }
    return {
      value: '₹0',
      change: 'Paid in full',
      subtext: 'All fee installments cleared'
    };
  }, [feesList]);

  const examsAssignmentsStats = useMemo(() => {
    const upcomingExams = examsList.filter(
      (e) => (e.status || '').toUpperCase() === 'UPCOMING'
    ).length;
    const activeHw = homeworkList.filter(
      (h) => (h.status || '').toUpperCase() === 'ACTIVE'
    ).length;
    const total = upcomingExams + activeHw;

    return {
      value: String(total),
      change: `${upcomingExams} Exam${upcomingExams === 1 ? '' : 's'}`,
      subtext: `${activeHw} homework assignment${activeHw === 1 ? '' : 's'}`
    };
  }, [examsList, homeworkList]);

  // Student name to display
  const studentDisplayName = activeStudent?.name || (childrenList.length > 0 ? childrenList[0].name : 'Student');
  const studentDobDisplay = activeStudent?.dateOfBirth ? new Date(activeStudent.dateOfBirth).toLocaleDateString('en-GB') : null;
  const studentGenderDisplay = activeStudent?.gender ? activeStudent.gender.charAt(0) + activeStudent.gender.slice(1).toLowerCase() : null;

  // Build Real Stat Items
  const dashboardStats: StatItem[] = [
    {
      id: 'stat_info',
      title: 'STUDENT INFORMATION',
      value: studentDisplayName,
      change: activeStudent?.status ? 'Enrolled' : 'Active',
      isPositive: true,
      neutral: false,
      subtext: [
        studentGenderDisplay,
        studentDobDisplay ? `DOB: ${studentDobDisplay}` : null,
        activeStudent?.address || 'Student Profile'
      ].filter(Boolean).join(' • '),
      iconName: 'GraduationCap',
      color: 'blue'
    },
    {
      id: 'stat_attendance',
      title: 'ATTENDANCE',
      value: attendanceStats.pct,
      change: `${attendanceStats.present} Present`,
      isPositive: true,
      neutral: false,
      subtext: attendanceStats.total > 0
        ? `${attendanceStats.total} recorded session${attendanceStats.total === 1 ? '' : 's'}`
        : 'Regular attendance',
      iconName: 'Calendar',
      color: 'emerald'
    },
    {
      id: 'stat_academic',
      title: 'ACADEMIC PERFORMANCE',
      value: academicStats.value,
      change: academicStats.change,
      isPositive: true,
      neutral: false,
      subtext: academicStats.subtext,
      iconName: 'BookOpen',
      color: 'purple'
    },
    {
      id: 'stat_fees',
      title: 'FEES',
      value: feesStats.value,
      change: feesStats.change,
      isPositive: feesStats.change !== 'Pending',
      neutral: false,
      subtext: feesStats.subtext,
      iconName: 'CreditCard',
      color: 'amber'
    },
    {
      id: 'stat_exams',
      title: 'EXAMS & ASSIGNMENTS',
      value: examsAssignmentsStats.value,
      change: examsAssignmentsStats.change,
      isPositive: true,
      neutral: false,
      subtext: examsAssignmentsStats.subtext,
      iconName: 'FileText',
      color: 'indigo'
    },
    {
      id: 'stat_timetable',
      title: 'TIMETABLE',
      value: String(timetableList.length),
      change: 'Scheduled',
      isPositive: true,
      neutral: false,
      subtext: timetableList.length > 0
        ? `${timetableList.length} weekly period${timetableList.length === 1 ? '' : 's'}`
        : 'Class schedule ready',
      iconName: 'Clock',
      color: 'rose'
    }
  ];

  const handleStatCardDetails = (id: string) => {
    setActiveModalId(id);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* ======================================================
          HERO BANNER
      ====================================================== */}
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

            {/* Active Child Indicator / Switcher */}
            {childrenList.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 backdrop-blur-md font-bold text-white border border-blue-300/30">
                <UserCheck className="w-3.5 h-3.5 text-blue-200" />
                Child: {studentDisplayName}
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Welcome, {parentName} 👋
            </h1>
            <p className="text-xs md:text-sm font-medium text-blue-100/90 mt-1 max-w-xl leading-relaxed">
              Here is the real-time academic, attendance, and fee status for your child <strong className="text-white font-bold">{studentDisplayName}</strong>.
            </p>
          </div>

          {/* MULTI-CHILD SELECTOR (if more than 1 child) */}
          {childrenList.length > 1 && (
            <div className="pt-1 flex items-center gap-2">
              <span className="text-xs text-blue-100 font-semibold">Select Child:</span>
              <div className="flex flex-wrap gap-2">
                {childrenList.map((kid) => (
                  <button
                    key={kid.id}
                    onClick={() => handleSelectChild(kid.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      kid.id === selectedChildId
                        ? 'bg-white text-blue-700 shadow-md'
                        : 'bg-white/20 text-white hover:bg-white/30 border border-white/20'
                    }`}
                  >
                    {kid.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative z-10 shrink-0">
          <Hero3DIllustration />
        </div>
      </div>

      {/* ======================================================
          ERROR STATE
      ====================================================== */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => selectedChildId && fetchChildData(selectedChildId)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* ======================================================
          LOADING STATE
      ====================================================== */}
      {loading && !activeStudent ? (
        <div className="flex items-center justify-center h-64 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading real student records...
            </p>
          </div>
        </div>
      ) : childrenList.length === 0 && !loading ? (
        /* ====================================================
           EMPTY STATE — NO LINKED CHILD
        ==================================================== */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="mt-5 text-lg font-extrabold text-slate-900">
            No Student Linked Yet
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            No student is currently linked to your parent account ({user?.email}). Please contact your school administration to link your student to this parent profile.
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20"
            >
              Refresh Dashboard
            </button>
          </div>
        </div>
      ) : (
        /* ====================================================
           6 STAT CARDS ROW
        ==================================================== */
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
          {dashboardStats.map((stat) => (
            <StatCard key={stat.id} stat={stat} onViewDetails={handleStatCardDetails} />
          ))}
        </div>
      )}

      {/* ======================================================
          CHILD-SPECIFIC VIEW DETAILS MODALS
      ====================================================== */}

      {/* 1. STUDENT INFORMATION MODAL */}
      <Modal
        isOpen={activeModalId === 'stat_info'}
        onClose={() => setActiveModalId(null)}
        title="Student Profile"
        subtitle={`Personal Information for ${studentDisplayName}`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-extrabold shadow-md shadow-blue-600/20">
              {studentDisplayName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">{studentDisplayName}</h3>
              <p className="text-xs font-semibold text-slate-500">
                {activeStudent?.email || 'Student Account'}
              </p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                {activeStudent?.status || 'Active Enrollment'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Gender</p>
              <p className="font-bold text-slate-800 mt-1 capitalize">{activeStudent?.gender || 'Not specified'}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Date of Birth</p>
              <p className="font-bold text-slate-800 mt-1">{studentDobDisplay || 'Not recorded'}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Contact Phone</p>
              <p className="font-bold text-slate-800 mt-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {activeStudent?.phone || 'Not provided'}
              </p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">City / Address</p>
              <p className="font-bold text-slate-800 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {activeStudent?.address || 'On file'}
              </p>
            </div>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-blue-800 font-medium">
            Student ID: <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-[10px]">{activeStudent?.id || selectedChildId}</code>
          </div>
        </div>
      </Modal>

      {/* 2. ATTENDANCE HISTORY MODAL */}
      <Modal
        isOpen={activeModalId === 'stat_attendance'}
        onClose={() => setActiveModalId(null)}
        title="Attendance History"
        subtitle={`Attendance Record for ${studentDisplayName}`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-700 uppercase">Rate</p>
              <p className="text-xl font-extrabold text-emerald-800 mt-0.5">{attendanceStats.pct}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-700 uppercase">Present</p>
              <p className="text-xl font-extrabold text-blue-800 mt-0.5">{attendanceStats.present}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Total Sessions</p>
              <p className="text-xl font-extrabold text-slate-800 mt-0.5">{attendanceStats.total}</p>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {attendanceRecords.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No attendance records logged yet.</p>
            ) : (
              attendanceRecords.map((rec) => (
                <div key={rec.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700">
                    {new Date(rec.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold ${
                    rec.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {rec.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* 3. ACADEMIC PERFORMANCE MODAL */}
      <Modal
        isOpen={activeModalId === 'stat_academic'}
        onClose={() => setActiveModalId(null)}
        title="Academic Performance"
        subtitle={`Exam Results for ${studentDisplayName}`}
        maxWidth="lg"
      >
        <div className="space-y-3">
          {examResults.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs space-y-1">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">No Graded Results Yet</p>
              <p>Exam results will appear here once teachers publish the scores.</p>
            </div>
          ) : (
            examResults.map((res) => (
              <div key={res.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-extrabold text-slate-900">{res.examination?.name || 'Examination'}</p>
                  <p className="text-slate-500 text-[11px]">{res.examination?.subject || 'Subject'}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-blue-600">
                    {res.marksObtained} / {res.examination?.totalMarks || 100}
                  </span>
                  {res.grade && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                      Grade: {res.grade}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* 4. FEES MODAL */}
      <Modal
        isOpen={activeModalId === 'stat_fees'}
        onClose={() => setActiveModalId(null)}
        title="Fee Overview"
        subtitle={`Fee records for ${studentDisplayName}`}
        maxWidth="lg"
      >
        <div className="space-y-3">
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-700 uppercase">Outstanding Balance</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{feesStats.value}</p>
            </div>
            <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
              feesStats.change === 'Pending' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {feesStats.change}
            </span>
          </div>

          {feesList.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No fee invoices recorded.</p>
          ) : (
            feesList.map((fee) => (
              <div key={fee.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">{fee.title || 'Tuition / Term Fee'}</p>
                  <p className="text-slate-400 text-[11px]">Due: {new Date(fee.dueDate).toLocaleDateString('en-GB')}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900">₹{fee.amount.toLocaleString('en-IN')}</p>
                  <span className="text-[10px] font-bold text-emerald-600">{fee.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* 5. EXAMS & ASSIGNMENTS MODAL */}
      <Modal
        isOpen={activeModalId === 'stat_exams'}
        onClose={() => setActiveModalId(null)}
        title="Exams & Homework"
        subtitle={`Academic tasks for ${studentDisplayName}`}
        maxWidth="lg"
      >
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {/* Upcoming Examinations */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Upcoming Examinations</p>
            {examsList.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No upcoming examinations scheduled.</p>
            ) : (
              <div className="space-y-2">
                {examsList.map((exam) => (
                  <div key={exam.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-extrabold text-slate-900">{exam.name}</p>
                      <p className="text-slate-500 text-[11px]">{exam.subject} • Date: {new Date(exam.examDate).toLocaleDateString('en-GB')}</p>
                    </div>
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 font-bold rounded text-[10px]">
                      {exam.totalMarks} Marks
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Homework */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Homework</p>
            {homeworkList.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No active homework assignments.</p>
            ) : (
              <div className="space-y-2">
                {homeworkList.map((hw) => (
                  <div key={hw.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-extrabold text-slate-900">{hw.title}</p>
                      <p className="text-slate-500 text-[11px]">{hw.subject} • Due: {new Date(hw.dueDate).toLocaleDateString('en-GB')}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">
                      {hw.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* 6. TIMETABLE MODAL */}
      <Modal
        isOpen={activeModalId === 'stat_timetable'}
        onClose={() => setActiveModalId(null)}
        title="Class Timetable"
        subtitle={`Weekly periods for ${studentDisplayName}`}
        maxWidth="lg"
      >
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {timetableList.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs space-y-1">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">Timetable Schedule Ready</p>
              <p>Period schedules will appear here once published by school administration.</p>
            </div>
          ) : (
            timetableList.map((slot) => (
              <div key={slot.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{slot.day}</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">{slot.subject} {slot.room ? `• ${slot.room}` : ''}</p>
                </div>
                <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-mono font-bold text-[11px] rounded-lg">
                  {slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}
                </span>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};
