import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { mockNotices } from '../../data/mockData';
import { Bell, ArrowUpRight } from 'lucide-react';

export const RecentNotices: React.FC = () => {
  return (
    <Card hoverLift padding="md" className="w-full h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Notices</h3>
              <p className="text-xs text-slate-500">Circulars & official announcements</p>
            </div>
          </div>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            <span>All Circulars</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {mockNotices.map((notice) => (
            <div
              key={notice.id}
              className="p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-all flex items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{notice.title}</h4>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Audience: <strong className="text-slate-700">{notice.targetAudience}</strong></span>
                  <span>•</span>
                  <span>{notice.date}</span>
                  <span>•</span>
                  <span>By {notice.author}</span>
                </div>
              </div>

              <Badge
                variant={notice.priority === 'High' ? 'rose' : notice.priority === 'Medium' ? 'amber' : 'slate'}
                size="sm"
              >
                {notice.priority} Priority
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
