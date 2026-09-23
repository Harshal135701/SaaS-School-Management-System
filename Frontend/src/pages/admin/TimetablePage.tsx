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

interface TeacherAssignment {
  id: string;
  teacherId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  status?: string;
}

interface Timetable {
  id: string;
  day: string;
  schoolPeriodId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  room?: string;
  teacher?: Teacher;
  class?: ClassItem;
  section?: SectionItem;
  subject?: SubjectItem;
  schoolPeriod?: SchoolPeriod;
}

interface FormData {
  day: string;
  schoolPeriodId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  room: string;
}

const initialForm: FormData = {
  day: 'MONDAY',
  schoolPeriodId: '',
  classId: '',
  sectionId: '',
  subjectId: '',
  teacherId: '',
  room: '',
};

const days = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

const TIMETABLE_API = '/franchise/timetable';
const TEACHER_API = '/franchise/teachers';
const SCHOOL_PERIODS_API = '/school-periods';
const CLASSES_API = '/franchise/classes';
const SECTIONS_API = '/franchise/sections';
const SUBJECTS_API = '/franchise/subjects';
const ASSIGNMENTS_API = '/franchise/teacher-assignments';

export const TimetablePage: React.FC = () => {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schoolPeriods, setSchoolPeriods] = useState<SchoolPeriod[]>([]);
  const [allSchoolPeriods, setAllSchoolPeriods] = useState<SchoolPeriod[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<
    TeacherAssignment[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>(initialForm);

  // ============================================================
  // HELPERS
  // ============================================================

  const displayDay = (day: string) => {
    if (!day) return '';

    return (
      day.charAt(0).toUpperCase() +
      day.slice(1).toLowerCase()
    );
  };

  const formatTime = (time?: string) => {
    if (!time) return '';

    const [hours, minutes] = time.split(':');
    const hour = Number(hours);

    if (Number.isNaN(hour)) return time;

    const suffix = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;

    return `${formattedHour}:${minutes} ${suffix}`;
  };

  const formatPeriodLabel = (period: SchoolPeriod) => {
    const start = period.startTime?.substring(0, 5) || '';
    const end = period.endTime?.substring(0, 5) || '';

    return `${period.name || `Period ${period.periodNumber}`} — ${formatTime(
      start
    )} - ${formatTime(end)}`;
  };

  // ============================================================
  // FETCH DATA
  // ============================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        timetableRes,
        teachersRes,
        periodsRes,
        classesRes,
        sectionsRes,
        subjectsRes,
        assignmentsRes,
      ] = await Promise.all([
        api.get(TIMETABLE_API),
        api.get(TEACHER_API),
        api.get(SCHOOL_PERIODS_API),
        api.get(CLASSES_API),
        api.get(SECTIONS_API),
        api.get(SUBJECTS_API),
        api.get(ASSIGNMENTS_API),
      ]);

      const timetableData = timetableRes.data?.data || [];

      const teacherData =
        teachersRes.data?.data ||
        teachersRes.data?.teachers ||
        [];

      const periodData = periodsRes.data?.data || [];

      const classData = classesRes.data?.data || [];

      const sectionData = sectionsRes.data?.data || [];

      const subjectData = subjectsRes.data?.data || [];

      const assignmentData =
        assignmentsRes.data?.data || [];

      setTimetables(timetableData);
      setTeachers(teacherData);

      setSchoolPeriods(
        periodData
          .filter(
            (period: SchoolPeriod) =>
              period.isActive !== false &&
              !period.isBreak
          )
          .sort(
            (a: SchoolPeriod, b: SchoolPeriod) =>
              a.periodNumber - b.periodNumber
          )
      );

      setAllSchoolPeriods(periodData);

      setClasses(classData);

      setSections(sectionData);

      setSubjects(
        subjectData.filter(
          (subject: SubjectItem) =>
            subject.isActive !== false
        )
      );

      setTeacherAssignments(
        assignmentData.filter(
          (assignment: TeacherAssignment) =>
            assignment.status === 'ACTIVE' ||
            !assignment.status
        )
      );
    } catch (err: any) {
      console.error('Timetable fetch error:', err);

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
  // FORM HELPERS
  // ============================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  // ============================================================
  // FILTER ASSIGNMENTS
  // ============================================================



  const availableTeachers = teachers.filter((teacher) =>
    teacherAssignments.some(
      (assignment) =>
        assignment.teacherId === teacher.id &&
        (!form.classId ||
          assignment.classId === form.classId) &&
        (!form.sectionId ||
          assignment.sectionId === form.sectionId) &&
        (!form.subjectId ||
          assignment.subjectId === form.subjectId)
    )
  );

  const availableSubjects = subjects.filter((subject) =>
    teacherAssignments.some(
      (assignment) =>
        assignment.subjectId === subject.id &&
        (!form.teacherId ||
          assignment.teacherId === form.teacherId) &&
        (!form.classId ||
          assignment.classId === form.classId) &&
        (!form.sectionId ||
          assignment.sectionId === form.sectionId)
    )
  );

  const availableClasses = classes.filter((classItem) =>
    teacherAssignments.some(
      (assignment) =>
        assignment.classId === classItem.id &&
        (!form.teacherId ||
          assignment.teacherId === form.teacherId) &&
        (!form.subjectId ||
          assignment.subjectId === form.subjectId)
    )
  );

  const availableSections = sections.filter((section) =>
    section.classId === form.classId &&
    teacherAssignments.some(
      (assignment) =>
        assignment.sectionId === section.id &&
        assignment.classId === form.classId &&
        (!form.teacherId ||
          assignment.teacherId === form.teacherId) &&
        (!form.subjectId ||
          assignment.subjectId === form.subjectId)
    )
  );

  // ============================================================
  // FIELD CASCADE
  // ============================================================

  const handleTeacherChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const teacherId = e.target.value;

    setForm((prev) => ({
      ...prev,
      teacherId,
      classId: '',
      sectionId: '',
      subjectId: '',
    }));
  };

  const handleClassChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const classId = e.target.value;

    setForm((prev) => ({
      ...prev,
      classId,
      sectionId: '',
      subjectId: '',
    }));
  };

  const handleSectionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const sectionId = e.target.value;

    setForm((prev) => ({
      ...prev,
      sectionId,
      subjectId: '',
    }));
  };

  const handleSubjectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const subjectId = e.target.value;

    setForm((prev) => ({
      ...prev,
      subjectId,
    }));
  };

  // ============================================================
  // CREATE
  // ============================================================

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // ============================================================
  // EDIT
  // ============================================================

  const openEditModal = (item: Timetable) => {
    setEditingId(item.id);

    setForm({
      day: item.day,
      schoolPeriodId: item.schoolPeriodId,
      classId: item.classId,
      sectionId: item.sectionId,
      subjectId: item.subjectId,
      teacherId: item.teacherId,
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
      !form.schoolPeriodId ||
      !form.classId ||
      !form.sectionId ||
      !form.subjectId ||
      !form.teacherId
    ) {
      alert('Please fill all required fields.');
      return;
    }

    const assignmentExists = teacherAssignments.some(
      (assignment) =>
        assignment.status !== 'INACTIVE' &&
        assignment.teacherId === form.teacherId &&
        assignment.classId === form.classId &&
        assignment.sectionId === form.sectionId &&
        assignment.subjectId === form.subjectId
    );

    if (!assignmentExists) {
      alert(
        'This teacher is not assigned to the selected class, section and subject.'
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        day: form.day,
        schoolPeriodId: form.schoolPeriodId,
        classId: form.classId,
        sectionId: form.sectionId,
        subjectId: form.subjectId,
        teacherId: form.teacherId,
        room: form.room.trim() || null,
      };

      if (editingId) {
        await api.put(
          `${TIMETABLE_API}/${editingId}`,
          payload
        );
      } else {
        await api.post(
          TIMETABLE_API,
          payload
        );
      }

      setIsModalOpen(false);
      resetForm();

      await fetchData();
    } catch (err: any) {
      console.error('Save timetable error:', err);

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

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this timetable entry?'
    );

    if (!confirmed) return;

    try {
      await api.delete(`${TIMETABLE_API}/${id}`);

      setTimetables((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (err: any) {
      console.error('Delete timetable error:', err);

      alert(
        err?.response?.data?.message ||
        'Failed to delete timetable entry.'
      );
    }
  };

  // ============================================================
  // DISPLAY HELPERS
  // ============================================================

  const getDayEntries = (day: string) => {
    return timetables
      .filter(
        (item) => item.day === day
      )
      .sort((a, b) => {
        const periodA =
          a.schoolPeriod?.periodNumber || 999;

        const periodB =
          b.schoolPeriod?.periodNumber || 999;

        return periodA - periodB;
      });
  };

  const getClassName = (item: Timetable) => {
    return (
      item.class?.name ||
      classes.find(
        (classItem) =>
          classItem.id === item.classId
      )?.name ||
      'Class'
    );
  };

  const getSectionName = (item: Timetable) => {
    return (
      item.section?.name ||
      sections.find(
        (section) =>
          section.id === item.sectionId
      )?.name ||
      'Section'
    );
  };

  const getSubjectName = (item: Timetable) => {
    return (
      item.subject?.name ||
      subjects.find(
        (subject) =>
          subject.id === item.subjectId
      )?.name ||
      'Subject'
    );
  };

  const getTeacherName = (item: Timetable) => {
    return (
      item.teacher?.name ||
      teachers.find(
        (teacher) =>
          teacher.id === item.teacherId
      )?.name ||
      'Teacher'
    );
  };


  const getPeriod = (item: Timetable) => {
    return (
      item.schoolPeriod ||
      allSchoolPeriods.find(
        (period) =>
          period.id === item.schoolPeriodId
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {days.map((day) => {
            const entries = getDayEntries(day);

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
                        {displayDay(day)}
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
                    entries.map((item) => {
                      const period = getPeriod(item);

                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">
                              <h3 className="font-extrabold text-slate-900">
                                {getSubjectName(item)}
                              </h3>

                              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">

                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-blue-500" />


                                  {period ? (
                                    <span className="inline-flex items-center gap-1">
                                      {formatTime(period.startTime)} -{' '}
                                      {formatTime(period.endTime)}

                                      {period.isActive === false && (
                                        <span className="ml-1 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 font-bold">
                                          Inactive
                                        </span>
                                      )}
                                    </span>
                                  ) : (
                                    'Period'
                                  )}


                                </span>

                                <span className="inline-flex items-center gap-1">
                                  <User className="w-3.5 h-3.5 text-purple-500" />

                                  {getTeacherName(item)}
                                </span>

                              </div>

                              <div className="flex flex-wrap gap-2 mt-3">

                                <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold">
                                  Class {getClassName(item)}
                                </span>

                                <span className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 text-[11px] font-bold">
                                  Section {getSectionName(item)}
                                </span>

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
                                  openEditModal(item)
                                }
                                className="p-2 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(item.id)
                                }
                                className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}

        </div>
      )}

      {/* CREATE / EDIT MODAL */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* HEADER */}

            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {editingId
                    ? 'Edit Timetable'
                    : 'Create Timetable'}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Select a valid teacher assignment for this schedule.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
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
                      <option key={day} value={day}>
                        {displayDay(day)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SCHOOL PERIOD */}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    School Period *
                  </label>

                  <select
                    name="schoolPeriodId"
                    value={form.schoolPeriodId}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                </div>

                {/* TEACHER */}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Teacher *
                  </label>

                  <select
                    name="teacherId"
                    value={form.teacherId}
                    onChange={handleTeacherChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select teacher
                    </option>

                    {availableTeachers.map((teacher) => (
                      <option
                        key={teacher.id}
                        value={teacher.id}
                      >
                        {teacher.name}
                      </option>
                    ))}
                  </select>

                  {form.teacherId &&
                    availableTeachers.length === 0 && (
                      <p className="mt-1.5 text-xs text-amber-700">
                        No active teacher assignment found.
                      </p>
                    )}
                </div>

                {/* CLASS */}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Class *
                  </label>

                  <select
                    name="classId"
                    value={form.classId}
                    onChange={handleClassChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select class
                    </option>

                    {availableClasses.map((classItem) => (
                      <option
                        key={classItem.id}
                        value={classItem.id}
                      >
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SECTION */}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Section *
                  </label>

                  <select
                    name="sectionId"
                    value={form.sectionId}
                    onChange={handleSectionChange}
                    disabled={!form.classId}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      {form.classId
                        ? 'Select section'
                        : 'Select class first'}
                    </option>

                    {availableSections.map((section) => (
                      <option
                        key={section.id}
                        value={section.id}
                      >
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SUBJECT */}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Subject *
                  </label>

                  <select
                    name="subjectId"
                    value={form.subjectId}
                    onChange={handleSubjectChange}
                    disabled={
                      !form.teacherId ||
                      !form.classId ||
                      !form.sectionId
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">
                      {!form.sectionId
                        ? 'Select section first'
                        : 'Select subject'}
                    </option>

                    {availableSubjects.map((subject) => (
                      <option
                        key={subject.id}
                        value={subject.id}
                      >
                        {subject.name}
                        {subject.code
                          ? ` (${subject.code})`
                          : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ROOM */}

                <div className="sm:col-span-2">
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

              {/* ASSIGNMENT INFO */}

              {form.teacherId &&
                form.classId &&
                form.sectionId &&
                form.subjectId && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
                    ✓ Teacher assignment validated. The backend will also
                    verify conflicts and weekly subject requirements.
                  </div>
                )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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