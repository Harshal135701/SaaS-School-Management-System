import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

import {
  mockRevenueTrends,
  mockRoyaltyPaymentStatusData,
  mockFranchiseGrowthData,
  mockPlanDistributionData,
  mockContractOverviewData
} from '../../data/superAdminMockData';

import {
  Building2,
  CheckCircle2,
  XCircle,
  Users,
  Search,
  Filter,
  PlusCircle,
  TrendingUp,
  Eye
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
  onOpenAddFranchiseModal: () => void;
}

export const SuperAdminDashboardPage: React.FC<
  SuperAdminDashboardPageProps
> = ({
  onNavigate,
  onOpenAddFranchiseModal
}) => {
  const [timeRange, setTimeRange] = useState<
    '6 Months' | '12 Months' | 'This Year'
  >('6 Months');

  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('All');

  const [franchises, setFranchises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    totalFranchises: 0,
    activeFranchises: 0,
    inactiveFranchises: 0,
    totalFranchiseAdmins: 0
  });

  // ================================
  // FETCH DASHBOARD DATA
  // ================================

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashboardResponse, franchisesResponse] =
          await Promise.all([
            api.get('/system-admin/dashboard'),
            api.get('/system-admin/franchises')
          ]);

        if (dashboardResponse.data.success) {
          setDashboardData(dashboardResponse.data.data);
        }

        if (franchisesResponse.data.success) {
          setFranchises(franchisesResponse.data.data);
        }
      } catch (error) {
        console.error(
          'Failed to fetch dashboard data:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ================================
  // FILTER FRANCHISES
  // ================================

  const filteredFranchises = franchises.filter((f) => {
    const matchesSearch =
      f.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      f.code
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      f.city
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesPlan =
      planFilter === 'All' ||
      f.plan?.name?.toLowerCase() ===
        planFilter.toLowerCase();

    return matchesSearch && matchesPlan;
  });

  // ================================
  // KPI DATA
  // ================================

  const kpiData = [
    {
      title: 'TOTAL FRANCHISES',
      value: dashboardData.totalFranchises,
      subtext: 'across all regions',
      icon: Building2,
      color: 'blue'
    },
    {
      title: 'ACTIVE FRANCHISES',
      value: dashboardData.activeFranchises,
      subtext: 'operational schools',
      icon: CheckCircle2,
      color: 'emerald'
    },
    {
      title: 'INACTIVE FRANCHISES',
      value: dashboardData.inactiveFranchises,
      subtext: 'needs follow-up',
      icon: XCircle,
      color: 'rose'
    },
    {
      title: 'FRANCHISE ADMINS',
      value: dashboardData.totalFranchiseAdmins,
      subtext: 'registered admins',
      icon: Users,
      color: 'indigo'
    }
  ];

  return (
    <div className="space-y-8">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800">

        <div>
          <div className="flex items-center gap-2">
            <Badge
              variant="indigo"
              size="sm"
            >
              SAAS PLATFORM OVERVIEW
            </Badge>

            <span className="text-xs font-semibold text-slate-400">
              • Multi-School Enterprise
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2 text-white">
            Super Admin Platform Dashboard
          </h1>

          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl font-medium">
            Real-time business performance analytics,
            franchise operations, royalty collections,
            and contract statuses across all enrolled
            schools.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <Button
            variant="secondary"
            size="md"
            onClick={() =>
              onNavigate('/super-admin/royalty')
            }
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Royalty Reports
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onOpenAddFranchiseModal}
            leftIcon={
              <PlusCircle className="w-4 h-4" />
            }
          >
            Add New School
          </Button>

        </div>
      </div>

      {/* =========================================
          KPI CARDS
      ========================================= */}

      <div>

        <div className="flex items-center justify-between mb-4">

          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">

            <TrendingUp className="w-5 h-5 text-blue-600" />

            Key SaaS Metrics & Performance KPIs

          </h2>

          <span className="text-xs font-semibold text-slate-500">
            {loading
              ? 'Loading...'
              : 'Live Data'}
          </span>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {kpiData.map((kpi, idx) => {

            const Icon = kpi.icon;

            return (
              <Card
                key={idx}
                hover
                className="p-4 flex flex-col justify-between border-slate-200/80"
              >

                <div className="flex items-center justify-between mb-3">

                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 truncate">
                    {kpi.title}
                  </span>

                  <div
                    className={`p-2 rounded-xl text-white shadow-xs shrink-0 ${
                      kpi.color === 'emerald'
                        ? 'bg-emerald-600'
                        : kpi.color === 'indigo'
                        ? 'bg-indigo-600'
                        : kpi.color === 'rose'
                        ? 'bg-rose-600'
                        : 'bg-blue-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                </div>

                <div>

                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {kpi.value}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500">
                      {kpi.subtext}
                    </span>
                  </div>

                </div>

              </Card>
            );
          })}

        </div>
      </div>

      {/* =========================================
          CHARTS ROW
      ========================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ROYALTY REVENUE TREND */}

        <Card className="lg:col-span-2 p-6 border-slate-200/80">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

            <div>

              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Royalty Revenue Trend
              </h3>

              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Monthly collected vs total billed royalty
                revenue across all franchises
              </p>

            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">

              {(
                [
                  '6 Months',
                  '12 Months',
                  'This Year'
                ] as const
              ).map((t) => (

                <button
                  key={t}
                  onClick={() =>
                    setTimeRange(t)
                  }
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    timeRange === t
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>

              ))}

            </div>

          </div>

          <div className="h-72 w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <AreaChart
                data={
                  mockRevenueTrends[
                    timeRange
                  ]
                }
              >

                <defs>

                  <linearGradient
                    id="colorRevenue"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#2563eb"
                      stopOpacity={0.4}
                    />

                    <stop
                      offset="95%"
                      stopColor="#2563eb"
                      stopOpacity={0}
                    />
                  </linearGradient>

                  <linearGradient
                    id="colorCollected"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#10b981"
                      stopOpacity={0.4}
                    />

                    <stop
                      offset="95%"
                      stopColor="#10b981"
                      stopOpacity={0}
                    />
                  </linearGradient>

                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 12,
                    fill: '#64748b'
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 11,
                    fill: '#64748b'
                  }}
                  tickFormatter={(v) =>
                    `₹${(
                      v / 100000
                    ).toFixed(1)}L`
                  }
                />

                <Tooltip
                  formatter={(value: any) => [
                    `₹${Number(
                      value
                    ).toLocaleString(
                      'en-IN'
                    )}`,
                    ''
                  ]}
                />

                <Legend iconType="circle" />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Total Billed"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />

                <Area
                  type="monotone"
                  dataKey="collected"
                  name="Collected Royalty"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCollected)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </Card>

        {/* ROYALTY PAYMENT STATUS */}

        <Card className="p-6 border-slate-200/80 flex flex-col justify-between">

          <div>

            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Royalty Payment Status
            </h3>

            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Current month payment compliance
              distribution
            </p>

          </div>

          <div className="h-56 my-2">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={
                    mockRoyaltyPaymentStatusData
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >

                  {mockRoyaltyPaymentStatusData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    )
                  )}

                </Pie>

                <Tooltip
                  formatter={(val: any) => [
                    `${val}%`,
                    'Percentage'
                  ]}
                />

              </PieChart>

            </ResponsiveContainer>

          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">

            {mockRoyaltyPaymentStatusData.map(
              (item) => (

                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs font-semibold"
                >

                  <div className="flex items-center gap-2">

                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          item.color
                      }}
                    />

                    <span className="text-slate-700">
                      {item.name}
                    </span>

                  </div>

                  <div className="flex items-center gap-2">

                    <span className="text-slate-500">
                      {item.amount}
                    </span>

                    <span className="font-extrabold text-slate-900">
                      ({item.value}%)
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        </Card>

      </div>

      {/* =========================================
          SECOND CHART ROW
      ========================================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* PLAN DISTRIBUTION */}

        <Card className="p-6 border-slate-200/80">

          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Subscription Plan Distribution
          </h3>

          <p className="text-xs text-slate-500 font-medium mt-0.5 mb-4">
            Breakdown by Basic, Pro, Enterprise tiers
          </p>

          <div className="h-48">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={
                    mockPlanDistributionData
                  }
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                >

                  {mockPlanDistributionData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    )
                  )}

                </Pie>

                <Tooltip
                  formatter={(val: any) => [
                    `${val} Schools`,
                    'Count'
                  ]}
                />

              </PieChart>

            </ResponsiveContainer>

          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-100">

            {mockPlanDistributionData.map(
              (p) => (

                <div
                  key={p.name}
                  className="p-2 rounded-xl bg-slate-50"
                >

                  <span className="text-[10px] font-bold text-slate-500 block uppercase">
                    {p.name}
                  </span>

                  <span className="text-sm font-extrabold text-slate-900">
                    {p.value} schools
                  </span>

                </div>

              )
            )}

          </div>

        </Card>

        {/* FRANCHISE GROWTH */}

        <Card className="p-6 border-slate-200/80">

          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Franchise Growth Rate
          </h3>

          <p className="text-xs text-slate-500 font-medium mt-0.5 mb-4">
            Cumulative active schools onboarded over time
          </p>

          <div className="h-56">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={
                  mockFranchiseGrowthData
                }
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </Card>

        {/* CONTRACT OVERVIEW */}

        <Card className="p-6 border-slate-200/80">

          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Contract Status Overview
          </h3>

          <p className="text-xs text-slate-500 font-medium mt-0.5 mb-4">
            Active vs Expiring vs Expired license contracts
          </p>

          <div className="h-56">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={
                  mockContractOverviewData
                }
                layout="vertical"
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f1f5f9"
                />

                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />

                <YAxis
                  type="category"
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  width={90}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  radius={[0, 6, 6, 0]}
                >

                  {mockContractOverviewData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    )
                  )}

                </Bar>

              </BarChart>

            </ResponsiveContainer>

          </div>

        </Card>

      </div>

      {/* =========================================
          FRANCHISE TABLE
      ========================================= */}

      <Card className="p-6 border-slate-200/80">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

          <div>

            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Recent Franchises & Enrolled Schools
            </h3>

            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live status of schools on the SaaS platform
            </p>

          </div>

          {/* SEARCH + FILTER */}

          <div className="flex flex-wrap items-center gap-3">

            <div className="relative">

              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />

              <input
                type="text"
                placeholder="Search school name or code..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                className="pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">

              <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />

              <span className="text-slate-500 text-[11px]">
                Plan:
              </span>

              {(
                [
                  'All',
                  'Basic',
                  'Pro',
                  'Enterprise'
                ] as const
              ).map((p) => (

                <button
                  key={p}
                  onClick={() =>
                    setPlanFilter(p)
                  }
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    planFilter === p
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600'
                  }`}
                >
                  {p}
                </button>

              ))}

            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onNavigate(
                  '/super-admin/franchises'
                )
              }
            >
              View All ({franchises.length})
            </Button>

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full text-left text-xs font-medium border-collapse">

            <thead>

              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">

                <th className="p-3.5 rounded-l-xl">
                  School Name & Code
                </th>

                <th className="p-3.5">
                  Location
                </th>

                <th className="p-3.5">
                  Plan
                </th>

                <th className="p-3.5">
                  Franchise Admin
                </th>

                <th className="p-3.5">
                  Contract
                </th>

                <th className="p-3.5">
                  Royalty
                </th>

                <th className="p-3.5">
                  Status
                </th>

                <th className="p-3.5 rounded-r-xl text-right">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {loading ? (

                <tr>

                  <td
                    colSpan={8}
                    className="p-8 text-center text-slate-500"
                  >
                    Loading franchises...
                  </td>

                </tr>

              ) : filteredFranchises.length === 0 ? (

                <tr>

                  <td
                    colSpan={8}
                    className="p-8 text-center text-slate-500"
                  >
                    No franchises found.
                  </td>

                </tr>

              ) : (

                filteredFranchises.map((f) => {

                  const royalty =
                    f.monthlyRoyalties?.[0];

                  const contract =
                    f.contracts?.[0];

                  return (

                    <tr
                      key={f.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >

                      {/* SCHOOL */}

                      <td className="p-3.5">

                        <div className="font-extrabold text-slate-900 text-sm">
                          {f.name}
                        </div>

                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 inline-block mt-0.5">
                          {f.code}
                        </span>

                      </td>

                      {/* LOCATION */}

                      <td className="p-3.5">

                        <div className="font-semibold text-slate-800">
                          {f.city}, {f.state}
                        </div>

                        <span className="text-[10px] text-slate-400 block">
                          {f.pincode}
                        </span>

                      </td>

                      {/* PLAN */}

                      <td className="p-3.5">

                        <span
                          className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase ${
                            f.plan?.name ===
                            'ENTERPRISE'
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : f.plan?.name ===
                                'PRO'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {f.plan?.name ||
                            'No Plan'}
                        </span>

                      </td>

                      {/* ADMIN */}

                      <td className="p-3.5">

                        <div className="font-bold text-slate-900">
                          {f.admin?.name ||
                            'Not Assigned'}
                        </div>

                        <div className="text-[11px] text-slate-500 truncate">
                          {f.admin?.email ||
                            'No email'}
                        </div>

                      </td>

                      {/* CONTRACT */}

                      <td className="p-3.5">

                        <Badge
                          variant={
                            contract?.status ===
                              'ACTIVE' ||
                            contract?.status ===
                              'RENEWED'
                              ? 'blue'
                              : 'rose'
                          }
                          size="sm"
                        >
                          {contract?.status ||
                            'No Contract'}
                        </Badge>

                      </td>

                      {/* ROYALTY */}

                      <td className="p-3.5">

                        {royalty ? (

                          <Badge
                            variant={
                              royalty.status ===
                              'PAID'
                                ? 'emerald'
                                : royalty.status ===
                                  'PENDING'
                                ? 'amber'
                                : 'rose'
                            }
                            size="sm"
                          >
                            {royalty.status}
                            {' '}
                            (₹
                            {Number(
                              royalty.royaltyAmount
                            ).toLocaleString(
                              'en-IN'
                            )}
                            )
                          </Badge>

                        ) : (

                          <Badge
                            variant="blue"
                            size="sm"
                          >
                            No Royalty
                          </Badge>

                        )}

                      </td>

                      {/* STATUS */}

                      <td className="p-3.5">

                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                            f.status ===
                            'ACTIVE'
                              ? 'text-emerald-600'
                              : 'text-slate-400'
                          }`}
                        >

                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              f.status ===
                              'ACTIVE'
                                ? 'bg-emerald-500'
                                : 'bg-slate-400'
                            }`}
                          />

                          {f.status ===
                          'ACTIVE'
                            ? 'Active'
                            : 'Inactive'}

                        </span>

                      </td>

                      {/* ACTION */}

                      <td className="p-3.5 text-right">

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onNavigate(
                              `/super-admin/franchises/${f.id}`
                            )
                          }
                          leftIcon={
                            <Eye className="w-3.5 h-3.5" />
                          }
                        >
                          View
                        </Button>

                      </td>

                    </tr>

                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </Card>

    </div>
  );
};