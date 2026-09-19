import React, { useEffect, useState } from 'react';
import { Plus, Edit, Eye, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

// --- Interfaces ---
interface Watchman {
  id: string;
  name: string;
  phone: string | null;
  joiningDate: string | null;
  paymentType: string;
  rate: string | number;
  isActive: boolean;
  createdAt?: string;
}

interface Expense {
  id: string;
  watchmanId: string;
  watchman?: Watchman;
  periodStart: string;
  periodEnd: string;
  amount: string | number;
  paymentDate: string | null;
  paymentMethod: string | null;
  paymentNumber: string | null;
  receiptNumber: string | null;
  referenceNumber: string | null;
  status: string;
  remarks: string | null;
  createdAt?: string;
}

export const WatchmenPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'watchmen' | 'expenses'>('watchmen');
  
  // Data
  const [watchmen, setWatchmen] = useState<Watchman[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isAddWatchmanOpen, setIsAddWatchmanOpen] = useState(false);
  const [isEditWatchmanOpen, setIsEditWatchmanOpen] = useState(false);
  const [isViewWatchmanOpen, setIsViewWatchmanOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isPayExpenseOpen, setIsPayExpenseOpen] = useState(false);
  
  const [selectedWatchman, setSelectedWatchman] = useState<Watchman | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [watchmanForm, setWatchmanForm] = useState({ name: '', phone: '', joiningDate: '', paymentType: 'MONTHLY', rate: '', isActive: true });
  const [expenseForm, setExpenseForm] = useState({ watchmanId: '', periodStart: '', periodEnd: '', amount: '', paymentDate: '', paymentMethod: 'CASH', referenceNumber: '', receiptNumber: '', status: 'PENDING', remarks: '' });
  const [payForm, setPayForm] = useState({ paymentDate: '', paymentMethod: 'CASH', referenceNumber: '', receiptNumber: '', remarks: '' });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [wRes, eRes, sumRes] = await Promise.all([
        api.get('/franchise/watchmen'),
        api.get('/franchise/watchmen/expenses'),
        api.get('/franchise/watchmen/expenses/summary')
      ]);
      setWatchmen(wRes.data?.data || []);
      setExpenses(eRes.data?.data || []);
      setExpenseSummary(sumRes.data?.data || null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load watchman data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);


  const downloadSlip = (expense: Expense) => {
    const watchman = expense.watchman;
    if (!watchman) return;
    
    const slipWindow = window.open('', '_blank');
    if (!slipWindow) return;

    const html = `
      <html>
        <head>
          <title>Salary Slip - ${watchman.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin: 0; }
            .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 14px; }
            .label { font-weight: bold; color: #555; }
            .value { color: #000; }
            .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 14px; }
            .table th { background: #f9fafb; }
            .total-row { font-weight: bold; background: #f0fdf4; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Salary Slip</h1>
            <p class="subtitle">Watchman Payment Record</p>
          </div>
          
          <div class="row">
            <div><span class="label">Watchman Name:</span> <span class="value">${watchman.name}</span></div>
            <div><span class="label">Payment Date:</span> <span class="value">${expense.paymentDate || 'Pending'}</span></div>
          </div>
          <div class="row">
            <div><span class="label">Payment Period:</span> <span class="value">${expense.periodStart} to ${expense.periodEnd}</span></div>
            <div><span class="label">Status:</span> <span class="value">${expense.status}</span></div>
          </div>
          <div class="row">
            <div><span class="label">Payment Method:</span> <span class="value">${expense.paymentMethod || '-'}</span></div>
            <div><span class="label">Reference No:</span> <span class="value">${expense.referenceNumber || '-'}</span></div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Salary (${watchman.paymentType})</td>
                <td>₹${Number(expense.amount).toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td>Net Payable</td>
                <td>₹${Number(expense.amount).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            This is a computer generated salary slip and requires no physical signature.<br/>
            ${new Date().toLocaleDateString()}
          </div>
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    
    slipWindow.document.write(html);
    slipWindow.document.close();
  };

  // --- Watchman Handlers ---
  const handleCreateWatchman = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/franchise/watchmen', watchmanForm);
      setIsAddWatchmanOpen(false);
      setWatchmanForm({ name: '', phone: '', joiningDate: '', paymentType: 'MONTHLY', rate: '', isActive: true });
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create watchman');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditWatchman = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWatchman) return;
    setSubmitting(true);
    try {
      await api.put(`/franchise/watchmen/${selectedWatchman.id}`, watchmanForm);
      setIsEditWatchmanOpen(false);
      setSelectedWatchman(null);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update watchman');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await api.patch(`/franchise/watchmen/${id}/status`);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const openEditWatchman = (w: Watchman) => {
    setSelectedWatchman(w);
    setWatchmanForm({
      name: w.name,
      phone: w.phone || '',
      joiningDate: w.joiningDate || '',
      paymentType: w.paymentType,
      rate: w.rate.toString(),
      isActive: w.isActive
    });
    setIsEditWatchmanOpen(true);
  };

  // --- Expense Handlers ---
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/franchise/watchmen/expenses', expenseForm);
      setIsAddExpenseOpen(false);
      setExpenseForm({ watchmanId: '', periodStart: '', periodEnd: '', amount: '', paymentDate: '', paymentMethod: 'CASH', referenceNumber: '', receiptNumber: '', status: 'PENDING', remarks: '' });
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense) return;
    setSubmitting(true);
    try {
      await api.patch(`/franchise/watchmen/expenses/${selectedExpense.id}/pay`, payForm);
      setIsPayExpenseOpen(false);
      setSelectedExpense(null);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark as paid');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/franchise/watchmen/expenses/${id}`);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete expense');
    }
  };


  const calculateYearly = (type: string, rate: number) => {
    switch(type) {
      case 'MONTHLY': return rate * 12;
      case 'DAILY': return rate * 30 * 12;
      case 'WEEKLY': return rate * 52;
      case 'FORTNIGHTLY': return rate * 26;
      default: return rate * 12;
    }
  };
  
  const calculateMonthly = (type: string, rate: number) => {
    switch(type) {
      case 'MONTHLY': return rate;
      case 'DAILY': return rate * 30;
      case 'WEEKLY': return rate * 4;
      case 'FORTNIGHTLY': return rate * 2;
      default: return rate;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Watchman Management</h1>
          <p className="text-sm text-slate-500">Manage watchmen, assignments, status and salary payments.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 flex gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${activeTab === 'watchmen' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('watchmen')}
        >
          Watchmen List
        </button>
        <button
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${activeTab === 'expenses' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('expenses')}
        >
          Salary / Payments
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-24 bg-slate-100 rounded-xl w-full"></div>
          <div className="h-64 bg-slate-100 rounded-xl w-full"></div>
        </div>
      ) : activeTab === 'watchmen' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card padding="md">
              <p className="text-xs font-semibold text-slate-400 uppercase">Total Watchmen</p>
              <p className="text-2xl font-black text-slate-800">{watchmen.length}</p>
            </Card>
            <Card padding="md">
              <p className="text-xs font-semibold text-slate-400 uppercase">Active</p>
              <p className="text-2xl font-black text-emerald-600">{watchmen.filter(w => w.isActive).length}</p>
            </Card>
            <Card padding="md">
              <p className="text-xs font-semibold text-slate-400 uppercase">Inactive</p>
              <p className="text-2xl font-black text-rose-600">{watchmen.filter(w => !w.isActive).length}</p>
            </Card>
          </div>

          <Card>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Watchmen Directory</h2>
              <button
                onClick={() => { setWatchmanForm({ name: '', phone: '', joiningDate: '', paymentType: 'MONTHLY', rate: '', isActive: true }); setIsAddWatchmanOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" /> Add Watchman
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Phone</th>
                    <th className="p-4 font-semibold">Payment Type</th>
                    <th className="p-4 font-semibold">Salary (₹)</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {watchmen.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">No watchmen found</td></tr>
                  ) : watchmen.map(w => (
                    <tr key={w.id} className="hover:bg-slate-50/50">
                      <td className="p-4 text-sm font-medium text-slate-900">{w.name}</td>
                      <td className="p-4 text-sm text-slate-600">{w.phone || '-'}</td>
                      <td className="p-4 text-sm text-slate-600">{w.paymentType}</td>
                      <td className="p-4 text-sm font-semibold text-slate-700">₹{Number(w.rate).toFixed(2)}</td>
                      <td className="p-4">
                        <Badge variant={w.isActive ? 'green' : 'rose'}>{w.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <button onClick={() => { setSelectedWatchman(w); setIsViewWatchmanOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"><Eye className="w-4 h-4"/></button>
                        <button onClick={() => openEditWatchman(w)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"><Edit className="w-4 h-4"/></button>
                        <button onClick={() => toggleStatus(w.id)} className={`p-1.5 rounded-lg ${w.isActive ? 'text-slate-400 hover:text-rose-600' : 'text-slate-400 hover:text-emerald-600'}`}>
                          {w.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card padding="md">
              <p className="text-xs font-semibold text-slate-400 uppercase">Total Expenses</p>
              <p className="text-2xl font-black text-slate-800">₹{expenseSummary?.totalExpenses || 0}</p>
            </Card>
            <Card padding="md">
              <p className="text-xs font-semibold text-slate-400 uppercase">Total Paid</p>
              <p className="text-2xl font-black text-emerald-600">₹{expenseSummary?.totalPaid || 0}</p>
            </Card>
            <Card padding="md">
              <p className="text-xs font-semibold text-slate-400 uppercase">Total Pending</p>
              <p className="text-2xl font-black text-amber-600">₹{expenseSummary?.totalPending || 0}</p>
            </Card>
            <Card padding="md">
              <p className="text-xs font-semibold text-slate-400 uppercase">Records</p>
              <p className="text-2xl font-black text-slate-800">{expenseSummary?.totalRecords || 0}</p>
            </Card>
          </div>

          <Card>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Salary & Expenses</h2>
              <button
                onClick={() => {
                  setExpenseForm({ watchmanId: '', periodStart: '', periodEnd: '', amount: '', paymentDate: '', paymentMethod: 'CASH', referenceNumber: '', receiptNumber: '', status: 'PENDING', remarks: '' });
                  setIsAddExpenseOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition"
              >
                <Plus className="w-4 h-4" /> Record Payment / Salary
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="p-4 font-semibold">Watchman</th>
                    <th className="p-4 font-semibold">Period</th>
                    <th className="p-4 font-semibold">Amount (₹)</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Payment Info</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">No payment records found</td></tr>
                  ) : expenses.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50/50">
                      <td className="p-4 text-sm font-medium text-slate-900">{e.watchman?.name || 'Unknown'}</td>
                      <td className="p-4 text-xs text-slate-600">{e.periodStart} to {e.periodEnd}</td>
                      <td className="p-4 text-sm font-bold text-slate-800">₹{Number(e.amount).toFixed(2)}</td>
                      <td className="p-4">
                        <Badge variant={e.status === 'PAID' ? 'green' : 'amber'}>{e.status}</Badge>
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {e.status === 'PAID' ? (
                          <>
                            <div>Date: {e.paymentDate}</div>
                            <div>Method: {e.paymentMethod}</div>
                            {e.referenceNumber && <div>Ref: {e.referenceNumber}</div>}
                          </>
                        ) : '-'}
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        {e.status === 'PENDING' && (
                          <>
                            <button onClick={() => { setSelectedExpense(e); setPayForm({ paymentDate: '', paymentMethod: 'CASH', referenceNumber: '', receiptNumber: '', remarks: '' }); setIsPayExpenseOpen(true); }} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold hover:bg-emerald-200">Mark Paid</button>
                            <button onClick={() => handleDeleteExpense(e.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                          </>
                        )}
                        {e.status === 'PAID' && (
                          <button onClick={() => downloadSlip(e)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold hover:bg-blue-200">
                            Download Slip
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* View Watchman Modal */}
      <Modal isOpen={isViewWatchmanOpen} onClose={() => setIsViewWatchmanOpen(false)} title="Watchman Details" maxWidth="md">
        {selectedWatchman && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold">{selectedWatchman.name}</h2>
              <Badge variant={selectedWatchman.isActive ? 'green' : 'rose'}>{selectedWatchman.isActive ? 'ACTIVE' : 'INACTIVE'}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Phone</p>
                <p className="font-semibold text-slate-700">{selectedWatchman.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Joining Date</p>
                <p className="font-semibold text-slate-700">{selectedWatchman.joiningDate || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Payment Type</p>
                <p className="font-semibold text-slate-700">{selectedWatchman.paymentType}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Base Salary</p>
                <p className="font-semibold text-slate-700">₹{selectedWatchman.rate} ({selectedWatchman.paymentType})</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Est. Monthly Salary</p>
                <p className="font-semibold text-slate-700">₹{calculateMonthly(selectedWatchman.paymentType, Number(selectedWatchman.rate)).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Est. Yearly Salary</p>
                <p className="font-semibold text-slate-700">₹{calculateYearly(selectedWatchman.paymentType, Number(selectedWatchman.rate)).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Watchman Modal */}
      <Modal isOpen={isAddWatchmanOpen || isEditWatchmanOpen} onClose={() => { setIsAddWatchmanOpen(false); setIsEditWatchmanOpen(false); }} title={isAddWatchmanOpen ? 'Add Watchman' : 'Edit Watchman'} maxWidth="md">
        <form onSubmit={isAddWatchmanOpen ? handleCreateWatchman : handleEditWatchman} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Name *</label>
            <input required type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={watchmanForm.name} onChange={e => setWatchmanForm({...watchmanForm, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
            <input type="text" placeholder="10 digits (e.g. 9876543210)" className="w-full px-3 py-2 border rounded-lg text-sm" value={watchmanForm.phone} onChange={e => setWatchmanForm({...watchmanForm, phone: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Joining Date</label>
            <input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={watchmanForm.joiningDate} onChange={e => setWatchmanForm({...watchmanForm, joiningDate: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Type *</label>
              <select className="w-full px-3 py-2 border rounded-lg text-sm" value={watchmanForm.paymentType} onChange={e => setWatchmanForm({...watchmanForm, paymentType: e.target.value})}>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="FORTNIGHTLY">Fortnightly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Salary (₹) *</label>
              <input required type="number" step="0.01" className="w-full px-3 py-2 border rounded-lg text-sm" value={watchmanForm.rate} onChange={e => setWatchmanForm({...watchmanForm, rate: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">Save</button>
          </div>
        </form>
      </Modal>

      {/* Record Expense Modal */}
      <Modal isOpen={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)} title="Record Salary / Payment" maxWidth="md">
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Watchman *</label>
            <select required className="w-full px-3 py-2 border rounded-lg text-sm" value={expenseForm.watchmanId} onChange={e => setExpenseForm({...expenseForm, watchmanId: e.target.value})}>
              <option value="">-- Select Watchman --</option>
              {watchmen.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Period Start *</label>
              <input required type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={expenseForm.periodStart} onChange={e => setExpenseForm({...expenseForm, periodStart: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Period End *</label>
              <input required type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={expenseForm.periodEnd} onChange={e => setExpenseForm({...expenseForm, periodEnd: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹) *</label>
            <input required type="number" step="0.01" className="w-full px-3 py-2 border rounded-lg text-sm" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status *</label>
            <select required className="w-full px-3 py-2 border rounded-lg text-sm" value={expenseForm.status} onChange={e => setExpenseForm({...expenseForm, status: e.target.value})}>
              <option value="PENDING">Pending (Add to Due)</option>
              <option value="PAID">Paid Now</option>
            </select>
          </div>
          {expenseForm.status === 'PAID' && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Date *</label>
                  <input required type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={expenseForm.paymentDate} onChange={e => setExpenseForm({...expenseForm, paymentDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Method *</label>
                  <select required className="w-full px-3 py-2 border rounded-lg text-sm" value={expenseForm.paymentMethod} onChange={e => setExpenseForm({...expenseForm, paymentMethod: e.target.value})}>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              {['UPI', 'BANK_TRANSFER', 'CHEQUE'].includes(expenseForm.paymentMethod) && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reference No *</label>
                  <input required type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={expenseForm.referenceNumber} onChange={e => setExpenseForm({...expenseForm, referenceNumber: e.target.value})} />
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold">Record Salary</button>
          </div>
        </form>
      </Modal>

      {/* Mark Paid Modal */}
      <Modal isOpen={isPayExpenseOpen} onClose={() => setIsPayExpenseOpen(false)} title="Mark as Paid" maxWidth="md">
        <form onSubmit={handlePayExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Date *</label>
              <input required type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={payForm.paymentDate} onChange={e => setPayForm({...payForm, paymentDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Method *</label>
              <select required className="w-full px-3 py-2 border rounded-lg text-sm" value={payForm.paymentMethod} onChange={e => setPayForm({...payForm, paymentMethod: e.target.value})}>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          {['UPI', 'BANK_TRANSFER', 'CHEQUE'].includes(payForm.paymentMethod) && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reference No *</label>
              <input required type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={payForm.referenceNumber} onChange={e => setPayForm({...payForm, referenceNumber: e.target.value})} />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold">Confirm Payment</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
