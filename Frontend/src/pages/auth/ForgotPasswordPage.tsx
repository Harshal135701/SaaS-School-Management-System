import React from 'react';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';
import { Auth3DIllustration } from '../../components/illustrations/Auth3DIllustration';

interface ForgotPasswordPageProps {
  onNavigateLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigateLogin }) => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 antialiased">
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
              ACCOUNT RECOVERY
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center text-center my-auto py-8">
          <Auth3DIllustration />
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-6">
            Secure Account Recovery
          </h2>
          <p className="text-sm font-medium text-slate-600 max-w-md mt-2">
            Rest assured, your administrative credentials and student records remain encrypted with enterprise security.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          © 2026 EduSphere Inc. All rights reserved.
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <ForgotPasswordForm onNavigateLogin={onNavigateLogin} />
      </div>
    </div>
  );
};
