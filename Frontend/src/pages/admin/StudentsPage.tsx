import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  GraduationCap,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import api from '../../services/api';

interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface ClassItem {
  id: string;
  franchiseId?: string;
  name: string;
  code?: string;
  numericValue?: number | null;
  description?: string;
  isActive?: boolean;
}

interface SectionItem {
  id: string;
  franchiseId?: string;
  classId: string;
  name: string;
  capacity?: number;
  isActive?: boolean;
  class?: {
    id: string;
    name: string;
    numericValue?: number | null;
  };
}

const formatDateToYYYYMMDD = (val?: string): string => {
  if (!val) return '';
  const trimmed = val.trim();
  if (trimmed.includes('T')) {
    return trimmed.split('T')[0];
  }
  // Match DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const ddmmyyyy = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/;
  const match1 = trimmed.match(ddmmyyyy);
  if (match1) {
    const day = match1[1].padStart(2, '0');
    const month = match1[2].padStart(2, '0');
    const year = match1[3];
    return `${year}-${month}-${day}`;
  }
  // Match YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const yyyymmdd = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/;
  const match2 = trimmed.match(yyyymmdd);
  if (match2) {
    const year = match2[1];
    const month = match2[2].padStart(2, '0');
    const day = match2[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return trimmed;
};

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  classId: '',
  sectionId: '',
  // Parent / Guardian Details
  parentName: '',
  parentEmail: '',
  parentPhone: '',
  parentPassword: '',
  parentRelationship: 'FATHER' as 'FATHER' | 'MOTHER' | 'GUARDIAN',
  isPrimary: true,
};

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Classes & Sections state
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);

  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [sectionsError, setSectionsError] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      setClassesError(null);
      const res = await api.get('/franchise/classes');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const sortedClasses = [...res.data.data].sort((a: ClassItem, b: ClassItem) => {
          const numA = a.numericValue;
          const numB = b.numericValue;
          if (numA !== null && numA !== undefined && numB !== null && numB !== undefined) {
            return numA - numB;
          }
          if (numA !== null && numA !== undefined) return -1;
          if (numB !== null && numB !== undefined) return 1;
          return (a.name || '').localeCompare(b.name || '');
        });
        setClasses(sortedClasses);
      } else {
        setClasses([]);
        setClassesError('Failed to load classes.');
      }
    } catch (err: any) {
      console.error('Error fetching classes:', err);
      setClasses([]);
      setClassesError(err.response?.data?.message || 'Failed to load classes.');
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchSectionsForClass = async (classId: string) => {
    if (!classId) {
      setSections([]);
      setLoadingSections(false);
      setSectionsError(null);
      return;
    }
    try {
      setLoadingSections(true);
      setSectionsError(null);
      const res = await api.get('/franchise/sections', {
        params: { classId },
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSections(res.data.data);
      } else {
        setSections([]);
        setSectionsError('Failed to load sections.');
      }
    } catch (err: any) {
      console.error('Error fetching sections:', err);
      setSections([]);
      setSectionsError(err.response?.data?.message || 'Failed to load sections.');
    } finally {
      setLoadingSections(false);
    }
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClassId = e.target.value;
    setForm((prev) => ({
      ...prev,
      classId: selectedClassId,
      sectionId: '',
    }));
    setSections([]);
    setSectionsError(null);
    if (selectedClassId) {
      fetchSectionsForClass(selectedClassId);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get('/franchise/students', {
        params: {
          search: search || undefined,
          limit: 100,
        },
      });

      if (res.data?.success) {
        setStudents(res.data.data || []);
      } else {
        setError('Failed to fetch students.');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const openAddModal = () => {
    setEditingStudent(null);
    setForm(emptyForm);
    setSections([]);
    setSectionsError(null);
    setError(null);
    setSaving(false);
    setIsModalOpen(true);
    if (classes.length === 0 && !loadingClasses) {
      fetchClasses();
    }
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);

    setForm({
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth ? formatDateToYYYYMMDD(student.dateOfBirth) : '',
      gender: student.gender || '',
      address: student.address || '',
      classId: '',
      sectionId: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      parentPassword: '',
      parentRelationship: 'FATHER',
      isPrimary: true,
    });

    setSections([]);
    setSectionsError(null);
    setError(null);
    setSaving(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingStudent(null);
    setForm(emptyForm);
    setSections([]);
    setSectionsError(null);
    setSaving(false);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    if (name === 'dateOfBirth') {
      const normalizedDate = formatDateToYYYYMMDD(value);
      setForm((prev) => ({
        ...prev,
        dateOfBirth: normalizedDate,
      }));
      return;
    }

    if (type === 'email') {
      setForm((prev) => ({
        ...prev,
        [name]: value.trim(),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Student registration submit triggered');

    if (!form.name.trim()) {
      setError('Student name is required.');
      return;
    }

    if (!editingStudent) {
      if (!form.classId) {
        setError('Please select a class.');
        return;
      }
      if (!form.sectionId) {
        setError('Please select a section.');
        return;
      }
      if (!form.parentName.trim()) {
        setError('Parent name is required.');
        return;
      }
      if (!form.parentEmail.trim()) {
        setError('Parent email is required.');
        return;
      }
      if (!form.parentPassword.trim()) {
        setError('Parent password is required.');
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);

      if (editingStudent) {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          dateOfBirth: form.dateOfBirth ? formatDateToYYYYMMDD(form.dateOfBirth) : undefined,
          gender: form.gender || undefined,
          address: form.address.trim() || undefined,
          status: editingStudent.status,
        };

        await api.put(
          `/franchise/students/${editingStudent.id}`,
          payload
        );

        closeModal();
        await fetchStudents();
        return;
      }

      // CREATE MODE: Sequential real backend API flow
      // 1. Create Student
      const studentPayload = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        dateOfBirth: form.dateOfBirth ? formatDateToYYYYMMDD(form.dateOfBirth) : undefined,
        gender: form.gender || undefined,
        address: form.address.trim() || undefined,
        classId: form.classId,
        sectionId: form.sectionId,
      };

      let studentRes;
      try {
        studentRes = await api.post('/franchise/students', studentPayload);
      } catch (err: any) {
        console.error('Error creating student:', err);
        setError(
          err.response?.data?.message || 'Failed to create student.'
        );
        return;
      }

      const newStudentId = studentRes.data?.data?.id;
      if (!newStudentId) {
        setError('Student was created, but failed to retrieve student ID.');
        return;
      }

      // 2. Create Parent
      const parentPayload = {
        name: form.parentName.trim(),
        email: form.parentEmail.trim(),
        phone: form.parentPhone.trim() || undefined,
        password: form.parentPassword,
      };

      let parentRes;
      try {
        parentRes = await api.post('/franchise/parents', parentPayload);
      } catch (err: any) {
        console.error('Error creating parent:', err);
        setError(
          err.response?.data?.message
            ? `Student created, but failed to create parent: ${err.response.data.message}`
            : 'Student created, but failed to create parent.'
        );
        await fetchStudents();
        return;
      }

      const newParentId = parentRes.data?.data?.id;
      if (!newParentId) {
        setError(
          'Parent was created, but failed to retrieve parent ID for student assignment.'
        );
        await fetchStudents();
        return;
      }

      // 3. Assign Parent to Student
      const assignPayload = {
        parentId: newParentId,
        studentId: newStudentId,
        relationship: form.parentRelationship,
        isPrimary: form.isPrimary,
      };

      try {
        await api.post('/franchise/parents/assign-student', assignPayload);
      } catch (err: any) {
        console.error('Error assigning parent to student:', err);
        setError(
          err.response?.data?.message
            ? `Student and parent created, but failed to assign relationship: ${err.response.data.message}`
            : 'Student and parent created, but failed to assign relationship.'
        );
        await fetchStudents();
        return;
      }

      closeModal();
      await fetchStudents();
    } catch (err: any) {
      console.error('Error saving student:', err);

      setError(
        err.response?.data?.message || 'Failed to save student.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (student: Student) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) return;

    try {
      setError(null);

      await api.delete(
        `/franchise/students/${student.id}`
      );

      await fetchStudents();
    } catch (err: any) {
      console.error('Error deleting student:', err);

      setError(
        err.response?.data?.message ||
          'Failed to delete student.'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-blue-600" />
            Student Management
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Directory of enrolled students across Grades 1–12
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Student</span>
        </button>
      </div>

      {/* Error */}
      {error && !isModalOpen && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 font-bold text-center text-sm">
          {error}
        </div>
      )}

      <Card padding="md" hoverLift={false}>
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name..."
              className="w-full bg-slate-100/80 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/70 rounded-xl text-xs font-bold text-slate-700 transition-colors">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Grade</span>
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl">
            <div className="text-center space-y-3">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">
                Loading students...
              </p>
            </div>
          </div>
        ) : students.length === 0 ? (
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-sm font-semibold text-slate-400">
              No students found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider bg-slate-50/50">
                  <th className="p-3">Student ID</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-3 font-bold text-blue-700">
                      {student.id.length > 8
                        ? student.id.substring(0, 8).toUpperCase()
                        : student.id}
                    </td>

                    <td className="p-3 font-bold text-slate-900">
                      {student.name}
                    </td>

                    <td className="p-3">
                      {student.email || '—'}
                    </td>

                    <td className="p-3">
                      {student.phone || '—'}
                    </td>

                    <td className="p-3">
                      <Badge
                        variant={
                          student.status === 'ACTIVE'
                            ? 'green'
                            : 'slate'
                        }
                        size="sm"
                      >
                        {student.status}
                      </Badge>
                    </td>

                    <td className="p-3 text-right space-x-1">
                      <button
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          openEditModal(student)
                        }
                        className="p-1 text-slate-400 hover:text-amber-600 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(student)
                        }
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {editingStudent
                    ? 'Edit Student'
                    : 'Register New Student'}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {editingStudent
                    ? 'Update student information.'
                    : 'Enter the student and parent details below.'}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="p-2 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-4"
            >
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold">
                  {error}
                </div>
              )}

              {/* Student Details Section */}
              <div className="space-y-4">
                <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Student Details
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Student Name *
                    </label>

                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      placeholder="Enter student name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Email
                    </label>

                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      placeholder="student@example.com"
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
                      placeholder="Phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Date of Birth
                    </label>

                    <input
                      name="dateOfBirth"
                      type="date"
                      value={formatDateToYYYYMMDD(form.dateOfBirth)}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
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
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {editingStudent && (
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Status
                      </label>

                      <select
                        name="status"
                        value={editingStudent.status}
                        onChange={(e) =>
                          setEditingStudent({
                            ...editingStudent,
                            status: e.target.value as
                              | 'ACTIVE'
                              | 'INACTIVE',
                          })
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">
                          Inactive
                        </option>
                      </select>
                    </div>
                  )}

                  {/* Class and Section Selection (Create Mode) */}
                  {!editingStudent && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Class *
                        </label>

                        <select
                          name="classId"
                          value={form.classId}
                          onChange={handleClassChange}
                          required={!editingStudent}
                          disabled={loadingClasses}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {loadingClasses ? 'Loading classes...' : 'Select class'}
                          </option>
                          {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.name}
                            </option>
                          ))}
                        </select>

                        {classesError && (
                          <p className="text-[11px] text-rose-600 font-medium mt-1">
                            {classesError}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Section *
                        </label>

                        <select
                          name="sectionId"
                          value={form.sectionId}
                          onChange={handleChange}
                          required={!editingStudent}
                          disabled={
                            !form.classId ||
                            loadingSections ||
                            sections.length === 0 ||
                            !!sectionsError
                          }
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {!form.classId
                              ? 'Select a class first'
                              : loadingSections
                              ? 'Loading sections...'
                              : sectionsError
                              ? 'Error loading sections'
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

                        {sectionsError && (
                          <p className="text-[11px] text-rose-600 font-medium mt-1">
                            {sectionsError}
                          </p>
                        )}
                      </div>
                    </>
                  )}
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
                    placeholder="Student address"
                  />
                </div>
              </div>

              {/* Parent / Guardian Details (Create Mode Only) */}
              {!editingStudent && (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Parent / Guardian Details
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Create parent account credentials and establish relationship with student.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Parent Name *
                      </label>

                      <input
                        name="parentName"
                        value={form.parentName}
                        onChange={handleChange}
                        required={!editingStudent}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        placeholder="Enter parent full name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Parent Email *
                      </label>

                      <input
                        name="parentEmail"
                        type="email"
                        value={form.parentEmail}
                        onChange={handleChange}
                        required={!editingStudent}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        placeholder="parent@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Parent Phone
                      </label>

                      <input
                        name="parentPhone"
                        value={form.parentPhone}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        placeholder="Phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Parent Login Password *
                      </label>

                      <input
                        name="parentPassword"
                        type="password"
                        value={form.parentPassword}
                        onChange={handleChange}
                        required={!editingStudent}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        placeholder="Set login password"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Relationship *
                      </label>

                      <select
                        name="parentRelationship"
                        value={form.parentRelationship}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="FATHER">Father</option>
                        <option value="MOTHER">Mother</option>
                        <option value="GUARDIAN">Guardian</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="isPrimary"
                        name="isPrimary"
                        checked={form.isPrimary}
                        onChange={handleChange}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <label
                        htmlFor="isPrimary"
                        className="text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        Primary Guardian
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  {saving
                    ? 'Saving...'
                    : editingStudent
                    ? 'Update Student'
                    : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
