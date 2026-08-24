import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Users, Mail, Phone, Plus, Shield } from 'lucide-react';
import api from '../../services/api';

interface TeachersPageProps {
  onOpenStaffModal: () => void;
}

export const TeachersPage: React.FC<TeachersPageProps> = ({ onOpenStaffModal }) => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/franchise/teachers');
        if (res.data?.success) {
          setTeachers(res.data.data);
        } else {
          setError('Failed to fetch teachers.');
        }
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError('Failed to load teachers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-600" />
            Teachers & Faculty Staff
          </h1>
          <p className="text-xs text-slate-500 mt-1">Directory of provisioned educators, heads of departments, and admin staff</p>
        </div>

        <button
          onClick={onOpenStaffModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Staff</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl">
          <div className="text-center space-y-3">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-500">Loading teachers...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 font-bold text-center text-sm">
          {error}
        </div>
      ) : teachers.length === 0 ? (
        <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-sm font-semibold text-slate-400">No teachers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {teachers.map((staff) => (
            <Card key={staff.id} hoverLift padding="md" className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Avatar name={staff.name} size="lg" status="online" />
                  <Badge variant="indigo" size="sm">
                    {staff.role || 'Teacher'}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{staff.name}</h3>
                  <span className="text-xs font-semibold text-blue-600 block">{staff.department || '—'}</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{staff.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{staff.phone || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[11px] font-bold text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-500" /> Verified Credentials
                </span>
                <button className="text-blue-600 hover:underline">Manage</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
