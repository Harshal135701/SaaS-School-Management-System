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
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';

interface TeachersPageProps {
  onOpenStaffModal: () => void;
}

export const TeachersPage: React.FC<TeachersPageProps> = ({
  onOpenStaffModal
}) => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get('/franchise/teachers');

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-600" />
            Teachers & Faculty Staff
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Directory of provisioned educators, heads of departments, and admin
            staff
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
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            />
          </button>

          <button
            onClick={onOpenStaffModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Staff</span>
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl">
          <div className="text-center space-y-3">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />

            <p className="text-xs font-bold text-slate-500">
              Loading teachers...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="space-y-3">
          <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 font-bold text-center text-sm">
            {error}
          </div>

          <div className="text-center">
            <button
              onClick={fetchTeachers}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : teachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl">
          <Users className="w-10 h-10 text-slate-300 mb-3" />

          <p className="text-sm font-semibold text-slate-400">
            No teachers found
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Click "Provision New Staff" to add your first teacher.
          </p>
        </div>
      ) : (
        /* Teachers */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {teachers.map(staff => (
            <Card
              key={staff.id}
              hoverLift
              padding="md"
              className="flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Avatar
                    name={staff.name}
                    size="lg"
                    status={
                      staff.status === 'INACTIVE'
                        ? undefined
                        : 'online'
                    }
                  />

                  <Badge variant="indigo" size="sm">
                    {staff.role || 'Teacher'}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {staff.name}
                  </h3>

                  <span className="text-xs font-semibold text-blue-600 block">
                    {staff.subject || staff.department || '—'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                    <span className="truncate">
                      {staff.email || '—'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                    <span>
                      {staff.phone || '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[11px] font-bold text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-500" />
                  {staff.status === 'INACTIVE'
                    ? 'Inactive'
                    : 'Verified Credentials'}
                </span>

                <button className="text-blue-600 hover:underline">
                  Manage
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};