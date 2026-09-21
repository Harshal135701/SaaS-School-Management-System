import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import { requestPasswordReset, verifyOTP, resetPassword } from '../../services/authService';

interface ForgotPasswordFormProps {
  onNavigateLogin: () => void;
}

type Step = 1 | 2 | 3;

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onNavigateLogin }) => {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [userType, setUserType] = useState('TEACHER');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await requestPasswordReset(email);
      setSuccessMsg(res.message || 'OTP sent successfully. Please check your email.');
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await verifyOTP(email, otp, userType);
      setResetToken(res.resetToken);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await resetPassword(email, userType, resetToken, newPassword);
      setIsSubmitted(true);
      // Clear sensitive state
      setEmail('');
      setOtp('');
      setUserType('TEACHER');
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
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
          <h3 className="text-xl font-bold text-slate-900">Success!</h3>
          <p className="text-xs text-slate-600">
            Password reset successfully. You can now login with your new password.
          </p>
          <Button variant="outline" fullWidth onClick={onNavigateLogin} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Sign In
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {step === 1 ? 'Forgot Password?' : step === 2 ? 'Verify OTP' : 'Create New Password'}
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-1">
                {step === 1 && "Enter your registered email address and we'll send you a verification code."}
                {step === 2 && "Enter the OTP sent to your email and select your account type."}
                {step === 3 && "Please enter your new password below."}
              </p>
            </div>
            <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
              Step {step} of 3
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}
          {successMsg && step === 2 && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
              {successMsg}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Input
                label="INSTITUTIONAL EMAIL"
                type="email"
                placeholder="user@edusphere.edu"
                requiredBadge
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                disabled={isLoading}
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                disabled={isLoading}
              >
                Send OTP
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl mb-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Verifying Email</p>
                <p className="text-sm font-semibold text-slate-900">{email}</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Account Type <span className="text-rose-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  disabled={isLoading}
                  required
                >
                  <option value="SYSTEM_ADMIN">System Admin</option>
                  <option value="FRANCHISE_ADMIN">Franchise Admin</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="PARENT">Parent</option>
                </select>
              </div>

              <Input
                label="VERIFICATION CODE (OTP)"
                type="text"
                placeholder="123456"
                requiredBadge
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                leftIcon={<KeyRound className="w-4 h-4" />}
                maxLength={6}
                disabled={isLoading}
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                disabled={isLoading}
              >
                Verify OTP
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  label="NEW PASSWORD"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  requiredBadge
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[32px] p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="relative">
                <Input
                  label="CONFIRM PASSWORD"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  requiredBadge
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[32px] p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                disabled={isLoading}
              >
                Reset Password
              </Button>
            </form>
          )}

          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 mx-auto cursor-pointer transition-colors"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Login</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
