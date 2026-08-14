import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { login } from '../../services/authService'
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onNavigateRegister,
  onNavigateForgotPassword
}) => {
  const [email, setEmail] = useState('krishna.admin@edusphere.edu');
  const [password, setPassword] = useState('SuperAdmin2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const data = await login(email, password);

      console.log('Login successful:', data);

      setIsLoading(false);
      onLoginSuccess();
    } catch (error: any) {
      console.error('Login failed:', error);

      setIsLoading(false);
      setError(
        error.response?.data?.message || 'Invalid email or password.'
      );
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 subtle-shadow border border-slate-100/80">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
          E
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 leading-tight">EduSphere</h2>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
            SAAS SCHOOL SYSTEM
          </span>
        </div>
      </div>

      {/* Heading */}
      <div className="mb-6">
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">USER LOGIN</h3>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Sign in to manage your school ecosystem
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="EMAIL OR USERNAME"
          type="text"
          placeholder="krishna.admin@edusphere.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          requiredBadge
        />

        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              PASSWORD <span className="text-rose-500 font-bold">*</span>
            </label>
            <button
              type="button"
              onClick={onNavigateForgotPassword}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </div>

        {/* Remember me checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-700">Remember for 30 days</span>
          </label>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="mt-2"
        >
          Login
        </Button>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            OR CONTINUE WITH
          </span>
        </div>

        {/* Google SSO Mock Button */}
        <button
          type="button"
          onClick={onLoginSuccess}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Google Workspace SSO (Mock)</span>
        </button>

        {/* Register navigation link */}
        <div className="pt-4 text-center text-xs font-medium text-slate-600">
          <span>Don't have an account? </span>
          <button
            type="button"
            onClick={onNavigateRegister}
            className="font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </form>

      {/* Footer metadata */}
      <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Enterprise Secured
        </span>
        <span>v2.4.0 • Production</span>
      </div>
    </div>
  );
};
