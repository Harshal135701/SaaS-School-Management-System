import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Franchise, PlanType } from '../../types/superAdmin';
import { Building2, Mail, Phone, MapPin, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';

interface AddFranchiseSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (franchise: Franchise) => void;
  editFranchise?: Franchise | null; // if provided, modal is in edit mode
}

export const AddFranchiseSchoolModal: React.FC<AddFranchiseSchoolModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editFranchise
}) => {
  const isEditMode = !!editFranchise;

  const [name, setName] = useState(editFranchise?.name || '');
  const [code, setCode] = useState(editFranchise?.code || `FR-${Math.floor(100 + Math.random() * 900)}`);
  const [email, setEmail] = useState(editFranchise?.email || '');
  const [phone, setPhone] = useState(editFranchise?.phone || '');
  const [address, setAddress] = useState(editFranchise?.address || '');
  const [city, setCity] = useState(editFranchise?.city || '');
  const [state, setState] = useState(editFranchise?.state || '');
  const [country, setCountry] = useState(editFranchise?.country || 'India');
  const [plan, setPlan] = useState<PlanType>(editFranchise?.plan || 'Pro');
  const [startDate, setStartDate] = useState(editFranchise?.contractStartDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(editFranchise?.contractEndDate || '2028-08-16');
  const [monthlyRoyalty, setMonthlyRoyalty] = useState(String(editFranchise?.monthlyRoyalty || '45000'));
  const [isLoading, setIsLoading] = useState(false);

  // Sync fields when editFranchise changes
  React.useEffect(() => {
    if (editFranchise) {
      setName(editFranchise.name);
      setCode(editFranchise.code);
      setEmail(editFranchise.email);
      setPhone(editFranchise.phone);
      setAddress(editFranchise.address);
      setCity(editFranchise.city);
      setState(editFranchise.state);
      setCountry(editFranchise.country);
      setPlan(editFranchise.plan);
      setStartDate(editFranchise.contractStartDate);
      setEndDate(editFranchise.contractEndDate);
      setMonthlyRoyalty(String(editFranchise.monthlyRoyalty));
    } else {
      setName('');
      setCode(`FR-${Math.floor(100 + Math.random() * 900)}`);
      setEmail('');
      setPhone('');
      setAddress('');
      setCity('');
      setState('');
      setCountry('India');
      setPlan('Pro');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('2028-08-16');
      setMonthlyRoyalty('45000');
    }
  }, [editFranchise, isOpen]);

  const handlePlanChange = (p: PlanType) => {
    setPlan(p);
    if (p === 'Basic') setMonthlyRoyalty('25000');
    if (p === 'Pro') setMonthlyRoyalty('45000');
    if (p === 'Enterprise') setMonthlyRoyalty('75000');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setIsLoading(true);
    setTimeout(() => {
      const franchise: Franchise = {
        id: editFranchise?.id || `fr-${Date.now()}`,
        code,
        name,
        email,
        phone: phone || '+91 98000 00000',
        address: address || 'Main Campus Road',
        city: city || 'Pune',
        state: state || 'Maharashtra',
        country,
        plan,
        adminName: editFranchise?.adminName || '',
        adminEmail: editFranchise?.adminEmail || '',
        adminPhone: editFranchise?.adminPhone || phone,
        studentCount: editFranchise?.studentCount || 0,
        teacherCount: editFranchise?.teacherCount || 0,
        contractStatus: 'Active',
        royaltyStatus: editFranchise?.royaltyStatus || 'Paid',
        status: editFranchise?.status || 'Active',
        joinedDate: editFranchise?.joinedDate || new Date().toISOString().split('T')[0],
        contractStartDate: startDate,
        contractEndDate: endDate,
        monthlyRoyalty: parseInt(monthlyRoyalty) || 45000
      };
      setIsLoading(false);
      onSave(franchise);
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Franchise School' : 'Add New Franchise School'}
      subtitle={isEditMode ? `Editing: ${editFranchise?.name}` : 'Register a new franchise school and set up subscription details'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Section 1: School Details */}
        <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-blue-200/50">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
              School Details
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
              label="Official Email *"
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

        {/* Section 2: Subscription & Contract */}
        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-200/50">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5 text-white" />
            </div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
              Subscription & Contract Details
            </h4>
          </div>

          {/* Plan Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              SaaS Subscription Plan
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['Basic', 'Pro', 'Enterprise'] as PlanType[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePlanChange(p)}
                  className={`relative p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    plan === p
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  {plan === p && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 absolute top-2 right-2" />
                  )}
                  <div className={`text-xs font-extrabold ${plan === p ? 'text-blue-700' : 'text-slate-700'}`}>{p}</div>
                  <div className={`text-[10px] font-semibold mt-0.5 ${plan === p ? 'text-blue-500' : 'text-slate-500'}`}>
                    {p === 'Basic' ? '₹25,000/mo' : p === 'Pro' ? '₹45,000/mo' : '₹75,000/mo'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <Input
              label="Monthly Royalty (₹)"
              type="number"
              placeholder="45000"
              value={monthlyRoyalty}
              onChange={(e) => setMonthlyRoyalty(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {isEditMode ? 'Save Changes' : 'Create Franchise School'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
