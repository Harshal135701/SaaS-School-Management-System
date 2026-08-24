import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { GraduationCap, Search, Filter, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/franchise/students');
        if (res.data?.success) {
          setStudents(res.data.data);
        } else {
          setError('Failed to fetch students.');
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-blue-600" />
            Student Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">Directory of enrolled students across Grades 1–12</p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors cursor-pointer self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Register New Student</span>
        </button>
      </div>

      <Card padding="md" hoverLift={false}>
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by student name or ID..."
              className="w-full bg-slate-100/80 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/70 rounded-xl text-xs font-bold text-slate-700 transition-colors">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Grade</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl">
            <div className="text-center space-y-3">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-slate-500">Loading students...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 font-bold text-center text-sm">
            {error}
          </div>
        ) : students.length === 0 ? (
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-sm font-semibold text-slate-400">No students found</p>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider bg-slate-50/50">
                  <th className="p-3">Student ID</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Grade & Sec</th>
                  <th className="p-3">Parent Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Fee Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-blue-700">
                      {/* Using first 8 chars of UUID if it's a UUID, otherwise ID */}
                      {s.id.length > 8 ? s.id.substring(0, 8).toUpperCase() : s.id}
                    </td>
                    <td className="p-3 font-bold text-slate-900">{s.name}</td>
                    <td className="p-3">—</td>
                    <td className="p-3">—</td>
                    <td className="p-3">
                      <Badge variant={s.status === 'ACTIVE' || s.status === 'Active' ? 'green' : 'slate'} size="sm">
                        {s.status || 'Active'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="slate" size="sm">
                        —
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button className="p-1 text-slate-400 hover:text-blue-600 rounded"><Eye className="w-4 h-4" /></button>
                      <button className="p-1 text-slate-400 hover:text-amber-600 rounded"><Edit className="w-4 h-4" /></button>
                      <button className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
