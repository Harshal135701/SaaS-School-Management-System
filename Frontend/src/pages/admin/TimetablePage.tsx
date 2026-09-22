import React, { useEffect, useState } from 'react';
import {
  Plus,
  CalendarDays,
  Clock,
  User,
  MapPin,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import api from '../../services/api';

interface Teacher {
  id: string;
  name: string;
  subject?: string;
}

interface SchoolPeriod {
  id: string;
  periodNumber: number;
  name: string;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
  isActive?: boolean;
}

interface ClassItem {
  id: string;
  name: string;
  code?: string;
  numericValue?: number;
}

interface SectionItem {
  id: string;
  classId: string;
  name: string;
}

interface SubjectItem {
  id: string;
  name: string;
  code?: string;
  isActive?: boolean;
}

interface Timetable {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId: string;
  className: string;
  section?: string;
  room?: string;
  teacher?: Teacher;
}

interface FormData {
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId: string;
  className: string;
  section: string;
  room: string;
}

const initialForm: FormData = {
  day: 'Monday',
  startTime: '',
  endTime: '',
  subject: '',
  teacherId: '',
  className: '',
  section: '',
  room: '',
};

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/*
 * IMPORTANT
 *
 * Backend route:
 * /api/franchise/timetables
 *
 * Therefore frontend API path:
 * /franchise/timetables
 */
const TIMETABLE_API = '/franchise/timetable';
const TEACHER_API = '/franchise/teachers';
const SCHOOL_PERIODS_API = '/school-periods';
const CLASSES_API = '/franchise/classes';
const SECTIONS_API = '/franchise/sections';
const SUBJECTS_API = '/franchise/subjects';

export const TimetablePage: React.FC = () => {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schoolPeriods, setSchoolPeriods] = useState<SchoolPeriod[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<any[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>(initialForm);

  // ============================================================
  // NORMALIZE DAY
  // ============================================================

  const normalizeDay = (day: string) => {
    if (!day) return '';

    return day.trim().toUpperCase();
  };

  const displayDay = (day: string) => {
    if (!day) return '';

    return (
      day.charAt(0).toUpperCase() +
      day.slice(1).toLowerCase()
    );
  };

  // ============================================================
  // FETCH DATA
  // ============================================================

  // ============================================================
  // FETCH DATA
  // ============================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        'Fetching timetable from:',
        TIMETABLE_API
      );

      const [timetableRes, teachersRes, periodsRes, classesRes, sectionsRes, subjectsRes, assignmentsRes] =
        await Promise.all([
          api.get(TIMETABLE_API),
          api.get(TEACHER_API),
          api.get(SCHOOL_PERIODS_API).catch((err) => {
            console.error('Failed to fetch school periods:', err);
            return { data: { data: [] } };
          }),
          api.get(CLASSES_API).catch((err) => {
            console.error('Failed to fetch classes:', err);
            return { data: { data: [] } };
          }),
          api.get(SECTIONS_API).catch((err) => {
            console.error('Failed to fetch sections:', err);
            return { data: { data: [] } };
          }),
          api.get(SUBJECTS_API).catch((err) => {
            console.error('Failed to fetch subjects:', err);
            return { data: { data: [] } };
          }),
          api.get('/franchise/teacher-assignments').catch((err) => {
            console.error('Failed to fetch teacher assignments:', err);
            return { data: { data: [] } };
          }),
        ]);

      console.log(
        'Timetable API response:',
        timetableRes.data
      );

      console.log(
        'Teachers API response:',
        teachersRes.data
      );

      console.log(
        'School Periods API response:',
        periodsRes.data
      );

      const timetableData =
        timetableRes.data?.data || [];

      const teacherData =
        teachersRes.data?.data ||
        teachersRes.data?.teachers ||
        [];

      const rawPeriods: SchoolPeriod[] =
        periodsRes.data?.data || [];

      const activeNonBreakPeriods = rawPeriods
        .filter((p) => p.isActive !== false && !p.isBreak)
        .sort((a, b) => a.periodNumber - b.periodNumber);

      const loadedClasses: ClassItem[] =
        classesRes.data?.data || [];

      const loadedSections: SectionItem[] =
        sectionsRes.data?.data || [];

      const loadedSubjects: SubjectItem[] =
        subjectsRes.data?.data || [];

      const activeSubjects = loadedSubjects.filter(
        (s) => s.isActive !== false
      );

      const loadedAssignments = assignmentsRes?.data?.data || [];

      setTimetables(timetableData);
      setTeachers(teacherData);
      setSchoolPeriods(activeNonBreakPeriods);
      setClasses(loadedClasses);
      setSections(loadedSections);
      setSubjects(activeSubjects);
      setTeacherAssignments(loadedAssignments);
    } catch (err: any) {
      console.error(
        'Timetable fetch error:',
        err
      );

      console.error(
        'Timetable fetch response:',
        err?.response?.data
      );

      setError(
        err?.response?.data?.message ||
          'Failed to load timetable. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ============================================================
  // FORM CHANGE & PERIOD HELPERS
  // ============================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === 'teacherId' && value) {
      const selectedTeacher = teachers.find((t) => t.id === value);
      if (selectedTeacher && selectedTeacher.subject) {
        const matchingSubject = subjects.find(
          (s) =>
            s.name.trim().toLowerCase() ===
            selectedTeacher.subject?.trim().toLowerCase()
        );

        setForm((prev) => ({
          ...prev,
          teacherId: value,
          subject: matchingSubject
            ? matchingSubject.name
            : (prev.subject || selectedTeacher.subject || ''),
        }));
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatPeriodLabel = (period: SchoolPeriod) => {
    const start = period.startTime ? period.startTime.substring(0, 5) : '';
    const end = period.endTime ? period.endTime.substring(0, 5) : '';
    return `${period.name || `Period ${period.periodNumber}`} — ${start} to ${end}`;
  };

  const handlePeriodChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const periodId = e.target.value;
    setSelectedPeriodId(periodId);

    const foundPeriod = schoolPeriods.find((p) => p.id === periodId);
    if (foundPeriod) {
      setForm((prev) => ({
        ...prev,
        startTime: foundPeriod.startTime ? foundPeriod.startTime.substring(0, 5) : '',
        endTime: foundPeriod.endTime ? foundPeriod.endTime.substring(0, 5) : '',
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        startTime: '',
        endTime: '',
      }));
    }
  };

  // ============================================================
  // OPEN CREATE MODAL
  // ============================================================

  const openCreateModal = () => {
    setEditingId(null);
    setSelectedPeriodId('');

    setForm({
      ...initialForm,
    });

    setIsModalOpen(true);
  };

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const openEditModal = (
    item: Timetable
  ) => {
    setEditingId(item.id);

    const itemStart = item.startTime
      ? item.startTime.substring(0, 5)
      : '';
    const itemEnd = item.endTime
      ? item.endTime.substring(0, 5)
      : '';

    const matchingPeriod = schoolPeriods.find(
      (p) =>
        p.startTime &&
        p.endTime &&
        p.startTime.substring(0, 5) === itemStart &&
        p.endTime.substring(0, 5) === itemEnd
    );

    setSelectedPeriodId(matchingPeriod ? matchingPeriod.id : '');

    setForm({
      day: displayDay(item.day),
      startTime: itemStart,
      endTime: itemEnd,
      subject: item.subject || '',
      teacherId: item.teacherId || '',
      className: item.className || '',
      section: item.section || '',
      room: item.room || '',
    });

    setIsModalOpen(true);
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !form.day ||
      !form.startTime ||
      !form.endTime ||
      !form.subject ||
      !form.teacherId ||
      !form.className
    ) {
      alert(
        'Please fill all required fields.'
      );

      return;
    }

    try {
      setSaving(true);

      /*
       * IMPORTANT:
       * Database ENUM expects:
       *
       * MONDAY
       * TUESDAY
       * WEDNESDAY
       * THURSDAY
       * FRIDAY
       * SATURDAY
       */

      const payload = {
        day: normalizeDay(form.day),
        startTime: form.startTime,
        endTime: form.endTime,
        subject: form.subject.trim(),
        teacherId: form.teacherId,
        className: form.className.trim(),
        section: form.section.trim() || null,
        room: form.room.trim() || null,
      };

      console.log(
        'Sending timetable payload:',
        payload
      );

      if (editingId) {
        const response = await api.put(
          `${TIMETABLE_API}/${editingId}`,
          payload
        );

        console.log(
          'Timetable update response:',
          response.data
        );
      } else {
        const response = await api.post(
          TIMETABLE_API,
          payload
        );

        console.log(
          'Timetable create response:',
          response.data
        );
      }

      setIsModalOpen(false);
      setEditingId(null);
      setForm({
        ...initialForm,
      });

      /*
       * Fetch latest data from database
       * so UI always reflects backend.
       */
      await fetchData();
    } catch (err: any) {
      console.error(
        'Save timetable error:',
        err
      );

      console.error(
        'Save timetable response:',
        err?.response?.data
      );

      alert(
        err?.response?.data?.message ||
          'Failed to save timetable. Please check the details and try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this timetable entry?'
      );

    if (!confirmed) return;

    try {
      await api.delete(
        `${TIMETABLE_API}/${id}`
      );

      setTimetables((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );
    } catch (err: any) {
      console.error(
        'Delete timetable error:',
        err
      );

      console.error(
        'Delete response:',
        err?.response?.data
      );

      alert(
        err?.response?.data?.message ||
          'Failed to delete timetable entry.'
      );
    }
  };

  // ============================================================
  // FORMAT TIME
  // ============================================================

  const formatTime = (
    time: string
  ) => {
    if (!time) return '';

    const [hours, minutes] =
      time.split(':');

    const hour = Number(hours);

    const suffix =
      hour >= 12 ? 'PM' : 'AM';

    const formattedHour =
      hour % 12 || 12;

    return `${formattedHour}:${minutes} ${suffix}`;
  };

  // ============================================================
  // GROUP BY DAY
  // ============================================================

  const getDayEntries = (
    day: string
  ) => {
    return timetables
      .filter(
        (item) =>
          normalizeDay(item.day) ===
          normalizeDay(day)
      )
      .sort((a, b) =>
        a.startTime.localeCompare(
          b.startTime
        )
      );
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <div className="flex items-center gap-2">

            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays className="w-5 h-5" />
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900">
              Timetable
            </h1>

          </div>

          <p className="text-sm text-slate-500 mt-1">
            Manage your school's class schedules and periods.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Timetable
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading ? (

        <div className="flex items-center justify-center h-64 rounded-3xl border-2 border-dashed border-slate-200">

          <div className="text-center">

            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading timetable...
            </p>

          </div>

        </div>

      ) : timetables.length === 0 ? (

        /* EMPTY */

        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CalendarDays className="w-8 h-8" />
          </div>

          <h2 className="mt-5 text-lg font-extrabold text-slate-900">
            No timetable entries yet
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Create your first timetable entry to get started.
          </p>

          <button
            onClick={openCreateModal}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Timetable
          </button>

        </div>

      ) : (

        /* TIMETABLE */

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {days.map((day) => {

            const entries =
              getDayEntries(day);

            return (

              <div
                key={day}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
              >

                {/* DAY HEADER */}

                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <CalendarDays className="w-5 h-5" />
                    </div>

                    <div>

                      <h2 className="font-extrabold text-slate-900">
                        {day}
                      </h2>

                      <p className="text-xs text-slate-500">
                        {entries.length}{' '}
                        {entries.length === 1
                          ? 'period'
                          : 'periods'}
                      </p>

                    </div>

                  </div>

                </div>

                {/* ENTRIES */}

                <div className="p-4 space-y-3">

                  {entries.length === 0 ? (

                    <div className="py-8 text-center text-sm text-slate-400">
                      No classes scheduled
                    </div>

                  ) : (

                    entries.map(
                      (item) => (

                        <div
                          key={item.id}
                          className="p-4 rounded-2xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">

                              <h3 className="font-extrabold text-slate-900">
                                {item.subject}
                              </h3>

                              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">

                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-blue-500" />

                                  {formatTime(
                                    item.startTime
                                  )}

                                  {' - '}

                                  {formatTime(
                                    item.endTime
                                  )}
                                </span>

                                <span className="inline-flex items-center gap-1">

                                  <User className="w-3.5 h-3.5 text-purple-500" />

                                  {item.teacher?.name ||
                                    'Teacher'}

                                </span>

                              </div>

                              <div className="flex flex-wrap gap-2 mt-3">

                                <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold">
                                  Class {item.className}
                                </span>

                                {item.section && (

                                  <span className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 text-[11px] font-bold">
                                    Section {item.section}
                                  </span>

                                )}

                                {item.room && (

                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold">

                                    <MapPin className="w-3 h-3" />

                                    {item.room}

                                  </span>

                                )}

                              </div>

                            </div>

                            {/* ACTIONS */}

                            <div className="flex items-center gap-1 shrink-0">

                              <button
                                onClick={() =>
                                  openEditModal(
                                    item
                                  )
                                }
                                className="p-2 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    item.id
                                  )
                                }
                                className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                            </div>

                          </div>

                        </div>

                      )
                    )

                  )}

                </div>

              </div>

            );

          })}

        </div>

      )}

      {/* ========================================================
          CREATE / EDIT MODAL
      ======================================================== */}

      {isModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() =>
              setIsModalOpen(false)
            }
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* MODAL HEADER */}

            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-slate-100 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-extrabold text-slate-900">
                  {editingId
                    ? 'Edit Timetable'
                    : 'Create Timetable'}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Add class schedule details.
                </p>

              </div>

              <button
                onClick={() =>
                  setIsModalOpen(false)
                }
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* DAY */}

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Day *
                  </label>

                  <select
                    name="day"
                    value={form.day}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >

                    {days.map((day) => (

                      <option
                        key={day}
                        value={day}
                      >
                        {day}
                      </option>

                    ))}

                  </select>

                </div>

                {/* SUBJECT */}

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Subject *
                  </label>

                  {subjects.length > 0 ? (
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select subject</option>
                      {subjects
                        .filter(sub => {
                          if (!form.teacherId) return true;
                          return teacherAssignments.some(a => a.teacherId === form.teacherId && a.subjectId === sub.id);
                        })
                        .map((sub) => (
                        <option key={sub.id} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs font-medium">
                      ⚠️ No active subjects configured. Please create subjects first in Franchise Settings / Subjects.
                    </div>
                  )}

                </div>

                {/* SCHOOL PERIOD */}

                <div className="sm:col-span-2">

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    School Period *
                  </label>

                  {schoolPeriods.length > 0 ? (
                    <>
                      <select
                        name="periodId"
                        value={selectedPeriodId}
                        onChange={handlePeriodChange}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-medium"
                      >
                        <option value="">
                          Select school period
                        </option>

                        {schoolPeriods.map((period) => (
                          <option
                            key={period.id}
                            value={period.id}
                          >
                            {formatPeriodLabel(period)}
                          </option>
                        ))}
                      </select>

                      {editingId && !selectedPeriodId && form.startTime && form.endTime && (
                        <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                          ⚠️ Warning: Existing timetable time ({form.startTime} - {form.endTime}) does not match any configured school period. Please select a valid period.
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs font-medium">
                      No active school periods configured. Please create school periods first in Franchise Settings / School Periods.
                    </div>
                  )}

                </div>

                {/* TEACHER */}

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Teacher *
                  </label>

                  <select
                    name="teacherId"
                    value={form.teacherId}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >

                    <option value="">
                      Select teacher
                    </option>

                    {teachers.map(
                      (teacher) => (

                        <option
                          key={teacher.id}
                          value={teacher.id}
                        >
                          {teacher.name}

                          {teacher.subject
                            ? ` - ${teacher.subject}`
                            : ''}
                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* CLASS */}

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Class *
                  </label>

                  {classes.length > 0 ? (
                    <select
                      name="className"
                      value={form.className}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select class</option>
                      {classes
                        .filter(cls => {
                          if (!form.teacherId) return true;
                          return teacherAssignments.some(a => a.teacherId === form.teacherId && a.classId === cls.id);
                        })
                        .map((cls) => (
                        <option key={cls.id} value={cls.name}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name="className"
                      value={form.className}
                      onChange={handleChange}
                      placeholder="e.g. 10"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  )}

                </div>

                {/* SECTION */}

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Section
                  </label>

                  {(() => {
                    const selectedClassObj = classes.find(
                      (c) => c.name === form.className
                    );
                    const availableSections = selectedClassObj
                      ? sections.filter((s) => s.classId === selectedClassObj.id)
                      : sections;

                    if (availableSections.length > 0) {
                      return (
                        <select
                          name="section"
                          value={form.section}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="">Select section (optional)</option>
                          {availableSections
                            .filter(sec => {
                              if (!form.teacherId) return true;
                              return teacherAssignments.some(a => a.teacherId === form.teacherId && a.classId === sec.classId && a.sectionId === sec.id);
                            })
                            .map((sec) => (
                            <option key={sec.id} value={sec.name}>
                              {sec.name}
                            </option>
                          ))}
                        </select>
                      );
                    }

                    return (
                      <input
                        name="section"
                        value={form.section}
                        onChange={handleChange}
                        placeholder="e.g. A"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    );
                  })()}

                </div>

                {/* ROOM */}

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Room
                  </label>

                  <input
                    name="room"
                    value={form.room}
                    onChange={handleChange}
                    placeholder="e.g. Room 101"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">

                <button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                    ? 'Update Timetable'
                    : 'Create Timetable'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};