import React from 'react';
import { Card } from '../ui/Card';
import { Wallet, CheckCircle2 } from 'lucide-react';

export interface StaffPaymentData {
  salaryProfile?: {
    basicSalary: string | number;
    allowances: string | number;
    deductions: string | number;
    netSalary: string | number;
    isActive: boolean;
  };
  latestPayment?: {
    amount: string | number;
    date: string;
    status?: string;
  };
}

interface StaffPaymentCardProps {
  data?: StaffPaymentData | null;
  isApiAvailable?: boolean;
}

const formatCurrency = (amount: string | number) => {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export const StaffPaymentCard: React.FC<StaffPaymentCardProps> = ({
  data,
  isApiAvailable = false
}) => {
  if (!isApiAvailable || (!data?.salaryProfile && !data?.latestPayment)) {
    return (
      <Card className="p-6 h-full flex flex-col justify-center items-center text-center space-y-3 bg-slate-50 border-dashed">
        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-2">
          <Wallet className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-700">My Payment Details</h3>
        <p className="text-xs text-slate-500 max-w-[250px]">
          No salary information has been configured yet.
        </p>
      </Card>
    );
  }

  const { salaryProfile, latestPayment } = data;

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">My Payment Details</h3>
          <p className="text-xs text-slate-500 mt-1">Salary & compensation</p>
        </div>
        {salaryProfile && (
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            salaryProfile.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
          }`}>
            {salaryProfile.isActive ? 'ACTIVE' : 'INACTIVE'}
          </div>
        )}
      </div>

      <div className="space-y-4 flex-1 flex flex-col">
        {salaryProfile && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Basic Salary</span>
              <span className="font-bold text-slate-700">{formatCurrency(salaryProfile.basicSalary)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Allowances</span>
              <span className="font-bold text-slate-700">+{formatCurrency(salaryProfile.allowances)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Deductions</span>
              <span className="font-bold text-slate-700">-{formatCurrency(salaryProfile.deductions)}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900">Net Salary</span>
              <span className="text-sm font-black text-emerald-600">{formatCurrency(salaryProfile.netSalary)}</span>
            </div>
          </div>
        )}

        <div className="flex-1 mt-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Latest Payment</h4>

          {latestPayment ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(latestPayment.amount)}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{new Date(latestPayment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              {latestPayment.status ? (
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  latestPayment.status === 'PAID' || latestPayment.status === 'ACTIVE' || latestPayment.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {latestPayment.status}
                </div>
              ) : (
                <div className="text-[10px] font-medium text-slate-400 italic">
                  Payment status not stored in schema
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              No payment transactions have been recorded yet.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};