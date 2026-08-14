import React from 'react';
import { Card } from '../ui/Card';
import { mockActivities } from '../../data/mockData';
import { Activity, UserCheck, CreditCard, UserPlus, BookOpen, RefreshCw } from 'lucide-react';

export const RecentActivities: React.FC = () => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'creation': return <UserPlus className="w-4 h-4 text-emerald-600" />;
      case 'assignment': return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-purple-600" />;
      case 'update': return <BookOpen className="w-4 h-4 text-amber-600" />;
      default: return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <Card hoverLift padding="md" className="w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Activities</h3>
            <p className="text-xs text-slate-500">Live operational log across campus modules</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {mockActivities.map((act) => (
          <div key={act.id} className="relative flex items-start gap-3 text-xs">
            {/* Timeline node icon */}
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
              {getActivityIcon(act.type)}
            </div>

            <div>
              <p className="text-slate-800 font-medium">
                <span className="font-bold text-slate-900">{act.user}</span> ({act.role}) {act.action} <span className="font-semibold text-blue-700">{act.target}</span>
              </p>
              <span className="text-[11px] text-slate-400 font-normal mt-0.5 block">{act.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
