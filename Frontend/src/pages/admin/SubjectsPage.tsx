import React, { useCallback, useEffect, useState } from 'react';
import {
  BookMarked,
  Plus,
  Search,
  RefreshCw,
  X,
  Trash2,
  Edit
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import api from '../../services/api';

interface SubjectItem {
  id: string;
  franchiseId: string;
  name: string;
  code?: string;
  description?: string;
  createdAt?: string;
}

const emptyForm = {
  name: '',
  code: '',
  description: '',
};

export const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/franchise/subjects');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSubjects(res.data.data);
      } else {
        setSubjects([]);
      }
    } catch (err: any) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const openAddModal = () => {
    setEditingSubject(null);
    setForm(emptyForm);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sub: SubjectItem) => {
    setEditingSubject(sub);
    setForm({
      name: sub.name || '',
      code: sub.code || '',
      description: sub.description || '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingSubject(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Subject name is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = {
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        description: form.description.trim() || undefined,
      };

      if (editingSubject) {
        await api.put(`/franchise/subjects/${editingSubject.id}`, payload);
      } else {
        await api.post('/franchise/subjects', payload);
      }

      closeModal();
      await fetchSubjects();
    } catch (err: any) {
      console.error('Error saving subject:', err);
      setError(err.response?.data?.message || 'Failed to save subject.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sub: SubjectItem) => {
    if (!window.confirm(`Are you sure you want to delete subject "${sub.name}"?`)) return;
    try {
      setError(null);
      await api.delete(`/franchise/subjects/${sub.id}`);
      await fetchSubjects();
    } catch (err: any) {
      console.error('Error deleting subject:', err);
      setError(err.response?.data?.message || 'Failed to delete subject.');
    }
  };

  const filtered = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookMarked className="w-7 h-7 text-blue-600" />
            Subjects Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage academic curriculum subjects offered across classes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSubjects}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Refresh subjects"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subjects by name or code..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500"
        />
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading subjects...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white border border-dashed border-slate-200 p-6">
          <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No subjects found</p>
          <p className="text-xs text-slate-400 mt-1">
            {search ? 'Try adjusting your search query.' : 'Click "Add Subject" to define your curriculum.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sub) => (
            <Card key={sub.id} hoverLift padding="md" className="flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-extrabold uppercase tracking-wide border border-blue-100">
                    {sub.code || 'SUB'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(sub)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      title="Edit Subject"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sub)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mt-3">{sub.name}</h3>
                {sub.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sub.description}</p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span>Academic Subject</span>
                <span className="text-emerald-600 font-bold">Active</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Mathematics, Chemistry, English"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Subject Code <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. MATH-101, CHEM-08"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Description <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Overview or curriculum syllabus details..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                >
                  {saving ? 'Saving...' : editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
