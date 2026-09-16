import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Search,
  CheckCircle2,
  ArrowRight,
  Layers,
  GraduationCap
} from 'lucide-react';
import api from '../../services/api';

interface TeacherClassesPageProps {
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

interface HomeworkItem {
  id: string;
  teacherId: string;
  classId?: string;
  sectionId?: string;
  title: string;
  subject: string;
  dueDate: string;
  status?: string;
  class?: { id: string; name: string };
  section?: { id: string; name: string };
}

interface StudentItem {
  id: string;
  name: string;
  classId?: string;
  sectionId?: string;
  class?: { id: string; name: string };
  section?: { id: string; name: string };
}

interface ClassScheduleSlot {
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
  subject: string;
}

interface AssignedClassGroup {
  key: string;
  className: string;
  section: string;
  displayName: string;
  subjects: string[];
  rooms: string[];
  schedule: ClassScheduleSlot[];
  homeworkCount: number;
  latestHomeworkTitle?: string;
  studentCount: number;
}

const DAYS_OF_WEEK = [
  'ALL',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY'
];

export const TeacherClassesPage: React.FC<TeacherClassesPageProps> = ({ onNavigate, user }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timetableList, setTimetableList] = useState<TimetableItem[]>([]);
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([]);
  const [studentsList, setStudentsList] = useState<StudentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>('ALL');

  const teacherId = user?.id;

  const fetchTeacherData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Concurrently fetch teacher-accessible endpoints
      const [timetableRes, homeworkRes, studentsRes] = await Promise.all([
        api.get('/franchise/timetable').catch((err) => {
          console.warn('Timetable fetch warning:', err);
          return { data: { success: false, data: [] } };
        }),
        api.get('/franchise/homework').catch((err) => {
          console.warn('Homework fetch warning:', err);
          return { data: { success: false, data: [] } };
        }),
        api.get('/franchise/students', { params: { limit: 100 } }).catch((err) => {
          console.warn('Students fetch warning:', err);
          return { data: { success: false, data: [] } };
        }),
      ]);

      // Filter timetable items for this teacher
      if (timetableRes.data?.success && Array.isArray(timetableRes.data.data)) {
        const allItems: TimetableItem[] = timetableRes.data.data;
        const myItems = teacherId
          ? allItems.filter(
              (t) => t.teacherId === teacherId || t.teacher?.id === teacherId
            )
          : allItems;
        setTimetableList(myItems.length > 0 ? myItems : allItems);
      } else {
        setTimetableList([]);
      }

      // Filter homework for this teacher / assigned classes
      if (homeworkRes.data?.success && Array.isArray(homeworkRes.data.data)) {
        setHomeworkList(homeworkRes.data.data);
      } else {
        setHomeworkList([]);
      }

      // Students
      if (studentsRes.data?.success && Array.isArray(studentsRes.data.data)) {
        setStudentsList(studentsRes.data.data);
      } else {
        setStudentsList([]);
      }
    } catch (err: any) {
      console.error('Error fetching teacher classes data:', err);
      setError('Failed to load your assigned classes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchTeacherData();
  }, [fetchTeacherData]);

  // Aggregate timetable into assigned class groups
  const classGroups: AssignedClassGroup[] = useMemo(() => {
    const map = new Map<string, AssignedClassGroup>();

    timetableList.forEach((item) => {
      const cName = item.className || 'Unknown';
      const sName = item.section || 'General';
      const key = `${cName}__${sName}`.toUpperCase();

      if (!map.has(key)) {
        // Format display name: e.g. "8" -> "Class 8", "Class 8" -> "Class 8"
        const formattedClass = cName.toLowerCase().startsWith('class') ? cName : `Class ${cName}`;
        const formattedSection = sName.toLowerCase().startsWith('section') ? sName : `Section ${sName}`;

        map.set(key, {
          key,
          className: formattedClass,
          section: formattedSection,
          displayName: `${formattedClass} - ${sName.toUpperCase()}`,
          subjects: [],
          rooms: [],
          schedule: [],
          homeworkCount: 0,
          studentCount: 0,
        });
      }

      const group = map.get(key)!;

      if (item.subject && !group.subjects.includes(item.subject)) {
        group.subjects.push(item.subject);
      }

      if (item.room && !group.rooms.includes(item.room)) {
        group.rooms.push(item.room);
      }

      group.schedule.push({
        day: item.day,
        startTime: item.startTime,
        endTime: item.endTime,
        room: item.room,
        subject: item.subject,
      });
    });

    // Match homework items to class groups
    homeworkList.forEach((hw) => {
      const hwClassName = hw.class?.name || '';
      const hwSecName = hw.section?.name || '';

      map.forEach((group) => {
        const cMatch =
          hwClassName &&
          (group.className.toLowerCase().includes(hwClassName.toLowerCase()) ||
            hwClassName.toLowerCase().includes(group.className.toLowerCase()));
        const sMatch =
          hwSecName &&
          (group.section.toLowerCase().includes(hwSecName.toLowerCase()) ||
            hwSecName.toLowerCase().includes(group.section.toLowerCase()));

        if (cMatch && sMatch) {
          group.homeworkCount += 1;
          if (!group.latestHomeworkTitle) {
            group.latestHomeworkTitle = hw.title;
          }
        }
      });
    });

    // Count enrolled students matching class
    studentsList.forEach((student) => {
      const sClassName = student.class?.name || '';
      const sSecName = student.section?.name || '';

      map.forEach((group) => {
        const cMatch =
          sClassName &&
          (group.className.toLowerCase().includes(sClassName.toLowerCase()) ||
            sClassName.toLowerCase().includes(group.className.toLowerCase()));
        const sMatch =
          sSecName &&
          (group.section.toLowerCase().includes(sSecName.toLowerCase()) ||
            sSecName.toLowerCase().includes(group.section.toLowerCase()));

        if (cMatch && sMatch) {
          group.studentCount += 1;
        }
      });
    });

    return Array.from(map.values());
  }, [timetableList, homeworkList, studentsList]);

  // Today's day of week
  const todayDayName = useMemo(() => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[new Date().getDay()];
  }, []);

  // Today's classes count
  const todayClassesCount = useMemo(() => {
    return timetableList.filter(
      (t) => (t.day || '').toUpperCase() === todayDayName
    ).length;
  }, [timetableList, todayDayName]);

  // Distinct subjects
  const allSubjects = useMemo(() => {
    const s = new Set<string>();
    classGroups.forEach((cg) => cg.subjects.forEach((sub) => s.add(sub)));
    return Array.from(s);
  }, [classGroups]);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    return classGroups.filter((cg) => {
      // Day filter
      if (selectedDay !== 'ALL') {
        const hasDay = cg.schedule.some(
          (slot) => (slot.day || '').toUpperCase() === selectedDay
        );
        if (!hasDay) return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        cg.displayName.toLowerCase().includes(q) ||
        cg.className.toLowerCase().includes(q) ||
        cg.section.toLowerCase().includes(q) ||
        cg.subjects.some((sub) => sub.toLowerCase().includes(q)) ||
        cg.rooms.some((r) => r.toLowerCase().includes(q))
      );
    });
  }, [classGroups, selectedDay, searchQuery]);

  const formatTimeSlot = (startTime: string, endTime: string) => {
    if (!startTime) return '';
    const cleanStart = startTime.slice(0, 5);
    const cleanEnd = endTime ? endTime.slice(0, 5) : '';
    return cleanEnd ? `${cleanStart} - ${cleanEnd}` : cleanStart;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* ======================================================
          HEADER BANNER
      ====================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 p-6 md:p-8 text-white shadow-xl shadow-blue-600/15">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-16 -translate-y-16" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md font-semibold text-white/90 border border-white/20">
                <BookOpen className="w-3.5 h-3.5 text-blue-200" />
                Teacher Portal
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 backdrop-blur-md font-semibold text-emerald-200 border border-emerald-300/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active Term
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              My Classes & Sections
            </h1>

            <p className="text-xs md:text-sm text-blue-100/90 leading-relaxed font-medium">
              View all class sections assigned to you in the official timetable, manage your periods, and monitor assignments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate?.('/teacher/timetable')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs md:text-sm font-bold shadow-md transition-all"
            >
              <Clock className="w-4 h-4" />
              Weekly Timetable
            </button>
            <button
              onClick={() => onNavigate?.('/teacher/assignments')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white border border-white/20 text-xs md:text-sm font-bold backdrop-blur-sm transition-all"
            >
              <FileText className="w-4 h-4" />
              Assignments
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
          STATS OVERVIEW
      ====================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Assigned Classes
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
            {classGroups.length}
          </p>
          <p className="text-xs font-semibold text-blue-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active cohorts
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Weekly Periods
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
            {timetableList.length}
          </p>
          <p className="text-xs font-semibold text-indigo-600 mt-1">
            Teaching lectures/week
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Today's Schedule
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
            {todayClassesCount}
          </p>
          <p className="text-xs font-semibold text-emerald-600 mt-1">
            {todayDayName.slice(0, 1) + todayDayName.slice(1).toLowerCase()} classes
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Subject Focus
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg md:text-xl font-extrabold text-slate-900 mt-2 truncate" title={allSubjects.join(', ')}>
            {allSubjects[0] || user?.subject || 'Academics'}
          </p>
          <p className="text-xs font-semibold text-purple-600 mt-1">
            {allSubjects.length > 1 ? `+${allSubjects.length - 1} more subjects` : 'Assigned subject'}
          </p>
        </div>
      </div>

      {/* ======================================================
          SEARCH & FILTER TOOLBAR
      ====================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search class, section, subject, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Day Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {DAYS_OF_WEEK.map((day) => {
            const isActive = selectedDay === day;
            const label = day === 'ALL' ? 'All Days' : day.slice(0, 3);
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================
          ERROR BANNER
      ====================================================== */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* ======================================================
          LOADING STATE
      ====================================================== */}
      {loading ? (
        <div className="flex items-center justify-center h-64 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading your assigned classes...
            </p>
          </div>
        </div>
      ) : filteredClasses.length === 0 ? (
        /* ====================================================
           EMPTY STATE
        ==================================================== */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="mt-5 text-lg font-extrabold text-slate-900">
            {searchQuery || selectedDay !== 'ALL'
              ? 'No classes matching filters'
              : 'No classes assigned yet'}
          </h2>
          <p className="mt-1.5 text-xs md:text-sm text-slate-500 max-w-md mx-auto">
            {searchQuery || selectedDay !== 'ALL'
              ? 'Try adjusting your search keyword or selecting "All Days" in the filter above.'
              : 'Your timetable schedule has not been set by the school administration yet. Once scheduled, your classes will appear here automatically.'}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDay('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              Reset Filters
            </button>
            <button
              onClick={() => onNavigate?.('/teacher/timetable')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all"
            >
              Check Timetable
            </button>
          </div>
        </div>
      ) : (
        /* ====================================================
           CLASSES GRID
        ==================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((item) => (
            <div
              key={item.key}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* CARD TOP */}
              <div className="p-6 space-y-4">
                {/* Header with Title & Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.displayName}
                      </h3>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        {item.section}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-extrabold tracking-wide uppercase">
                    {item.subjects[0] || 'Subject'}
                  </span>
                </div>

                {/* Details Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {item.rooms.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {item.rooms.join(', ')}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {item.schedule.length} {item.schedule.length === 1 ? 'Period' : 'Periods'}/wk
                  </span>
                  {item.homeworkCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold">
                      <FileText className="w-3.5 h-3.5 text-amber-500" />
                      {item.homeworkCount} {item.homeworkCount === 1 ? 'Assignment' : 'Assignments'}
                    </span>
                  )}
                  {item.studentCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold">
                      <Users className="w-3.5 h-3.5 text-purple-500" />
                      {item.studentCount} Students
                    </span>
                  )}
                </div>

                {/* Weekly Schedule Slots */}
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Class Schedule
                  </p>
                  <div className="space-y-1.5">
                    {item.schedule.slice(0, 3).map((slot, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <span className="font-bold text-slate-700">
                          {slot.day.slice(0, 1) + slot.day.slice(1).toLowerCase()}
                        </span>
                        <span className="text-slate-500 font-medium">
                          {formatTimeSlot(slot.startTime, slot.endTime)}
                        </span>
                        {slot.room && (
                          <span className="text-[11px] text-blue-600 font-semibold">
                            {slot.room}
                          </span>
                        )}
                      </div>
                    ))}
                    {item.schedule.length > 3 && (
                      <p className="text-[11px] font-medium text-slate-400 text-center pt-1">
                        +{item.schedule.length - 3} more periods scheduled
                      </p>
                    )}
                  </div>
                </div>

                {/* Homework Spotlight if available */}
                {item.latestHomeworkTitle && (
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100/80">
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                      Recent Assignment
                    </p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                      {item.latestHomeworkTitle}
                    </p>
                  </div>
                )}
              </div>

              {/* CARD FOOTER ACTIONS */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => onNavigate?.('/teacher/attendance')}
                  className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all text-center"
                >
                  Attendance
                </button>
                <button
                  onClick={() => onNavigate?.('/teacher/assignments')}
                  className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all text-center"
                >
                  Homework
                </button>
                <button
                  onClick={() => onNavigate?.('/teacher/timetable')}
                  className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all"
                  title="View Timetable"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
