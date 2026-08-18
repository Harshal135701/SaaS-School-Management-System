import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  mockFranchises,
  mockRevenueTrends,
  mockRoyaltyPaymentStatusData,
  mockFranchiseGrowthData,
  mockPlanDistributionData,
  mockContractOverviewData
} from '../../data/superAdminMockData';
import type { Franchise } from '../../types/superAdmin';
import {
  Building2,
  CheckCircle2,
  GraduationCap,
  IndianRupee,
  FileCheck2,
  Search,
  Filter,
  PlusCircle,
  TrendingUp,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  Sparkles,
  Globe,
  UserPlus
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface SuperAdminDashboardPageProps {
  onNavigate: (path: string) => void;
  onOpenAddSchoolModal: () => void;
  onOpenAddAdminModal: () => void;
  onEditFranchise?: (franchise: Franchise) => void;
  franchiseList?: Franchise[];
}

export const SuperAdminDashboardPage: React.FC<SuperAdminDashboardPageProps> = ({
  onNavigate,
  onOpenAddSchoolModal,
  onOpenAddAdminModal,
  onEditFranchise,
  franchiseList
}) => {
  const [timeRange, setTimeRange] = useState<'6 Months' | '12 Months' | 'This Year'>('6 Months');
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('All');
  const [localFranchises, setLocalFranchises] = useState<Franchise[]>(franchiseList || mockFranchises);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const franchises = franchiseList || localFranchises;

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const filteredFranchises = franchises.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === 'All' || f.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const handleDelete = (id: string) => {
    setLocalFranchises(prev => prev.filter(f => f.id !== id));
    setDeleteConfirmId(null);
  };

  const activeFranchisesCount = franchises.filter(f => f.status === 'Active').length;
  const inactiveFranchisesCount = franchises.filter(f => f.status === 'Inactive').length;

  // 4 Core clean KPI cards (uncluttered & high impact)
  const coreKpis = [
    {
      title: 'TOTAL FRANCHISES',
      value: `${franchises.length}`,
      subtext: `${activeFranchisesCount} Active · ${inactiveFranchisesCount} Inactive`,
      change: '+12.5%',
      isPositive: true,
      icon: Building2,
      color: 'blue'
    },
    {
      title: 'MONTHLY ROYALTY',
      value: '₹8,45,000',
      subtext: '₹1,25,000 pending grace',
      change: '+8.5%',
      isPositive: true,
      icon: IndianRupee,
      color: 'emerald'
    },
    {
      title: 'NETWORK STUDENTS & STAFF',
      value: '18,450',
      subtext: '1,240 active educators',
      change: '+14.2%',
      isPositive: true,
      icon: GraduationCap,
      color: 'purple'
    },
    {
      title: 'ACTIVE CONTRACTS',
      value: '21 / 24',
      subtext: '3 renewals due in 60d',
      change: '87.5%',
      isPositive: true,
      icon: FileCheck2,
      color: 'indigo'
    }
  ];

  return (
    <div className="space-y-8">

      {/* ── 1. HERO BANNER ── */}
      <div className="relative w-full rounded-3xl overflow-hidden hero-gradient p-6 md:p-8 text-white shadow-xl shadow-blue-600/15 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-12 -translate-y-12" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md font-semibold text-white/90 border border-white/20">
              <Calendar className="w-3.5 h-3.5 text-blue-200" />
              {todayDateString}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 backdrop-blur-md font-semibold text-emerald-200 border border-emerald-300/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              SaaS Multi-Tenant Live
            </span>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Super Admin Dashboard 🛡️
            </h1>
            <p className="text-xs md:text-sm font-medium text-blue-100/90 mt-1 max-w-xl leading-relaxed">
              Real-time platform overview across <strong className="text-white font-bold">{franchises.length} franchise schools</strong>, royalty collections, and contract agreements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-sm text-xs font-semibold text-white">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              Revenue up <strong className="text-white font-bold">+8.5%</strong> this month
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-sm text-xs font-semibold text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {activeFranchisesCount} Operational Schools
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-sm text-xs font-semibold text-white">
              <Globe className="w-3.5 h-3.5 text-blue-300" />
              Centralized Control
            </span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
          <Button
            variant="primary"
            size="md"
            onClick={onOpenAddSchoolModal}
            leftIcon={<PlusCircle className="w-4 h-4" />}
            className="bg-white text-blue-700 hover:bg-blue-50 border-white shadow-lg font-bold"
          >
            Add Franchise School
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onOpenAddAdminModal}
            leftIcon={<UserPlus className="w-4 h-4" />}
            className="bg-white/15 hover:bg-white/25 text-white border-white/30 font-bold"
          >
            Add Franchise Admin
          </Button>
        </div>
      </div>

      {/* ── 2. PRIMARY ANALYTICS ROW (GRAPHS AT START) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <Card hoverLift className="lg:col-span-2 p-6 border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Royalty Revenue Trend</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Monthly collected royalty vs total invoiced billings</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['6 Months', '12 Months', 'This Year'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    timeRange === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRevenueTrends[timeRange]}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
                <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']} contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="revenue" name="Total Invoiced" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="collected" name="Collected Royalty" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCollected)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Royalty Payment Status Donut */}
        <Card hoverLift className="p-6 border-slate-200/80 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Royalty Payment Status</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Current month collection compliance</p>
          </div>
          <div className="h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mockRoyaltyPaymentStatusData} cx="50%" cy="50%" innerRadius={52} outerRadius={76} paddingAngle={4} dataKey="value">
                  {mockRoyaltyPaymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {mockRoyaltyPaymentStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{item.amount}</span>
                  <span className="font-extrabold text-slate-900">({item.value}%)</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── 3. CLEAN 4 CORE KPI METRICS ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Key SaaS Platform Performance
          </h2>
          <span className="text-xs font-semibold text-slate-400">Live Metric Stream</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {coreKpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <Card key={idx} hoverLift className="p-5 flex flex-col justify-between border-slate-200/80">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 truncate pr-1">
                    {kpi.title}
                  </span>
                  <div className={`p-2 rounded-xl text-white shadow-xs shrink-0 ${
                    kpi.color === 'emerald' ? 'bg-emerald-500' :
                    kpi.color === 'purple' ? 'bg-purple-500' :
                    kpi.color === 'indigo' ? 'bg-indigo-500' :
                    'bg-blue-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {kpi.value}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-medium text-slate-500 truncate">{kpi.subtext}</span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 ${
                      kpi.isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                    }`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── 4. SECONDARY INSIGHTS (SPACIOUS 2-COLUMN) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Franchise Growth & Plans */}
        <Card hoverLift className="p-6 border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Franchise Growth & Subscriptions</h3>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                {franchises.length} Total Schools
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-4">Cumulative franchise expansion and tier distribution</p>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockFranchiseGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val: any) => [`${val} Active Schools`, 'Active']} />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center pt-4 border-t border-slate-100 mt-2">
            {mockPlanDistributionData.map(p => (
              <div key={p.name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">{p.name} Plan</span>
                <span className="text-sm font-extrabold text-slate-900">{p.value} schools</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Contract & Agreement Overview */}
        <Card hoverLift className="p-6 border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Contract Status & Renewals</h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                87.5% Active Rate
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-4">Active contracts, upcoming renewals and expired agreements</p>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockContractOverviewData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {mockContractOverviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs font-semibold text-blue-900 mt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>3 Franchise contracts up for renewal within the next 60 days</span>
            </div>
            <button
              onClick={() => onNavigate('/super-admin/contracts')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 underline shrink-0 cursor-pointer"
            >
              View Contracts
            </button>
          </div>
        </Card>
      </div>

      {/* ── 5. FRANCHISE SCHOOLS TABLE WITH CRUD ── */}
      <Card hoverLift className="p-6 border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Franchise Schools Directory
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage all enrolled franchise schools — view credentials, edit subscription plans, or remove
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search school or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 w-52 transition-all"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />
              <span className="text-slate-500 text-[11px]">Plan:</span>
              {(['All', 'Basic', 'Pro', 'Enterprise'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPlanFilter(p)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    planFilter === p ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/super-admin/franchises')}
            >
              View All ({franchises.length})
            </Button>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
              onClick={onOpenAddSchoolModal}
            >
              Add School
            </Button>
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
                <th className="p-3.5">Contract</th>
                <th className="p-3.5">Royalty</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFranchises.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-sm font-semibold">
                    No franchise schools found matching your search.
                  </td>
                </tr>
              ) : (
                filteredFranchises.map((f) => (
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
                      <div className="font-bold text-slate-900">{f.adminName || '—'}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{f.adminEmail || 'No admin assigned'}</div>
                    </td>

                    <td className="p-3.5">
                      <Badge variant={f.contractStatus === 'Active' ? 'blue' : f.contractStatus === 'Expiring Soon' ? 'amber' : 'rose'} size="sm">
                        {f.contractStatus}
                      </Badge>
                    </td>

                    <td className="p-3.5">
                      <Badge variant={f.royaltyStatus === 'Paid' ? 'emerald' : f.royaltyStatus === 'Pending' ? 'amber' : 'rose'} size="sm">
                        {f.royaltyStatus} (₹{(f.monthlyRoyalty / 1000).toFixed(0)}k)
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

                    <td className="p-3.5 text-right">
                      {deleteConfirmId === f.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-600">Delete?</span>
                          <button
                            onClick={() => handleDelete(f.id)}
                            className="px-2 py-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-lg hover:bg-rose-600 transition-colors cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 bg-slate-200 text-slate-700 text-[10px] font-extrabold rounded-lg hover:bg-slate-300 transition-colors cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigate(`/super-admin/franchises/${f.id}`)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            View
                          </Button>
                          <button
                            onClick={() => onEditFranchise && onEditFranchise(f)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit School"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(f.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete School"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
