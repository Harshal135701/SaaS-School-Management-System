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

interface TeachersPageProps {
  onOpenStaffModal: () => void;
}

interface Teacher {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  department?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

interface TeacherForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  department: string;
  password: string;
  confirmPassword: string;
}

const emptyForm: TeacherForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  department: '',
  password: '',
  confirmPassword: '',
};

export const TeachersPage: React.FC<TeachersPageProps> = ({
  onOpenStaffModal,
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
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

      const res = await api.get('/franchise/teachers', {
        params: {
          limit: 100,
        },
      });

      if (res.data?.success) {
        setTeachers(res.data.data || []);
      } else {
        setError('Failed to fetch teachers.');
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

  const openAddModal = () => {
    setEditingTeacher(null);
    setForm(emptyForm);
    setError(null);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);

    setForm({
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      subject: teacher.subject || '',
      department: teacher.department || '',
      password: '',
      confirmPassword: '',
    });

    setError(null);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingTeacher(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      const payload: any = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject.trim() || undefined,
        department: form.department.trim() || undefined,
      };

      if (!editingTeacher) {
        payload.password = form.password;
      }

      if (editingTeacher) {
        await api.put(
          `/franchise/teachers/${editingTeacher.id}`,
          payload
        );
      } else {
        await api.post('/franchise/teachers', payload);
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