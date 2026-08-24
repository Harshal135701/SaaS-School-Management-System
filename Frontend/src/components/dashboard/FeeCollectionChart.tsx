import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { IndianRupee } from 'lucide-react';

interface Props {
  fees: any[];
}

export const FeeCollectionChart: React.FC<Props> = ({ fees }) => {
  const paid = fees.filter(f => f.status === 'PAID').reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const pending = fees.filter(f => f.status === 'PENDING').reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const overdue = fees.filter(f => f.status === 'OVERDUE').reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const total = paid + pending + overdue;

  const data = [
    { name: 'Collected', value: paid, amount: `₹${paid.toLocaleString()}`, color: '#10b981' },
    { name: 'Pending', value: pending, amount: `₹${pending.toLocaleString()}`, color: '#f59e0b' },
    { name: 'Overdue', value: overdue, amount: `₹${overdue.toLocaleString()}`, color: '#f43f5e' }
  ].filter(d => d.value > 0);

  return (
    <Card hoverLift padding="md" className="w-full flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Fee Collection</h3>
            <p className="text-xs text-slate-500">Academic Session 2026–27</p>
          </div>
          <Badge variant="green" icon={<IndianRupee className="w-3 h-3" />}>
            Live Data
          </Badge>
        </div>

        {/* Donut Chart */}
        <div className="h-48 w-full relative flex items-center justify-center my-2">
          {total > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 8px 20px -4px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Donut Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-semibold text-slate-400">Total Revenue</span>
                <span className="text-lg font-extrabold text-slate-900">₹{total.toLocaleString()}</span>
              </div>
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
              <p className="text-sm font-semibold text-slate-400">No fee data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="space-y-2.5 pt-3 border-t border-slate-100">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-semibold text-slate-700">{item.name}</span>
            </div>
            <span className="font-bold text-slate-900">{item.amount}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
