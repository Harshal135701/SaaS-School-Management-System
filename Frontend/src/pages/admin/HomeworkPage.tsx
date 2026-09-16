import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  BookOpen,
  CalendarDays,
  User,
  Edit,
  Trash2,
  X,
  FileText,
  Search,
} from 'lucide-react';
import api from '../../services/api';

interface Teacher {
  id: string;
  name: string;
  subject?: string;
}

interface ClassItem {
  id: string;
  name: string;
  code?: string;
  numericValue?: number | null;
}

interface SectionItem {
  id: string;
  name: string;
  classId: string;
}

interface Homework {
  id: string;
  teacherId: string;
  classId?: string;
  sectionId?: string;
  title: string;
  description?: string;
  subject: string;
  dueDate: string;
  status?: string;
  teacher?: Teacher;
  class?: { id: string; name: string; code?: string };
  section?: { id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

interface FormData {
  teacherId: string;
  classId: string;
  sectionId: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  status: string;
}

const initialForm: FormData = {
  teacherId: '',
  classId: '',
  sectionId: '',
  title: '',
  description: '',
  subject: '',
  dueDate: '',
  status: 'ACTIVE',
};

const statusOptions = [
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
];

interface HomeworkPageProps {
  user?: any;
}

export const HomeworkPage: React.FC<HomeworkPageProps> = ({ user }) => {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>(initialForm);

  // ============================================================
  // FETCH HOMEWORK + TEACHERS + CLASSES
  // ============================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [homeworkRes, teachersRes, classesRes] = await Promise.all([
        api.get('/franchise/homework').catch((err) => {
          console.error('Homework fetch error:', err);
          return { data: { success: false, data: [] } };
        }),
        api.get('/franchise/teachers', { params: { limit: 100 } }).catch((err) => {
          console.warn('Teachers fetch warning (may require elevated permissions):', err?.response?.status || err);
          return { data: { success: false, data: [] } };
        }),
        api.get('/franchise/classes').catch((err) => {
          console.warn('Classes fetch warning (requires franchise admin):', err?.response?.status || err);
          return { data: { success: false, data: [] } };
        }),
      ]);

      const loadedHomeworks: Homework[] = homeworkRes.data?.data || [];
      setHomeworks(loadedHomeworks);

      // Populate teachers
      const loadedTeachers: Teacher[] =
        teachersRes.data?.data || teachersRes.data?.teachers || [];

      if (loadedTeachers.length > 0) {
        setTeachers(loadedTeachers);
      } else if (user) {
        setTeachers([
          {
            id: user.id,
            name: user.name || 'Teacher',
            subject: user.subject,
          },
        ]);
      } else {
        // Fallback: extract distinct teachers from loaded homework
        const teacherMap = new Map<string, Teacher>();
        loadedHomeworks.forEach((h) => {
          if (h.teacher?.id && h.teacher?.name) {
            teacherMap.set(h.teacher.id, {
              id: h.teacher.id,
              name: h.teacher.name,
              subject: h.teacher.subject,
            });
          }
        });
        setTeachers(Array.from(teacherMap.values()));
      }

      // Populate classes
      if (classesRes.data?.success && Array.isArray(classesRes.data.data) && classesRes.data.data.length > 0) {
        const sorted = [...classesRes.data.data].sort((a: ClassItem, b: ClassItem) => {
          const numA = a.numericValue;
          const numB = b.numericValue;
          if (numA !== null && numA !== undefined && numB !== null && numB !== undefined) {
            return numA - numB;
          }
          if (numA !== null && numA !== undefined) return -1;
          if (numB !== null && numB !== undefined) return 1;
          return (a.name || '').localeCompare(b.name || '');
        });
        setClasses(sorted);
      } else {
        // Fallback: extract distinct classes from loaded homework
        const classMap = new Map<string, ClassItem>();
        loadedHomeworks.forEach((h) => {
          if (h.class?.id && h.class?.name) {
            classMap.set(h.class.id, {
              id: h.class.id,
              name: h.class.name,
              code: h.class.code,
            });
          }
        });
        setClasses(Array.from(classMap.values()));
      }
    } catch (err) {
      console.error('Homework fetch error:', err);
      setError('Failed to load homework. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchSectionsForClass = async (classId: string) => {
    if (!classId) {
      setSections([]);
      return;
    }
    try {
      const res = await api.get('/franchise/sections', { params: { classId } }).catch(() => null);
      if (res?.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setSections(res.data.data);
      } else {
        // Fallback: extract matching sections from loaded homework
        const secMap = new Map<string, SectionItem>();
        homeworks.forEach((h) => {
          if (h.classId === classId && h.section?.id && h.section?.name) {
            secMap.set(h.section.id, {
              id: h.section.id,
              name: h.section.name,
              classId: h.classId,
            });
          }
        });
        setSections(Array.from(secMap.values()));
      }
    } catch (err) {
      console.error('Failed to load sections:', err);
      setSections([]);
    }
  };

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'classId') {
      fetchSectionsForClass(value);
      setForm((prev) => ({
        ...prev,
        classId: value,
        sectionId: '',
      }));
    }
  };

  // ============================================================
  // OPEN CREATE MODAL
  // ============================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');

  const filteredHomeworks = useMemo(() => {
    return homeworks.filter((item) => {
      if (statusFilter !== 'ALL' && (item.status || 'ACTIVE').toUpperCase() !== statusFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (item.title || '').toLowerCase().includes(q) ||
        (item.subject || '').toLowerCase().includes(q) ||
        (item.teacher?.name || '').toLowerCase().includes(q) ||
        (item.class?.name || '').toLowerCase().includes(q) ||
        (item.section?.name || '').toLowerCase().includes(q)
      );
    });
  }, [homeworks, statusFilter, searchQuery]);

  // ============================================================
  // OPEN CREATE MODAL
  // ============================================================

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...initialForm,
      teacherId: user?.id || (teachers.length > 0 ? teachers[0].id : ''),
    });
    setSections([]);
    setIsModalOpen(true);
  };

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const openEditModal = (item: Homework) => {
    setEditingId(item.id);

    if (item.classId) {
      fetchSectionsForClass(item.classId);
    } else {
      setSections([]);
    }

    setForm({
      teacherId: item.teacherId,
      classId: item.classId || '',
      sectionId: item.sectionId || '',
      title: item.title,
      description: item.description || '',
      subject: item.subject,
      dueDate: item.dueDate
        ? item.dueDate.substring(0, 10)
        : '',
      status: item.status || 'ACTIVE',
    });

    setIsModalOpen(true);
  };

  // ============================================================
  // SAVE HOMEWORK
  // ============================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const effectiveTeacherId = form.teacherId || user?.id || (teachers.length === 1 ? teachers[0].id : '');

    if (
      !effectiveTeacherId ||
      !form.classId ||
      !form.sectionId ||
      !form.title ||
      !form.subject ||
      !form.dueDate
    ) {
      alert(
        'Please fill all required fields: Teacher, Class, Section, Title, Subject, and Due Date.'
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        teacherId: effectiveTeacherId,
        classId: form.classId,
        sectionId: form.sectionId,
        title: form.title,
        description: form.description,
        subject: form.subject,
        dueDate: form.dueDate,
        status: form.status,
      };

      console.log(
        'Saving homework:',
        payload
      );

      if (editingId) {
        await api.put(
          `/franchise/homework/${editingId}`,
          payload
        );
      } else {
        await api.post(
          '/franchise/homework',
          payload
        );
      }

      setIsModalOpen(false);
      setEditingId(null);
      setForm(initialForm);

      await fetchData();
    } catch (err: any) {
      console.error(
        'Save homework error:',
        err
      );

      console.error(
        'Backend response:',
        err?.response?.data
      );

      alert(
        err?.response?.data?.message ||
        'Failed to save homework. Please check the details and try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE HOMEWORK
  // ============================================================

  const handleDelete = async (
    id: string
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this homework?'
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/franchise/homework/${id}`
      );

      setHomeworks((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );
    } catch (err: any) {
      console.error(
        'Delete homework error:',
        err
      );

      alert(
        err?.response?.data?.message ||
        'Failed to delete homework.'
      );
    }
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (
    date: string
  ) => {
    if (!date) return '';

    const parsedDate =
      new Date(date);

    if (Number.isNaN(
      parsedDate.getTime()
    )) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  // ============================================================
  // STATUS STYLE
  // ============================================================

  const getStatusClass = (
    status?: string
  ) => {
    switch (
      status?.toUpperCase()
    ) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700';

      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700';

      case 'ACTIVE':
      default:
        return 'bg-blue-50 text-blue-700';
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <div className="flex items-center gap-2">

            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900">
              Homework
            </h1>

          </div>

          <p className="text-sm text-slate-500 mt-1">
            Manage homework assignments for your students.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Homework
        </button>

      </div>

      {/* ======================================================
          SEARCH & FILTER TOOLBAR
      ====================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title, subject, teacher, class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {(['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const).map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading ? (

        <div className="flex items-center justify-center h-64 rounded-3xl border-2 border-dashed border-slate-200">

          <div className="text-center">

            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading homework...
            </p>

          </div>

        </div>

      ) : filteredHomeworks.length === 0 ? (

        /* ====================================================
           EMPTY STATE
        ==================================================== */

        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">

            <BookOpen className="w-8 h-8" />

          </div>

          <h2 className="mt-5 text-lg font-extrabold text-slate-900">
            {searchQuery || statusFilter !== 'ALL'
              ? 'No matching assignments found'
              : 'No homework yet'}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Try resetting the filters or modifying your search query.'
              : 'Create your first homework assignment to get started.'}
          </p>

          {searchQuery || statusFilter !== 'ALL' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-all"
            >
              Reset Filters
            </button>
          ) : (
            <button
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Homework
            </button>
          )}

        </div>

      ) : (

        /* ====================================================
           HOMEWORK LIST
        ==================================================== */

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {filteredHomeworks.map((item) => (

            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >

              {/* CARD HEADER */}

              <div className="p-5 border-b border-slate-100">

                <div className="flex items-start justify-between gap-3">

                  <div className="flex items-center gap-3 min-w-0">

                    <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

                      <FileText className="w-5 h-5" />

                    </div>

                    <div className="min-w-0">

                      <h3 className="font-extrabold text-slate-900 truncate">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.subject}
                      </p>

                    </div>

                  </div>

                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${getStatusClass(
                      item.status
                    )}`}
                  >
                    {item.status || 'ACTIVE'}
                  </span>

                </div>

              </div>

              {/* CARD BODY */}

              <div className="p-5 space-y-4">

                {/* DESCRIPTION */}

                {item.description && (

                  <div>

                    <p className="text-xs font-bold text-slate-500 mb-1">
                      Description
                    </p>

                    <p className="text-sm text-slate-700 line-clamp-3">
                      {item.description}
                    </p>

                  </div>

                )}

                {/* TEACHER */}

                <div className="flex items-center gap-2">

                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">

                    <User className="w-4 h-4" />

                  </div>

                  <div>

                    <p className="text-[11px] text-slate-400 font-semibold">
                      Teacher
                    </p>

                    <p className="text-sm font-bold text-slate-700">
                      {item.teacher?.name ||
                        'Teacher'}
                    </p>

                  </div>

                </div>

                {/* CLASS & SECTION */}

                {(item.class?.name || item.section?.name) && (

                  <div className="flex items-center gap-2">

                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">

                      <BookOpen className="w-4 h-4" />

                    </div>

                    <div>

                      <p className="text-[11px] text-slate-400 font-semibold">
                        Class & Section
                      </p>

                      <p className="text-sm font-bold text-slate-700">
                        {item.class?.name || 'Class'}{item.section?.name ? ` • ${item.section.name}` : ''}
                      </p>

                    </div>

                  </div>

                )}

                {/* DUE DATE */}

                <div className="flex items-center gap-2">

                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">

                    <CalendarDays className="w-4 h-4" />

                  </div>

                  <div>

                    <p className="text-[11px] text-slate-400 font-semibold">
                      Due Date
                    </p>

                    <p className="text-sm font-bold text-slate-700">
                      {formatDate(
                        item.dueDate
                      )}
                    </p>

                  </div>

                </div>

              </div>

              {/* CARD FOOTER */}

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">

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

          ))}

        </div>

      )}

      {/* ======================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {isModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* BACKDROP */}

          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() =>
              !saving &&
              setIsModalOpen(false)
            }
          />

          {/* MODAL */}

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* MODAL HEADER */}

            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-slate-100 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-extrabold text-slate-900">
                  {editingId
                    ? 'Edit Homework'
                    : 'Create Homework'}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Add homework assignment details.
                </p>

              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setIsModalOpen(false)
                }
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 disabled:opacity-50"
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

                {/* TITLE */}

                <div className="sm:col-span-2">

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Homework Title *
                  </label>

                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Algebra Assignment"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* SUBJECT */}

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Subject *
                  </label>

                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="e.g. Mathematics"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

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
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
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

                  <select
                    name="classId"
                    value={form.classId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                  >

                    <option value="">
                      Select class
                    </option>

                    {classes.map((cls) => (

                      <option key={cls.id} value={cls.id}>
                        {cls.name} {cls.code ? `(${cls.code})` : ''}
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
                    onChange={handleChange}
                    disabled={!form.classId || sections.length === 0}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                  >

                    <option value="">
                      {!form.classId
                        ? 'Select class first'
                        : sections.length === 0
                        ? 'No sections available'
                        : 'Select section'}
                    </option>

                    {sections.map((sec) => (

                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>

                    ))}

                  </select>

                </div>

                {/* DUE DATE */}

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Due Date *
                  </label>

                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* STATUS */}

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >

                    {statusOptions.map(
                      (status) => (

                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* DESCRIPTION */}

                <div className="sm:col-span-2">

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter homework instructions or description..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
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
                    ? 'Update Homework'
                    : 'Create Homework'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default HomeworkPage;