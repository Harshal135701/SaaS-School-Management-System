import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import {
  Users,
  Mail,
  Phone,
  Plus,
  Shield,
  RefreshCw,
  X,
  Lock,
  Eye,
  EyeOff,
  Edit,
  Trash2,
} from 'lucide-react';
import api from '../../services/api';

interface Teacher {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  subject?: string;
  department?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

interface ClassItem {
  id: string;
  name: string;
  code?: string;
}

interface SectionItem {
  id: string;
  name: string;
  classId: string;
}

interface TeacherForm {
  name: string;
  email: string;
  phone: string;
  panNumber: string;
  aadhaarNumber: string;
  subject: string;
  department: string;
  password: string;
  confirmPassword: string;
  classId?: string;
  sectionId?: string;
}

const emptyForm: TeacherForm = {
  name: '',
  email: '',
  phone: '',
  panNumber: '',
  aadhaarNumber: '',
  subject: '',
  department: '',
  password: '',
  confirmPassword: '',
  classId: '',
  sectionId: '',
};

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [form, setForm] = useState<TeacherForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [teachersRes, classesRes, assignmentsRes] = await Promise.all([
        api.get('/franchise/teachers', {
          params: {
            limit: 100,
          },
        }),
        api.get('/franchise/classes').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/franchise/teacher-assignments').catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (teachersRes.data?.success) {
        setTeachers(teachersRes.data.data || []);
      } else {
        setError('Failed to fetch teachers.');
      }

      if (classesRes.data?.success && Array.isArray(classesRes.data.data)) {
        setClasses(classesRes.data.data);
      }

      if (assignmentsRes.data?.success && Array.isArray(assignmentsRes.data.data)) {
        setAssignments(assignmentsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Failed to load teachers. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const fetchSectionsForClass = async (classId: string) => {
    if (!classId) {
      setSections([]);
      return;
    }
    try {
      const res = await api.get('/franchise/sections', { params: { classId } });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSections(res.data.data);
      } else {
        setSections([]);
      }
    } catch (err) {
      console.error('Failed to load sections:', err);
      setSections([]);
    }
  };

  const openAddModal = () => {
    setEditingTeacher(null);
    setForm({ ...emptyForm });
    setSections([]);
    setError(null);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);

    const existingAssignment = assignments.find((a) => a.teacherId === teacher.id);
    if (existingAssignment?.classId) {
      fetchSectionsForClass(existingAssignment.classId);
    } else {
      setSections([]);
    }

    setForm({
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      panNumber: teacher.panNumber || '',
      aadhaarNumber: teacher.aadhaarNumber || '',
      subject: teacher.subject || '',
      department: teacher.department || '',
      password: '',
      confirmPassword: '',
      classId: existingAssignment?.classId || '',
      sectionId: existingAssignment?.sectionId || '',
    });

    setError(null);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingTeacher(null);
    setForm({ ...emptyForm });
    setSections([]);
    setError(null);
    setShowPassword(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError('Teacher name is required.');
      return;
    }

    if (!form.email.trim()) {
      setError('Teacher email is required.');
      return;
    }

    if (!editingTeacher) {
      if (!form.password) {
        setError('Password is required.');
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError('Password and Confirm Password do not match.');
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);

      if (form.classId && !form.sectionId) {
        setError('Please select a section for the assigned class, or leave class empty.');
        return;
      }

      const payload: {
        name: string;
        email: string;
        phone?: string;
        panNumber?: string | null;
        aadhaarNumber?: string | null;
        subject?: string;
        department?: string;
        password?: string;
      } = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        panNumber: form.panNumber.trim() || null,
        aadhaarNumber: form.aadhaarNumber.trim() || null,
        subject: form.subject.trim() || undefined,
        department: form.department.trim() || undefined,
      };

      if (!editingTeacher) {
        payload.password = form.password;
      }

      let savedTeacherId = editingTeacher?.id;

      if (editingTeacher) {
        await api.put(
          `/franchise/teachers/${editingTeacher.id}`,
          payload
        );
      } else {
        const createRes = await api.post('/franchise/teachers', payload);
        savedTeacherId = createRes.data?.data?.id;
      }

      if (savedTeacherId) {
        const existingAssignment = assignments.find((a) => a.teacherId === savedTeacherId);
        if (form.classId && form.sectionId) {
          if (existingAssignment) {
            await api.put(`/franchise/teacher-assignments/${existingAssignment.id}`, {
              teacherId: savedTeacherId,
              classId: form.classId,
              sectionId: form.sectionId,
            }).catch((assignErr) => {
              console.warn('Failed to update teacher assignment:', assignErr);
            });
          } else {
            await api.post('/franchise/teacher-assignments', {
              teacherId: savedTeacherId,
              classId: form.classId,
              sectionId: form.sectionId,
            }).catch((assignErr) => {
              console.warn('Failed to create teacher assignment:', assignErr);
            });
          }
        } else if (!form.classId && existingAssignment) {
          await api.delete(`/franchise/teacher-assignments/${existingAssignment.id}`).catch((delErr) => {
            console.warn('Failed to remove teacher assignment:', delErr);
          });
        }
      }

      closeModal();
      await fetchTeachers();
    } catch (err: any) {
      console.error('Error saving teacher:', err);

      setError(
        err.response?.data?.message ||
          'Failed to save teacher.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (teacher: Teacher) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${teacher.name}?`
    );

    if (!confirmed) return;

    try {
      setError(null);

      await api.delete(
        `/franchise/teachers/${teacher.id}`
      );

      await fetchTeachers();
    } catch (err: any) {
      console.error('Error deleting teacher:', err);

      setError(
        err.response?.data?.message ||
          'Failed to delete teacher.'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-600" />
            Teachers & Faculty
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Manage teachers and faculty members of your school.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTeachers}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh teachers"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loading ? 'animate-spin' : ''
              }`}
            />
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Teacher
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && !isModalOpen && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 font-bold text-center text-sm">
          {error}
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl">
          <div className="text-center space-y-3">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">
              Loading teachers...
            </p>
          </div>
        </div>
      ) : teachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl">
          <Users className="w-10 h-10 text-slate-300 mb-3" />

          <p className="text-sm font-semibold text-slate-400">
            No teachers found
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Click "Add Teacher" to register your first teacher.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {teachers.map((teacher) => (
            <Card
              key={teacher.id}
              hoverLift
              padding="md"
              className="flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Avatar
                    name={teacher.name}
                    size="lg"
                    status={
                      teacher.status === 'INACTIVE'
                        ? undefined
                        : 'online'
                    }
                  />

                  <Badge variant="indigo" size="sm">
                    Teacher
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {teacher.name}
                  </h3>

                  <span className="text-xs font-semibold text-blue-600 block">
                    {teacher.subject ||
                      teacher.department ||
                      'Teacher'}
                  </span>

                  {assignments
                    .filter((a) => a.teacherId === teacher.id)
                    .map((a) => (
                      <span
                        key={a.id}
                        className="inline-flex items-center text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 mt-1.5 mr-1"
                      >
                        {a.class?.name || 'Class'} - {a.section?.name || 'Sec'}
                      </span>
                    ))}
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                    <span className="truncate">
                      {teacher.email || '—'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                    <span>
                      {teacher.phone || '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-500" />
                  {teacher.status === 'INACTIVE'
                    ? 'Inactive'
                    : 'Active'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(teacher)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit teacher"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(teacher)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Delete teacher"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ADD / EDIT TEACHER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {editingTeacher
                    ? 'Edit Teacher'
                    : 'Add New Teacher'}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {editingTeacher
                    ? 'Update teacher information.'
                    : 'Create a teacher account for your school.'}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-50"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-4"
            >
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NAME */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Teacher Name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="e.g. Dr. Rajesh Verma"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Email *
                  </label>

                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="teacher@school.edu"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="+91 98765 00000"
                  />
                </div>

                {/* PAN CARD NUMBER */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    PAN CARD NUMBER <span className="font-normal text-slate-400">(Optional)</span>
                  </label>

                  <input
                    name="panNumber"
                    value={form.panNumber}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="e.g. ABCDE1234F"
                  />
                </div>

                {/* AADHAAR CARD NUMBER */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    AADHAAR CARD NUMBER <span className="font-normal text-slate-400">(Optional)</span>
                  </label>

                  <input
                    name="aadhaarNumber"
                    value={form.aadhaarNumber}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="e.g. 1234 5678 9012"
                  />
                </div>

                {/* SUBJECT */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Subject
                  </label>

                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="e.g. Mathematics"
                  />
                </div>

                {/* DEPARTMENT */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Department
                  </label>

                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="e.g. Mathematics Department"
                  />
                </div>

                {/* ASSIGNED CLASS (OPTIONAL) */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Assigned Class <span className="font-normal text-slate-400">(Optional)</span>
                  </label>
                  <select
                    name="classId"
                    value={form.classId}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">-- None / Select Class --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ASSIGNED SECTION (OPTIONAL) */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Assigned Section <span className="font-normal text-slate-400">(Optional)</span>
                  </label>
                  <select
                    name="sectionId"
                    value={form.sectionId}
                    onChange={handleChange}
                    disabled={!form.classId}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">
                      {!form.classId ? '-- Select Class First --' : '-- Select Section --'}
                    </option>
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PASSWORD */}
                {!editingTeacher && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Password *
                    </label>

                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />

                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-sm outline-none focus:border-blue-500"
                        placeholder="Enter password"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* CONFIRM PASSWORD */}
                {!editingTeacher && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Confirm Password *
                    </label>

                    <input
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      placeholder="Confirm password"
                    />
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingTeacher
                    ? 'Update Teacher'
                    : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};