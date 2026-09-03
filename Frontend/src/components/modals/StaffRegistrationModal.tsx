import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { UserRole, StaffRegistrationInput } from '../../types';
import { UserPlus, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

interface StaffRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStaffRegistered: (staffData: StaffRegistrationInput) => void;
}

export const StaffRegistrationModal: React.FC<StaffRegistrationModalProps> = ({
  isOpen,
  onClose,
  onStaffRegistered
}) => {
  const [formData, setFormData] = useState<
    StaffRegistrationInput & {
      password?: string;
      confirmPassword?: string;
    }
  >({
    fullName: '',
    email: '',
    phone: '',
    role: 'Teacher',
    department: 'Mathematics',
    sendEmailNotification: true,
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const roles: UserRole[] = [
    'Teacher',
    'Principal',
    'HOD',
    'Accountant',
    'Data Entry',
    'Support'
  ];

  const hodDepartments = [
    'Maths HOD',
    'Hindi HOD',
    'Chemistry HOD',
    'Physics HOD',
    'English HOD',
    'Computer Science HOD',
    'Biology HOD',
    'Social Studies HOD'
  ];

  const academicDepartments = [
    'Principal',
    ...hodDepartments,
    'Mathematics',
    'Physics & Science',
    'Chemistry',
    'Hindi & Languages',
    'English & Humanities',
    'Computer Science',
    'Finance & Accounts',
    'Student Affairs',
    'Sports & Physical Ed'
  ];

  const supportStaffDepartments = [
    'Receptionist',
    'Driver',
    'Security',
    'Maintenance',
    'Support / Non-Working Staff'
  ];

  const handleRoleChange = (role: UserRole) => {
    let defaultDept = formData.department;

    if (role === 'Principal') {
      defaultDept = 'Principal';
    } else if (role === 'HOD') {
      defaultDept = 'Maths HOD';
    } else if (
      role === 'Support' &&
      !supportStaffDepartments.includes(formData.department)
    ) {
      defaultDept = 'Receptionist';
    } else if (
      role !== 'Support' &&
      supportStaffDepartments.includes(formData.department)
    ) {
      defaultDept = 'Mathematics';
    }

    setFormData(prev => ({
      ...prev,
      role,
      department: defaultDept
    }));
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      role: 'Teacher',
      department: 'Mathematics',
      sendEmailNotification: true,
      password: '',
      confirmPassword: ''
    });

    setError('');
    setShowPassword(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;

    setIsSuccess(false);
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setError('Please enter the staff full name.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter the staff email address.');
      return;
    }

    if (!formData.password) {
      setError('Please enter a password.');
      return;
    }

    if (!formData.confirmPassword) {
      setError('Please confirm the password.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);

      const response = await api.post('/franchise/teachers', {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        password: formData.password,

        // Backend expects role values such as TEACHER
        role:
          formData.role === 'Teacher'
            ? 'TEACHER'
            : formData.role.toUpperCase().replace(/\s+/g, '_'),

        // Backend Teacher model/controller uses subject
        subject: formData.department || null,

        qualification: null,
        joiningDate: null,
        dateOfBirth: null,
        gender: null,
        address: null
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Failed to create staff member.'
        );
      }

      console.log('Teacher created successfully:', response.data.data);

      setIsSuccess(true);

      // Tell parent that registration succeeded
      onStaffRegistered(formData);

      setTimeout(() => {
        setIsSuccess(false);
        resetForm();
        onClose();
      }, 1800);

    } catch (err: any) {
      console.error('Failed to create teacher:', err);

      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to create staff member. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Provision New Staff Member"
      subtitle="Register faculty, administration leadership, or support staff."
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h4 className="text-xl font-bold text-slate-900">
            Staff Provisioned Successfully!
          </h4>

          <p className="text-sm text-slate-600 max-w-xs">
            Account created for{' '}
            <span className="font-semibold text-slate-900">
              {formData.fullName}
            </span>{' '}
            ({formData.role} - {formData.department}).
            Credentials created for{' '}
            <span className="font-medium text-blue-600">
              {formData.email}
            </span>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <Input
            label="STAFF FULL NAME"
            placeholder="e.g. Dr. Rajesh Verma"
            requiredBadge
            value={formData.fullName}
            onChange={e =>
              setFormData({
                ...formData,
                fullName: e.target.value
              })
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="EMAIL ADDRESS (USERNAME)"
              type="email"
              placeholder="staff.name@edusphere.edu"
              requiredBadge
              value={formData.email}
              onChange={e =>
                setFormData({
                  ...formData,
                  email: e.target.value
                })
              }
            />

            <Input
              label="CONTACT PHONE"
              placeholder="+91 98765 00000"
              value={formData.phone}
              onChange={e =>
                setFormData({
                  ...formData,
                  phone: e.target.value
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                STAFF ROLE{' '}
                <span className="text-rose-500 font-bold">*</span>
              </label>

              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none cursor-pointer"
                value={formData.role}
                onChange={e =>
                  handleRoleChange(e.target.value as UserRole)
                }
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                {formData.role === 'Support'
                  ? 'SUPPORT NON-WORKING CATEGORY'
                  : formData.role === 'HOD'
                    ? 'HOD DEPARTMENT'
                    : 'ACADEMIC DEPARTMENT'}{' '}
                <span className="text-rose-500 font-bold">*</span>
              </label>

              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none cursor-pointer"
                value={formData.department}
                onChange={e =>
                  setFormData({
                    ...formData,
                    department: e.target.value
                  })
                }
              >
                {formData.role === 'HOD' ? (
                  <optgroup label="Head of Department (HOD) Roles">
                    {hodDepartments.map(department => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </optgroup>
                ) : formData.role === 'Support' ? (
                  <optgroup label="Support / Non-Working Staff">
                    {supportStaffDepartments.map(department => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </optgroup>
                ) : (
                  <>
                    <optgroup label="Leadership & Administration">
                      <option value="Principal">Principal</option>
                    </optgroup>

                    <optgroup label="Head of Department (HOD) Options">
                      {hodDepartments.map(department => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </optgroup>

                    <optgroup label="Academic Departments">
                      {academicDepartments
                        .filter(
                          department =>
                            !hodDepartments.includes(department) &&
                            department !== 'Principal'
                        )
                        .map(department => (
                          <option key={department} value={department}>
                            {department}
                          </option>
                        ))}
                    </optgroup>

                    <optgroup label="Support Staff Categories">
                      {supportStaffDepartments.map(department => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </optgroup>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <Input
              label="PASSWORD"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              requiredBadge
              value={formData.password}
              onChange={e =>
                setFormData({
                  ...formData,
                  password: e.target.value
                })
              }
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />

            <Input
              label="CONFIRM PASSWORD"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              requiredBadge
              value={formData.confirmPassword}
              onChange={e =>
                setFormData({
                  ...formData,
                  confirmPassword: e.target.value
                })
              }
              leftIcon={<Lock className="w-4 h-4" />}
            />
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              checked={formData.sendEmailNotification}
              onChange={e =>
                setFormData({
                  ...formData,
                  sendEmailNotification: e.target.checked
                })
              }
            />

            <div className="text-left">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                Dispatch Login Credentials via Email
              </span>

              <p className="text-[11px] text-slate-500">
                Sends onboarding instructions & login password to staff email
                address.
              </p>
            </div>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="ghost"
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Provision & Send Credentials
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};