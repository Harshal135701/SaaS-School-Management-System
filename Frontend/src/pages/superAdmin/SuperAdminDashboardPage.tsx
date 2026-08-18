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

/* =========================================================
   TYPES
========================================================= */

interface Franchise {
  id: string;
  name: string;
  code: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  status?: string;

  plan?: {
    name?: string;
  } | string | null;

  admin?: {
    name?: string;
    email?: string;
  } | null;

  adminName?: string;
  adminEmail?: string;

  contracts?: Array<{
    status?: string;
  }>;

  monthlyRoyalties?: Array<{
    status?: string;
    royaltyAmount?: number | string;
    amount?: number | string;
  }>;

  contractStatus?: string;
  royaltyStatus?: string;
  monthlyRoyalty?: number;
}

interface SuperAdminDashboardPageProps {
  onNavigate: (path: string) => void;
  onOpenAddSchoolModal: () => void;
  onOpenAddAdminModal: () => void;
  onEditFranchise?: (franchise: Franchise) => void;
  franchiseList?: Franchise[];
}

/* =========================================================
   COMPONENT
========================================================= */

export const SuperAdminDashboardPage: React.FC<
  SuperAdminDashboardPageProps
> = ({
  onNavigate,
  onOpenAddSchoolModal,
  onOpenAddAdminModal,
  onEditFranchise,
  franchiseList
}) => {
  /* =======================================================
     STATE
  ======================================================= */

  const [timeRange, setTimeRange] = useState<
    '6 Months' | '12 Months' | 'This Year'
  >('6 Months');

  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('All');

  const [localFranchises, setLocalFranchises] = useState<Franchise[]>(
    franchiseList || []
  );

  const [deleteConfirmId, setDeleteConfirmId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    totalFranchises: 0,
    activeFranchises: 0,
    inactiveFranchises: 0,
    totalFranchiseAdmins: 0
  });

  /* =======================================================
     FETCH DASHBOARD DATA
  ======================================================= */

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashboardResponse, franchisesResponse] =
          await Promise.all([
            api.get('/system-admin/dashboard'),
            api.get('/system-admin/franchises')
          ]);

        if (dashboardResponse.data?.success) {
          setDashboardData(
            dashboardResponse.data.data
          );
        }

        if (franchisesResponse.data?.success) {
          setLocalFranchises(
            franchisesResponse.data.data || []
          );
        }
      } catch (error) {
        console.error(
          'Failed to fetch dashboard data:',
          error
        );

        /*
         * If franchiseList was supplied by the parent,
         * keep using it as a fallback.
         */
        if (franchiseList) {
          setLocalFranchises(franchiseList);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [franchiseList]);

  /* =======================================================
     FRANCHISE DATA
  ======================================================= */

  const franchises =
    franchiseList && franchiseList.length > 0
      ? franchiseList
      : localFranchises;

  /* =======================================================
     DATE
  ======================================================= */

  const todayDateString = new Date().toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }
  );

  /* =======================================================
     SEARCH + FILTER
  ======================================================= */

  const filteredFranchises = franchises.filter((f) => {
    const query =
      searchQuery.toLowerCase();

    const matchesSearch =
      f.name
        ?.toLowerCase()
        .includes(query) ||
      f.code
        ?.toLowerCase()
        .includes(query) ||
      f.city
        ?.toLowerCase()
        .includes(query) ||
      f.state
        ?.toLowerCase()
        .includes(query);

    const planName =
      typeof f.plan === 'string'
        ? f.plan
        : f.plan?.name;

    const matchesPlan =
      planFilter === 'All' ||
      planName
        ?.toLowerCase()
        .includes(
          planFilter.toLowerCase()
        );

    return (
      matchesSearch &&
      matchesPlan
    );
  });

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async (
    id: string
  ) => {
    try {
      /*
       * Delete API can be enabled here when the backend
       * delete endpoint is confirmed.
       *
       * Example:
       * await api.delete(`/system-admin/franchises/${id}`);
       */

      setLocalFranchises((prev) =>
        prev.filter(
          (franchise) =>
            franchise.id !== id
        )
      );

      setDeleteConfirmId(null);
    } catch (error) {
      console.error(
        'Failed to delete franchise:',
        error
      );
    }
  };

  /* =======================================================
     KPI DATA
  ======================================================= */

  const activeFranchisesCount =
    dashboardData.activeFranchises ||
    franchises.filter(
      (f) =>
        f.status === 'ACTIVE' ||
        f.status === 'Active'
    ).length;

  const inactiveFranchisesCount =
    dashboardData.inactiveFranchises ||
    franchises.filter(
      (f) =>
        f.status === 'INACTIVE' ||
        f.status === 'Inactive'
    ).length;

  const totalFranchisesCount =
    dashboardData.totalFranchises ||
    franchises.length;

  const kpiData = [
    {
      title: 'TOTAL FRANCHISES',
      value: totalFranchisesCount,
      subtext: 'across all regions',
      icon: Building2,
      color: 'blue'
    },
    {
      title: 'ACTIVE FRANCHISES',
      value: activeFranchisesCount,
      subtext: 'operational schools',
      icon: CheckCircle2,
      color: 'emerald'
    },
    {
      title: 'INACTIVE FRANCHISES',
      value: inactiveFranchisesCount,
      subtext: 'needs follow-up',
      icon: XCircle,
      color: 'rose'
    },
    {
      title: 'FRANCHISE ADMINS',
      value:
        dashboardData.totalFranchiseAdmins,
      subtext: 'registered admins',
      icon: Users,
      color: 'indigo'
    }
  ];

  /* =======================================================
     PLAN NAME HELPER
  ======================================================= */

  const getPlanName = (
    franchise: Franchise
  ) => {
    if (
      typeof franchise.plan ===
      'string'
    ) {
      return franchise.plan;
    }

    return (
      franchise.plan?.name ||
      'No Plan'
    );
  };

  /* =======================================================
     ADMIN HELPER
  ======================================================= */

  const getAdminName = (
    franchise: Franchise
  ) => {
    return (
      franchise.admin?.name ||
      franchise.adminName ||
      'Not Assigned'
    );
  };

  const getAdminEmail = (
    franchise: Franchise
  ) => {
    return (
      franchise.admin?.email ||
      franchise.adminEmail ||
      'No email'
    );
  };

  /* =======================================================
     CONTRACT HELPER
  ======================================================= */

  const getContractStatus = (
    franchise: Franchise
  ) => {
    return (
      franchise.contracts?.[0]
        ?.status ||
      franchise.contractStatus ||
      'No Contract'
    );
  };

  /* =======================================================
     ROYALTY HELPER
  ======================================================= */

  const getRoyalty = (
    franchise: Franchise
  ) => {
    const royalty =
      franchise.monthlyRoyalties?.[0];

    if (royalty) {
      return {
        status:
          royalty.status ||
          'PENDING',
        amount:
          Number(
            royalty.royaltyAmount ??
              royalty.amount ??
              0
          )
      };
    }

    return {
      status:
        franchise.royaltyStatus ||
        'No Royalty',
      amount:
        Number(
          franchise.monthlyRoyalty ||
            0
        )
    };
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-8">

      {/* ===================================================
          HERO BANNER
      =================================================== */}

      <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">

        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-12 -translate-y-12" />

        <div className="relative z-10 max-w-3xl space-y-3">

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
              Real-time platform overview across{' '}
              <strong className="text-white font-bold">
                {totalFranchisesCount}{' '}
                franchise schools
              </strong>
              , royalty collections, and
              contract agreements.
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-sm text-xs font-semibold text-white">

              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />

              Platform Performance

            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-sm text-xs font-semibold text-white">

              <Sparkles className="w-3.5 h-3.5 text-amber-300" />

              {activeFranchisesCount}{' '}
              Operational Schools

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
            onClick={
              onOpenAddSchoolModal
            }
            leftIcon={
              <PlusCircle className="w-4 h-4" />
            }
            className="bg-white text-blue-700 hover:bg-blue-50 border-white shadow-lg font-bold"
          >
            Add Franchise School
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={
              onOpenAddAdminModal
            }
            leftIcon={
              <UserPlus className="w-4 h-4" />
            }
            className="bg-white/15 hover:bg-white/25 text-white border-white/30 font-bold"
          >
            Add Franchise Admin
          </Button>

        </div>

      </div>

      {/* ===================================================
          KPI CARDS
      =================================================== */}

      <div>

        <div className="flex items-center justify-between mb-4">

          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">

            <TrendingUp className="w-4 h-4 text-blue-600" />

            Key SaaS Platform Performance

          </h2>

          <span className="text-xs font-semibold text-slate-400">
            {loading
              ? 'Loading...'
              : 'Live Data'}
          </span>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {kpiData.map(
            (kpi, index) => {

              const Icon =
                kpi.icon;

              return (
                <Card
                  key={index}
                  hover
                  className="p-5 flex flex-col justify-between border-slate-200/80"
                >

                  <div className="flex items-center justify-between mb-3">

                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 truncate pr-1">
                      {kpi.title}
                    </span>

                    <div
                      className={`p-2 rounded-xl text-white shadow-xs shrink-0 ${
                        kpi.color ===
                        'emerald'
                          ? 'bg-emerald-500'
                          : kpi.color ===
                            'rose'
                          ? 'bg-rose-500'
                          : kpi.color ===
                            'indigo'
                          ? 'bg-indigo-500'
                          : 'bg-blue-500'
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

                      <span className="text-xs font-medium text-slate-500">
                        {kpi.subtext}
                      </span>

                    </div>

                  </div>

                </Card>
              );
            }
          )}

        </div>

      </div>

      {/* ===================================================
          MAIN CHARTS
      =================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ROYALTY REVENUE */}

        <Card className="lg:col-span-2 p-6 border-slate-200/80">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

            <div>

              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Royalty Revenue Trend
              </h3>

              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Monthly collected vs total
                billed royalty revenue
              </p>

            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">

              {(
                [
                  '6 Months',
                  '12 Months',
                  'This Year'
                ] as const
              ).map(
                (range) => (

                  <button
                    key={range}
                    onClick={() =>
                      setTimeRange(
                        range
                      )
                    }
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      timeRange ===
                      range
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {range}
                  </button>

                )
              )}

            </div>

          </div>

          <div className="h-64 w-full">

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
                      stopOpacity={0.35}
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
                      stopOpacity={0.35}
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
                  tickFormatter={(value) =>
                    `₹${(
                      value / 100000
                    ).toFixed(1)}L`
                  }
                />

                <Tooltip
                  formatter={(
                    value: any
                  ) => [
                    `₹${Number(
                      value
                    ).toLocaleString(
                      'en-IN'
                    )}`,
                    ''
                  ]}
                />

                <Legend
                  iconType="circle"
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Total Billed"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />

                <Area
                  type="monotone"
                  dataKey="collected"
                  name="Collected Royalty"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCollected)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </Card>

        {/* ROYALTY STATUS */}

        <Card className="p-6 border-slate-200/80 flex flex-col justify-between">

          <div>

            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Royalty Payment Status
            </h3>

            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Current month collection
              compliance
            </p>

          </div>

          <div className="h-48 my-2">

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
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={4}
                  dataKey="value"
                >

                  {mockRoyaltyPaymentStatusData.map(
                    (
                      entry,
                      index
                    ) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.color
                        }
                      />
                    )
                  )}

                </Pie>

                <Tooltip
                  formatter={(
                    value: any
                  ) => [
                    `${value}%`,
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

      {/* ===================================================
          SECONDARY CHARTS
      =================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* PLAN DISTRIBUTION */}

        <Card className="p-6 border-slate-200/80">

          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Subscription Plan Distribution
          </h3>

          <p className="text-xs text-slate-500 font-medium mt-0.5 mb-4">
            Breakdown by subscription
            tiers
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
                    (
                      entry,
                      index
                    ) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.color
                        }
                      />
                    )
                  )}

                </Pie>

                <Tooltip
                  formatter={(
                    value: any
                  ) => [
                    `${value} Schools`,
                    'Count'
                  ]}
                />

              </PieChart>

            </ResponsiveContainer>

          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-100">

            {mockPlanDistributionData.map(
              (plan) => (

                <div
                  key={plan.name}
                  className="p-2 rounded-xl bg-slate-50"
                >

                  <span className="text-[10px] font-bold text-slate-500 block uppercase">
                    {plan.name}
                  </span>

                  <span className="text-sm font-extrabold text-slate-900">
                    {plan.value}{' '}
                    schools
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
            Cumulative active schools
            onboarded over time
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
                  tick={{
                    fontSize: 11
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 11
                  }}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  fill="#2563eb"
                  radius={[
                    6,
                    6,
                    0,
                    0
                  ]}
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
            Active vs expiring vs
            expired contracts
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
                  tick={{
                    fontSize: 11
                  }}
                />

                <YAxis
                  type="category"
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 11
                  }}
                  width={90}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  radius={[
                    0,
                    6,
                    6,
                    0
                  ]}
                >

                  {mockContractOverviewData.map(
                    (
                      entry,
                      index
                    ) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.color
                        }
                      />
                    )
                  )}

                </Bar>

              </BarChart>

            </ResponsiveContainer>

          </div>

        </Card>

      </div>

      {/* ===================================================
          FRANCHISE TABLE
      =================================================== */}

      <Card className="p-6 border-slate-200/80">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

          <div>

            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Franchise Schools Directory
            </h3>

            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage all enrolled franchise
              schools — view, edit, or remove
            </p>

          </div>

          {/* SEARCH + FILTER */}

          <div className="flex flex-wrap items-center gap-3">

            <div className="relative">

              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />

              <input
                type="text"
                placeholder="Search school or city..."
                value={
                  searchQuery
                }
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                className="pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 w-52 transition-all"
              />

            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">

              <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />

              <span className="text-slate-500 text-[11px]">
                Plan:
              </span>

              {[
                'All',
                'Basic',
                'Pro',
                'Enterprise'
              ].map(
                (plan) => (

                  <button
                    key={plan}
                    onClick={() =>
                      setPlanFilter(
                        plan
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      planFilter ===
                      plan
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    {plan}
                  </button>

                )
              )}

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
              View All (
              {franchises.length}
              )
            </Button>

            <Button
              variant="primary"
              size="sm"
              leftIcon={
                <PlusCircle className="w-3.5 h-3.5" />
              }
              onClick={
                onOpenAddSchoolModal
              }
            >
              Add School
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
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {loading ? (

                <tr>

                  <td
                    colSpan={8}
                    className="p-8 text-center text-slate-500 text-sm font-semibold"
                  >
                    Loading franchises...
                  </td>

                </tr>

              ) : filteredFranchises.length ===
                0 ? (

                <tr>

                  <td
                    colSpan={8}
                    className="p-8 text-center text-slate-400 text-sm font-semibold"
                  >
                    No franchise schools found
                    matching your search.
                  </td>

                </tr>

              ) : (

                filteredFranchises.map(
                  (franchise) => {

                    const plan =
                      getPlanName(
                        franchise
                      );

                    const contract =
                      getContractStatus(
                        franchise
                      );

                    const royalty =
                      getRoyalty(
                        franchise
                      );

                    const isActive =
                      franchise.status ===
                        'ACTIVE' ||
                      franchise.status ===
                        'Active';

                    return (

                      <tr
                        key={
                          franchise.id
                        }
                        className="hover:bg-slate-50/80 transition-colors"
                      >

                        {/* SCHOOL */}

                        <td className="p-3.5">

                          <div className="font-extrabold text-slate-900 text-sm">
                            {
                              franchise.name
                            }
                          </div>

                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 inline-block mt-0.5">
                            {
                              franchise.code
                            }
                          </span>

                        </td>

                        {/* LOCATION */}

                        <td className="p-3.5">

                          <div className="font-semibold text-slate-800">
                            {
                              franchise.city ||
                              '—'
                            }
                            {franchise.city &&
                            franchise.state
                              ? `, ${franchise.state}`
                              : ''}
                          </div>

                          <span className="text-[10px] text-slate-400 block">
                            {
                              franchise.pincode ||
                              franchise.country ||
                              '—'
                            }
                          </span>

                        </td>

                        {/* PLAN */}

                        <td className="p-3.5">

                          <span
                            className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase ${
                              plan.toUpperCase() ===
                              'ENTERPRISE'
                                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                : plan.toUpperCase() ===
                                  'PRO'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {plan}
                          </span>

                        </td>

                        {/* ADMIN */}

                        <td className="p-3.5">

                          <div className="font-bold text-slate-900">
                            {
                              getAdminName(
                                franchise
                              )
                            }
                          </div>

                          <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                            {
                              getAdminEmail(
                                franchise
                              )
                            }
                          </div>

                        </td>

                        {/* CONTRACT */}

                        <td className="p-3.5">

                          <Badge
                            variant={
                              contract ===
                                'ACTIVE' ||
                              contract ===
                                'Active' ||
                              contract ===
                                'RENEWED' ||
                              contract ===
                                'Renewed'
                                ? 'blue'
                                : contract ===
                                  'EXPIRING' ||
                                  contract ===
                                    'Expiring Soon'
                                ? 'amber'
                                : 'rose'
                            }
                            size="sm"
                          >
                            {
                              contract
                            }
                          </Badge>

                        </td>

                        {/* ROYALTY */}

                        <td className="p-3.5">

                          {royalty.status ===
                            'No Royalty' ? (

                            <Badge
                              variant="blue"
                              size="sm"
                            >
                              No Royalty
                            </Badge>

                          ) : (

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
                              {
                                royalty.status
                              }{' '}
                              (
                              ₹
                              {royalty.amount.toLocaleString(
                                'en-IN'
                              )}
                              )
                            </Badge>

                          )}

                        </td>

                        {/* STATUS */}

                        <td className="p-3.5">

                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                              isActive
                                ? 'text-emerald-600'
                                : 'text-slate-400'
                            }`}
                          >

                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-400'
                              }`}
                            />

                            {isActive
                              ? 'Active'
                              : 'Inactive'}

                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td className="p-3.5 text-right">

                          {deleteConfirmId ===
                          franchise.id ? (

                            <div className="flex items-center justify-end gap-1.5">

                              <span className="text-[11px] font-semibold text-slate-600">
                                Delete?
                              </span>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    franchise.id
                                  )
                                }
                                className="px-2 py-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-lg hover:bg-rose-600 transition-colors cursor-pointer"
                              >
                                Yes
                              </button>

                              <button
                                onClick={() =>
                                  setDeleteConfirmId(
                                    null
                                  )
                                }
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
                                onClick={() =>
                                  onNavigate(
                                    `/super-admin/franchises/${franchise.id}`
                                  )
                                }
                                leftIcon={
                                  <Eye className="w-3.5 h-3.5" />
                                }
                              >
                                View
                              </Button>

                              {onEditFranchise && (
                                <button
                                  onClick={() =>
                                    onEditFranchise(
                                      franchise
                                    )
                                  }
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit School"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  setDeleteConfirmId(
                                    franchise.id
                                  )
                                }
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete School"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                            </div>

                          )}

                        </td>

                      </tr>

                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </Card>

    </div>
  );
};