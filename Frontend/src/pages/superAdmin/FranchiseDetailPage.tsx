import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockContracts, mockRoyaltyRecords } from '../../data/superAdminMockData';
import api from '../../services/api';
import {
  Building2,
  User,
  MapPin,
  Calendar,
  CreditCard,
  ArrowLeft,
  FileText,
  ShieldCheck,
  GraduationCap,
  Users,
  IndianRupee
} from 'lucide-react';

interface FranchiseDetailPageProps {
  franchiseId: string;
  franchiseList?: any[];
  onNavigate: (path: string) => void;
}

export const FranchiseDetailPage: React.FC<FranchiseDetailPageProps> = ({
  franchiseId,
  franchiseList = [],
  onNavigate
}) => {
  const [franchise, setFranchise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchFranchise = async () => {
      try {
        const response = await api.get(`/system-admin/franchises/${franchiseId}`);
        if (response.data?.success) {
          setFranchise(response.data.data);
        }
      } catch (error: any) {
        console.error("Error fetching franchise details:", error);
        setErrorMsg(error?.message || 'Failed to load from API');
      } finally {
        setLoading(false);
      }
    };
    fetchFranchise();
  }, [franchiseId]);

  if (loading) {
    return <div className="p-10 text-center text-slate-500 font-medium">Loading franchise details...</div>;
  }

  // 1. Prefer live API data
  // 2. Fall back to the franchiseList prop (real DB rows passed from App.tsx)
  // 3. Show error — do NOT fall back to unrelated mock data
  const listMatch = franchiseList.find((f: any) => String(f.id) === String(franchiseId));
  const displayFranchise = franchise || listMatch;

  if (!displayFranchise) {
    return (
      <div className="p-10 text-center space-y-2">
        <p className="text-rose-600 font-bold">Could not load franchise details.</p>
        <p className="text-slate-500 text-sm">Franchise ID: <code className="bg-slate-100 px-1 rounded">{franchiseId}</code></p>
        {errorMsg && <p className="text-slate-400 text-xs">API error: {errorMsg}</p>}
        <button onClick={() => onNavigate('/super-admin/franchises')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">← Back to All Franchises</button>
      </div>
    );
  }
  
  // Try to safely extract plan name (backend sends object, mock sends string)
  const planName = typeof displayFranchise.plan === 'object' && displayFranchise.plan !== null 
    ? displayFranchise.plan.name 
    : displayFranchise.plan || 'No Plan';

  // Extract admin name (backend sends admin object, mock sends adminName string)
  const adminName = displayFranchise.admin?.name || displayFranchise.adminName || 'Not Assigned';
  const adminEmail = displayFranchise.admin?.email || displayFranchise.adminEmail || 'No email';

  const contract = mockContracts.find(c => c.schoolId === displayFranchise.id) || mockContracts[0];
  const royaltyRecord = mockRoyaltyRecords.find(r => r.schoolId === displayFranchise.id) || mockRoyaltyRecords[0];

  return (
    <div className="space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('/super-admin/franchises')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to All Franchises
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant={displayFranchise.status === 'ACTIVE' || displayFranchise.status === 'Active' ? 'emerald' : 'slate'}>
            Status: {displayFranchise.status}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/super-admin/royalty')}
          >
            Royalty Ledger
          </Button>
        </div>
      </div>

      {/* Main Banner Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md text-white font-extrabold text-2xl flex items-center justify-center border border-white/20 shrink-0">
            {displayFranchise.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-extrabold text-xs border border-blue-400/30">
                {displayFranchise.code}
              </span>
              <span className="text-xs font-semibold text-slate-300">• Onboarded on {displayFranchise.joinedDate || (displayFranchise.createdAt ? new Date(displayFranchise.createdAt).toISOString().split('T')[0] : 'N/A')}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
              {displayFranchise.name}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium flex items-center gap-2 mt-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              {displayFranchise.address}, {displayFranchise.city}, {displayFranchise.state || 'Maharashtra'}
            </p>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-start md:items-end justify-between gap-2 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
          <div className="text-left md:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subscription Plan</span>
            <span className="text-lg font-extrabold text-white">{planName} Tier</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Royalty</span>
            <span className="text-xl font-extrabold text-emerald-400">₹{(displayFranchise.monthlyRoyalty || 45000).toLocaleString('en-IN')}/mo</span>
          </div>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Total Students</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{(displayFranchise.studentCount || 0).toLocaleString()}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Active student profiles</span>
        </Card>

        <Card className="p-4 border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Teachers & Staff</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{displayFranchise.teacherCount || 0}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Provisioned accounts</span>
        </Card>

        <Card className="p-4 border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Contract Days Left</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{contract.daysRemaining} Days</div>
          <span className="text-[11px] font-bold text-indigo-600 mt-1 block">Expires: {contract.endDate}</span>
        </Card>

        <Card className="p-4 border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Royalty Status</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">{displayFranchise.royaltyStatus || 'Paid'}</div>
          <span className={`text-[11px] font-bold mt-1 block ${
            (displayFranchise.royaltyStatus || 'Paid') === 'Paid' ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            August billing cleared
          </span>
        </Card>
      </div>

      {/* DETAILS SECTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Admin & School Info */}
        <div className="space-y-6">
          <Card className="p-6 border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-extrabold text-slate-900">Franchise Admin Login Details</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Admin Full Name:</span>
                <span className="font-extrabold text-slate-900">{adminName}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Login Email / Username:</span>
                <span className="font-bold text-blue-600">{adminEmail}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Contact Phone:</span>
                <span className="font-bold text-slate-800">{displayFranchise.phone || displayFranchise.adminPhone || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Initial Assigned Password:</span>
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-800">
                  {displayFranchise.adminPassword || 'Confidential'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="font-semibold text-slate-500">Target Dashboard View:</span>
                <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  School Admin Dashboard
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-900 font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Franchise Admin can log in using these credentials to manage their school instance.</span>
            </div>
          </Card>

          <Card className="p-6 border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-extrabold text-slate-900">School Contact & Institutional Info</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Official Email:</span>
                <span className="font-bold text-slate-800">{displayFranchise.email}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Campus Phone:</span>
                <span className="font-bold text-slate-800">{displayFranchise.phone}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Campus Address:</span>
                <span className="font-bold text-slate-800">{displayFranchise.address}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="font-semibold text-slate-500">City / State:</span>
                <span className="font-bold text-slate-800">{displayFranchise.city}, {displayFranchise.state}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Contract & Royalty details */}
        <div className="space-y-6">
          <Card className="p-6 border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">SaaS License Contract</h3>
              </div>
              <Badge variant="blue" size="sm">{contract.renewalStatus}</Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Contract Number:</span>
                <span className="font-extrabold text-slate-900">{contract.contractNumber}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Agreement Title:</span>
                <span className="font-bold text-slate-800">{contract.agreementTitle}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Contract Duration:</span>
                <span className="font-bold text-slate-800">{contract.durationMonths} Months</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Start Date:</span>
                <span className="font-bold text-slate-800">{contract.startDate}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="font-semibold text-slate-500">End Date:</span>
                <span className="font-bold text-slate-800">{contract.endDate}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => onNavigate('/super-admin/contracts')}
            >
              Manage License Agreements →
            </Button>
          </Card>

          <Card className="p-6 border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-extrabold text-slate-900">Royalty Financial Breakdown</h3>
              </div>
              <Badge variant={royaltyRecord.status === 'Paid' ? 'emerald' : 'amber'}>
                {royaltyRecord.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Monthly Amount</span>
                <span className="text-lg font-extrabold text-slate-900">₹{(displayFranchise.monthlyRoyalty || 45000).toLocaleString('en-IN')}</span>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Total Collected</span>
                <span className="text-lg font-extrabold text-emerald-800">
                  ₹{((displayFranchise.monthlyRoyalty || 45000) * 12).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="text-xs font-medium text-slate-600 space-y-1.5 pt-2">
              <div className="flex justify-between">
                <span>Billing Cycle:</span>
                <strong className="text-slate-800">Monthly (Due 5th of month)</strong>
              </div>
              <div className="flex justify-between">
                <span>Invoice Number:</span>
                <strong className="text-slate-800">{royaltyRecord.invoiceNumber}</strong>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
