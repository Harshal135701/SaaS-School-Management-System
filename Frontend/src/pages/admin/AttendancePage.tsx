import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import {
    CheckCircle2,
    Search,
    Plus,
    Edit,
    Trash2,
} from 'lucide-react';
import api from '../../services/api';

interface Student {
    id: string;
    name: string;
    email?: string;
}

interface Attendance {
    id: string;
    studentId: string;
    date: string;
    status: string;
    remarks?: string;
    student?: Student;
}

export const AttendancePage: React.FC = () => {
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [date, setDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [status, setStatus] = useState('PRESENT');
    const [remarks, setRemarks] = useState('');

    const fetchAttendance = async () => {
        try {
            setLoading(true);

            const res = await api.get('/franchise/attendance')

            if (res.data?.success) {
                setAttendance(res.data.data || []);
            } else {
                setError('Failed to fetch attendance.');
            }
        } catch (err) {
            console.error('Error fetching attendance:', err);
            setError('Failed to load attendance.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await api.get('/franchise/students');

            if (res.data?.success) {
                setStudents(res.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching students:', err);
        }
    };

    useEffect(() => {
        fetchAttendance();
        fetchStudents();
    }, []);

    const handleCreateAttendance = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!selectedStudent || !date || !status) {
            return;
        }

        try {
            await api.post('/franchise/attendance', {
                studentId: selectedStudent,
                date,
                status,
                remarks,
            });

            setShowForm(false);
            setSelectedStudent('');
            setRemarks('');

            await fetchAttendance();
        } catch (err: any) {
            console.error('Error creating attendance:', err);

            setError(
                err.response?.data?.message ||
                'Failed to mark attendance.'
            );
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this attendance record?')) {
            return;
        }

        try {
            await api.delete(`/franchise/attendance/${id}`)
            await fetchAttendance();
        } catch (err: any) {
            console.error('Error deleting attendance:', err);

            setError(
                err.response?.data?.message ||
                'Failed to delete attendance.'
            );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-7 h-7 text-blue-600" />
                        Attendance Management
                    </h1>

                    <p className="text-xs text-slate-500 mt-1">
                        Track and manage student attendance.
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" />
                    Mark Attendance
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <Card padding="md" hoverLift={false}>
                    <form
                        onSubmit={handleCreateAttendance}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4"
                    >
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                Student
                            </label>

                            <select
                                value={selectedStudent}
                                onChange={(e) =>
                                    setSelectedStudent(e.target.value)
                                }
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                                required
                            >
                                <option value="">Select student</option>

                                {students.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                Date
                            </label>

                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                Status
                            </label>

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                            >
                                <option value="PRESENT">Present</option>
                                <option value="ABSENT">Absent</option>
                                <option value="LATE">Late</option>
                                <option value="LEAVE">Leave</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                Remarks
                            </label>

                            <input
                                type="text"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Optional"
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="md:col-span-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                            >
                                Save Attendance
                            </button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Error */}
            {error && (
                <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-sm font-bold">
                    {error}
                </div>
            )}

            {/* Attendance Table */}
            <Card padding="md" hoverLift={false}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-extrabold text-slate-900">
                        Attendance Records
                    </h2>

                    <Search className="w-4 h-4 text-slate-400" />
                </div>

                {loading ? (
                    <div className="flex justify-center h-40 items-center">
                        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : attendance.length === 0 ? (
                    <div className="flex items-center justify-center h-40 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-sm font-semibold text-slate-400">
                            No attendance records found
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider">
                                    <th className="p-3">Student</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Remarks</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {attendance.map((record) => (
                                    <tr
                                        key={record.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="p-3 font-bold text-slate-900">
                                            {record.student?.name ||
                                                students.find(
                                                    (s) => s.id === record.studentId
                                                )?.name ||
                                                'Unknown'}
                                        </td>

                                        <td className="p-3">
                                            {record.date}
                                        </td>

                                        <td className="p-3">
                                            <span className="px-2 py-1 rounded-lg bg-slate-100 font-bold">
                                                {record.status}
                                            </span>
                                        </td>

                                        <td className="p-3">
                                            {record.remarks || '—'}
                                        </td>

                                        <td className="p-3 text-right">
                                            <button
                                                className="p-1 text-slate-400 hover:text-blue-600"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDelete(record.id)
                                                }
                                                className="p-1 text-slate-400 hover:text-rose-600"
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
        </div>
    );
};