import React, { useCallback, useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  RefreshCw,
  X,
} from 'lucide-react';

import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import api from '../../services/api';

interface Student {
  id: string;
  name: string;
  email?: string;
  status?: string;
}

interface Parent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
  students?: Student[];
}

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
};

export const ParentsPage: React.FC = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchParents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get('/franchise/parents');

      if (res.data?.success) {
        setParents(res.data.data || []);
      } else {
        setError('Failed to fetch parents.');
      }
    } catch (err) {
      console.error('Error fetching parents:', err);
      setError('Failed to load parents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  const openAddModal = () => {
    setForm(emptyForm);
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setForm(emptyForm);
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

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError('Parent name is required.');
      return;
    }

    if (!form.email.trim()) {
      setError('Parent email is required.');
      return;
    }

    if (!form.password.trim()) {
      setError('Password is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await api.post('/franchise/parents', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });

      closeModal();
      await fetchParents();
    } catch (err: any) {
      console.error('Error creating parent:', err);

      setError(
        err.response?.data?.message ||
          'Failed to create parent.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-600" />
            Parent Management
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Manage parents and their linked students
          </p>
        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={fetchParents}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors disabled:opacity-50"
            title="Refresh parents"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loading ? 'animate-spin' : ''
              }`}
            />
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Parent
          </button>

        </div>
      </div>

      {/* Error */}
      {error && !isModalOpen && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 font-bold text-center text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl">
          <div className="text-center space-y-3">
            <div className="w-6 h-6 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />

            <p className="text-xs font-bold text-slate-500">
              Loading parents...
            </p>
          </div>
        </div>
      ) : parents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl">
          <Users className="w-10 h-10 text-slate-300 mb-3" />

          <p className="text-sm font-semibold text-slate-400">
            No parents found
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Click "Add Parent" to register the first parent.
          </p>
        </div>
      ) : (
        /* Parent Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {parents.map((parent) => (
            <Card
              key={parent.id}
              hoverLift
              padding="md"
              className="space-y-4"
            >

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {parent.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    Parent ID: {parent.id.substring(0, 8)}
                  </p>
                </div>

                <Badge
                  variant={
                    parent.status === 'ACTIVE'
                      ? 'green'
                      : 'slate'
                  }
                  size="sm"
                >
                  {parent.status}
                </Badge>
              </div>

              <div className="space-y-2 text-xs text-slate-500">

                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />

                  <span className="truncate">
                    {parent.email || '—'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />

                  <span>
                    {parent.phone || '—'}
                  </span>
                </div>

              </div>

              {/* Students */}
              <div className="pt-3 border-t border-slate-100">

                <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Linked Students
                </p>

                {parent.students &&
                parent.students.length > 0 ? (
                  <div className="space-y-1">
                    {parent.students.map((student) => (
                      <div
                        key={student.id}
                        className="text-xs font-semibold text-slate-700 bg-slate-50 rounded-lg px-3 py-2"
                      >
                        {student.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    No students linked
                  </p>
                )}

              </div>

            </Card>
          ))}

        </div>
      )}

      {/* Add Parent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">

              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Add Parent
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Create a parent account
                </p>
              </div>

              <button
                onClick={closeModal}
                className="p-2 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>

            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-4"
            >

              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Parent Name *
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter parent name"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
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
                  placeholder="parent@example.com"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
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
                  placeholder="Phone number"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Password *
                </label>

                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create parent password"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">

                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Parent'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};