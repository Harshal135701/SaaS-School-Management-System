import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Bell, ArrowUpRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import api from '../../services/api';

interface NoticeItem {
  id: string;
  title: string;
  content: string;
  audience: string;
  priority: string;
  createdAt?: string;
  publishedAt?: string;
}

interface RecentNoticesProps {
  onNavigate?: (path: string) => void;
}

export const RecentNotices: React.FC<RecentNoticesProps> = ({ onNavigate }) => {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRecentNotices = async () => {
      try {
        setLoading(true);
        const res = await api.get('/franchise/notices');
        if (isMounted) {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setNotices(res.data.data.slice(0, 3));
          } else if (Array.isArray(res.data)) {
            setNotices(res.data.slice(0, 3));
          } else {
            setNotices([]);
          }
        }
      } catch (err) {
        // Backend capability might not be provisioned yet (404) or empty
        if (isMounted) {
          setNotices([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecentNotices();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return <Badge size="sm" variant="rose">Urgent</Badge>;
      case 'HIGH':
        return <Badge size="sm" variant="amber">High</Badge>;
      case 'MEDIUM':
        return <Badge size="sm" variant="blue">Normal</Badge>;
      case 'LOW':
        return <Badge size="sm" variant="slate">Low</Badge>;
      default:
        return <Badge size="sm" variant="slate">{priority}</Badge>;
    }
  };

  const renderAudienceBadge = (audience: string) => {
    switch (audience?.toUpperCase()) {
      case 'ALL':
        return <Badge size="sm" variant="indigo">All School</Badge>;
      case 'TEACHERS':
        return <Badge size="sm" variant="purple">Teachers</Badge>;
      case 'STUDENTS':
        return <Badge size="sm" variant="blue">Students</Badge>;
      case 'PARENTS':
        return <Badge size="sm" variant="green">Parents</Badge>;
      default:
        return <Badge size="sm" variant="slate">{audience}</Badge>;
    }
  };

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
          <button
            type="button"
            onClick={() => onNavigate?.('/admin/notices')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition"
          >
            <span>All Circulars</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-slate-50 rounded-xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : notices.length > 0 ? (
          <div className="space-y-2.5">
            {notices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => onNavigate?.('/admin/notices')}
                className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {renderAudienceBadge(notice.audience)}
                    {renderPriorityBadge(notice.priority)}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {formatDate(notice.createdAt || notice.publishedAt)}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                  {notice.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {notice.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-40 w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100 border-dashed p-4 text-center">
            <p className="text-sm font-semibold text-slate-400">No recent notices</p>
            <p className="text-xs text-slate-400 mt-0.5">No announcements published yet</p>
          </div>
        )}
      </div>
    </Card>
  );
};
