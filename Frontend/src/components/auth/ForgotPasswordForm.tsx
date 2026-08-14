import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordFormProps {
  onNavigateLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onNavigateLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 subtle-shadow border border-slate-100/80">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
          E
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 leading-none tracking-tight">EduSphere</h2>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mt-0.5">
            PASSWORD RECOVERY
          </span>
        </div>
      </div>

      {isSubmitted ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Reset Instructions Sent!</h3>
          <p className="text-xs text-slate-600">
            We have dispatched password reset instructions to <span className="font-bold text-slate-900">{email}</span>. Please check your inbox or spam folder.
          </p>
          <Button variant="outline" fullWidth onClick={onNavigateLogin} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Sign In
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reset Password</h3>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Enter your registered institutional email to receive a recovery link.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="INSTITUTIONAL EMAIL"
              type="email"
              placeholder="user@edusphere.edu"
              requiredBadge
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Send Recovery Link
            </Button>

            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={onNavigateLogin}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Login</span>
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
