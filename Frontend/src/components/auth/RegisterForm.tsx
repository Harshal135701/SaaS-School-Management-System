import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  MapPin, 
  GraduationCap, 
  ArrowRight
} from 'lucide-react';

interface RegisterFormProps {
  onRegisterSuccess: () => void;
  onNavigateLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegisterSuccess,
  onNavigateLogin
}) => {
  // Form states matching input_file_1
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [studentName, setStudentName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Please agree to the Terms and Conditions and Privacy Policy.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }
    if (!email || !parentName || !studentName) {
      setError('Please fill in all required fields marked with *.');
      return;
    }

    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onRegisterSuccess();
    }, 1000);
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl p-8 md:p-10 subtle-shadow border border-slate-100/80">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            E
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 leading-none tracking-tight">EduSphere</h2>
        </div>

        <Badge variant="blue" size="md">
          Unified Registration
        </Badge>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create your account</h3>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Register parent and link student details
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Form Fields - Exact match to input_file_1 design */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="FULL NAME OF PARENT"
          placeholder="e.g. Ramesh Kumar"
          requiredBadge
          value={parentName}
          onChange={(e) => setParentName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="EMAIL ADDRESS"
            type="email"
            placeholder="name@domain.com"
            requiredBadge
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="PHONE NUMBER"
            type="tel"
            placeholder="+91 98765 43210"
            requiredBadge
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="PASSWORD"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            requiredBadge
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

          <Input
            label="CONFIRM PASSWORD"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            requiredBadge
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
          />
        </div>

        <Input
          label="ADDRESS"
          placeholder="Enter full residential address"
          requiredBadge
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          leftIcon={<MapPin className="w-4 h-4" />}
        />

        {/* Student Name Linking Field */}
        <div className="pt-1">
          <Input
            label="FULL NAME OF STUDENT"
            placeholder="e.g. Ananya Kumar"
            requiredBadge
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            leftIcon={<GraduationCap className="w-4 h-4 text-blue-600" />}
          />
          <p className="text-[11px] text-slate-500 font-normal mt-1">
            * Links this student directly to the parent account to avoid duplicate entries.
          </p>
        </div>

        {/* Terms Checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
          />
          <span className="text-xs font-medium text-slate-600">
            I agree to the <a href="#terms" className="text-blue-600 font-bold hover:underline">Terms and Conditions</a> and <a href="#privacy" className="text-blue-600 font-bold hover:underline">Privacy Policy</a>.
          </span>
        </label>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="mt-2"
        >
          Create Unified Account
        </Button>

        {/* Login Link */}
        <div className="pt-4 text-center text-xs font-medium text-slate-600">
          <span>Already have an account? </span>
          <button
            type="button"
            onClick={onNavigateLogin}
            className="font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
};
