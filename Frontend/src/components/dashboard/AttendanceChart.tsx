import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  CartesianGrid 
} from 'recharts';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Props {
  attendances: any[];
}

export const AttendanceChart: React.FC<Props> = ({ attendances }) => {
  const totalPresent = attendances.filter(a => a.status === 'PRESENT').length;
  const totalAbsent = attendances.filter(a => a.status === 'ABSENT').length;
  const totalLate = attendances.filter(a => a.status === 'LATE').length;

  // Group by date for the chart
  const grouped = attendances.reduce((acc, curr) => {
    const d = curr.date.split('T')[0]; // Handle ISO dates if necessary
    if (!acc[d]) acc[d] = { name: d, Present: 0, Absent: 0, Late: 0 };
    if (curr.status === 'PRESENT') acc[d].Present += 1;
    if (curr.status === 'ABSENT') acc[d].Absent += 1;
    if (curr.status === 'LATE') acc[d].Late += 1;
    return acc;
  }, {} as Record<string, any>);

  const data = Object.values(grouped).sort((a: any, b: any) => a.name.localeCompare(b.name));

  return (
    <Card hoverLift padding="md" className="w-full">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Attendance Overview</h3>
            <Badge variant="blue" icon={<RefreshCw className="w-3 h-3 text-blue-600" />}>
              Live Data
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Student check-in telemetry across campus
          </p>
        </div>
      </div>

      {/* Summary metric indicators */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Present</div>
            <div className="text-lg font-extrabold text-emerald-950">{totalPresent.toLocaleString()}</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Absent</div>
            <div className="text-lg font-extrabold text-rose-950">{totalAbsent.toLocaleString()}</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Late Arrival</div>
            <div className="text-lg font-extrabold text-amber-950">{totalLate.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart or Empty State */}
      <div className="h-64 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              />
              <Area
                type="monotone"
                dataKey="Present"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#presentGradient)"
              />
              <Area
                type="monotone"
                dataKey="Absent"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#absentGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
            <p className="text-sm font-semibold text-slate-400">No attendance data available</p>
          </div>
        )}
      </div>
    </Card>
  );
};
