import React, { useEffect, useState } from 'react';
import {
  Plus,
  Clock,
  Edit,
  X,
  Coffee,
  Power,
} from 'lucide-react';
import api from '../../services/api';

interface SchoolPeriod {
  id: string;
  periodNumber: number;
  name: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  isActive: boolean;
}

interface FormData {
  periodNumber: string;
  name: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
}

const initialForm: FormData = {
  periodNumber: '',
  name: '',
  startTime: '',
  endTime: '',
  isBreak: false,
};

const API = '/school-periods';

export const SchoolPeriodsPage: React.FC = () => {
  const [periods, setPeriods] = useState<SchoolPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] =
    useState<SchoolPeriod | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(API);
      setPeriods(response.data?.data || []);
    } catch (err: any) {
      console.error('Get school periods error:', err);

      setError(
        err?.response?.data?.message ||
        'Failed to load school periods.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingPeriod(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (period: SchoolPeriod) => {
    setEditingPeriod(period);

    setForm({
      periodNumber: String(period.periodNumber),
      name: period.name,
      startTime: period.startTime.slice(0, 5),
      endTime: period.endTime.slice(0, 5),
      isBreak: period.isBreak,
    });

    setIsModalOpen(true);
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !form.periodNumber ||
      !form.name ||
      !form.startTime ||
      !form.endTime
    ) {
      alert('Please fill all required fields.');
      return;
    }

    if (form.startTime >= form.endTime) {
      alert('End time must be greater than start time.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        periodNumber: Number(form.periodNumber),
        name: form.name.trim(),
        startTime: form.startTime,
        endTime: form.endTime,
        isBreak: form.isBreak,
      };

      if (editingPeriod) {
        await api.put(
          `${API}/${editingPeriod.id}`,
          payload
        );
      } else {
        await api.post(API, payload);
      }

      setIsModalOpen(false);
      resetForm();

      await fetchPeriods();
    } catch (err: any) {
      console.error('Save school period error:', err);

      alert(
        err?.response?.data?.message ||
        'Failed to save school period.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (
    period: SchoolPeriod
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${period.name}"?`
    );

    if (!confirmed) return;

    try {
      await api.patch(
        `${API}/${period.id}/deactivate`
      );

      await fetchPeriods();
    } catch (err: any) {
      console.error(
        'Deactivate school period error:',
        err
      );

      alert(
        err?.response?.data?.message ||
        'Failed to deactivate school period.'
      );
    }
  };

  const handleActivate = async (
    period: SchoolPeriod
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to activate "${period.name}" ? `
    );

    if (!confirmed) return;

    try {
      await api.patch(
       `${API}/${period.id}/activate`
      );

      await fetchPeriods();
    } catch (err: any) {
      console.error(
        'Activate school period error:',
        err
      );

      alert(
        err?.response?.data?.message ||
        'Failed to activate school period.'
      );
    }
  };




  const formatTime = (time: string) => {
    if (!time) return '';

    const [hours, minutes] = time.split(':');
    const hour = Number(hours);

    if (Number.isNaN(hour)) return time;

    const suffix = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;

    return `${formattedHour}:${minutes} ${suffix}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-5 h-5" />
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900">
              School Periods
            </h1>
          </div>

          <p className="text-sm text-slate-500 mt-1">
            Manage school periods, timings and breaks.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Period
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading periods...
            </p>
          </div>
        </div>
      ) : periods.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-8 h-8" />
          </div>

          <h2 className="mt-5 text-lg font-extrabold text-slate-900">
            No school periods yet
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Create your first school period to use it in the timetable.
          </p>

          <button
            onClick={openCreateModal}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Period
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
            {periods.map((period) => (
              <div
                key={period.id}
                className={`p-5 rounded-2xl border transition-all ${period.isBreak
                  ? 'border-amber-200 bg-amber-50/50'
                  : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${period.isBreak
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-blue-100 text-blue-600'
                        }`}
                    >
                      {period.isBreak ? (
                        <Coffee className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400">
                        PERIOD {period.periodNumber}
                      </p>

                      <h3 className="font-extrabold text-slate-900">
                        {period.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(period)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>


                    <button
                      onClick={() =>
                        period.isActive
                          ? handleDeactivate(period)
                          : handleActivate(period)
                      }
                      className={`p-2 rounded-lg transition-colors ${period.isActive
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-green-600 hover:bg-green-50'
                        }`}
                      title={period.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="w-4 h-4" />
                    </button>


                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">
                    {formatTime(period.startTime)}
                  </span>

                  <span className="text-xs text-slate-400">
                    →
                  </span>

                  <span className="text-sm font-bold text-slate-700">
                    {formatTime(period.endTime)}
                  </span>
                </div>

                <div className="mt-4">
                  {period.isBreak ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold">
                      <Coffee className="w-3 h-3" />
                      Break
                    </span>
                  ) : (
                    <span className="inline-flex px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
                      Teaching Period
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {editingPeriod
                    ? 'Edit School Period'
                    : 'Create School Period'}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {editingPeriod
                    ? 'Update period timing or details.'
                    : 'Add a teaching period or school break.'}
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Period Number *
                  </label>

                  <input
                    type="number"
                    name="periodNumber"
                    min="1"
                    value={form.periodNumber}
                    onChange={handleChange}
                    placeholder="e.g. 1"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Mathematics"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Start Time *
                  </label>

                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    End Time *
                  </label>

                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  name="isBreak"
                  checked={form.isBreak}
                  onChange={handleChange}
                  className="w-4 h-4"
                />

                <div>
                  <p className="text-sm font-bold text-slate-700">
                    This is a break
                  </p>

                  <p className="text-xs text-slate-500">
                    Break periods will not be available for timetable classes.
                  </p>
                </div>
              </label>

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
                    ? editingPeriod
                      ? 'Updating...'
                      : 'Creating...'
                    : editingPeriod
                      ? 'Update Period'
                      : 'Create Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolPeriodsPage;

