import React from 'react';
import { Card } from '../ui/Card';
import { Calendar, ChevronRight } from 'lucide-react';

export const UpcomingEvents: React.FC = () => {
  return (
    <Card hoverLift padding="md" className="w-full h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Events</h3>
              <p className="text-xs text-slate-500">Key institutional calendar schedules</p>
            </div>
          </div>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            <span>Calendar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-40 w-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
          <p className="text-sm font-semibold text-slate-400">No upcoming events</p>
        </div>
      </div>
    </Card>
  );
};
