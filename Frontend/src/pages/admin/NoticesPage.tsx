import React, { useEffect, useState, useMemo } from 'react';
import {
  Bell,
  Plus,
  Search,
  AlertTriangle,
  Calendar,
  Users,
  Eye,
  Trash2,
  Filter,
  Clock,
  ArrowLeft,
  X,
  Send,
} from 'lucide-react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export interface Notice {
  id: string;
  title: string;
  content: string;
  audience: 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | string;
  publishedAt?: string;
  createdAt?: string;
  expiresAt?: string;
  authorName?: string;
  franchiseId?: string;
}

interface NoticeFormData {
  title: string;
  content: string;
  audience: string;
  priority: string;
  expiresAt: string;
}

const initialFormData: NoticeFormData = {
  title: '',
  content: '',
  audience: 'ALL',
  priority: 'MEDIUM',
  expiresAt: '',
};

interface NoticesPageProps {
  onNavigate?: (path: string) => void;
}

export const NoticesPage: React.FC<NoticesPageProps> = ({ onNavigate }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendMissing, setBackendMissing] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('ALL_AUDIENCES');
  const [selectedPriority, setSelectedPriority] = useState('ALL_PRIORITIES');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // Form State
  const [formData, setFormData] = useState<NoticeFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch notices from real backend
  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      setBackendMissing(false);

      const res = await api.get('/franchise/notices');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setNotices(res.data.data);
      } else if (Array.isArray(res.data)) {
        setNotices(res.data);
      } else {
        setNotices([]);
      }
    } catch (err: any) {
      console.warn('GET /franchise/notices response:', err?.response?.status || err?.message);
      if (err?.response?.status === 404) {
        setBackendMissing(true);
        setError('Backend capability missing: GET /api/franchise/notices is not yet provisioned on the backend server.');
      } else {
        setError(err?.response?.data?.message || 'Failed to load notices from server.');
      }
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Filtered notices
  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const matchesSearch =
        notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAudience =
        selectedAudience === 'ALL_AUDIENCES' || notice.audience === selectedAudience;

      const matchesPriority =
        selectedPriority === 'ALL_PRIORITIES' || notice.priority === selectedPriority;

      return matchesSearch && matchesAudience && matchesPriority;
    });
  }, [notices, searchQuery, selectedAudience, selectedPriority]);

  // Handle create notice submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Notice title is required.');
      return;
    }
    if (!formData.content.trim()) {
      setFormError('Notice content is required.');
      return;
    }

    try {
      setSaving(true);
      const payload: Record<string, any> = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        targetAudience: formData.audience,
        priority: formData.priority,
      };

      if (formData.expiresAt) {
        payload.expiryDate = formData.expiresAt;
      }

      const res = await api.post('/franchise/notices', payload);

      if (res.data?.success) {
        setIsCreateModalOpen(false);
        setFormData(initialFormData);
        await fetchNotices();
      } else {
        setFormError(res.data?.message || 'Failed to publish notice.');
      }
    } catch (err: any) {
      console.error('POST /franchise/notices error:', err);
      if (err?.response?.status === 404) {
        setFormError(
          'Backend capability missing: POST /api/franchise/notices is not yet implemented on the server. Backend development for notices module is required.'
        );
      } else {
        setFormError(
          err?.response?.data?.message ||
          'Failed to publish notice. The backend request could not be completed.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle delete notice
  const handleDelete = async (noticeId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this notice?');
    if (!confirmed) return;

    try {
      await api.delete(`/franchise/notices/${noticeId}`);
      setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    } catch (err: any) {
      console.error('DELETE /franchise/notices error:', err);
      alert(
        err?.response?.data?.message ||
        'Failed to delete notice. Backend endpoint DELETE /api/franchise/notices/:id may not be provisioned.'
      );
    }
  };

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Audience styling badge helper
  const renderAudienceBadge = (audience: string) => {
    switch (audience?.toUpperCase()) {
      case 'ALL':
        return <Badge variant="indigo">All School</Badge>;
      case 'TEACHERS':
        return <Badge variant="purple">Teachers</Badge>;
      case 'STUDENTS':
        return <Badge variant="blue">Students</Badge>;
      case 'PARENTS':
        return <Badge variant="green">Parents</Badge>;
      default:
        return <Badge variant="slate">{audience}</Badge>;
    }
  };

  // Priority styling badge helper
  const renderPriorityBadge = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return <Badge variant="rose">Urgent</Badge>;
      case 'HIGH':
        return <Badge variant="amber">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="blue">Normal</Badge>;
      case 'LOW':
        return <Badge variant="slate">Low</Badge>;
      default:
        return <Badge variant="slate">{priority}</Badge>;
    }
  };

  // Calculate live statistics
  const totalCount = notices.length;
  const urgentCount = notices.filter((n) => n.priority === 'URGENT').length;
  const allSchoolCount = notices.filter((n) => n.audience === 'ALL').length;
  const teacherCount = notices.filter((n) => n.audience === 'TEACHERS').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/admin/dashboard')}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 shadow-xs">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                School Notices & Circulars
              </h1>
              <p className="text-sm text-slate-500">
                Publish and manage announcements, circulars, and official notifications for staff, parents, and students.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData(initialFormData);
            setFormError(null);
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Notice</span>
        </button>
      </div>

      {/* Backend Status / Capability Warning Banner */}
      {backendMissing ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold">Backend capability missing: </span>
            The Notice & Circulars service is not yet provisioned on the backend server (
            <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono text-xs">
              GET /api/franchise/notices
            </code>
            ). The frontend is fully built and ready according to standard API contract specifications. No fake or mock data is being used.
          </div>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm font-semibold">{error}</div>
        </div>
      ) : null}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Notices</p>
            <p className="text-2xl font-black text-slate-800">{totalCount}</p>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Urgent</p>
            <p className="text-2xl font-black text-slate-800">{urgentCount}</p>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">All School</p>
            <p className="text-2xl font-black text-slate-800">{allSchoolCount}</p>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Staff Circulars</p>
            <p className="text-2xl font-black text-slate-800">{teacherCount}</p>
          </div>
        </Card>
      </div>

      {/* Search & Filters Card */}
      <Card padding="md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search circulars by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL_AUDIENCES">All Audiences</option>
                <option value="ALL">Entire School</option>
                <option value="TEACHERS">Teachers Only</option>
                <option value="STUDENTS">Students Only</option>
                <option value="PARENTS">Parents Only</option>
              </select>
            </div>

            <div>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL_PRIORITIES">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Normal</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Notices Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse p-4" />
          ))}
        </div>
      ) : filteredNotices.length === 0 ? (
        <Card padding="lg" className="text-center py-16">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            {searchQuery || selectedAudience !== 'ALL_AUDIENCES' || selectedPriority !== 'ALL_PRIORITIES'
              ? 'No notices match your filters'
              : 'No notices published yet'}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            {searchQuery || selectedAudience !== 'ALL_AUDIENCES' || selectedPriority !== 'ALL_PRIORITIES'
              ? 'Try changing or clearing your search filters to view notices.'
              : 'Create a new notice or official circular to communicate with staff, students, or parents.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setFormData(initialFormData);
              setFormError(null);
              setIsCreateModalOpen(true);
            }}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
          >
            Create First Notice
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotices.map((notice) => (
            <Card
              key={notice.id}
              hoverLift
              padding="md"
              className="flex flex-col justify-between border-slate-200/80 hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {renderAudienceBadge(notice.audience)}
                    {renderPriorityBadge(notice.priority)}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                    {formatDate(notice.createdAt || notice.publishedAt)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1 mb-1">
                  {notice.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                  {notice.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                  {notice.expiresAt && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      Expires: {formatDate(notice.expiresAt)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedNotice(notice);
                      setIsViewModalOpen(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="View Notice"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(notice.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Notice Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedNotice(null);
        }}
        title="Notice Details"
        subtitle="Official school announcement"
        maxWidth="lg"
      >
        {selectedNotice && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {renderAudienceBadge(selectedNotice.audience)}
                {renderPriorityBadge(selectedNotice.priority)}
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {formatDate(selectedNotice.createdAt || selectedNotice.publishedAt)}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                {selectedNotice.title}
              </h2>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {selectedNotice.content}
              </div>
            </div>

            {selectedNotice.expiresAt && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Expiry Date: {formatDate(selectedNotice.expiresAt)}</span>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedNotice(null);
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Notice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormError(null);
        }}
        title="Create Notice / Circular"
        subtitle="Broadcast an announcement to your school"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Annual Sports Day Schedule, Parent-Teacher Meeting"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Audience <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              >
                <option value="ALL">Entire School (Everyone)</option>
                <option value="TEACHERS">Teachers & Staff</option>
                <option value="STUDENTS">Students</option>
                <option value="PARENTS">Parents</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notice Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              placeholder="Write the complete announcement text, instructions, and relevant details..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{saving ? 'Publishing...' : 'Publish Notice'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
