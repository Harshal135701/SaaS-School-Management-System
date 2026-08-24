import React from 'react';
import { Card } from '../ui/Card';
import { Activity, RefreshCw } from 'lucide-react';

export const RecentActivities: React.FC = () => {
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

      <div className="h-40 w-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
        <p className="text-sm font-semibold text-slate-400">No recent activities</p>
      </div>
    </Card>
  );
};
