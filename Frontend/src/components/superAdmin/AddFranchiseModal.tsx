import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Franchise, PlanType } from '../../types/superAdmin';
import { Building2, User, Mail, Phone, MapPin, Calendar, CreditCard, ShieldCheck } from 'lucide-react';

interface AddFranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFranchiseAdded: (newFranchise: Franchise) => void;
}

export const AddFranchiseModal: React.FC<AddFranchiseModalProps> = ({
  isOpen,
  onClose,
  onFranchiseAdded
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState(`FR-${Math.floor(100 + Math.random() * 900)}`);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, _setCountry] = useState('India');

  // Admin Credentials Creation
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('Password123!');

  // Plan & Financials
  const [plan, setPlan] = useState<PlanType>('Pro');
  const [startDate, setStartDate] = useState('2026-08-17');
  const [endDate, setEndDate] = useState('2028-08-16');
  const [monthlyRoyalty, setMonthlyRoyalty] = useState('45000');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !adminEmail || !adminName) return;

    setIsLoading(true);

    setTimeout(() => {
      const newFranchise: Franchise = {
        id: `fr-${Date.now()}`,
        code,
        name,
        email,
        phone: phone || '+91 98000 00000',
        address: address || 'Main Campus Road',
        city: city || 'Pune',
        state: state || 'Maharashtra',
        country,
        plan,
        adminName,
        adminEmail,
        adminPhone: adminPhone || phone,
        adminPassword,
        studentCount: 0,
        teacherCount: 0,
        contractStatus: 'Active',
        royaltyStatus: 'Paid',
        status: 'Active',
        joinedDate: new Date().toISOString().split('T')[0],
        contractStartDate: startDate,
        contractEndDate: endDate,
        monthlyRoyalty: parseInt(monthlyRoyalty) || 45000
      };

      setIsLoading(false);
      onFranchiseAdded(newFranchise);

      // Reset form
      setName('');
      setEmail('');
      setAdminName('');
      setAdminEmail('');
      onClose();
    }, 600);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Provision New Franchise / School" maxWidth="3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Franchise Details */}
        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-4">
          <div className="flex items-center gap-2 border-b border-blue-200/60 pb-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
              1. Franchise Details
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="School Name *"
              placeholder="Oxford Heritage High School"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="School Code *"
              placeholder="FR-009"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />

            <Input
              label="School Official Email *"
              type="email"
              placeholder="admin@oxfordheritage.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Contact Phone"
              placeholder="+91 98765 00000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <div className="md:col-span-2">
              <Input
                label="Campus Address"
                placeholder="Sector 12, Main MG Road"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
              />
            </div>

            <Input
              label="City"
              placeholder="Pune"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            <Input
              label="State"
              placeholder="Maharashtra"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
        </div>

        {/* Step 2: Franchise Admin Credentials */}
        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-4">
          <div className="flex items-center gap-2 border-b border-indigo-200/60 pb-2">
            <User className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">
              2. Franchise Admin Account (Login Credentials)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Franchise Admin Full Name *"
              placeholder="Rajesh Patil"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
            />

            <Input
              label="Franchise Admin Email (Login Username) *"
              type="email"
              placeholder="rajesh.admin@oxfordheritage.edu"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />

            <Input
              label="Admin Initial Password *"
              type="text"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />

            <Input
              label="Admin Phone"
              placeholder="+91 98765 11111"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
            />
          </div>

          <p className="text-[11px] font-medium text-indigo-700 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            These credentials will allow the Franchise Admin to log into their dedicated School Admin Dashboard.
          </p>
        </div>

        {/* Step 3: Plan, Contract & Royalty */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              3. Subscription Plan & Contract Setup
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                SaaS Subscription Plan
              </label>
              <select
                value={plan}
                onChange={(e) => {
                  const p = e.target.value as PlanType;
                  setPlan(p);
                  if (p === 'Basic') setMonthlyRoyalty('25000');
                  if (p === 'Pro') setMonthlyRoyalty('45000');
                  if (p === 'Enterprise') setMonthlyRoyalty('75000');
                }}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="Basic">Basic Plan (₹25,000/mo)</option>
                <option value="Pro">Pro Plan (₹45,000/mo)</option>
                <option value="Enterprise">Enterprise Plan (₹75,000/mo)</option>
              </select>
            </div>

            <Input
              label="Contract Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
            />

            <Input
              label="Contract End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Create Franchise & Provision Account
          </Button>
        </div>
      </form>
    </Modal>
  );
};
