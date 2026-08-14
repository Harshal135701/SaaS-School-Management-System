import React from 'react';
import { RegisterForm } from '../../components/auth/RegisterForm';
import { Auth3DIllustration } from '../../components/illustrations/Auth3DIllustration';
import { Users, Clock, Lock } from 'lucide-react';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onNavigateLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigateLogin
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 antialiased selection:bg-blue-600 selection:text-white">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 subtle-blue-bg p-12 flex-col justify-between relative overflow-hidden border-r border-blue-100/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            E
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-none tracking-tight">
              EduSphere
            </h1>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mt-0.5">
              JOIN OUR ACADEMIC COMMUNITY
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center text-center my-auto py-8">
          <Auth3DIllustration />

          <h2 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight max-w-lg mt-6 leading-tight">
            Streamlined Onboarding
          </h2>
          
          <p className="text-sm font-medium text-slate-600 max-w-md mt-3 leading-relaxed">
            Connect parents and students with real-time progress, digital report cards, fee tracking, and direct teacher communications.
          </p>

          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-blue-100 shadow-2xs text-center">
              <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <span className="block text-sm font-extrabold text-slate-900">10,000+</span>
              <span className="text-[11px] font-medium text-slate-500">Parents Onboarded</span>
            </div>

            <div className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-blue-100 shadow-2xs text-center">
              <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <span className="block text-sm font-extrabold text-slate-900">99.9%</span>
              <span className="text-[11px] font-medium text-slate-500">System Uptime</span>
            </div>

            <div className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-blue-100 shadow-2xs text-center">
              <Lock className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <span className="block text-sm font-extrabold text-slate-900">RBAC</span>
              <span className="text-[11px] font-medium text-slate-500">Security Verified</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>EduSphere Platform • Security Verified</span>
          <span>© 2026 EduSphere Inc.</span>
        </div>
      </div>

      {/* Right Panel Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <RegisterForm
          onRegisterSuccess={onRegisterSuccess}
          onNavigateLogin={onNavigateLogin}
        />
      </div>
    </div>
  );
};
