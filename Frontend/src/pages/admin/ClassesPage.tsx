
import React, { useCallback, useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  X,
  Layers,
  Trash2,
  Pencil,
  Power,
} from 'lucide-react';

import { Card } from '../../components/ui/Card';
import api from '../../services/api';

interface ClassItem {
  id: string;
  franchiseId: string;
  name: string;
  code: string;
  numericValue?: number | null;
  description?: string;
  isActive: boolean;
  createdAt?: string;
}

interface SectionItem {
  id: string;
  franchiseId: string;
  classId: string;
  name: string;
  capacity?: number | null;
  isActive: boolean;
}

const emptyClassForm = {
  name: '',
  code: '',
  numericValue: '',
  description: '',
};

const emptySectionForm = {
  classId: '',
  name: '',
  capacity: '20',
};

export const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classForm, setClassForm] = useState(emptyClassForm);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionForm, setSectionForm] = useState(emptySectionForm);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [classesRes, sectionsRes] = await Promise.all([
        api.get('/franchise/classes'),
        api.get('/franchise/sections'),
      ]);

      if (classesRes.data?.success && Array.isArray(classesRes.data.data)) {
        const sorted = [...classesRes.data.data].sort((a, b) => {
          const numA = a.numericValue;
          const numB = b.numericValue;

          if (
            numA !== null &&
            numA !== undefined &&
            numB !== null &&
            numB !== undefined
          ) {
            return numA - numB;
          }

          if (numA !== null && numA !== undefined) return -1;
          if (numB !== null && numB !== undefined) return 1;

          return (a.name || '').localeCompare(b.name || '');
        });

        setClasses(sorted);
      }

      if (sectionsRes.data?.success && Array.isArray(sectionsRes.data.data)) {
        setSections(sectionsRes.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching classes/sections:', err);
      setError(err.response?.data?.message || 'Failed to load classes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateClassModal = () => {
    setEditingClassId(null);
    setClassForm(emptyClassForm);
    setError(null);
    setIsClassModalOpen(true);
  };

  const openEditClassModal = (cls: ClassItem) => {
    setEditingClassId(cls.id);
    setClassForm({
      name: cls.name || '',
      code: cls.code || '',
      numericValue:
        cls.numericValue !== null && cls.numericValue !== undefined
          ? String(cls.numericValue)
          : '',
      description: cls.description || '',
    });
    setError(null);
    setIsClassModalOpen(true);
  };

  const openCreateSectionModal = (classId = '') => {
    setEditingSectionId(null);
    setSectionForm({
      ...emptySectionForm,
      classId,
    });
    setError(null);
    setIsSectionModalOpen(true);
  };

  const openEditSectionModal = (section: SectionItem) => {
    setEditingSectionId(section.id);
    setSectionForm({
      classId: section.classId,
      name: section.name || '',
      capacity:
        section.capacity !== null && section.capacity !== undefined
          ? String(section.capacity)
          : '',
    });
    setError(null);
    setIsSectionModalOpen(true);
  };

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!classForm.name.trim()) {
      setError('Class name is required.');
      return;
    }

    if (!classForm.code.trim()) {
      setError('Class code is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: any = {
        name: classForm.name.trim(),
        code: classForm.code.trim(),
        description: classForm.description.trim() || undefined,
      };

      if (classForm.numericValue.trim()) {
        payload.numericValue = parseInt(classForm.numericValue, 10);
      } else {
        payload.numericValue = null;
      }

      if (editingClassId) {
        await api.put(`/franchise/classes/${editingClassId}`, payload);
      } else {
        await api.post('/franchise/classes', payload);
      }

      setIsClassModalOpen(false);
      setClassForm(emptyClassForm);
      setEditingClassId(null);
      await fetchData();
    } catch (err: any) {
      console.error('Error saving class:', err);
      setError(
        err.response?.data?.message ||
          (editingClassId
            ? 'Failed to update class.'
            : 'Failed to create class.')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sectionForm.classId) {
      setError('Please select a class for the section.');
      return;
    }

    if (!sectionForm.name.trim()) {
      setError('Section name is required.');
      return;
    }

    if (
      sectionForm.capacity &&
      (!Number.isInteger(Number(sectionForm.capacity)) ||
        Number(sectionForm.capacity) <= 0)
    ) {
      setError('Capacity must be a positive integer.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: any = {
        classId: sectionForm.classId,
        name: sectionForm.name.trim(),
        capacity: sectionForm.capacity
          ? parseInt(sectionForm.capacity, 10)
          : null,
      };

      if (editingSectionId) {
        await api.put(
          `/franchise/sections/${editingSectionId}`,
          payload
        );
      } else {
        await api.post('/franchise/sections', payload);
      }

      setIsSectionModalOpen(false);
      setSectionForm(emptySectionForm);
      setEditingSectionId(null);
      await fetchData();
    } catch (err: any) {
      console.error('Error saving section:', err);
      setError(
        err.response?.data?.message ||
          (editingSectionId
            ? 'Failed to update section.'
            : 'Failed to create section.')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleClass = async (cls: ClassItem) => {
    const action = cls.isActive ? 'deactivate' : 'activate';

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${cls.name}?`
      )
    ) {
      return;
    }

    try {
      setError(null);

      await api.put(`/franchise/classes/${cls.id}`, {
        isActive: !cls.isActive,
      });

      await fetchData();
    } catch (err: any) {
      console.error('Error updating class status:', err);
      setError(
        err.response?.data?.message ||
          `Failed to ${action} class.`
      );
    }
  };

  const handleToggleSection = async (section: SectionItem) => {
    const action = section.isActive ? 'deactivate' : 'activate';

    if (
      !window.confirm(
        `Are you sure you want to ${action} section ${section.name}?`
      )
    ) {
      return;
    }

    try {
      setError(null);

      await api.put(`/franchise/sections/${section.id}`, {
        isActive: !section.isActive,
      });

      await fetchData();
    } catch (err: any) {
      console.error('Error updating section status:', err);
      setError(
        err.response?.data?.message ||
          `Failed to ${action} section.`
      );
    }
  };

  const handleDeleteClass = async (
    classId: string,
    className: string
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${className}?`
      )
    ) {
      return;
    }

    try {
      setError(null);
      await api.delete(`/franchise/classes/${classId}`);
      await fetchData();
    } catch (err: any) {
      console.error('Error deleting class:', err);
      setError(
        err.response?.data?.message ||
          'This class cannot be deleted because it is being used.'
      );
    }
  };

  const handleDeleteSection = async (
    sectionId: string,
    sectionName: string
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to delete section ${sectionName}?`
      )
    ) {
      return;
    }

    try {
      setError(null);
      await api.delete(`/franchise/sections/${sectionId}`);
      await fetchData();
    } catch (err: any) {
      console.error('Error deleting section:', err);
      setError(
        err.response?.data?.message ||
          'This section cannot be deleted because it is being used.'
      );
    }
  };

  const filteredClasses = classes.filter((c) => {
    const q = search.toLowerCase();

    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Classes & Sections
          </h1>
          <p className="text-xs md:text-sm font-medium text-slate-500 mt-1">
            Manage academic classes, standards, and assigned sections
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw
              className={
                'w-4 h-4' + (loading ? ' animate-spin' : '')
              }
            />
          </button>

          <button
            type="button"
            onClick={() => openCreateSectionModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-600 text-blue-600 font-bold text-xs hover:bg-blue-50 transition cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            Add Section
          </button>

          <button
            type="button"
            onClick={openCreateClassModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Class
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-2xl flex items-center justify-between">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

        <input
          type="text"
          placeholder="Search classes by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-3xl">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-500">
              Loading classes...
            </p>
          </div>
        </div>
      ) : filteredClasses.length === 0 ? (
        <Card padding="lg" className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-slate-800">
            No classes found
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            {search
              ? 'Try adjusting your search query.'
              : 'Create your first academic class to get started.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => {
            const classSections = sections.filter(
              (s) => s.classId === cls.id
            );

            return (
              <Card
                key={cls.id}
                padding="md"
                className="space-y-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-sm">
                      {cls.numericValue ?? (
                        <Building2 className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900">
                          {cls.name}
                        </h4>

                        <span
                          className={
                            'text-[10px] font-bold px-2 py-0.5 rounded-full ' +
                            (cls.isActive
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-slate-100 text-slate-500')
                          }
                        >
                          {cls.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {cls.code}
                        </span>

                        {cls.numericValue !== null &&
                          cls.numericValue !== undefined && (
                            <span className="text-xs font-semibold text-slate-400">
                              Order: {cls.numericValue}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditClassModal(cls)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                      title="Edit Class"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleClass(cls)}
                      className={
                        'p-1.5 rounded-lg transition cursor-pointer ' +
                        (cls.isActive
                          ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50')
                      }
                      title={
                        cls.isActive
                          ? 'Deactivate Class'
                          : 'Activate Class'
                      }
                    >
                      <Power className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteClass(cls.id, cls.name)
                      }
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {cls.description && (
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {cls.description}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      Sections ({classSections.length})
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        openCreateSectionModal(cls.id)
                      }
                      disabled={!cls.isActive}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer disabled:text-slate-300 disabled:cursor-not-allowed"
                    >
                      + Add
                    </button>
                  </div>

                  {classSections.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      No sections created yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {classSections.map((sec) => (
                        <div
                          key={sec.id}
                          className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-semibold text-slate-700 truncate">
                              {sec.name}
                            </span>

                            {sec.capacity !== null &&
                              sec.capacity !== undefined && (
                                <span className="text-[10px] text-slate-400">
                                  / {sec.capacity}
                                </span>
                              )}

                            <span
                              className={
                                'text-[9px] font-bold px-1.5 py-0.5 rounded-full ' +
                                (sec.isActive
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-slate-200 text-slate-500')
                              }
                            >
                              {sec.isActive
                                ? 'Active'
                                : 'Inactive'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                openEditSectionModal(sec)
                              }
                              className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition cursor-pointer"
                              title="Edit Section"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleToggleSection(sec)
                              }
                              className={
                                'p-1 rounded transition cursor-pointer ' +
                                (sec.isActive
                                  ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                  : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50')
                              }
                              title={
                                sec.isActive
                                  ? 'Deactivate Section'
                                  : 'Activate Section'
                              }
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteSection(
                                  sec.id,
                                  sec.name
                                )
                              }
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition cursor-pointer"
                              title="Delete Section"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Building2 className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {editingClassId
                    ? 'Edit Academic Class'
                    : 'Create Academic Class'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsClassModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleClassSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Class Name <span className="text-rose-500">*</span>
                </label>

                <input
                  type="text"
                  placeholder="e.g. Class 11"
                  value={classForm.name}
                  onChange={(e) =>
                    setClassForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class Code <span className="text-rose-500">*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. CLS-11"
                    value={classForm.code}
                    onChange={(e) =>
                      setClassForm((prev) => ({
                        ...prev,
                        code: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Numeric Order
                  </label>

                  <input
                    type="number"
                    placeholder="e.g. 11"
                    value={classForm.numericValue}
                    onChange={(e) =>
                      setClassForm((prev) => ({
                        ...prev,
                        numericValue: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>

                <textarea
                  placeholder="Optional notes or stream details..."
                  rows={2}
                  value={classForm.description}
                  onChange={(e) =>
                    setClassForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {saving
                    ? editingClassId
                      ? 'Updating...'
                      : 'Creating...'
                    : editingClassId
                    ? 'Update Class'
                    : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Layers className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {editingSectionId
                    ? 'Edit Section'
                    : 'Add New Section'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsSectionModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSectionSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Class <span className="text-rose-500">*</span>
                </label>

                <select
                  value={sectionForm.classId}
                  onChange={(e) =>
                    setSectionForm((prev) => ({
                      ...prev,
                      classId: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="">Select a class</option>

                  {classes.map((cls) => (
                    <option
                      key={cls.id}
                      value={cls.id}
                      disabled={!cls.isActive}
                    >
                      {cls.name} ({cls.code})
                      {!cls.isActive ? ' - Inactive' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Section Name <span className="text-rose-500">*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Section A"
                    value={sectionForm.name}
                    onChange={(e) =>
                      setSectionForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Capacity
                  </label>

                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 20"
                    value={sectionForm.capacity}
                    onChange={(e) =>
                      setSectionForm((prev) => ({
                        ...prev,
                        capacity: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setIsSectionModalOpen(false)
                  }
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  {saving
                    ? editingSectionId
                      ? 'Updating...'
                      : 'Adding...'
                    : editingSectionId
                    ? 'Update Section'
                    : 'Add Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

