import React from 'react';
import { Card } from '../ui/Card';
import {
  UserPlus,
  Users,
  UserCheck,
  HeartHandshake,
  BellRing,
  FileCheck2,
  CreditCard,
  Building2,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';

interface QuickActionsProps {
  onOpenStaffModal: () => void;
  onOpenActionModal?: (actionKey: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenStaffModal,
  onOpenActionModal,
}) => {
  const handleAction = (actionKey: string) => {
    if (!onOpenActionModal) return;

    onOpenActionModal(actionKey);
  };

  const actions = [
    {
      id: 'provision_staff',
      label: 'Provision Staff',
      badge: 'Admin',
      icon: <UserPlus className="w-4 h-4 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100/70',
      handler: onOpenStaffModal,
    },
    {
      id: 'add_student',
      label: 'Add Student',
      icon: <Users className="w-4 h-4 text-blue-600" />,
      color: 'bg-blue-50 border-blue-100 hover:bg-blue-100/70',
      handler: () => handleAction('add_student'),
    },
    {
      id: 'add_teacher',
      label: 'Add Teacher',
      icon: <UserCheck className="w-4 h-4 text-purple-600" />,
      color: 'bg-purple-50 border-purple-100 hover:bg-purple-100/70',
      handler: () => handleAction('add_teacher'),
    },
    {
      id: 'add_parent',
      label: 'Add Parent',
      icon: <HeartHandshake className="w-4 h-4 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100/70',
      handler: () => handleAction('add_parent'),
    },
    {
      id: 'create_notice',
      label: 'Create Notice',
      icon: <BellRing className="w-4 h-4 text-amber-600" />,
      color: 'bg-amber-50 border-amber-100 hover:bg-amber-100/70',
      handler: () => handleAction('create_notice'),
    },
    {
      id: 'create_exam',
      label: 'Create Exam',
      icon: <FileCheck2 className="w-4 h-4 text-rose-600" />,
      color: 'bg-rose-50 border-rose-100 hover:bg-rose-100/70',
      handler: () => handleAction('create_exam'),
    },
    {
      id: 'record_payment',
      label: 'Record Payment',
      icon: <CreditCard className="w-4 h-4 text-teal-600" />,
      color: 'bg-teal-50 border-teal-100 hover:bg-teal-100/70',
      handler: () => handleAction('record_payment'),
    },
    {
      id: 'create_class',
      label: 'Create Class',
      icon: <Building2 className="w-4 h-4 text-cyan-600" />,
      color: 'bg-cyan-50 border-cyan-100 hover:bg-cyan-100/70',
      handler: () => handleAction('create_class'),
    },
    {
      id: 'generate_report',
      label: 'Generate Report',
      icon: <FileSpreadsheet className="w-4 h-4 text-violet-600" />,
      color: 'bg-violet-50 border-violet-100 hover:bg-violet-100/70',
      handler: () => handleAction('generate_report'),
    },
  ];

  return (
    <Card hoverLift={false} padding="md" className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
          <Zap className="w-5 h-5" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Quick Actions
          </h3>

          <p className="text-xs text-slate-500">
            Fast administrative shortcuts & workflows
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.handler}
            className={`
              p-3
              rounded-2xl
              border
              ${action.color}
              flex
              flex-col
              items-center
              justify-center
              text-center
              gap-2
              transition-all
              cursor-pointer
              hover:shadow-sm
              active:scale-[0.98]
              group
            `}
          >
            <div className="p-2 rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform">
              {action.icon}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-800">
                {action.label}
              </span>

              {action.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-indigo-600 text-white rounded-full uppercase">
                  {action.badge}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};