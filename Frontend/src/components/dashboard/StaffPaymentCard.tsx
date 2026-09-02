import React from 'react';
import { Card } from '../ui/Card';
import { Wallet, CheckCircle2 } from 'lucide-react';

export interface StaffPaymentData {
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  lastPaymentMonth?: string;
  amount?: string;
  history?: Array<{
    month: string;
    amount: string;
    date: string;
  }>;
}

interface StaffPaymentCardProps {
  data?: StaffPaymentData | null;
  isApiAvailable?: boolean;
}

export const StaffPaymentCard: React.FC<StaffPaymentCardProps> = ({
  data,
  isApiAvailable = false
}) => {
  // STATE 6: Payment API unavailable
  if (!isApiAvailable) {
    return (
      <Card className="p-6 h-full flex flex-col justify-center items-center text-center space-y-3 bg-slate-50 border-dashed">
        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-2">
          <Wallet className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-700">My Payment Details</h3>
        <p className="text-xs text-slate-500 max-w-[250px]">
          Payment information is not available yet.
        </p>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">My Payment</h3>
          <p className="text-xs text-slate-500 mt-1">Salary & compensation</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          data.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
          data.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
          'bg-rose-100 text-rose-700'
        }`}>
          {data.status}
        </div>
      </div>

      <div className="space-y-6 flex-1 flex flex-col">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Last Payment</p>
            <p className="text-lg font-black text-slate-900">{data.lastPaymentMonth || '-'}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Amount</p>
            <p className="text-lg font-black text-emerald-600">{data.amount || '-'}</p>
          </div>
        </div>

        <div className="flex-1">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Payment History</h4>
          <div className="space-y-3">
            {data.history?.map((record, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{record.month}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{record.date}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-700">{record.amount}</p>
              </div>
            ))}
            
            {(!data.history || data.history.length === 0) && (
              <p className="text-xs text-slate-500 text-center py-4">No payment history available.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};