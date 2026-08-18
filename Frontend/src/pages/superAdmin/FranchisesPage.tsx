import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { mockFranchises, mockFranchiseAdmins } from '../../data/superAdminMockData';
import type { Franchise, FranchiseAdminUser } from '../../types/superAdmin';
import {
  Building2,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Edit,
  Power,
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  AlertTriangle
} from 'lucide-react';

interface FranchisesPageProps {
  onNavigate: (path: string) => void;
  onOpenAddFranchiseModal: () => void;
  subView?: 'all' | 'admins';
}

export const FranchisesPage: React.FC<FranchisesPageProps> = ({
  onNavigate,
  onOpenAddFranchiseModal,
  subView = 'all'
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'admins'>(subView);

  useEffect(() => {
    setActiveTab(subView);
  }, [subView]);

  const handleTabChange = (tab: 'all' | 'admins') => {
    setActiveTab(tab);
    onNavigate(tab === 'all' ? '/super-admin/franchises' : '/super-admin/franchise-admins');
  };

  const [franchisesList, setFranchisesList] = useState<Franchise[]>(mockFranchises);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Confirmation Modal state for Activate/Deactivate
  const [selectedFranchiseForToggle, setSelectedFranchiseForToggle] = useState<Franchise | null>(null);

  // Filtered List
  const filteredFranchises = franchisesList.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === 'All' || f.plan === planFilter;
    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleToggleStatus = () => {
    if (!selectedFranchiseForToggle) return;

    setFranchisesList(prev => prev.map(f => {
      if (f.id === selectedFranchiseForToggle.id) {
        const nextStatus = f.status === 'Active' ? 'Inactive' : 'Active';
        return { ...f, status: nextStatus };
      }
      return f;
    }));

    setSelectedFranchiseForToggle(null);
  };

  const totalCount = franchisesList.length;
  const activeCount = franchisesList.filter(f => f.status === 'Active').length;
  const inactiveCount = totalCount - activeCount;
  const basicCount = franchisesList.filter(f => f.plan === 'Basic').length;
  const proCount = franchisesList.filter(f => f.plan === 'Pro').length;
  const enterpriseCount = franchisesList.filter(f => f.plan === 'Enterprise').length;

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="blue" size="sm">SAAS MULTI-TENANCY</Badge>
            <span className="text-xs font-semibold text-slate-500">Franchise & School Directory</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Franchise Management
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage all schools onboarded onto the SaaS platform, assign franchise admins, and control access licenses.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={onOpenAddFranchiseModal}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Add Franchise School
        </Button>
      </div>

      {/* Summary KPI Pill Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3 text-center border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Schools</span>
          <span className="text-lg font-extrabold text-slate-900">{totalCount}</span>
        </Card>

        <Card className="p-3 text-center border-slate-200/80 bg-emerald-50/40">
          <span className="text-[10px] font-bold text-emerald-600 uppercase block">Active</span>
          <span className="text-lg font-extrabold text-emerald-800">{activeCount}</span>
        </Card>

        <Card className="p-3 text-center border-slate-200/80 bg-rose-50/40">
          <span className="text-[10px] font-bold text-rose-600 uppercase block">Inactive</span>
          <span className="text-lg font-extrabold text-rose-800">{inactiveCount}</span>
        </Card>

        <Card className="p-3 text-center border-slate-200/80">
          <span className="text-[10px] font-bold text-indigo-600 uppercase block">Basic Plan</span>
          <span className="text-lg font-extrabold text-slate-900">{basicCount}</span>
        </Card>

        <Card className="p-3 text-center border-slate-200/80">
          <span className="text-[10px] font-bold text-blue-600 uppercase block">Pro Plan</span>
          <span className="text-lg font-extrabold text-slate-900">{proCount}</span>
        </Card>

        <Card className="p-3 text-center border-slate-200/80">
          <span className="text-[10px] font-bold text-teal-600 uppercase block">Enterprise</span>
          <span className="text-lg font-extrabold text-slate-900">{enterpriseCount}</span>
        </Card>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-extrabold">
        <button
          onClick={() => handleTabChange('all')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>All Franchises ({totalCount})</span>
        </button>

        <button
          onClick={() => handleTabChange('admins')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'admins'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Franchise Admins ({mockFranchiseAdmins.length})</span>
        </button>
      </div>

      {/* TAB 1: ALL FRANCHISES */}
      {activeTab === 'all' && (
        <Card className="p-6 border-slate-200/80">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search school name, code, admin, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-slate-500">Plan:</span>
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none"
                >
                  <option value="All">All Plans</option>
                  <option value="Basic">Basic</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="p-3.5 rounded-l-xl">School Name & Code</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Plan</th>
                  <th className="p-3.5">Franchise Admin</th>
                  <th className="p-3.5">Students / Staff</th>
                  <th className="p-3.5">Contract</th>
                  <th className="p-3.5">Royalty</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFranchises.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-extrabold text-slate-900 text-sm">{f.name}</div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 inline-block mt-0.5">
                        {f.code}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{f.city}, {f.state}</div>
                      <span className="text-[10px] text-slate-400 block">{f.country}</span>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase ${
                        f.plan === 'Enterprise' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                        f.plan === 'Pro' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {f.plan}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{f.adminName}</div>
                      <div className="text-[11px] text-slate-500 truncate">{f.adminEmail}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-extrabold text-slate-900">{f.studentCount.toLocaleString()} Students</div>
                      <div className="text-[10px] text-slate-500">{f.teacherCount} Teachers</div>
                    </td>

                    <td className="p-3.5">
                      <Badge variant={f.contractStatus === 'Active' ? 'blue' : f.contractStatus === 'Expiring Soon' ? 'amber' : 'rose'} size="sm">
                        {f.contractStatus}
                      </Badge>
                    </td>

                    <td className="p-3.5">
                      <Badge variant={f.royaltyStatus === 'Paid' ? 'emerald' : f.royaltyStatus === 'Pending' ? 'amber' : 'rose'} size="sm">
                        {f.royaltyStatus}
                      </Badge>
                    </td>

                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                        f.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${f.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {f.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate(`/super-admin/franchises/${f.id}`)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        title="View Details"
                      >
                        View
                      </Button>

                      <button
                        onClick={() => setSelectedFranchiseForToggle(f)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          f.status === 'Active'
                            ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                        }`}
                        title={f.status === 'Active' ? 'Deactivate Franchise' : 'Activate Franchise'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: FRANCHISE ADMINS */}
      {activeTab === 'admins' && (
        <Card className="p-6 border-slate-200/80">
          <div className="mb-4">
            <h3 className="text-base font-extrabold text-slate-900">Assigned Franchise Administrators</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              School administrators provisioned by Super Admin to manage individual school dashboards.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="p-3.5 rounded-l-xl">Admin Name</th>
                  <th className="p-3.5">Email / Username</th>
                  <th className="p-3.5">Phone Number</th>
                  <th className="p-3.5">Associated School</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5">Last Login</th>
                  <th className="p-3.5 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockFranchiseAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-extrabold text-slate-900">{admin.name}</td>
                    <td className="p-3.5 font-medium text-slate-700">{admin.email}</td>
                    <td className="p-3.5 font-medium text-slate-600">{admin.phone}</td>
                    <td className="p-3.5 font-bold text-blue-600">{admin.schoolName}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[10px] uppercase">
                        {admin.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 text-[11px]">{admin.lastLogin}</td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                        admin.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${admin.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {admin.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Status Toggle Modal */}
      {selectedFranchiseForToggle && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedFranchiseForToggle(null)}
          title={`${selectedFranchiseForToggle.status === 'Active' ? 'Deactivate' : 'Activate'} Franchise`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-amber-900 leading-relaxed">
                Are you sure you want to {selectedFranchiseForToggle.status === 'Active' ? 'deactivate' : 'activate'} <strong>{selectedFranchiseForToggle.name}</strong>?
                {selectedFranchiseForToggle.status === 'Active' && ' This will temporarily suspend access for their Franchise Admin and staff.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setSelectedFranchiseForToggle(null)}>
                Cancel
              </Button>
              <Button
                variant={selectedFranchiseForToggle.status === 'Active' ? 'danger' : 'primary'}
                onClick={handleToggleStatus}
              >
                Confirm {selectedFranchiseForToggle.status === 'Active' ? 'Deactivation' : 'Activation'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
