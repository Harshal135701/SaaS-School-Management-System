import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { GraduationCap, Search, Filter, Plus, Eye, Edit, Trash2 } from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const studentsMock = [
    { id: 'STU1001', name: 'Ananya Kumar', grade: '10th', section: 'A', parent: 'Ramesh Kumar', roll: '1001', status: 'Active', feeStatus: 'Paid' },
    { id: 'STU1002', name: 'Rohan Deshmukh', grade: '5th', section: 'C', parent: 'Meera Deshmukh', roll: '5012', status: 'Active', feeStatus: 'Pending' },
    { id: 'STU1003', name: 'Aarav Patel', grade: '12th', section: 'B', parent: 'Sanjay Patel', roll: '1204', status: 'Active', feeStatus: 'Paid' },
    { id: 'STU1004', name: 'Diya Sharma', grade: '8th', section: 'A', parent: 'Alok Sharma', roll: '8023', status: 'Active', feeStatus: 'Overdue' }
  ];

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

        {/* Table */}
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
              {studentsMock.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-blue-700">{s.id}</td>
                  <td className="p-3 font-bold text-slate-900">{s.name}</td>
                  <td className="p-3">{s.grade} - {s.section}</td>
                  <td className="p-3">{s.parent}</td>
                  <td className="p-3">
                    <Badge variant="green" size="sm">{s.status}</Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={s.feeStatus === 'Paid' ? 'blue' : s.feeStatus === 'Pending' ? 'amber' : 'rose'} size="sm">
                      {s.feeStatus}
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
      </Card>
    </div>
  );
};
