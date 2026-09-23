import React, { useEffect, useState } from 'react';
import type { StatItem } from '../../../types';
import {
  Calendar,
  CheckCircle2,
  GraduationCap,
  Users,
  Building2,
  BookMarked,
  Plus,
  RefreshCw,
} from 'lucide-react';
import api from '../../../services/api';
import { StatCard } from '../../../components/dashboard/StatCard';

interface DataEntryDashboardProps {
  onNavigate?: (path: string) => void;
}

export const DataEntryDashboard: React.FC<DataEntryDashboardProps> = ({
  onNavigate,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    students: 0,
    parents: 0,
    classes: 0,
    activeClasses: 0,
    subjects: 0,
    activeSubjects: 0,
  });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        studentsRes,
        parentsRes,
        classesRes,
        subjectsRes,
      ] = await Promise.all([
        api.get('/franchise/students'),
        api.get('/franchise/parents'),
        api.get('/franchise/classes'),
        api.get('/franchise/subjects'),
      ]);

      const students =
        studentsRes.data?.pagination?.total ??
        studentsRes.data?.data?.length ??
        0;

      const parents =
        parentsRes.data?.pagination?.total ??
        parentsRes.data?.data?.length ??
        0;

      const classesData = Array.isArray(classesRes.data?.data)
        ? classesRes.data.data
        : [];

      const subjectsData = Array.isArray(subjectsRes.data?.data)
        ? subjectsRes.data.data
        : [];

      setStats({
        students,
        parents,
        classes: classesData.length,
        activeClasses: classesData.filter(
          (item: any) => item.isActive
        ).length,
        subjects: subjectsData.length,
        activeSubjects: subjectsData.filter(
          (item: any) => item.isActive
        ).length,
      });
    } catch (err: any) {
      console.error('Data Entry Dashboard error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to load dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const dashboardStats: StatItem[] = [
    {
      id: 'students',
      title: 'TOTAL STUDENTS',
      value: stats.students.toLocaleString(),
      change: '+0%',
      isPositive: true,
      subtext: 'Live count',
      iconName: 'GraduationCap',
      color: 'blue',
    },
    {
      id: 'parents',
      title: 'TOTAL PARENTS',
      value: stats.parents.toLocaleString(),
      change: '+0%',
      isPositive: true,
      subtext: 'Live count',
      iconName: 'Users',
      color: 'emerald',
    },
    {
      id: 'classes',
      title: 'TOTAL CLASSES',
      value: stats.classes.toLocaleString(),
      change: '+0%',
      isPositive: true,
      subtext: 'Configured classes',
      iconName: 'Building2',
      color: 'purple',
    },
    {
      id: 'active_classes',
      title: 'ACTIVE CLASSES',
      value: stats.activeClasses.toLocaleString(),
      change: '+0%',
      isPositive: true,
      subtext: 'Currently active',
      iconName: 'Building2',
      color: 'blue',
    },
    {
      id: 'subjects',
      title: 'TOTAL SUBJECTS',
      value: stats.subjects.toLocaleString(),
      change: '+0%',
      isPositive: true,
      subtext: 'Configured subjects',
      iconName: 'BookMarked',
      color: 'amber',
    },
    {
      id: 'active_subjects',
      title: 'ACTIVE SUBJECTS',
      value: stats.activeSubjects.toLocaleString(),
      change: '+0%',
      isPositive: true,
      subtext: 'Currently active',
      iconName: 'BookMarked',
      color: 'emerald',
    },
  ];

  const handleStatNavigation = (id: string) => {
    switch (id) {
      case 'students':
        onNavigate?.('/data-entry/students');
        break;

      case 'parents':
        onNavigate?.('/data-entry/parents');
        break;

      case 'classes':
      case 'active_classes':
        onNavigate?.('/data-entry/classes');
        break;

      case 'subjects':
      case 'active_subjects':
        onNavigate?.('/data-entry/subjects');
        break;

      default:
        break;
    }
  };

  return (
    <div className="space-y-6">

      {/* HERO */}
      <div className="relative w-full rounded-3xl overflow-hidden hero-gradient p-6 md:p-8 text-white shadow-xl shadow-blue-600/15">

        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none translate-x-12 -translate-y-12" />

        <div className="relative z-10">

          <div className="flex flex-wrap items-center gap-2 text-xs mb-4">

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md font-semibold border border-white/20">
              <Calendar className="w-3.5 h-3.5" />
              {todayDateString}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 backdrop-blur-md font-semibold text-emerald-200 border border-emerald-300/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Academic Session 2026-27
            </span>

          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Data Entry Dashboard 👋
          </h1>

          <p className="text-sm text-blue-100/90 mt-2 max-w-2xl">
            Manage students, parents, classes, sections, and academic
            subjects from one place.
          </p>

        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-3xl">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-500">
              Loading dashboard data...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 text-rose-700 rounded-3xl border border-rose-100 font-bold text-center">
          {error}

          <button
            onClick={fetchDashboard}
            className="ml-3 inline-flex items-center gap-1 text-rose-700 underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* STATS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {dashboardStats.map((stat) => (
              <StatCard
                key={stat.id}
                stat={stat}
                onViewDetails={handleStatNavigation}
              />
            ))}
          </div>

          {/* QUICK ACTIONS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Quick Actions
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Quickly access common data management tasks.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <button
                onClick={() => onNavigate?.('/data-entry/students')}
                className="group p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <GraduationCap className="w-5 h-5" />
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm">
                  Manage Students
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Add, edit and manage student records.
                </p>

                <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-blue-600">
                  <Plus className="w-3.5 h-3.5" />
                  Open
                </span>
              </button>

              <button
                onClick={() => onNavigate?.('/data-entry/parents')}
                className="group p-5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-300 hover:shadow-md transition text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm">
                  Manage Parents
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Create parents and assign students.
                </p>

                <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-emerald-600">
                  <Plus className="w-3.5 h-3.5" />
                  Open
                </span>
              </button>

              <button
                onClick={() => onNavigate?.('/data-entry/classes')}
                className="group p-5 bg-white border border-slate-200 rounded-2xl hover:border-purple-300 hover:shadow-md transition text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                  <Building2 className="w-5 h-5" />
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm">
                  Classes & Sections
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Manage classes and section capacity.
                </p>

                <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-purple-600">
                  <Plus className="w-3.5 h-3.5" />
                  Open
                </span>
              </button>

              <button
                onClick={() => onNavigate?.('/data-entry/subjects')}
                className="group p-5 bg-white border border-slate-200 rounded-2xl hover:border-amber-300 hover:shadow-md transition text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <BookMarked className="w-5 h-5" />
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm">
                  Manage Subjects
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Create and manage academic subjects.
                </p>

                <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-amber-600">
                  <Plus className="w-3.5 h-3.5" />
                  Open
                </span>
              </button>

            </div>
          </div>
        </>
      )}
    </div>
  );
};