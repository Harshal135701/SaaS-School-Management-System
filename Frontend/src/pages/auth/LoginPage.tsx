import React from 'react';
import { LoginForm } from '../../components/auth/LoginForm';
import { Auth3DIllustration } from '../../components/illustrations/Auth3DIllustration';
import { Badge } from '../../components/ui/Badge';
import { BookOpen, Award, Shield } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (email?: string) => void;
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateRegister,
  onNavigateForgotPassword
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 antialiased selection:bg-blue-600 selection:text-white">
      {/* Left Panel: 3D Graphic Banner */}
      <div className="hidden lg:flex lg:w-1/2 subtle-blue-bg p-12 flex-col justify-between relative overflow-hidden border-r border-blue-100/60">
        {/* Brand Top Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            E
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-none tracking-tight">
              EduSphere
            </h1>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mt-0.5">
              NEXT-GEN SCHOOL MANAGEMENT PLATFORM
            </span>
          </div>
        </div>

        {/* Center Illustration & Content */}
        <div className="flex flex-col items-center text-center my-auto py-8">
          <Auth3DIllustration />

          <h2 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight max-w-lg mt-6 leading-tight">
            Transform Your Educational Institution
          </h2>
          
          <p className="text-sm font-medium text-slate-600 max-w-md mt-3 leading-relaxed">
            Empower administrators, teachers, students, and parents with automated attendance, real-time analytics, and seamless fee processing.
          </p>

          {/* Bottom Badge Chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Badge variant="blue" icon={<BookOpen className="w-3.5 h-3.5" />}>
              K-12 & Higher Ed
            </Badge>
            <Badge variant="indigo" icon={<Award className="w-3.5 h-3.5" />}>
              Curriculum Tracking
            </Badge>
            <Badge variant="slate" icon={<Shield className="w-3.5 h-3.5 text-blue-600" />}>
              Spring Boot Security
            </Badge>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>EduSphere Platform • Security Verified</span>
          <span>© 2026 EduSphere Inc. All rights reserved.</span>
        </div>
      </div>

      {/* Right Panel: Login Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <LoginForm
          onLoginSuccess={onLoginSuccess}
          onNavigateRegister={onNavigateRegister}
          onNavigateForgotPassword={onNavigateForgotPassword}
        />
      </div>
    </div>
  );
};
