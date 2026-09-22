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
  RotateCcw,
} from 'lucide-react';
import api from '../../services/api';

interface Teacher {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  staffType?: 'TEACHING' | 'NON_TEACHING';
  role?: 'TEACHER' | 'HOD' | 'PRINCIPAL' | 'ACCOUNTANT' | 'DATA_ENTRY' | 'SUPPORT';
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  qualification?: string;
  joiningDate?: string;
  address?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

interface ClassItem {
  id: string;
  name: string;
  code?: string;
  isActive?: boolean;
}

interface SectionItem {
  id: string;
  name: string;
  classId: string;
  isActive?: boolean;
}

interface SubjectItem {
  id: string;
  name: string;
  code?: string;
  isActive?: boolean;
}

interface Assignment {
  id: string;
  teacherId: string;
  classId: string;
  sectionId: string;
  subjectId?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  teacher?: {
    id: string;
    name: string;
  };
  class?: {
    id: string;
    name: string;
  };
  section?: {
    id: string;
    name: string;
  };
  subject?: {
    id: string;
    name: string;
  } | null;
}

interface TeacherForm {
  name: string;
  email: string;
  phone: string;
  panNumber: string;
  aadhaarNumber: string;
  staffType: 'TEACHING' | 'NON_TEACHING';
  role: 'TEACHER' | 'HOD' | 'PRINCIPAL' | 'ACCOUNTANT' | 'DATA_ENTRY' | 'SUPPORT';
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | '';
  qualification: string;
  joiningDate: string;
  address: string;
  password: string;
  confirmPassword: string;
  classId: string;
  sectionId: string;
  subjectId: string;
}

const emptyForm: TeacherForm = {
  name: '',
  email: '',
  phone: '',
  panNumber: '',
  aadhaarNumber: '',
  staffType: 'TEACHING',
  role: 'TEACHER',
  dateOfBirth: '',
  gender: '',
  qualification: '',
  joiningDate: '',
  address: '',
  password: '',
  confirmPassword: '',
  classId: '',
  sectionId: '',
  subjectId: '',
};

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

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

      const [
        teachersRes,
        classesRes,
        assignmentsRes,
        subjectsRes,
      ] = await Promise.all([
        api.get('/franchise/teachers', {
          params: {
            limit: 100,
          },
        }),

        api.get('/franchise/classes'),

        api.get('/franchise/teacher-assignments', {
          params: {
            status: 'ACTIVE',
            limit: 100,
          },
        }),

        api.get('/franchise/subjects'),
      ]);

      if (teachersRes.data?.success) {
        setTeachers(teachersRes.data.data || []);
      } else {
        setError('Failed to fetch teachers.');
      }

      if (classesRes.data?.success && Array.isArray(classesRes.data.data)) {
        setClasses(classesRes.data.data);
      } else {
        setClasses([]);
      }

      if (
        assignmentsRes.data?.success &&
        Array.isArray(assignmentsRes.data.data)
      ) {
        setAssignments(assignmentsRes.data.data);
      } else {
        setAssignments([]);
      }

      if (
        subjectsRes.data?.success &&
        Array.isArray(subjectsRes.data.data)
      ) {
        setSubjects(subjectsRes.data.data);
      } else {
        setSubjects([]);
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
      const res = await api.get('/franchise/sections', {
        params: {
          classId,
        },
      });

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

  const openEditModal = async (teacher: Teacher) => {
    setEditingTeacher(teacher);

    const existingAssignment = assignments.find(
      (assignment) => assignment.teacherId === teacher.id
    );

    if (existingAssignment?.classId) {
      await fetchSectionsForClass(existingAssignment.classId);
    } else {
      setSections([]);
    }

    setForm({
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      panNumber: teacher.panNumber || '',
      aadhaarNumber: teacher.aadhaarNumber || '',
      staffType: teacher.staffType || 'TEACHING',
      role: teacher.role || 'TEACHER',
      dateOfBirth: teacher.dateOfBirth || '',
      gender: teacher.gender || '',
      qualification: teacher.qualification || '',
      joiningDate: teacher.joiningDate || '',
      address: teacher.address || '',
      password: '',
      confirmPassword: '',
      classId: existingAssignment?.classId || '',
      sectionId: existingAssignment?.sectionId || '',
      subjectId: existingAssignment?.subjectId || '',
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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

    if (name === 'staffType' && value === 'NON_TEACHING') {
      setForm((prev) => ({
        ...prev,
        staffType: 'NON_TEACHING',
        classId: '',
        sectionId: '',
        subjectId: '',
      }));

      setSections([]);
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

    if (!form.panNumber.trim() && !editingTeacher) {
      setError('PAN number is required.');
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

    if (form.classId && !form.sectionId) {
      setError(
        'Please select a section for the assigned class, or leave class empty.'
      );
      return;
    }

    if (
      form.staffType === 'NON_TEACHING' &&
      (form.classId || form.sectionId || form.subjectId)
    ) {
      setError('Non-teaching staff cannot have teaching assignments.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: Record<string, any> = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        staffType: form.staffType,
        role: form.role,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
        qualification: form.qualification.trim() || null,
        joiningDate: form.joiningDate || null,
        address: form.address.trim() || null,
        panNumber: form.panNumber.trim().toUpperCase(),
        aadhaarNumber: form.aadhaarNumber.trim() || null,
      };

      if (!editingTeacher) {
        payload.password = form.password;
      } else if (form.password) {
        payload.password = form.password;
      }

      let savedTeacherId = editingTeacher?.id;

      if (editingTeacher) {
        await api.put(
          `/franchise/teachers/${editingTeacher.id}`,
          payload
        );
      } else {
        const createRes = await api.post(
          '/franchise/teachers',
          payload
        );

        savedTeacherId = createRes.data?.data?.id;
      }

      if (savedTeacherId && form.staffType === 'TEACHING') {
        const existingAssignment = assignments.find(
          (assignment) =>
            assignment.teacherId === savedTeacherId &&
            assignment.status === 'ACTIVE'
        );

        if (form.classId && form.sectionId) {
          const assignmentPayload = {
            teacherId: savedTeacherId,
            classId: form.classId,
            sectionId: form.sectionId,
            subjectId: form.subjectId || null,
          };

          if (existingAssignment) {
            await api.put(
              `/franchise/teacher-assignments/${existingAssignment.id}`,
              assignmentPayload
            );
          } else {
            await api.post(
              '/franchise/teacher-assignments',
              assignmentPayload
            );
          }
        } else if (existingAssignment) {
          await api.delete(
            `/franchise/teacher-assignments/${existingAssignment.id}`
          );
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
      `Are you sure you want to deactivate ${teacher.name}?`
    );

    if (!confirmed) return;

    try {
      setError(null);

      await api.delete(
        `/franchise/teachers/${teacher.id}`
      );

      await fetchTeachers();
    } catch (err: any) {
      console.error('Error deactivating teacher:', err);

      setError(
        err.response?.data?.message ||
        'Failed to deactivate teacher.'
      );
    }
  };

  const handleReactivate = async (teacher: Teacher) => {
    const confirmed = window.confirm(
      `Are you sure you want to reactivate ${teacher.name}?`
    );

    if (!confirmed) return;

    try {
      setError(null);

      await api.put(
        `/franchise/teachers/${teacher.id}`,
        {
          status: 'ACTIVE',
        }
      );

      await fetchTeachers();
    } catch (err: any) {
      console.error('Error reactivating teacher:', err);

      setError(
        err.response?.data?.message ||
        'Failed to reactivate teacher.'
      );
    }
  };

  const getTeacherAssignments = (teacherId: string) => {
    return assignments.filter(
      (assignment) =>
        assignment.teacherId === teacherId &&
        assignment.status === 'ACTIVE'
    );
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
            Manage teachers, faculty information and teaching assignments.
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
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''
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
          {teachers.map((teacher) => {
            const teacherAssignments = getTeacherAssignments(teacher.id);

            return (
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

                    <Badge
                      variant={
                        teacher.status === 'INACTIVE'
                          ? 'slate'
                          : 'indigo'
                      }
                      size="sm"
                    >
                      {teacher.role || 'TEACHER'}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {teacher.name}
                    </h3>

                    <span className="text-xs font-semibold text-blue-600 block">
                      {teacher.qualification ||
                        teacher.staffType ||
                        'Faculty'}
                    </span>

                    {teacherAssignments.map((assignment) => (
                      <span
                        key={assignment.id}
                        className="inline-flex items-center text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 mt-1.5 mr-1"
                      >
                        {assignment.class?.name || 'Class'} -{' '}
                        {assignment.section?.name || 'Section'}
                        {assignment.subject?.name
                          ? ` • ${assignment.subject.name}`
                          : ''}
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

                    {teacher.status !== 'INACTIVE' ? (
                      <button
                        onClick={() => handleDelete(teacher)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Deactivate teacher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivate(teacher)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        title="Reactivate teacher"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {editingTeacher
                    ? 'Edit Teacher'
                    : 'Add New Teacher'}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {editingTeacher
                    ? 'Update teacher information and assignment.'
                    : 'Create a teacher account and optionally assign a class.'}
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
              className="p-5 space-y-5"
            >
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold">
                  {error}
                </div>
              )}

              {/* BASIC INFORMATION */}
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 mb-3">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="e.g. Rajesh Verma"
                    />
                  </div>

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

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      PAN Number *
                    </label>

                    <input
                      name="panNumber"
                      value={form.panNumber}
                      onChange={handleChange}
                      required={!editingTeacher}
                      maxLength={10}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500"
                      placeholder="ABCDE1234F"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Aadhaar Number
                    </label>

                    <input
                      name="aadhaarNumber"
                      value={form.aadhaarNumber}
                      onChange={handleChange}
                      maxLength={12}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      placeholder="123456789012"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Gender
                    </label>

                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Date of Birth
                    </label>

                    <input
                      name="dateOfBirth"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Qualification
                    </label>

                    <input
                      name="qualification"
                      value={form.qualification}
                      onChange={handleChange}
                      placeholder="e.g. M.Sc Mathematics, B.Ed"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* EMPLOYMENT */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-extrabold text-slate-800 mb-3">
                  Employment
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Staff Type *
                    </label>

                    <select
                      name="staffType"
                      value={form.staffType}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="TEACHING">Teaching</option>
                      <option value="NON_TEACHING">
                        Non-Teaching
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Role *
                    </label>

                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="TEACHER">Teacher</option>
                      <option value="HOD">HOD</option>
                      <option value="PRINCIPAL">Principal</option>
                      <option value="ACCOUNTANT">Accountant</option>
                      <option value="DATA_ENTRY">Data Entry</option>
                      <option value="SUPPORT">Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Joining Date
                    </label>

                    <input
                      name="joiningDate"
                      type="date"
                      value={form.joiningDate}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Address
                    </label>

                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={2}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 resize-none"
                      placeholder="Teacher residential address"
                    />
                  </div>
                </div>
              </div>

              {/* TEACHING ASSIGNMENT */}
              {form.staffType === 'TEACHING' && (
                <div className="border-t border-slate-100 pt-5">
                  <h3 className="text-sm font-extrabold text-slate-800 mb-1">
                    Teaching Assignment
                  </h3>

                  <p className="text-[11px] text-slate-400 mb-3">
                    Assign the teacher to a class, section and subject.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Class
                      </label>

                      <select
                        name="classId"
                        value={form.classId}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="">No Assignment</option>

                        {classes
                          .filter((cls) => cls.isActive !== false)
                          .map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Section
                      </label>

                      <select
                        name="sectionId"
                        value={form.sectionId}
                        onChange={handleChange}
                        disabled={!form.classId}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                      >
                        <option value="">
                          {!form.classId
                            ? 'Select Class First'
                            : 'Select Section'}
                        </option>

                        {sections
                          .filter((section) => section.isActive !== false)
                          .map((section) => (
                            <option
                              key={section.id}
                              value={section.id}
                            >
                              {section.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Subject
                      </label>

                      <select
                        name="subjectId"
                        value={form.subjectId}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="">No Subject</option>

                        {subjects
                          .filter((subject) => subject.isActive !== false)
                          .map((subject) => (
                            <option
                              key={subject.id}
                              value={subject.id}
                            >
                              {subject.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* PASSWORD */}
              {!editingTeacher && (
                <div className="border-t border-slate-100 pt-5">
                  <h3 className="text-sm font-extrabold text-slate-800 mb-3">
                    Account Security
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                </div>
              )}

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