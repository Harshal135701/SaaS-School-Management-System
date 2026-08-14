import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { mockEvents } from '../../data/mockData';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';

export const UpcomingEvents: React.FC = () => {
  const getCategoryVariant = (cat: string) => {
    switch (cat) {
      case 'Academic': return 'blue';
      case 'Sports': return 'emerald';
      case 'Meeting': return 'amber';
      case 'Cultural': return 'purple';
      default: return 'indigo';
    }
  };

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

        <div className="space-y-3">
          {mockEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-center shrink-0 shadow-2xs">
                  <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    {evt.date.split(' ')[0]}
                  </span>
                  <span className="block text-base font-extrabold text-slate-900 leading-tight">
                    {evt.date.split(' ')[1].replace(',', '')}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{evt.title}</h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {evt.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {evt.location}
                    </span>
                  </div>
                </div>
              </div>

              <Badge variant={getCategoryVariant(evt.category)} size="sm">
                {evt.category}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
