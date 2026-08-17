import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import {
  mockRoyaltyRecords,
  mockRoyaltyConfigs,
  mockRevenueTrends,
  mockRoyaltyPaymentStatusData
} from '../../data/superAdminMockData';
import type { RoyaltyRecord, RoyaltyConfig, RoyaltyStatus } from '../../types/superAdmin';
import {
  BadgePercent,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  SlidersHorizontal,
  Download,
  Filter,
  Search,
  FileSpreadsheet,
  TrendingUp,
  Send,
  Calendar
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
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

  React.useEffect(() => {
    setActiveTab(subView);
  }, [subView]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as any);
    const path = tabId === 'overview' ? '/super-admin/royalty' : `/super-admin/royalty/${tabId}`;
    onNavigate(path);
  };

  const [royaltyList, setRoyaltyList] = useState<RoyaltyRecord[]>(mockRoyaltyRecords);
  const [configsList, setConfigsList] = useState<RoyaltyConfig[]>(mockRoyaltyConfigs);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Edit config modal state
  const [editingConfig, setEditingConfig] = useState<RoyaltyConfig | null>(null);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConfig) return;

    setConfigsList(prev => prev.map(c => c.id === editingConfig.id ? editingConfig : c));
    setEditingConfig(null);
    showNotification(`Royalty configuration updated for ${editingConfig.plan} plan!`);
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

  const totalBilled = royaltyList.reduce((acc, r) => acc + r.monthlyAmount, 0);
  const totalPaid = royaltyList.filter(r => r.status === 'Paid').reduce((acc, r) => acc + r.monthlyAmount, 0);
  const totalPending = royaltyList.filter(r => r.status === 'Pending').reduce((acc, r) => acc + r.monthlyAmount, 0);
  const totalOverdue = royaltyList.filter(r => r.status === 'Overdue').reduce((acc, r) => acc + r.monthlyAmount, 0);

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
          <span className="text-[11px] text-emerald-600 font-extrabold mt-1 block">Collection Rate: 72%</span>
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
              className={`pb-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                isActive
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
              <h3 className="text-base font-extrabold text-slate-900">Royalty Collection Trend</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Historical monthly royalty performance</p>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockRevenueTrends['6 Months']}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']} />
                    <Area type="monotone" dataKey="revenue" name="Billed Revenue" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
                    <Area type="monotone" dataKey="collected" name="Collected" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
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
                    <Pie data={mockRoyaltyPaymentStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                      {mockRoyaltyPaymentStatusData.map((e, idx) => (
                        <Cell key={idx} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                {mockRoyaltyPaymentStatusData.map(item => (
                  <div key={item.name} className="flex justify-between font-bold">
                    <span className="text-slate-600">{item.name}:</span>
                    <span className="text-slate-900">{item.amount} ({item.value}%)</span>
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">SaaS Royalty Rules & Tier Pricing</h3>
              <p className="text-xs text-slate-500 font-medium">Configure monthly royalty rates, due days, grace periods, and late fee penalties per subscription plan tier.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {configsList.map((cfg) => (
              <Card key={cfg.id} className="p-5 border-slate-200/80 hover:border-blue-300 transition-all flex flex-col justify-between bg-slate-50/50">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-lg font-extrabold text-xs uppercase ${
                      cfg.plan === 'Enterprise' ? 'bg-teal-100 text-teal-800' :
                      cfg.plan === 'Pro' ? 'bg-blue-100 text-blue-800' :
                      'bg-indigo-100 text-indigo-800'
                    }`}>
                      {cfg.plan} Plan Tier
                    </span>
                    <Badge variant={cfg.status === 'Active' ? 'emerald' : 'slate'}>{cfg.status}</Badge>
                  </div>

                  <div className="text-2xl font-extrabold text-slate-900 my-2">
                    ₹{cfg.monthlyRoyalty.toLocaleString('en-IN')} <span className="text-xs text-slate-500 font-normal">/ month</span>
                  </div>

                  <div className="space-y-2 text-xs font-semibold text-slate-600 pt-3 border-t border-slate-200/80">
                    <div className="flex justify-between">
                      <span>Billing Cycle:</span>
                      <strong className="text-slate-900">{cfg.billingCycle}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Due Day:</span>
                      <strong className="text-slate-900">{cfg.dueDay}th of month</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Grace Period:</span>
                      <strong className="text-slate-900">{cfg.gracePeriodDays} Days</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Late Fee Penalty:</span>
                      <strong className="text-rose-600">{cfg.lateFeePercentage}% / month</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/80">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => setEditingConfig(cfg)}
                  >
                    Edit Tier Configuration
                  </Button>
                </div>
              </Card>
            ))}
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
                {getFilteredRecords(
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
                ))}
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
                <option>Current Quarter (Q3 2026)</option>
                <option>Last Quarter (Q2 2026)</option>
                <option>Full Year 2026</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">School / Franchise</label>
              <select className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800">
                <option>All Schools (24)</option>
                {mockRoyaltyRecords.map(r => (
                  <option key={r.id}>{r.schoolName}</option>
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

      {/* EDIT CONFIG MODAL */}
      {editingConfig && (
        <Modal
          isOpen={true}
          onClose={() => setEditingConfig(null)}
          title={`Edit ${editingConfig.plan} Plan Royalty Config`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <Input
              label="Monthly Royalty Amount (₹)"
              type="number"
              value={editingConfig.monthlyRoyalty.toString()}
              onChange={(e) => setEditingConfig({ ...editingConfig, monthlyRoyalty: parseInt(e.target.value) || 0 })}
              required
            />

            <Input
              label="Due Day of Month"
              type="number"
              value={editingConfig.dueDay.toString()}
              onChange={(e) => setEditingConfig({ ...editingConfig, dueDay: parseInt(e.target.value) || 5 })}
              required
            />

            <Input
              label="Grace Period (Days)"
              type="number"
              value={editingConfig.gracePeriodDays.toString()}
              onChange={(e) => setEditingConfig({ ...editingConfig, gracePeriodDays: parseInt(e.target.value) || 5 })}
              required
            />

            <Input
              label="Late Penalty (%)"
              type="number"
              value={editingConfig.lateFeePercentage.toString()}
              onChange={(e) => setEditingConfig({ ...editingConfig, lateFeePercentage: parseFloat(e.target.value) || 0 })}
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={() => setEditingConfig(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Configuration
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
