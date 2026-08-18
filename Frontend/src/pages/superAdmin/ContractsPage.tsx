import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import api from '../../services/api';
import type { Contract, ContractStatus } from '../../types/superAdmin';
import {
  FileText,
  FileCheck2,
  Clock,
  FileX2,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2
} from 'lucide-react';
interface ContractsPageProps {
  onNavigate: (path: string) => void;
  subView?: 'all' | 'active' | 'expiring' | 'expired';
}

export const ContractsPage: React.FC<ContractsPageProps> = ({
  onNavigate,
  subView = 'all'
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expiring' | 'expired'>(subView);

  React.useEffect(() => {
    setActiveTab(subView);
  }, [subView]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as any);
    const path = tabId === 'all' ? '/super-admin/contracts' : `/super-admin/contracts/${tabId}`;
    onNavigate(path);
  };

  const [contractsList, setContractsList] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await api.get('/contracts');

        if (response.data.success) {
          const contracts = response.data.data.map((contract: any) => {
            const today = new Date();
            const endDate = new Date(contract.endDate);

            const diffTime = endDate.getTime() - today.getTime();
            const daysRemaining = Math.ceil(
              diffTime / (1000 * 60 * 60 * 24)
            );

            let status: ContractStatus;

            if (daysRemaining <= 0 || contract.status === 'EXPIRED') {
              status = 'Expired';
            } else if (daysRemaining <= 60) {
              status = 'Expiring Soon';
            } else {
              status = 'Active';
            }

            return {
              id: String(contract.id),
              contractNumber: contract.agreementNumber,
              schoolId: contract.franchiseId,
              schoolName: contract.franchise?.name || 'Unknown School',
              schoolCode: contract.franchise?.code || 'N/A',
              agreementTitle: contract.agreementType,
              startDate: contract.startDate,
              endDate: contract.endDate,
              durationMonths: 0,
              monthlyRoyalty: 0,
              plan: 'Basic',
              renewalStatus:
                contract.status === 'RENEWED'
                  ? 'Auto Renewal'
                  : 'Manual Renewal',
              status,
              daysRemaining,
              documentUrl: contract.documentUrl,
            };
          });

          setContractsList(contracts);
        }
      } catch (error) {
        console.error('Failed to fetch contracts:', error);
        showToast('Failed to load contracts');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  // Selected contract for View or Renew
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);
  const [renewingContract, setRenewingContract] = useState<Contract | null>(null);
  const [extensionMonths, setExtensionMonths] = useState<number>(24);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!renewingContract) return;

    try {
      const oldEndDate = new Date(renewingContract.endDate);

      const newStartDate = new Date(oldEndDate);
      newStartDate.setDate(newStartDate.getDate() + 1);

      const newEndDate = new Date(newStartDate);
      newEndDate.setMonth(newEndDate.getMonth() + extensionMonths);

      const formatDate = (date: Date) =>
        date.toISOString().split('T')[0];

      const response = await api.patch(
        `/contracts/${renewingContract.id}/renew`,
        {
          startDate: formatDate(newStartDate),
          endDate: formatDate(newEndDate),
        }
      );

      if (response.data.success) {
        showToast(
          `Contract ${renewingContract.contractNumber} renewed successfully!`
        );

        setRenewingContract(null);

        // Refresh contracts
        const refreshed = await api.get('/contracts');

        if (refreshed.data.success) {
          const contracts = refreshed.data.data.map((contract: any) => {
            const today = new Date();
            const endDate = new Date(contract.endDate);

            const diffTime = endDate.getTime() - today.getTime();

            const daysRemaining = Math.ceil(
              diffTime / (1000 * 60 * 60 * 24)
            );

            let status: ContractStatus;

            if (daysRemaining <= 0 || contract.status === 'EXPIRED') {
              status = 'Expired';
            } else if (daysRemaining <= 60) {
              status = 'Expiring Soon';
            } else {
              status = 'Active';
            }

            return {
              id: String(contract.id),
              contractNumber: contract.agreementNumber,
              schoolId: contract.franchiseId,
              schoolName: contract.franchise?.name || 'Unknown School',
              schoolCode: contract.franchise?.code || 'N/A',
              agreementTitle: contract.agreementType,
              startDate: contract.startDate,
              endDate: contract.endDate,
              durationMonths: 0,
              monthlyRoyalty: 0,
              plan: 'Basic',
              renewalStatus:
                contract.status === 'RENEWED'
                  ? 'Auto Renewal'
                  : 'Manual Renewal',
              status,
              daysRemaining,
              documentUrl: contract.documentUrl,
            };
          });

          setContractsList(contracts);
        }
      }
    } catch (error) {
      console.error('Renew contract error:', error);
      showToast('Failed to renew contract');
    }
  };

  const filteredContracts = contractsList.filter(c => {
    const matchesSearch = c.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.schoolCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'active') return matchesSearch && c.status === 'Active';
    if (activeTab === 'expiring') return matchesSearch && c.status === 'Expiring Soon';
    if (activeTab === 'expired') return matchesSearch && c.status === 'Expired';
    return matchesSearch;
  });

  const totalCount = contractsList.length;
  const activeCount = contractsList.filter(c => c.status === 'Active').length;
  const expiringCount = contractsList.filter(c => c.status === 'Expiring Soon').length;
  const expiredCount = contractsList.filter(c => c.status === 'Expired').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="blue" size="sm">SAAS CONTRACT OVERSIGHT</Badge>
            <span className="text-xs font-semibold text-slate-500">Franchise Agreements & Licensing</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Contract Management
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Review school franchise agreements, monitor contract expiry dates, and process license renewals.
          </p>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Contracts</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</div>
        </Card>

        <Card className="p-4 border-slate-200/80 bg-emerald-50/30">
          <span className="text-[10px] font-bold text-emerald-700 uppercase block">Active License Agreements</span>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1">{activeCount}</div>
        </Card>

        <Card className="p-4 border-slate-200/80 bg-amber-50/30">
          <span className="text-[10px] font-bold text-amber-700 uppercase block">Expiring Within 60 Days</span>
          <div className="text-2xl font-extrabold text-amber-800 mt-1">{expiringCount}</div>
        </Card>

        <Card className="p-4 border-slate-200/80 bg-rose-50/30">
          <span className="text-[10px] font-bold text-rose-700 uppercase block">Expired Contracts</span>
          <div className="text-2xl font-extrabold text-rose-800 mt-1">{expiredCount}</div>
        </Card>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-extrabold pb-0">
        {[
          { id: 'all', label: `All Contracts (${totalCount})`, icon: FileText },
          { id: 'active', label: `Active (${activeCount})`, icon: FileCheck2 },
          { id: 'expiring', label: `Expiring Soon (${expiringCount})`, icon: Clock, badge: 'Alert' },
          { id: 'expired', label: `Expired (${expiredCount})`, icon: FileX2 }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Table Card */}
      <Card className="p-6 border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search contract #, school name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                <th className="p-3.5 rounded-l-xl">School & Code</th>
                <th className="p-3.5">Contract ID</th>
                <th className="p-3.5">Agreement Title</th>
                <th className="p-3.5">Plan</th>
                <th className="p-3.5">Start Date</th>
                <th className="p-3.5">End Date</th>
                <th className="p-3.5">Days Left</th>
                <th className="p-3.5">Renewal Status</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContracts.map((c) => (
                <tr key={c.id} className={`hover:bg-slate-50/80 transition-colors ${c.status === 'Expiring Soon' ? 'bg-amber-50/30' : ''
                  }`}>
                  <td className="p-3.5">
                    <div className="font-extrabold text-slate-900">{c.schoolName}</div>
                    <span className="text-[10px] font-bold text-blue-600">{c.schoolCode}</span>
                  </td>

                  <td className="p-3.5 font-mono text-slate-700 font-bold">{c.contractNumber}</td>

                  <td className="p-3.5 text-slate-700 font-medium max-w-xs truncate">{c.agreementTitle}</td>

                  <td className="p-3.5 font-bold text-slate-800">{c.plan}</td>

                  <td className="p-3.5 text-slate-600">{c.startDate}</td>

                  <td className="p-3.5 text-slate-600 font-semibold">{c.endDate}</td>

                  <td className="p-3.5 font-extrabold">
                    <span className={c.daysRemaining < 60 ? 'text-amber-600 font-extrabold' : 'text-slate-900'}>
                      {c.daysRemaining > 0 ? `${c.daysRemaining} days` : 'Expired'}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px] text-slate-700">
                      {c.renewalStatus}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <Badge variant={c.status === 'Active' ? 'blue' : c.status === 'Expiring Soon' ? 'amber' : 'rose'}>
                      {c.status}
                    </Badge>
                  </td>

                  <td className="p-3.5 text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingContract(c)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      View
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setRenewingContract(c)}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    >
                      Renew
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* VIEW CONTRACT MODAL */}
      {viewingContract && (
        <Modal
          isOpen={true}
          onClose={() => setViewingContract(null)}
          title={`Contract Details: ${viewingContract.contractNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-slate-500">School Name:</span>
                <span className="font-extrabold text-slate-900 text-sm">{viewingContract.schoolName} ({viewingContract.schoolCode})</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-slate-500">Agreement Title:</span>
                <span className="font-bold text-slate-800">{viewingContract.agreementTitle}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-slate-500">SaaS Plan Tier:</span>
                <span className="font-bold text-blue-600">{viewingContract.plan} Tier</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-slate-500">Monthly Royalty Rate:</span>
                <span className="font-extrabold text-emerald-600">₹{viewingContract.monthlyRoyalty.toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-slate-500">Contract Start & End:</span>
                <span className="font-semibold text-slate-800">{viewingContract.startDate} to {viewingContract.endDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-500">Days Remaining:</span>
                <span className="font-extrabold text-indigo-700">{viewingContract.daysRemaining} Days</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={() => setViewingContract(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* RENEW CONTRACT MODAL */}
      {renewingContract && (
        <Modal
          isOpen={true}
          onClose={() => setRenewingContract(null)}
          title={`Renew Contract for ${renewingContract.schoolName}`}
          maxWidth="md"
        >
          <form onSubmit={handleRenewSubmit} className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs font-semibold text-blue-900">
              Contract #{renewingContract.contractNumber} is currently set to expire on {renewingContract.endDate}.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Select Renewal Extension Period</label>
              <select
                value={extensionMonths}
                onChange={(e) => setExtensionMonths(parseInt(e.target.value))}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none"
              >
                <option value={12}>12 Months (+ 1 Year Extension)</option>
                <option value={24}>24 Months (+ 2 Years Extension)</option>
                <option value={36}>36 Months (+ 3 Years Extension)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={() => setRenewingContract(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Confirm License Renewal
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
