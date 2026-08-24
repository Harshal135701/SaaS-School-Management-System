import React from 'react';
import { Card } from '../ui/Card';
import { Layers } from 'lucide-react';

export const StudentDistributionChart: React.FC = () => {
  return (
    <Card hoverLift padding="md" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Students by Class</h3>
          <p className="text-xs text-slate-500">Classroom strength distribution</p>
        </div>
        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      <div className="h-60 w-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
        <p className="text-sm font-semibold text-slate-400">No class data available</p>
      </div>
    </Card>
  );
};
