import React, { useEffect, useState } from 'react';
import { 
  Plus, Edit, Eye, Trash2, CheckCircle, XCircle, 
  Receipt, Building2, Tag, Search, Check, Clock, 
  CreditCard, Printer, TrendingUp, RefreshCw, AlertTriangle,
  Calendar, X
} from 'lucide-react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

// --- Interfaces ---
interface ExpenseCategory {
  id: string;
  name: string;
  description: string | null;
  isActive?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

interface Vendor {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxNumber: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

interface SchoolExpense {
  id: string;
  title: string;
  categoryId: string;
  vendorId: string | null;
  amount: string | number;
  expenseDate: string;
  invoiceNumber: string | null;
  description: string | null;
  paymentMethod: string | null;
  receiptUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  remarks: string | null;
  paymentDate: string | null;
  paymentNumber: string | null;
  referenceNumber: string | null;
  category?: ExpenseCategory;
  vendor?: Vendor;
  createdAt?: string;
}

interface ExpenseSummary {
  totalExpense?: number;
  paidExpense?: number;
  pendingExpense?: number;
  approvedExpense?: number;
  rejectedExpense?: number;
  totalExpenses?: number;
  paidExpenses?: number;
  pendingExpenses?: number;
  totalAmount?: number;
  paidAmount?: number;
  pendingAmount?: number;
  categoryBreakdown?: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
    totalAmount: number;
  }>;
}

export const ExpensesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'categories' | 'vendors' | 'summary'>('expenses');

  // Main Data States
  const [expenses, setExpenses] = useState<SchoolExpense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filters for Expenses
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [vendorFilter, setVendorFilter] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Modals visibility
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [isViewExpenseOpen, setIsViewExpenseOpen] = useState(false);
  const [isRejectExpenseOpen, setIsRejectExpenseOpen] = useState(false);
  const [isPayExpenseOpen, setIsPayExpenseOpen] = useState(false);

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);

  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isEditVendorOpen, setIsEditVendorOpen] = useState(false);

  // Selected Records for Actions
  const [selectedExpense, setSelectedExpense] = useState<SchoolExpense | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form States
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    categoryId: '',
    vendorId: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    description: '',
    paymentMethod: '',
    receiptUrl: ''
  });

  const [rejectForm, setRejectForm] = useState({ remarks: '' });
  const [payForm, setPayForm] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    referenceNumber: '',
    remarks: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  const [vendorForm, setVendorForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    taxNumber: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // --- Load Data ---
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query params for expenses
      const expenseParams: any = {};
      if (statusFilter !== 'ALL') expenseParams.status = statusFilter;
      if (categoryFilter !== 'ALL') expenseParams.categoryId = categoryFilter;
      if (vendorFilter !== 'ALL') expenseParams.vendorId = vendorFilter;
      if (fromDate) expenseParams.fromDate = fromDate;
      if (toDate) expenseParams.toDate = toDate;

      const [catRes, venRes, expRes, sumRes] = await Promise.allSettled([
        api.get('/expense-categories'),
        api.get('/vendors'),
        api.get('/school-expenses', { params: expenseParams }),
        api.get('/school-expenses/summary')
      ]);

      if (catRes.status === 'fulfilled' && catRes.value.data?.success) {
        setCategories(Array.isArray(catRes.value.data.data) ? catRes.value.data.data : []);
      }
      if (venRes.status === 'fulfilled' && venRes.value.data?.success) {
        setVendors(Array.isArray(venRes.value.data.data) ? venRes.value.data.data : []);
      }
      if (expRes.status === 'fulfilled' && expRes.value.data?.success) {
        setExpenses(Array.isArray(expRes.value.data.data) ? expRes.value.data.data : []);
      }
      if (sumRes.status === 'fulfilled' && sumRes.value.data?.success) {
        setSummary(sumRes.value.data.data || null);
      }

    } catch (err: any) {
      console.error('Failed to load expense data:', err);
      setError(err.response?.data?.message || 'Failed to fetch expense records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter, vendorFilter, fromDate, toDate]);

  // --- Client side search filter for Expenses ---
  const filteredExpenses = expenses.filter(exp => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const titleText = (exp.title || exp.description || '').toLowerCase();
    return (
      titleText.includes(term) ||
      (exp.paymentNumber && exp.paymentNumber.toLowerCase().includes(term)) ||
      (exp.invoiceNumber && exp.invoiceNumber.toLowerCase().includes(term)) ||
      (exp.category && exp.category.name.toLowerCase().includes(term)) ||
      (exp.vendor && exp.vendor.name.toLowerCase().includes(term))
    );
  });

  // --- Dynamic Category Breakdown computation ---
  const computedCategoryBreakdown = React.useMemo(() => {
    if (!Array.isArray(categories)) return [];
    
    const categoryMap: { [key: string]: { categoryId: string; categoryName: string; count: number; totalAmount: number } } = {};

    categories.forEach(cat => {
      categoryMap[cat.id] = {
        categoryId: cat.id,
        categoryName: cat.name,
        count: 0,
        totalAmount: 0
      };
    });

    expenses.forEach(exp => {
      const catId = exp.categoryId || exp.category?.id;
      if (catId) {
        if (!categoryMap[catId]) {
          categoryMap[catId] = {
            categoryId: catId,
            categoryName: exp.category?.name || 'Uncategorized',
            count: 0,
            totalAmount: 0
          };
        }
        categoryMap[catId].count += 1;
        categoryMap[catId].totalAmount += Number(exp.amount || 0);
      }
    });

    return Object.values(categoryMap);
  }, [categories, expenses]);

  // --- Category Handlers ---
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('/expense-categories', categoryForm);
      if (res.data?.success) {
        showToast('Expense Category created successfully');
        setIsAddCategoryOpen(false);
        setCategoryForm({ name: '', description: '', status: 'ACTIVE' });
        loadData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !categoryForm.name.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/expense-categories/${selectedCategory.id}`, categoryForm);
      if (res.data?.success) {
        showToast('Category updated successfully');
        setIsEditCategoryOpen(false);
        setSelectedCategory(null);
        loadData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleCategoryStatus = async (cat: ExpenseCategory) => {
    try {
      const res = await api.patch(`/expense-categories/${cat.id}/toggle-status`);
      if (res.data?.success) {
        showToast(`Category status changed to ${res.data.data.status}`);
        loadData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update category status');
    }
  };

  const handleDeleteCategory = async (cat: ExpenseCategory) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    try {
      const res = await api.delete(`/expense-categories/${cat.id}`);
      if (res.data?.success) {
        showToast('Category deleted successfully');
        loadData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Cannot delete category (it may be linked to existing expenses)');
    }
  };

  // --- Vendor Handlers ---
  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('/vendors', vendorForm);
      if (res.data?.success) {
        showToast('Vendor created successfully');
        setIsAddVendorOpen(false);
        setVendorForm({ name: '', contactPerson: '', phone: '', email: '', address: '', taxNumber: '', status: 'ACTIVE' });
        loadData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create vendor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor || !vendorForm.name.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/vendors/${selectedVendor.id}`, vendorForm);
      if (res.data?.success) {
        showToast('Vendor updated successfully');
        setIsEditVendorOpen(false);
        setSelectedVendor(null);
        loadData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update vendor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVendorStatus = async (ven: Vendor) => {
    try {
      const res = await api.patch(`/vendors/${ven.id}/toggle-status`);
      if (res.data?.success) {
        showToast(`Vendor status changed to ${res.data.data.status}`);
        loadData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update vendor status');
    }
  };

  const handleDeleteVendor = async (ven: Vendor) => {
    if (!window.confirm(`Are you sure you want to delete vendor "${ven.name}"?`)) return;
    try {
      const res = await api.delete(`/vendors/${ven.id}`);
      if (res.data?.success) {
        showToast('Vendor deleted successfully');
        loadData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Cannot delete vendor (it may be linked to existing expenses)');
    }
  };

  // --- Expense Handlers ---
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const titleOrDesc = (expenseForm.title || expenseForm.description || '').trim();

    if (!titleOrDesc) {
      setModalError('Expense Title is required');
      return;
    }

    if (titleOrDesc.length < 2 || titleOrDesc.length > 255) {
      setModalError('Expense Title must be between 2 and 255 characters');
      return;
    }

    if (!expenseForm.categoryId) {
      setModalError('Category is required');
      return;
    }

    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      setModalError('Amount must be a valid positive number');
      return;
    }

    if (!expenseForm.expenseDate) {
      setModalError('Expense Date is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        description: titleOrDesc,
        categoryId: expenseForm.categoryId,
        amount: parseFloat(expenseForm.amount),
        expenseDate: expenseForm.expenseDate,
      };
      if (expenseForm.vendorId) payload.vendorId = expenseForm.vendorId;
      if (expenseForm.invoiceNumber) payload.invoiceNumber = expenseForm.invoiceNumber.trim();
      if (expenseForm.paymentMethod) payload.paymentMethod = expenseForm.paymentMethod;

      const res = await api.post('/school-expenses', payload);
      if (res.data?.success) {
        showToast('Expense created successfully');
        setIsAddExpenseOpen(false);
        setExpenseForm({
          title: '', categoryId: '', vendorId: '', amount: '',
          expenseDate: new Date().toISOString().split('T')[0],
          invoiceNumber: '', description: '', paymentMethod: '', receiptUrl: ''
        });
        loadData();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create expense';
      setModalError(msg);
      showToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense) return;
    setModalError(null);

    const titleOrDesc = (expenseForm.title || expenseForm.description || '').trim();

    if (!titleOrDesc) {
      setModalError('Expense Title is required');
      return;
    }

    if (!expenseForm.categoryId || !expenseForm.amount || !expenseForm.expenseDate) {
      setModalError('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        description: titleOrDesc,
        categoryId: expenseForm.categoryId,
        amount: parseFloat(expenseForm.amount),
        expenseDate: expenseForm.expenseDate,
        invoiceNumber: expenseForm.invoiceNumber || null,
        vendorId: expenseForm.vendorId || null,
        paymentMethod: expenseForm.paymentMethod || null
      };

      const res = await api.put(`/school-expenses/${selectedExpense.id}`, payload);
      if (res.data?.success) {
        showToast('Expense updated successfully');
        setIsEditExpenseOpen(false);
        setSelectedExpense(null);
        loadData();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update expense';
      setModalError(msg);
      showToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveExpense = async (exp: SchoolExpense) => {
    if (!window.confirm(`Approve expense "${exp.title}" for ₹${exp.amount}?`)) return;
    try {
      const res = await api.patch(`/school-expenses/${exp.id}/approve`);
      if (res.data?.success) {
        showToast('Expense approved successfully');
        loadData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to approve expense');
    }
  };

  const handleRejectExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense) return;
    if (!rejectForm.remarks.trim()) {
      showToast('Remarks are required when rejecting an expense');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.patch(`/school-expenses/${selectedExpense.id}/reject`, {
        remarks: rejectForm.remarks
      });
      if (res.data?.success) {
        showToast('Expense rejected successfully');
        setIsRejectExpenseOpen(false);
        setSelectedExpense(null);
        setRejectForm({ remarks: '' });
        loadData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to reject expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense) return;
    if (!payForm.paymentDate || !payForm.paymentMethod) {
      showToast('Payment Date and Method are required');
      return;
    }
    if (['UPI', 'BANK_TRANSFER', 'CHEQUE'].includes(payForm.paymentMethod) && !payForm.referenceNumber.trim()) {
      showToast(`Reference Number (Txn ID / Cheque #) is required for ${payForm.paymentMethod}`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.patch(`/school-expenses/${selectedExpense.id}/pay`, {
        paymentDate: payForm.paymentDate,
        paymentMethod: payForm.paymentMethod,
        referenceNumber: payForm.referenceNumber || null,
        remarks: payForm.remarks || null
      });
      if (res.data?.success) {
        showToast(`Payment processed successfully! Payment #: ${res.data.data.paymentNumber || 'Done'}`);
        setIsPayExpenseOpen(false);
        setSelectedExpense(null);
        setPayForm({
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'CASH',
          referenceNumber: '',
          remarks: ''
        });
        loadData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to record expense payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (exp: SchoolExpense) => {
    if (!window.confirm(`Delete expense "${exp.title}"?`)) return;
    try {
      const res = await api.delete(`/school-expenses/${exp.id}`);
      if (res.data?.success) {
        showToast('Expense deleted successfully');
        loadData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  // --- Print / Download Expense Voucher ---
  const downloadVoucher = (exp: SchoolExpense) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Expense Voucher - ${exp.paymentNumber || exp.title}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .voucher { max-width: 650px; margin: 0 auto; border: 2px solid #e2e8f0; border-radius: 12px; padding: 32px; background: #ffffff; }
            .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; }
            .header h1 { margin: 0; font-size: 24px; color: #1e3a8a; text-transform: uppercase; letter-spacing: 1px; }
            .header p { margin: 4px 0 0; color: #64748b; font-size: 13px; font-weight: 600; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; font-size: 14px; }
            .meta-item { background: #f8fafc; padding: 10px 14px; rounded-radius: 8px; border: 1px solid #f1f5f9; }
            .label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px; }
            .value { font-weight: 600; color: #0f172a; }
            .amount-box { text-align: center; background: #eff6ff; border: 2px dashed #3b82f6; padding: 20px; border-radius: 10px; margin: 24px 0; }
            .amount-box .amt { font-size: 32px; font-weight: 800; color: #1d4ed8; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; pt-16px; text-align: justify; display: flex; justify-content: space-between; padding-top: 24px; }
            .sig-box { text-align: center; border-top: 1px solid #94a3b8; width: 180px; pt-4; font-size: 12px; font-weight: 600; color: #475569; }
            @media print {
              body { padding: 0; }
              .voucher { border: none; border-radius: 0; }
            }
          </style>
        </head>
        <body>
          <div class="voucher">
            <div class="header">
              <h1>Expense Voucher</h1>
              <p>School / Franchise Operations</p>
            </div>
            <div class="meta-grid">
              <div class="meta-item">
                <span class="label">Voucher / Payment #</span>
                <span class="value">${exp.paymentNumber || exp.id.slice(0, 8)}</span>
              </div>
              <div class="meta-item">
                <span class="label">Status</span>
                <span class="value" style="color: ${exp.status === 'PAID' ? '#15803d' : exp.status === 'APPROVED' ? '#1d4ed8' : exp.status === 'REJECTED' ? '#b91c1c' : '#b45309'}">${exp.status}</span>
              </div>
              <div class="meta-item">
                <span class="label">Title / Subject</span>
                <span class="value">${exp.title}</span>
              </div>
              <div class="meta-item">
                <span class="label">Category</span>
                <span class="value">${exp.category ? exp.category.name : '-'}</span>
              </div>
              <div class="meta-item">
                <span class="label">Vendor</span>
                <span class="value">${exp.vendor ? exp.vendor.name : 'N/A'}</span>
              </div>
              <div class="meta-item">
                <span class="label">Expense Date</span>
                <span class="value">${exp.expenseDate}</span>
              </div>
              <div class="meta-item">
                <span class="label">Payment Date</span>
                <span class="value">${exp.paymentDate || '-'}</span>
              </div>
              <div class="meta-item">
                <span class="label">Payment Method</span>
                <span class="value">${exp.paymentMethod || '-'} ${exp.referenceNumber ? `(${exp.referenceNumber})` : ''}</span>
              </div>
            </div>

            <div class="amount-box">
              <span class="label">Total Amount</span>
              <div class="amt">₹ ${Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>

            ${exp.description ? `<p><strong>Description:</strong> ${exp.description}</p>` : ''}
            ${exp.remarks ? `<p><strong>Remarks:</strong> ${exp.remarks}</p>` : ''}

            <div class="footer">
              <div class="sig-box">Prepared By</div>
              <div class="sig-box">Approved / Received By</div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PAID': return 'emerald';
      case 'APPROVED': return 'blue';
      case 'PENDING': return 'amber';
      case 'REJECTED': return 'rose';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-blue-600" />
            General Expense Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track, approve, pay, and analyze school operational expenses, categories, and vendors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData()}
            className="p-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          {activeTab === 'expenses' && (
            <button
              onClick={() => {
                setExpenseForm({
                  title: '', categoryId: categories[0]?.id || '', vendorId: '', amount: '',
                  expenseDate: new Date().toISOString().split('T')[0],
                  invoiceNumber: '', description: '', paymentMethod: '', receiptUrl: ''
                });
                setIsAddExpenseOpen(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          )}

          {activeTab === 'categories' && (
            <button
              onClick={() => {
                setCategoryForm({ name: '', description: '', status: 'ACTIVE' });
                setIsAddCategoryOpen(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          )}

          {activeTab === 'vendors' && (
            <button
              onClick={() => {
                setVendorForm({ name: '', contactPerson: '', phone: '', email: '', address: '', taxNumber: '', status: 'ACTIVE' });
                setIsAddVendorOpen(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vendor</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Overview Cards */}
      {(() => {
        const totalAmountVal = Number(summary?.totalExpense ?? summary?.totalAmount ?? 0);
        const paidAmountVal = Number(summary?.paidExpense ?? summary?.paidAmount ?? 0);
        const pendingAmountVal = Number(summary?.pendingExpense ?? summary?.pendingAmount ?? 0);
        const totalCount = expenses.length;
        const paidCount = expenses.filter(e => e.status === 'PAID').length;
        const pendingCount = expenses.filter(e => e.status === 'PENDING').length;

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Expenses</p>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    ₹ {totalAmountVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {totalCount} total expense records
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="border-l-4 border-l-emerald-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Paid Amount</p>
                  <h3 className="text-xl font-black text-emerald-700 mt-1">
                    ₹ {paidAmountVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {paidCount} paid expenses
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Amount</p>
                  <h3 className="text-xl font-black text-amber-700 mt-1">
                    ₹ {pendingAmountVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {pendingCount} pending approval/payment
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="border-l-4 border-l-indigo-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Categories / Vendors</p>
                  <h3 className="text-xl font-black text-indigo-700 mt-1">
                    {categories.length} / {vendors.length}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Active categories & vendor accounts
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </div>
        );
      })()}

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`py-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'expenses'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Expenses List</span>
          <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-700 rounded-full">
            {filteredExpenses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`py-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Expense Categories</span>
          <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-700 rounded-full">
            {categories.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('vendors')}
          className={`py-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'vendors'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Vendors Management</span>
          <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-700 rounded-full">
            {vendors.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`py-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'summary'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Summary & Analytics</span>
        </button>
      </div>

      {/* Tab 1: Expenses List */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <Card padding="sm" className="bg-slate-50/70 border border-slate-200/80">
            <div className="flex flex-col gap-3">
              {/* Main Search & Select Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Search */}
                <div className="md:col-span-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search title, receipt #, vendor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="PAID">PAID</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Vendor Filter */}
                <div>
                  <select
                    value={vendorFilter}
                    onChange={(e) => setVendorFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                  >
                    <option value="ALL">All Vendors</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Range & Clear Filters Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-600 text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Date Filter:
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 text-[11px] font-medium">From</span>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 text-[11px] font-medium">To</span>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                    />
                  </div>
                </div>

                {(searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || vendorFilter !== 'ALL' || fromDate || toDate) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('ALL');
                      setCategoryFilter('ALL');
                      setVendorFilter('ALL');
                      setFromDate('');
                      setToDate('');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold transition flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </Card>

          {/* Expenses Table */}
          <Card padding="none" className="overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-slate-500 font-medium text-xs flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span>Loading real expense records from server...</span>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No Expense Records Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || vendorFilter !== 'ALL'
                    ? 'No expenses matched your filter criteria.'
                    : 'No expense records have been created yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Ref / Title</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Vendor</th>
                      <th className="py-3.5 px-4 text-right">Amount</th>
                      <th className="py-3.5 px-4">Expense Date</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{exp.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {exp.paymentNumber ? exp.paymentNumber : exp.invoiceNumber ? `Inv: ${exp.invoiceNumber}` : `ID: ${exp.id.slice(0, 8)}`}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            {exp.category ? exp.category.name : '-'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {exp.vendor ? (
                            <span className="text-slate-800 font-medium">{exp.vendor.name}</span>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-900">
                          ₹ {Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {exp.expenseDate}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={getStatusBadgeVariant(exp.status)}>
                            {exp.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View */}
                            <button
                              onClick={() => { setSelectedExpense(exp); setIsViewExpenseOpen(true); }}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Print Voucher */}
                            <button
                              onClick={() => downloadVoucher(exp)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                              title="Print / Download Voucher"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Edit (PENDING or REJECTED) */}
                            {(exp.status === 'PENDING' || exp.status === 'REJECTED') && (
                              <button
                                onClick={() => {
                                  setSelectedExpense(exp);
                                  setExpenseForm({
                                    title: exp.title,
                                    categoryId: exp.categoryId,
                                    vendorId: exp.vendorId || '',
                                    amount: String(exp.amount),
                                    expenseDate: exp.expenseDate,
                                    invoiceNumber: exp.invoiceNumber || '',
                                    description: exp.description || '',
                                    paymentMethod: exp.paymentMethod || '',
                                    receiptUrl: exp.receiptUrl || ''
                                  });
                                  setIsEditExpenseOpen(true);
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit Expense"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}

                            {/* Approve (PENDING only) */}
                            {exp.status === 'PENDING' && (
                              <button
                                onClick={() => handleApproveExpense(exp)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                title="Approve Expense"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            {/* Reject (PENDING only) */}
                            {exp.status === 'PENDING' && (
                              <button
                                onClick={() => {
                                  setSelectedExpense(exp);
                                  setRejectForm({ remarks: '' });
                                  setIsRejectExpenseOpen(true);
                                }}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Reject Expense"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}

                            {/* Pay (PENDING or APPROVED) */}
                            {(exp.status === 'PENDING' || exp.status === 'APPROVED') && (
                              <button
                                onClick={() => {
                                  setSelectedExpense(exp);
                                  setPayForm({
                                    paymentDate: new Date().toISOString().split('T')[0],
                                    paymentMethod: exp.paymentMethod || 'CASH',
                                    referenceNumber: '',
                                    remarks: ''
                                  });
                                  setIsPayExpenseOpen(true);
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                                title="Process Payment"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Pay</span>
                              </button>
                            )}

                            {/* Delete (PENDING or REJECTED) */}
                            {(exp.status === 'PENDING' || exp.status === 'REJECTED') && (
                              <button
                                onClick={() => handleDeleteExpense(exp)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Expense"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 2: Expense Categories */}
      {activeTab === 'categories' && (
        <Card padding="none" className="overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Expense Categories</h3>
            <span className="text-xs text-slate-500 font-medium">{categories.length} Total</span>
          </div>

          {categories.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No categories created yet. Click "Add Category" above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{cat.name}</td>
                      <td className="py-3 px-4 text-slate-500">{cat.description || '-'}</td>
                      <td className="py-3 px-4">
                        {(() => {
                          const isCatActive = cat.isActive !== false && cat.status !== 'INACTIVE';
                          return (
                            <button
                              onClick={() => handleToggleCategoryStatus(cat)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition ${
                                isCatActive
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              }`}
                            >
                              {isCatActive ? 'ACTIVE' : 'INACTIVE'}
                            </button>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedCategory(cat);
                              const isCatActive = cat.isActive !== false && cat.status !== 'INACTIVE';
                              setCategoryForm({ name: cat.name, description: cat.description || '', status: isCatActive ? 'ACTIVE' : 'INACTIVE' });
                              setIsEditCategoryOpen(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Category"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 3: Vendors Management */}
      {activeTab === 'vendors' && (
        <Card padding="none" className="overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Registered Vendors</h3>
            <span className="text-xs text-slate-500 font-medium">{vendors.length} Vendors</span>
          </div>

          {vendors.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No vendor accounts registered yet. Click "Add Vendor" above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Vendor Name</th>
                    <th className="py-3 px-4">Contact Person</th>
                    <th className="py-3 px-4">Phone / Email</th>
                    <th className="py-3 px-4">GST / Tax #</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {vendors.map((ven) => (
                    <tr key={ven.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{ven.name}</td>
                      <td className="py-3 px-4 text-slate-700">{ven.contactPerson || '-'}</td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{ven.phone || '-'}</div>
                        <div className="text-[11px] text-slate-400">{ven.email || ''}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">{ven.taxNumber || '-'}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleVendorStatus(ven)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition ${
                            ven.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {ven.status}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedVendor(ven);
                              setVendorForm({
                                name: ven.name,
                                contactPerson: ven.contactPerson || '',
                                phone: ven.phone || '',
                                email: ven.email || '',
                                address: ven.address || '',
                                taxNumber: ven.taxNumber || '',
                                status: ven.status
                              });
                              setIsEditVendorOpen(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Vendor"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVendor(ven)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Vendor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Summary & Analytics */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Category Breakdown
            </h3>
            {computedCategoryBreakdown.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-center">Expense Count</th>
                      <th className="py-3 px-4 text-right">Total Expenditure</th>
                      <th className="py-3 px-4 text-right">% of Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {computedCategoryBreakdown.map((cb) => {
                      const totalAmt = Number(summary?.totalExpense ?? summary?.totalAmount ?? expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0));
                      const cbAmt = Number(cb.totalAmount || 0);
                      const pct = totalAmt > 0 ? ((cbAmt / totalAmt) * 100).toFixed(1) : '0';
                      return (
                        <tr key={cb.categoryId} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{cb.categoryName}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-700">{cb.count}</td>
                          <td className="py-3.5 px-4 text-right font-black text-slate-900">
                            ₹ {cbAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md text-[11px]">
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No expense category metrics available yet.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* MODALS */}

      {/* Modal: Create Expense */}
      <Modal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        title="Record New Expense"
        subtitle="Submit a new operational expense entry"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Expense Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., Office Stationery & Printing"
              value={expenseForm.title}
              onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                required
                value={expenseForm.categoryId}
                onChange={(e) => setExpenseForm({ ...expenseForm, categoryId: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Category --</option>
                {categories.filter(c => c.isActive !== false && c.status !== 'INACTIVE').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vendor (Optional)</label>
              <select
                value={expenseForm.vendorId}
                onChange={(e) => setExpenseForm({ ...expenseForm, vendorId: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- None / Direct --</option>
                {vendors.filter(v => v.status !== 'INACTIVE').map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expense Date *</label>
              <input
                type="date"
                required
                value={expenseForm.expenseDate}
                onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Invoice / Bill Number</label>
              <input
                type="text"
                placeholder="e.g. INV-9921"
                value={expenseForm.invoiceNumber}
                onChange={(e) => setExpenseForm({ ...expenseForm, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={expenseForm.paymentMethod}
                onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Unspecified --</option>
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">BANK TRANSFER</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="CARD">CARD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Notes</label>
            <textarea
              rows={2}
              placeholder="Additional details regarding this expense..."
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddExpenseOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Submit Expense'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Expense */}
      <Modal
        isOpen={isEditExpenseOpen}
        onClose={() => setIsEditExpenseOpen(false)}
        title="Edit Expense Record"
        subtitle={selectedExpense ? `Editing ${selectedExpense.title}` : ''}
      >
        <form onSubmit={handleUpdateExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Expense Title *</label>
            <input
              type="text"
              required
              value={expenseForm.title}
              onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                required
                value={expenseForm.categoryId}
                onChange={(e) => setExpenseForm({ ...expenseForm, categoryId: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vendor</label>
              <select
                value={expenseForm.vendorId}
                onChange={(e) => setExpenseForm({ ...expenseForm, vendorId: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- None / Direct --</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expense Date *</label>
              <input
                type="date"
                required
                value={expenseForm.expenseDate}
                onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Number</label>
              <input
                type="text"
                value={expenseForm.invoiceNumber}
                onChange={(e) => setExpenseForm({ ...expenseForm, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={expenseForm.paymentMethod}
                onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Unspecified --</option>
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">BANK TRANSFER</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="CARD">CARD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditExpenseOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Expense Details */}
      <Modal
        isOpen={isViewExpenseOpen}
        onClose={() => setIsViewExpenseOpen(false)}
        title="Expense Details"
        subtitle={selectedExpense?.paymentNumber || selectedExpense?.id}
      >
        {selectedExpense && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Title</span>
                <span className="font-bold text-slate-900 text-sm">{selectedExpense.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Amount</span>
                <span className="font-black text-slate-900 text-base">
                  ₹ {Number(selectedExpense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Status</span>
                <Badge variant={getStatusBadgeVariant(selectedExpense.status)}>
                  {selectedExpense.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Category</span>
                <span className="font-semibold text-slate-800">{selectedExpense.category?.name || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Vendor</span>
                <span className="font-semibold text-slate-800">{selectedExpense.vendor?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Expense Date</span>
                <span className="font-mono text-slate-800">{selectedExpense.expenseDate}</span>
              </div>
              {selectedExpense.invoiceNumber && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Invoice Number</span>
                  <span className="font-mono text-slate-800">{selectedExpense.invoiceNumber}</span>
                </div>
              )}
            </div>

            {/* Payment Details if available */}
            {(selectedExpense.paymentDate || selectedExpense.paymentMethod || selectedExpense.paymentNumber) && (
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/60 space-y-2">
                <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Payment Settlement
                </h4>
                {selectedExpense.paymentNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700 font-medium">Payment Number</span>
                    <span className="font-mono font-bold text-emerald-900">{selectedExpense.paymentNumber}</span>
                  </div>
                )}
                {selectedExpense.paymentDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700 font-medium">Payment Date</span>
                    <span className="font-mono text-emerald-900">{selectedExpense.paymentDate}</span>
                  </div>
                )}
                {selectedExpense.paymentMethod && (
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700 font-medium">Method</span>
                    <span className="font-semibold text-emerald-900">{selectedExpense.paymentMethod}</span>
                  </div>
                )}
                {selectedExpense.referenceNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700 font-medium">Ref / Txn ID</span>
                    <span className="font-mono text-emerald-900">{selectedExpense.referenceNumber}</span>
                  </div>
                )}
              </div>
            )}

            {selectedExpense.description && (
              <div>
                <span className="block font-bold text-slate-700 mb-1">Description</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedExpense.description}
                </p>
              </div>
            )}

            {selectedExpense.remarks && (
              <div>
                <span className="block font-bold text-slate-700 mb-1">Remarks</span>
                <p className="text-slate-600 bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900">
                  {selectedExpense.remarks}
                </p>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => downloadVoucher(selectedExpense)}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Reject Expense */}
      <Modal
        isOpen={isRejectExpenseOpen}
        onClose={() => setIsRejectExpenseOpen(false)}
        title="Reject Expense"
        subtitle="Specify reasons for rejecting this expense claim"
      >
        <form onSubmit={handleRejectExpenseSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Rejection Remarks *</label>
            <textarea
              required
              rows={3}
              placeholder="State reason for rejecting this expense..."
              value={rejectForm.remarks}
              onChange={(e) => setRejectForm({ remarks: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRejectExpenseOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-500/20 disabled:opacity-50"
            >
              {submitting ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Process Payment */}
      <Modal
        isOpen={isPayExpenseOpen}
        onClose={() => setIsPayExpenseOpen(false)}
        title="Process Expense Payment"
        subtitle={selectedExpense ? `Pay ₹${selectedExpense.amount} for ${selectedExpense.title}` : ''}
      >
        <form onSubmit={handlePayExpenseSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Date *</label>
              <input
                type="date"
                required
                value={payForm.paymentDate}
                onChange={(e) => setPayForm({ ...payForm, paymentDate: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method *</label>
              <select
                required
                value={payForm.paymentMethod}
                onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">BANK TRANSFER</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="CARD">CARD</option>
              </select>
            </div>
          </div>

          {['UPI', 'BANK_TRANSFER', 'CHEQUE'].includes(payForm.paymentMethod) && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reference # / Txn ID / Cheque # *
              </label>
              <input
                type="text"
                required
                placeholder="Enter transaction / cheque reference number"
                value={payForm.referenceNumber}
                onChange={(e) => setPayForm({ ...payForm, referenceNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Remarks (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Paid via ICICI Current Account"
              value={payForm.remarks}
              onChange={(e) => setPayForm({ ...payForm, remarks: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPayExpenseOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Processing...' : 'Confirm & Record Payment'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Category */}
      <Modal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        title="Add Expense Category"
        subtitle="Create a new classification for operational expenses"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g., Office Supplies, Repairs & Maintenance"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Brief description of expenses covered by this category..."
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddCategoryOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Category */}
      <Modal
        isOpen={isEditCategoryOpen}
        onClose={() => setIsEditCategoryOpen(false)}
        title="Edit Expense Category"
        subtitle={selectedCategory ? `Editing ${selectedCategory.name}` : ''}
      >
        <form onSubmit={handleUpdateCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={categoryForm.status}
              onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditCategoryOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Vendor */}
      <Modal
        isOpen={isAddVendorOpen}
        onClose={() => setIsAddVendorOpen(false)}
        title="Add New Vendor"
        subtitle="Register a new supplier or service provider"
      >
        <form onSubmit={handleCreateVendor} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Vendor Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Printing Press"
              value={vendorForm.name}
              onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                placeholder="Name of contact"
                value={vendorForm.contactPerson}
                onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="Phone number"
                value={vendorForm.phone}
                onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="vendor@example.com"
                value={vendorForm.email}
                onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GST / Tax ID Number</label>
              <input
                type="text"
                placeholder="GSTIN..."
                value={vendorForm.taxNumber}
                onChange={(e) => setVendorForm({ ...vendorForm, taxNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
            <textarea
              rows={2}
              placeholder="Vendor business address..."
              value={vendorForm.address}
              onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddVendorOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Vendor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Vendor */}
      <Modal
        isOpen={isEditVendorOpen}
        onClose={() => setIsEditVendorOpen(false)}
        title="Edit Vendor Information"
        subtitle={selectedVendor ? `Editing ${selectedVendor.name}` : ''}
      >
        <form onSubmit={handleUpdateVendor} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Vendor Name *</label>
            <input
              type="text"
              required
              value={vendorForm.name}
              onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={vendorForm.contactPerson}
                onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={vendorForm.phone}
                onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={vendorForm.email}
                onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GST / Tax ID Number</label>
              <input
                type="text"
                value={vendorForm.taxNumber}
                onChange={(e) => setVendorForm({ ...vendorForm, taxNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
            <textarea
              rows={2}
              value={vendorForm.address}
              onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={vendorForm.status}
              onChange={(e) => setVendorForm({ ...vendorForm, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditVendorOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
