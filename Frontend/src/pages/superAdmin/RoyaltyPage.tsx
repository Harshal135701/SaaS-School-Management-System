import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Search,
  Plus,
  Edit,
  X,
  RefreshCw,
} from 'lucide-react';

type RoyaltyTab =
  | 'overview'
  | 'config'
  | 'monthly'
  | 'paid'
  | 'pending'
  | 'overdue'
  | 'reports';

interface RoyaltyPageProps {
  onNavigate: (path: string) => void;
  subView?: string;
}

interface Franchise {
  id: string;
  name: string;
  code: string;
  plan?: {
    name: string;
    price: number;
    billingCycle: string;
  };
}

interface Configuration {
  id: string;
  franchiseId: string;
  royaltyType: 'FIXED' | 'PERCENTAGE';
  amount: number;
  effectiveFrom: string;
  isActive: boolean;
  franchise?: {
    id: string;
    name: string;
    code: string;
  };
}

interface MonthlyRoyalty {
  id: string;
  franchiseId: string;
  billingMonth: string;
  planAmount: number;
  baseAmount: number;
  royaltyType: 'FIXED' | 'PERCENTAGE';
  royaltyRate: number;
  royaltyAmount: number;
  totalAmount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  franchise?: {
    id: string;
    name: string;
    code: string;
  };
}

const RoyaltyPage: React.FC<RoyaltyPageProps> = ({
  onNavigate,
  subView = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<RoyaltyTab>(
    (subView as RoyaltyTab) || 'overview'
  );

  const [royalties, setRoyalties] = useState<MonthlyRoyalty[]>([]);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] =
    useState<Configuration | null>(null);

  const [configForm, setConfigForm] = useState({
    franchiseId: '',
    royaltyType: 'FIXED' as 'FIXED' | 'PERCENTAGE',
    amount: '',
    effectiveFrom: '',
  });

  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');
  const [reportFranchise, setReportFranchise] = useState('');

  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    setActiveTab((subView as RoyaltyTab) || 'overview');
  }, [subView]);

  const showToast = (message: string) => {
    setToastMsg(message);

    setTimeout(() => {
      setToastMsg('');
    }, 3000);
  };

  const handleTabChange = (tab: RoyaltyTab) => {
    setActiveTab(tab);

    if (tab === 'overview') {
      onNavigate('/super-admin/royalty');
    } else {
      onNavigate(`/super-admin/royalty/${tab}`);
    }
  };

  /* =========================
     FETCH FRANCHISES
  ========================= */

  const fetchFranchises = async () => {
    try {
      const res = await api.get('/system-admin/franchises');

      if (res.data?.success && Array.isArray(res.data.data)) {
        setFranchises(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch franchises:', error);
    }
  };

  /* =========================
     FETCH MONTHLY ROYALTIES
  ========================= */

  const fetchRoyalties = async () => {
    try {
      setLoading(true);

      const res = await api.get('/royalties/monthly');

      if (res.data?.success && Array.isArray(res.data.data)) {
        setRoyalties(res.data.data);
      } else {
        setRoyalties([]);
      }
    } catch (error) {
      console.error('Failed to fetch monthly royalties:', error);
      showToast('Failed to load royalty data');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FETCH CONFIGURATIONS
  ========================= */

  const fetchConfigurations = async () => {
    try {
      const res = await api.get(
        '/system-admin/royalties/configurations'
      );

      if (res.data?.success && Array.isArray(res.data.data)) {
        setConfigurations(res.data.data);
      } else {
        setConfigurations([]);
      }
    } catch (error) {
      console.error(
        'Failed to fetch royalty configurations:',
        error
      );
      showToast('Failed to load royalty configurations');
    }
  };

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    fetchFranchises();
    fetchRoyalties();
    fetchConfigurations();
  }, []);

  /* =========================
     SUMMARY
  ========================= */

  const totalBilled = useMemo(
    () =>
      royalties.reduce(
        (sum, item) => sum + Number(item.totalAmount || 0),
        0
      ),
    [royalties]
  );

  const totalPaid = useMemo(
    () =>
      royalties
        .filter((item) => item.status === 'PAID')
        .reduce(
          (sum, item) => sum + Number(item.totalAmount || 0),
          0
        ),
    [royalties]
  );

  const totalPending = useMemo(
    () =>
      royalties
        .filter((item) => item.status === 'PENDING')
        .reduce(
          (sum, item) => sum + Number(item.totalAmount || 0),
          0
        ),
    [royalties]
  );

  const totalOverdue = useMemo(
    () =>
      royalties
        .filter((item) => item.status === 'OVERDUE')
        .reduce(
          (sum, item) => sum + Number(item.totalAmount || 0),
          0
        ),
    [royalties]
  );

  const collectionRate =
    totalBilled > 0
      ? ((totalPaid / totalBilled) * 100).toFixed(1)
      : '0';

  /* =========================
     FILTERED ROYALTIES
  ========================= */

  const filteredRoyalties = useMemo(() => {
    return royalties.filter((royalty) => {
      const search = searchQuery.toLowerCase();

      const matchesSearch =
        royalty.franchise?.name
          ?.toLowerCase()
          .includes(search) ||
        royalty.franchise?.code
          ?.toLowerCase()
          .includes(search) ||
        royalty.id?.toLowerCase().includes(search);

      let matchesTab = true;

      if (activeTab === 'paid') {
        matchesTab = royalty.status === 'PAID';
      }

      if (activeTab === 'pending') {
        matchesTab = royalty.status === 'PENDING';
      }

      if (activeTab === 'overdue') {
        matchesTab = royalty.status === 'OVERDUE';
      }

      if (statusFilter !== 'ALL') {
        matchesTab =
          matchesTab && royalty.status === statusFilter;
      }

      return matchesSearch && matchesTab;
    });
  }, [
    royalties,
    searchQuery,
    activeTab,
    statusFilter,
  ]);

  /* =========================
     CONFIG MODAL
  ========================= */

  const openCreateConfig = () => {
    setEditingConfig(null);

    setConfigForm({
      franchiseId: '',
      royaltyType: 'FIXED',
      amount: '',
      effectiveFrom: new Date()
        .toISOString()
        .split('T')[0],
    });

    setShowConfigModal(true);
  };

  const openEditConfig = (config: Configuration) => {
    setEditingConfig(config);

    setConfigForm({
      franchiseId: config.franchiseId,
      royaltyType: config.royaltyType,
      amount: String(config.amount),
      effectiveFrom: config.effectiveFrom,
    });

    setShowConfigModal(true);
  };

  const handleConfigSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !configForm.franchiseId ||
      !configForm.amount ||
      !configForm.effectiveFrom
    ) {
      showToast('Please fill all required fields');
      return;
    }

    const amount = Number(configForm.amount);

    if (amount <= 0) {
      showToast('Royalty amount must be greater than 0');
      return;
    }

    if (
      configForm.royaltyType === 'PERCENTAGE' &&
      amount > 100
    ) {
      showToast('Percentage cannot exceed 100%');
      return;
    }

    try {
      setLoading(true);

      if (editingConfig) {
        await api.put(
          `/system-admin/royalties/configurations/${editingConfig.id}`,
          {
            royaltyType: configForm.royaltyType,
            amount,
            effectiveFrom: configForm.effectiveFrom,
          }
        );

        showToast(
          'Royalty configuration updated successfully'
        );
      } else {
        await api.post(
          '/system-admin/royalties/configurations',
          {
            franchiseId: configForm.franchiseId,
            royaltyType: configForm.royaltyType,
            amount,
            effectiveFrom: configForm.effectiveFrom,
          }
        );

        showToast(
          'Royalty configuration created successfully'
        );
      }

      setShowConfigModal(false);
      await fetchConfigurations();
    } catch (error: any) {
      console.error(
        'Failed to save royalty configuration:',
        error
      );

      showToast(
        error?.response?.data?.message ||
        'Failed to save configuration'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UPDATE STATUS
  ========================= */

  const updateStatus = async (
    id: string,
    status: 'PENDING' | 'PAID' | 'OVERDUE'
  ) => {
    try {
      await api.put(`/royalties/monthly/${id}/status`, {
        status,
      });

      showToast(
        `Royalty marked as ${status.toLowerCase()}`
      );

      await fetchRoyalties();
    } catch (error) {
      console.error(
        'Failed to update royalty status:',
        error
      );

      showToast('Failed to update royalty status');
    }
  };


  /* =========================
     REPORT
  ========================= */

  const generateReport = async () => {
    try {
      const params: any = {};

      if (reportFranchise) {
        params.franchiseId = reportFranchise;
      }

      if (reportFrom) {
        params.from = reportFrom;
      }

      if (reportTo) {
        params.to = reportTo;
      }

      const res = await api.get(
        '/royalties/monthly/report',
        { params }
      );

      if (res.data?.success) {
        showToast(
          `Report generated: ${res.data.summary.totalBills} bills`
        );
      }
    } catch (error) {
      console.error(
        'Failed to generate report:',
        error
      );

      showToast('Failed to generate report');
    }
  };

  /* =========================
     FORMAT
  ========================= */

  const formatCurrency = (amount: number) => {
    return `₹${Number(amount || 0).toLocaleString(
      'en-IN',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString(
      'en-IN'
    );
  };

  const getStatusBadge = (
    status: MonthlyRoyalty['status']
  ) => {
    if (status === 'PAID') {
      return (
        <Badge variant="green">
          <CheckCircle size={14} />
          Paid
        </Badge>
      );
    }

    if (status === 'OVERDUE') {
      return (
        <Badge variant="rose">
          <AlertCircle size={14} />
          Overdue
        </Badge>
      );
    }

    return (
      <Badge variant="amber">
        <Clock size={14} />
        Pending
      </Badge>
    );
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Royalty Management
          </h1>

          <p className="text-gray-500">
            Manage franchise plans, royalty configuration
            and monthly billing
          </p>
        </div>

        <Button
          onClick={() => {
            fetchRoyalties();
            fetchConfigurations();
          }}
        >
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>

      {/* TABS */}

      <div className="flex flex-wrap gap-2 border-b pb-2">

        {[
          ['overview', 'Overview'],
          ['config', 'Configuration'],
          ['monthly', 'Monthly'],
          ['paid', 'Paid'],
          ['pending', 'Pending'],
          ['overdue', 'Overdue'],
          ['reports', 'Reports'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() =>
              handleTabChange(id as RoyaltyTab)
            }
            className={`px-4 py-2 rounded-lg text-sm ${activeTab === id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TOAST */}

      {toastMsg && (
        <div className="fixed right-6 top-6 z-50 rounded-lg bg-gray-900 px-5 py-3 text-white shadow-lg">
          {toastMsg}
        </div>
      )}

      {/* ================= OVERVIEW ================= */}

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

            <Card>
              <div className="p-5">
                <p className="text-sm text-gray-500">
                  Total Billed
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {formatCurrency(totalBilled)}
                </h2>
              </div>
            </Card>

            <Card>
              <div className="p-5">
                <p className="text-sm text-gray-500">
                  Paid
                </p>

                <h2 className="mt-2 text-2xl font-bold text-green-600">
                  {formatCurrency(totalPaid)}
                </h2>
              </div>
            </Card>

            <Card>
              <div className="p-5">
                <p className="text-sm text-gray-500">
                  Pending
                </p>

                <h2 className="mt-2 text-2xl font-bold text-yellow-600">
                  {formatCurrency(totalPending)}
                </h2>
              </div>
            </Card>

            <Card>
              <div className="p-5">
                <p className="text-sm text-gray-500">
                  Overdue
                </p>

                <h2 className="mt-2 text-2xl font-bold text-red-600">
                  {formatCurrency(totalOverdue)}
                </h2>
              </div>
            </Card>

          </div>

          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold">
                Collection Rate
              </h2>

              <div className="mt-5 flex items-center gap-5">
                <div className="text-4xl font-bold">
                  {collectionRate}%
                </div>

                <div className="flex-1">
                  <div className="h-3 rounded-full bg-gray-200">
                    <div
                      className="h-3 rounded-full bg-green-500"
                      style={{
                        width: `${Math.min(
                          Number(collectionRate),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* ================= CONFIGURATION ================= */}

      {activeTab === 'config' && (
        <Card>
          <div className="p-6">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-lg font-semibold">
                  Royalty Configuration
                </h2>

                <p className="text-sm text-gray-500">
                  Configure the extra royalty charged on
                  top of the franchise plan.
                </p>
              </div>

              <Button onClick={openCreateConfig}>
                <Plus size={16} />
                Add Configuration
              </Button>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="p-3">Franchise</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Royalty</th>
                    <th className="p-3">
                      Effective From
                    </th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>

                <tbody>

                  {configurations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-gray-500"
                      >
                        No royalty configurations found.
                      </td>
                    </tr>
                  ) : (
                    configurations.map((config) => (
                      <tr
                        key={config.id}
                        className="border-b"
                      >
                        <td className="p-3">
                          <div className="font-medium">
                            {config.franchise?.name ||
                              'Unknown'}
                          </div>

                          <div className="text-xs text-gray-500">
                            {config.franchise?.code || '-'}
                          </div>
                        </td>

                        <td className="p-3">
                          {config.royaltyType}
                        </td>

                        <td className="p-3 font-medium">
                          {config.royaltyType ===
                            'PERCENTAGE'
                            ? `${config.amount}%`
                            : formatCurrency(
                              Number(config.amount)
                            )}
                        </td>

                        <td className="p-3">
                          {formatDate(
                            config.effectiveFrom
                          )}
                        </td>

                        <td className="p-3">
                          {config.isActive ? (
                            <Badge variant="green">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="slate">
                              Inactive
                            </Badge>
                          )}
                        </td>

                        <td className="p-3">
                          <Button
                            onClick={() =>
                              openEditConfig(config)
                            }
                          >
                            <Edit size={15} />
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}

                </tbody>

              </table>
            </div>
          </div>
        </Card>
      )}

      {/* ================= MONTHLY / STATUS TABLE ================= */}

      {['monthly', 'paid', 'pending', 'overdue'].includes(
        activeTab
      ) && (
          <Card>
            <div className="p-6">

              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />

                  <input
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    placeholder="Search franchise..."
                    className="rounded-lg border py-2 pl-10 pr-4"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="rounded-lg border px-4 py-2"
                >
                  <option value="ALL">All Status</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">
                    Pending
                  </option>
                  <option value="OVERDUE">
                    Overdue
                  </option>
                </select>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-left">

                  <thead>
                    <tr className="border-b text-sm text-gray-500">
                      <th className="p-3">School</th>
                      <th className="p-3">Billing Month</th>
                      <th className="p-3">Plan Amount</th>
                      <th className="p-3">
                        Extra Royalty
                      </th>
                      <th className="p-3">
                        Total Amount
                      </th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {loading ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="p-8 text-center"
                        >
                          Loading...
                        </td>
                      </tr>
                    ) : filteredRoyalties.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="p-8 text-center text-gray-500"
                        >
                          No royalty records found.
                        </td>
                      </tr>
                    ) : (
                      filteredRoyalties.map(
                        (royalty) => (
                          <tr
                            key={royalty.id}
                            className="border-b"
                          >

                            <td className="p-3">
                              <div className="font-medium">
                                {royalty.franchise?.name ||
                                  'Unknown'}
                              </div>

                              <div className="text-xs text-gray-500">
                                {royalty.franchise?.code ||
                                  '-'}
                              </div>
                            </td>

                            <td className="p-3">
                              {formatDate(
                                royalty.billingMonth
                              )}
                            </td>

                            <td className="p-3">
                              {formatCurrency(
                                Number(
                                  royalty.planAmount
                                )
                              )}
                            </td>

                            <td className="p-3">
                              <div>
                                {formatCurrency(
                                  Number(
                                    royalty.royaltyAmount
                                  )
                                )}
                              </div>

                              <div className="text-xs text-gray-500">
                                {royalty.royaltyType ===
                                  'PERCENTAGE'
                                  ? `${royalty.royaltyRate}%`
                                  : 'Fixed'}
                              </div>
                            </td>

                            <td className="p-3 font-bold">
                              {formatCurrency(
                                Number(
                                  royalty.totalAmount
                                )
                              )}
                            </td>

                            <td className="p-3">
                              {formatDate(
                                royalty.dueDate
                              )}
                            </td>

                            <td className="p-3">
                              {getStatusBadge(
                                royalty.status
                              )}
                            </td>

                            <td className="p-3">

                              {royalty.status ===
                                'PENDING' && (
                                  <Button
                                    onClick={() =>
                                      updateStatus(
                                        royalty.id,
                                        'PAID'
                                      )
                                    }
                                  >
                                    Mark Paid
                                  </Button>
                                )}

                              {royalty.status ===
                                'OVERDUE' && (
                                  <Button
                                    onClick={() =>
                                      updateStatus(
                                        royalty.id,
                                        'PAID'
                                      )
                                    }
                                  >
                                    Mark Paid
                                  </Button>
                                )}

                              {royalty.status ===
                                'PAID' && (
                                  <span className="text-sm text-gray-500">
                                    Completed
                                  </span>
                                )}

                            </td>

                          </tr>
                        )
                      )
                    )}

                  </tbody>

                </table>
              </div>
            </div>
          </Card>
        )}

      {/* ================= REPORTS ================= */}

      {activeTab === 'reports' && (
        <Card>
          <div className="p-6">

            <h2 className="mb-6 text-lg font-semibold">
              Royalty Reports
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              <div>
                <label className="mb-1 block text-sm">
                  Franchise
                </label>

                <select
                  value={reportFranchise}
                  onChange={(e) =>
                    setReportFranchise(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="">
                    All Franchises
                  </option>

                  {franchises.map((franchise) => (
                    <option
                      key={franchise.id}
                      value={franchise.id}
                    >
                      {franchise.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm">
                  From
                </label>

                <input
                  type="date"
                  value={reportFrom}
                  onChange={(e) =>
                    setReportFrom(e.target.value)
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm">
                  To
                </label>

                <input
                  type="date"
                  value={reportTo}
                  onChange={(e) =>
                    setReportTo(e.target.value)
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

            </div>

            <div className="mt-6">
              <Button onClick={generateReport}>
                <FileText size={16} />
                Generate Report
              </Button>
            </div>

          </div>
        </Card>
      )}

      {/* ================= CONFIG MODAL ================= */}

      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-xl font-semibold">
                {editingConfig
                  ? 'Edit Royalty Configuration'
                  : 'Add Royalty Configuration'}
              </h2>

              <button
                onClick={() =>
                  setShowConfigModal(false)
                }
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleConfigSubmit}
              className="space-y-4"
            >

              {!editingConfig && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Franchise
                  </label>

                  <select
                    value={configForm.franchiseId}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        franchiseId:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border px-3 py-2"
                    required
                  >
                    <option value="">
                      Select Franchise
                    </option>

                    {franchises.map((franchise) => (
                      <option
                        key={franchise.id}
                        value={franchise.id}
                      >
                        {franchise.name} (
                        {franchise.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Royalty Type
                </label>

                <select
                  value={configForm.royaltyType}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      royaltyType:
                        e.target.value as
                        | 'FIXED'
                        | 'PERCENTAGE',
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="FIXED">
                    Fixed Amount
                  </option>

                  <option value="PERCENTAGE">
                    Percentage
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {configForm.royaltyType ===
                    'PERCENTAGE'
                    ? 'Royalty Percentage (%)'
                    : 'Royalty Amount (₹)'}
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={configForm.amount}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      amount: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Effective From
                </label>

                <input
                  type="date"
                  value={configForm.effectiveFrom}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      effectiveFrom:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">

                <Button
                  type="button"
                  onClick={() =>
                    setShowConfigModal(false)
                  }
                >
                  Cancel
                </Button>

                <Button type="submit">
                  {editingConfig
                    ? 'Update Configuration'
                    : 'Save Configuration'}
                </Button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export { RoyaltyPage };