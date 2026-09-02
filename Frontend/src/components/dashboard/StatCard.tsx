import React from 'react';
import { Card } from '../ui/Card';
import type { StatItem } from '../../types';
import { 
  GraduationCap, 
  Users, 
  UserCheck, 
  HeartHandshake, 
  Building2, 
  UserPlus, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Calendar,
  CreditCard,
  BookOpen,
  FileText,
  Clock
} from 'lucide-react';

interface StatCardProps {
  stat: StatItem;
  onViewDetails?: (id: string) => void;
}

export const StatCard: React.FC<StatCardProps> = ({ stat, onViewDetails }) => {
  const getIcon = () => {
    switch (stat.iconName) {
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-blue-600" />;
      case 'Users': return <Users className="w-5 h-5 text-purple-600" />;
      case 'UserCheck': return <UserCheck className="w-5 h-5 text-emerald-600" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-indigo-600" />;
      case 'Building2': return <Building2 className="w-5 h-5 text-amber-600" />;
      case 'UserPlus': return <UserPlus className="w-5 h-5 text-rose-600" />;
      case 'Calendar': return <Calendar className="w-5 h-5 text-emerald-600" />;
      case 'CreditCard': return <CreditCard className="w-5 h-5 text-amber-600" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-purple-600" />;
      case 'FileText': return <FileText className="w-5 h-5 text-indigo-600" />;
      case 'Clock': return <Clock className="w-5 h-5 text-rose-600" />;
      default: return <GraduationCap className="w-5 h-5 text-blue-600" />;
    }
  };

  const getIconBg = () => {
    switch (stat.color) {
      case 'blue': return 'bg-blue-50 border-blue-100/80';
      case 'purple': return 'bg-purple-50 border-purple-100/80';
      case 'emerald': return 'bg-emerald-50 border-emerald-100/80';
      case 'indigo': return 'bg-indigo-50 border-indigo-100/80';
      case 'amber': return 'bg-amber-50 border-amber-100/80';
      case 'rose': return 'bg-rose-50 border-rose-100/80';
      default: return 'bg-blue-50 border-blue-100/80';
    }
  };

  return (
    <Card hoverLift padding="md" className="flex flex-col justify-between h-full group">
      <div>
        {/* Top Icon & Change Badge Row */}
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-xl border ${getIconBg()} flex items-center justify-center transition-transform group-hover:scale-105 duration-200`}>
            {getIcon()}
          </div>
          
          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            stat.neutral 
              ? 'bg-slate-100 text-slate-700 border border-slate-200'
              : stat.isPositive 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                : 'bg-rose-50 text-rose-700 border border-rose-200/80'
          }`}>
            {stat.isPositive && !stat.neutral ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : !stat.neutral ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : null}
            <span>{stat.change}</span>
          </div>
        </div>

        {/* Title & Value */}
        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          {stat.title}
        </h4>
        <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          {stat.value}
        </div>
      </div>

      {/* Footer Subtext & Action */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <span className="text-slate-500 font-normal">{stat.subtext}</span>
        <button 
          onClick={() => onViewDetails && onViewDetails(stat.id)}
          className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-all cursor-pointer"
        >
          <span>View details</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </Card>
  );
};
