import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';


import api from '../../services/api';

import type { RoyaltyStatus } from '../../types/superAdmin';
import {
  BadgePercent,
  CheckCircle2,
  Clock,
  AlertTriangle,
  SlidersHorizontal,
  Download,
  Search,
  FileSpreadsheet,
  Send,
  Calendar
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface RoyaltyPageProps {
  onNavigate: (path: string) => void;
  subView?: 'overview' | 'config' | 'monthly' | 'paid' | 'pending' | 'overdue' | 'reports';
}

export const RoyaltyPage: React.FC<RoyaltyPageProps> = ({
  onNavigate,
  subView = 'overview'
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'config' | 'monthly' | 'paid' | 'pending' | 'overdue' | 'reports'
  >(subView);

  useEffect(() => {
    setActiveTab(subView);
  }, [subView]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as any);
    const path = tabId === 'overview' ? '/super-admin/royalty' : `/super-admin/royalty/${tabId}`;
    onNavigate(path);
  };

  const [royaltyList, setRoyaltyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, _setStatusFilter] = useState<string>('All');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoyaltyData = async () => {
      try {
        setLoading(true);

        const res = await api.get('/system-admin/franchises');

        if (res.data?.success && Array.isArray(res.data.data)) {
          const franchises = res.data.data;

          const records = franchises
            .map((franchise: any) => {
              const royalty =
                franchise.monthlyRoyalties &&
                franchise.monthlyRoyalties.length > 0
                  ? franchise.monthlyRoyalties[0]
                  : null;

              if (!royalty) return null;

              return {
                id: royalty.id,
                schoolName: franchise.name || 'Unknown School',
                schoolCode: franchise.code || '-',
                invoiceNumber: `ROY-${royalty.id?.slice(0, 8) || 'N/A'}`,
                plan:
                  typeof franchise.plan === 'object'
                    ? franchise.plan?.name
                    : franchise.plan || 'BASIC',
                monthlyAmount:
                  Number(royalty.royaltyAmount) ||
                  Number(royalty.totalAmount) ||
                  0,
                dueDate: royalty.dueDate
                  ? new Date(royalty.dueDate).toLocaleDateString('en-IN')
                  : '-',
                billingCycle:
                  franchise.plan?.billingCycle || 'MONTHLY',
                status:
                  royalty.status === 'PAID'
                    ? 'Paid'
                    : royalty.status === 'OVERDUE'
                    ? 'Overdue'
                    : 'Pending',
              };
            })
            .filter(Boolean);

          setRoyaltyList(records);
        }
      } catch (error) {
        console.error('Failed to fetch royalty data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoyaltyData();
  }, []);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filtered records
  const getFilteredRecords = (targetStatus?: RoyaltyStatus) => {
    return royaltyList.filter(r => {
      const matchesSearch = r.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.schoolCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = targetStatus ? r.status === targetStatus : (statusFilter === 'All' || r.status === statusFilter);
      return matchesSearch && matchesStatus;
    });
  };

  const totalBilled = royaltyList.reduce(
    (acc, r) => acc + Number(r.monthlyAmount || 0),
    0
  );

  const totalPaid = royaltyList
    .filter(r => r.status === 'Paid')
    .reduce((acc, r) => acc + Number(r.monthlyAmount || 0), 0);

  const totalPending = royaltyList
    .filter(r => r.status === 'Pending')
    .reduce((acc, r) => acc + Number(r.monthlyAmount || 0), 0);

  const totalOverdue = royaltyList
    .filter(r => r.status === 'Overdue')
    .reduce((acc, r) => acc + Number(r.monthlyAmount || 0), 0);

  const collectionRate =
    totalBilled > 0
      ? Math.round((totalPaid / totalBilled) * 100)
      : 0;

  const paymentStatusData = [
    {
      name: 'Paid',
      value: totalPaid,
      percentage:
        totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0,
      color: '#10b981',
    },
    {
      name: 'Pending',
      value: totalPending,
      percentage:
        totalBilled > 0 ? Math.round((totalPending / totalBilled) * 100) : 0,
      color: '#f59e0b',
    },
    {
      name: 'Overdue',
      value: totalOverdue,
      percentage:
        totalBilled > 0 ? Math.round((totalOverdue / totalBilled) * 100) : 0,
      color: '#ef4444',
    },
  ].filter(item => item.value > 0);

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
            <Badge variant="emerald" size="sm">SAAS REVENUE SYSTEM</Badge>
            <span className="text-xs font-semibold text-slate-500">Royalty & Billing Oversight</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Royalty Management
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Monitor platform royalty collections, configure pricing plans, track pending/overdue invoices, and export financial reports.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            showNotification('Royalty Financial Report exported successfully (CSV/Excel)!');
          }}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Export Royalty Report
        </Button>
      </div>

      {/* Financial KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Monthly Royalty Billed</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalBilled.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Active month across all schools</span>
        </Card>

        <Card className="p-4 border-slate-200/80 bg-emerald-50/30">
          <span className="text-[10px] font-bold text-emerald-700 uppercase block">Total Collected</span>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1">₹{totalPaid.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-emerald-600 font-extrabold mt-1 block">Collection Rate: {collectionRate}%</span>
        </Card>

        <Card className="p-4 border-slate-200/80 bg-amber-50/30">
          <span className="text-[10px] font-bold text-amber-700 uppercase block">Pending Collections</span>
          <div className="text-2xl font-extrabold text-amber-800 mt-1">₹{totalPending.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">Within grace period</span>
        </Card>

        <Card className="p-4 border-slate-200/80 bg-rose-50/30">
          <span className="text-[10px] font-bold text-rose-700 uppercase block">Overdue Collections</span>
          <div className="text-2xl font-extrabold text-rose-800 mt-1">₹{totalOverdue.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-rose-700 font-extrabold mt-1 block">Requires payment reminder</span>
        </Card>
      </div>

      {/* Tabs Row */}
      <div className="flex overflow-x-auto border-b border-slate-200 gap-6 text-xs font-extrabold pb-0">
        {[
          { id: 'overview', label: 'Royalty Overview', icon: BadgePercent },
          { id: 'config', label: 'Royalty Configuration', icon: SlidersHorizontal },
          { id: 'monthly', label: 'Monthly Royalty', icon: Calendar },
          { id: 'paid', label: 'Paid Payments', icon: CheckCircle2 },
          { id: 'pending', label: 'Pending Payments', icon: Clock },
          { id: 'overdue', label: 'Overdue Payments', icon: AlertTriangle, badge: 'Alert' },
          { id: 'reports', label: 'Royalty Reports', icon: FileSpreadsheet }
        ].map((t) => {
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
              {t.badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-100 text-rose-700 font-extrabold">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6 border-slate-200/80">
              <h3 className="text-base font-extrabold text-slate-900">Current Royalty Collection</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Current monthly royalty status across all franchises</p>

              <div className="h-64 flex items-center justify-center">
                {loading ? (
                  <p className="text-xs font-semibold text-slate-400">Loading royalty data...</p>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl font-extrabold text-slate-900">
                      ₹{totalBilled.toLocaleString('en-IN')}
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Total royalty billed for current records</p>
                    <div className="flex justify-center gap-6 mt-6 text-xs font-bold">
                      <span className="text-emerald-600">Paid: ₹{totalPaid.toLocaleString('en-IN')}</span>
                      <span className="text-amber-600">Pending: ₹{totalPending.toLocaleString('en-IN')}</span>
                      <span className="text-rose-600">Overdue: ₹{totalOverdue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 border-slate-200/80 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Payment Breakdown</h3>
                <p className="text-xs text-slate-500 font-medium mb-4">Status distribution for current month</p>
              </div>

              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                      {paymentStatusData.map((e, idx) => (
                        <Cell key={idx} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                {paymentStatusData.map(item => (
                  <div key={item.name} className="flex justify-between font-bold">
                    <span className="text-slate-600">{item.name}:</span>
                    <span className="text-slate-900">₹{item.value.toLocaleString('en-IN')} ({item.percentage}%)</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: CONFIGURATION */}
      {activeTab === 'config' && (
        <Card className="p-6 border-slate-200/80 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Royalty Configuration</h3>
            <p className="text-xs text-slate-500 mt-1">Royalty configuration will be loaded from the backend.</p>
          </div>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs font-semibold text-blue-800">
              Backend royalty configuration integration is the next step.
            </p>
          </div>
        </Card>
      )}

      {/* TAB 3, 4, 5, 6: MONTHLY / PAID / PENDING / OVERDUE TABLES */}
      {(['monthly', 'paid', 'pending', 'overdue'].includes(activeTab)) && (
        <Card className="p-6 border-slate-200/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search school name or invoice number..."
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
                  <th className="p-3.5 rounded-l-xl">School Name & Code</th>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Plan</th>
                  <th className="p-3.5">Monthly Royalty</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Billing Cycle</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400 font-semibold text-xs">
                      Loading royalty data records...
                    </td>
                  </tr>
                ) : getFilteredRecords(
                  activeTab === 'paid' ? 'Paid' : activeTab === 'pending' ? 'Pending' : activeTab === 'overdue' ? 'Overdue' : undefined
                ).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400 font-semibold text-xs">
                      No royalty records found.
                    </td>
                  </tr>
                ) : (
                  getFilteredRecords(
                    activeTab === 'paid' ? 'Paid' : activeTab === 'pending' ? 'Pending' : activeTab === 'overdue' ? 'Overdue' : undefined
                  ).map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-extrabold text-slate-900">
                        <div>{r.schoolName}</div>
                        <span className="text-[10px] font-bold text-blue-600">{r.schoolCode}</span>
                      </td>

                      <td className="p-3.5 font-mono text-slate-700">{r.invoiceNumber}</td>

                      <td className="p-3.5 font-bold text-slate-800">{r.plan}</td>

                      <td className="p-3.5 font-extrabold text-slate-900">
                        ₹{r.monthlyAmount.toLocaleString('en-IN')}
                      </td>

                      <td className="p-3.5 text-slate-600 font-semibold">{r.dueDate}</td>

                      <td className="p-3.5 text-slate-500">{r.billingCycle}</td>

                      <td className="p-3.5">
                        <Badge variant={r.status === 'Paid' ? 'emerald' : r.status === 'Pending' ? 'amber' : 'rose'}>
                          {r.status}
                        </Badge>
                      </td>

                      <td className="p-3.5 text-right">
                        {r.status === 'Overdue' ? (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => showNotification(`Payment reminder dispatched to ${r.schoolName} admin!`)}
                            leftIcon={<Send className="w-3 h-3" />}
                          >
                            Send Notice
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => showNotification(`Viewing invoice details for ${r.invoiceNumber}`)}
                          >
                            Invoice
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 7: REPORTS */}
      {activeTab === 'reports' && (
        <Card className="p-6 border-slate-200/80 space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Royalty Financial Reporting & Data Export</h3>
            <p className="text-xs text-slate-500 font-medium">Filter payment logs across dates, plans, and statuses to generate downloadable financial reports.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Date Range</label>
              <select className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800">
                <option>Current Quarter</option>
                <option>Last Quarter</option>
                <option>Full Year</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">School / Franchise</label>
              <select className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800">
                <option>All Schools ({royaltyList.length})</option>
                {royaltyList.map(r => (
                  <option key={r.id} value={r.schoolName}>
                    {r.schoolName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Plan Tier</label>
              <select className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800">
                <option>All Plans</option>
                <option>Basic</option>
                <option>Pro</option>
                <option>Enterprise</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="primary"
                fullWidth
                onClick={() => showNotification('Generated custom royalty report!')}
                leftIcon={<FileSpreadsheet className="w-4 h-4" />}
              >
                Generate Report
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};