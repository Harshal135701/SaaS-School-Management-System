import React from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  BookOpen, 
  CreditCard,
  FileText
} from 'lucide-react';

interface ParentDashboardPageProps {
  onNavigate?: (path: string) => void;
  user?: any;
}

export const ParentDashboardPage: React.FC<ParentDashboardPageProps> = ({ user }) => {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <GraduationCap className="w-48 h-48" />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Parent Portal
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Welcome back, {user?.name || 'Parent'} 👋
          </h1>
          <p className="text-slate-500 max-w-2xl text-lg font-medium">
            Here's an overview of your child's school journey.
          </p>
        </div>
      </motion.div>

      {/* Empty States / Future Data Placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex flex-col items-center justify-center text-center min-h-[240px]"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Student Information</h3>
          <p className="text-slate-500 text-sm font-medium">
            Student profile information will appear here once the Parent APIs are available.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex flex-col items-center justify-center text-center min-h-[240px]"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Attendance</h3>
          <p className="text-slate-500 text-sm font-medium">
            Attendance data not available yet.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex flex-col items-center justify-center text-center min-h-[240px]"
        >
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Academic Performance</h3>
          <p className="text-slate-500 text-sm font-medium">
            Academic data not available yet.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex flex-col items-center justify-center text-center min-h-[240px]"
        >
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Fees</h3>
          <p className="text-slate-500 text-sm font-medium">
            Fee information not available yet.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex flex-col items-center justify-center text-center min-h-[240px]"
        >
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Exams & Assignments</h3>
          <p className="text-slate-500 text-sm font-medium">
            Exam and assignment information not available yet.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex flex-col items-center justify-center text-center min-h-[240px]"
        >
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Timetable</h3>
          <p className="text-slate-500 text-sm font-medium">
            Timetable information not available yet.
          </p>
        </motion.div>

      </div>
    </div>
  );
};
