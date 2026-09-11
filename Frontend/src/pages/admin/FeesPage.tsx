import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CreditCard,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Eye,
  Receipt,
  Calendar,
  FileText,
  User,
  RefreshCw,
  Tag,
  Percent,
} from "lucide-react";
import api from "../../services/api";
import type {
  FeeCategory,
  StudentFee,
  Installment,
  Payment,
  FeeSummary,
  PaymentMethod,
  InstallmentStatus,
} from "../../types";

interface SimpleStudent {
  id: string;
  name: string;
  email?: string;
  rollNumber?: string;
  admissionNumber?: string;
}

type TabType = "student-fees" | "installments" | "payments" | "categories";

// Helper to extract currently logged in admin details from session/local storage or JWT token
const getLoggedInUser = (): { id: string; name: string; email: string } => {
  try {
    const userStr =
      sessionStorage.getItem("user") || localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.id) {
        return {
          id: user.id,
          name: user.name || "Franchise Admin",
          email: user.email || "",
        };
      }
    }
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) {
      const parts = token.split(".");
      if (parts.length >= 2) {
        const decoded = JSON.parse(atob(parts[1]));
        if (decoded?.id) {
          return {
            id: decoded.id,
            name: decoded.name || decoded.email || "Franchise Admin",
            email: decoded.email || "",
          };
        }
      }
    }
  } catch (err) {
    console.error("Failed to extract current user credentials", err);
  }
  return { id: "", name: "Franchise Admin", email: "" };
};

export const FeesPage: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>("student-fees");
  const [search, setSearch] = useState("");

  // Data states
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [categories, setCategories] = useState<FeeCategory[]>([]);
  const [students, setStudents] = useState<SimpleStudent[]>([]);

  // Loading states per resource (independent to avoid blanking out UI on single failure)
  const [loadingFees, setLoadingFees] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingInstallments, setLoadingInstallments] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Errors per resource
  const [feesError, setFeesError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [installmentsError, setInstallmentsError] = useState<string | null>(null);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Global Alerts
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage(null);
  };

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    studentId: "",
    feeCategoryId: "",
    originalAmount: "",
    discountPercent: "0",
    remarks: "",
  });

  const [isEditFeeModalOpen, setIsEditFeeModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<StudentFee | null>(null);
  const [editFeeForm, setEditFeeForm] = useState({
    originalAmount: "",
    discountPercent: "0",
    remarks: "",
  });

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedFeeDetails, setSelectedFeeDetails] = useState<StudentFee | null>(null);

  const [isCreateInstallmentModalOpen, setIsCreateInstallmentModalOpen] = useState(false);
  const [createInstallmentForm, setCreateInstallmentForm] = useState({
    studentFeeId: "",
    installmentNumber: 1,
    amount: "",
    dueDate: "",
  });

  const [isEditInstallmentModalOpen, setIsEditInstallmentModalOpen] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<Installment | null>(null);
  const [editInstallmentForm, setEditInstallmentForm] = useState({
    amount: "",
    dueDate: "",
  });

  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [paymentTargetInstallment, setPaymentTargetInstallment] = useState<Installment | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "CASH" as PaymentMethod,
    receiptNumber: "",
    remarks: "",
  });

  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });

  // ==========================================
  // FETCHERS (Source of Truth)
  // ==========================================

  const loadFeeSummary = useCallback(async () => {
    try {
      setLoadingSummary(true);
      setSummaryError(null);
      const res = await api.get("/student-fees/summary");
      if (res.data?.success && res.data.data) {
        setFeeSummary(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to load fee summary:", err);
      setSummaryError(err.response?.data?.message || "Failed to load fee summary");
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const loadStudentFees = useCallback(async () => {
    try {
      setLoadingFees(true);
      setFeesError(null);
      const res = await api.get("/student-fees");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setStudentFees(res.data.data);
      } else {
        setStudentFees([]);
      }
    } catch (err: any) {
      console.error("Failed to load student fees:", err);
      setFeesError(err.response?.data?.message || "Failed to load student fees");
    } finally {
      setLoadingFees(false);
    }
  }, []);

  const loadInstallments = useCallback(async () => {
    try {
      setLoadingInstallments(true);
      setInstallmentsError(null);
      const res = await api.get("/installments");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setInstallments(res.data.data);
      } else {
        setInstallments([]);
      }
    } catch (err: any) {
      console.error("Failed to load installments:", err);
      setInstallmentsError(err.response?.data?.message || "Failed to load installments");
    } finally {
      setLoadingInstallments(false);
    }
  }, []);

  const loadPayments = useCallback(async () => {
    try {
      setLoadingPayments(true);
      setPaymentsError(null);
      const res = await api.get("/payments");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setPayments(res.data.data);
      } else {
        setPayments([]);
      }
    } catch (err: any) {
      console.error("Failed to load payments:", err);
      setPaymentsError(err.response?.data?.message || "Failed to load payments");
    } finally {
      setLoadingPayments(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      setCategoriesError(null);
      const res = await api.get("/fee-categories");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCategories(res.data.data);
      } else {
        setCategories([]);
      }
    } catch (err: any) {
      console.error("Failed to load fee categories:", err);
      setCategoriesError(err.response?.data?.message || "Failed to load fee categories");
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    try {
      const res = await api.get("/franchise/students", {
        params: { limit: 100 },
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load student list for selection:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadFeeSummary();
    loadStudentFees();
    loadInstallments();
    loadPayments();
    loadCategories();
    loadStudents();
  }, [
    loadFeeSummary,
    loadStudentFees,
    loadInstallments,
    loadPayments,
    loadCategories,
    loadStudents,
  ]);

  // Keep details modal in sync if studentFees update
  useEffect(() => {
    if (selectedFeeDetails) {
      const updated = studentFees.find((f) => f.id === selectedFeeDetails.id);
      if (updated) {
        setSelectedFeeDetails(updated);
      }
    }
  }, [studentFees, selectedFeeDetails]);

  // ==========================================
  // HELPERS & CALCULATIONS
  // ==========================================

  const getFeePaidAmount = (fee: StudentFee): number => {
    let paid = 0;
    fee.installments?.forEach((inst) => {
      inst.payments?.forEach((p) => {
        paid += Number(p.amount || 0);
      });
    });
    return paid;
  };

  const getInstallmentPaidAmount = (inst: Installment): number => {
    let paid = 0;
    inst.payments?.forEach((p) => {
      paid += Number(p.amount || 0);
    });
    return paid;
  };

  const getInstallmentStatusBadge = (status: InstallmentStatus) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PAID
          </span>
        );
      case "PARTIAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock3 className="w-3.5 h-3.5" />
            PARTIAL
          </span>
        );
      case "OVERDUE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" />
            OVERDUE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock3 className="w-3.5 h-3.5" />
            PENDING
          </span>
        );
    }
  };

  // Filtered lists for each tab
  const filteredStudentFees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return studentFees;
    return studentFees.filter((f) => {
      const studentName = f.student?.name?.toLowerCase() || "";
      const catName = f.category?.name?.toLowerCase() || "";
      return studentName.includes(q) || catName.includes(q);
    });
  }, [studentFees, search]);

  const filteredInstallments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return installments;
    return installments.filter((i) => {
      const studentName = i.studentFee?.student?.name?.toLowerCase() || "";
      const catName = i.studentFee?.category?.name?.toLowerCase() || "";
      const status = i.status?.toLowerCase() || "";
      return studentName.includes(q) || catName.includes(q) || status.includes(q);
    });
  }, [installments, search]);

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((p) => {
      const studentName = p.student?.name?.toLowerCase() || "";
      const receiptNo = p.receiptNumber?.toLowerCase() || "";
      const refNo = p.referenceNumber?.toLowerCase() || "";
      const method = p.paymentMethod?.toLowerCase() || "";
      return (
        studentName.includes(q) ||
        receiptNo.includes(q) ||
        refNo.includes(q) ||
        method.includes(q)
      );
    });
  }, [payments, search]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => {
      const name = c.name?.toLowerCase() || "";
      const desc = c.description?.toLowerCase() || "";
      return name.includes(q) || desc.includes(q);
    });
  }, [categories, search]);

  // ==========================================
  // HANDLERS: ASSIGN STUDENT FEE
  // ==========================================

  const calculatedAssignFinal = useMemo(() => {
    const orig = Number(assignForm.originalAmount) || 0;
    const disc = Number(assignForm.discountPercent) || 0;
    if (orig <= 0) return 0;
    return Math.max(0, orig - (orig * disc) / 100);
  }, [assignForm.originalAmount, assignForm.discountPercent]);

  const handleOpenAssignModal = () => {
    loadCategories();
    loadStudents();
    setAssignForm({
      studentId: "",
      feeCategoryId: categories[0]?.id || "",
      originalAmount: "",
      discountPercent: "0",
      remarks: "",
    });
    setErrorMessage(null);
    setIsAssignModalOpen(true);
  };

  // Synchronize category selection in Assign Fee modal once categories are loaded
  useEffect(() => {
    if (isAssignModalOpen && !assignForm.feeCategoryId && categories.length > 0) {
      setAssignForm((prev) => ({
        ...prev,
        feeCategoryId: categories[0].id,
      }));
    }
  }, [isAssignModalOpen, categories, assignForm.feeCategoryId]);

  const handleAssignFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.studentId) {
      triggerError("Please select a student.");
      return;
    }
    if (!assignForm.feeCategoryId) {
      triggerError("Please select a fee category.");
      return;
    }
    const orig = Number(assignForm.originalAmount);
    if (!orig || orig <= 0) {
      triggerError("Please enter a valid original amount greater than 0.");
      return;
    }
    const disc = Number(assignForm.discountPercent);
    if (isNaN(disc) || disc < 0 || disc > 100) {
      triggerError("Discount percentage must be between 0 and 100.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        studentId: assignForm.studentId,
        feeCategoryId: assignForm.feeCategoryId,
        originalAmount: orig,
        discountPercent: disc,
        remarks: assignForm.remarks.trim() || undefined,
      };

      const res = await api.post("/student-fees", payload);
      if (res.data?.success) {
        triggerSuccess("Student fee assigned successfully.");
        setIsAssignModalOpen(false);
        await Promise.all([loadStudentFees(), loadFeeSummary()]);
      } else {
        throw new Error(res.data?.message || "Failed to assign student fee.");
      }
    } catch (err: any) {
      console.error("Assign fee error:", err);
      triggerError(err.response?.data?.message || err.message || "Failed to assign student fee.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // HANDLERS: EDIT STUDENT FEE
  // ==========================================

  const calculatedEditFinal = useMemo(() => {
    const orig = Number(editFeeForm.originalAmount) || 0;
    const disc = Number(editFeeForm.discountPercent) || 0;
    if (orig <= 0) return 0;
    return Math.max(0, orig - (orig * disc) / 100);
  }, [editFeeForm.originalAmount, editFeeForm.discountPercent]);

  const handleOpenEditFeeModal = (fee: StudentFee) => {
    setEditingFee(fee);
    setEditFeeForm({
      originalAmount: String(fee.originalAmount),
      discountPercent: String(fee.discountPercent || "0"),
      remarks: fee.remarks || "",
    });
    setErrorMessage(null);
    setIsEditFeeModalOpen(true);
  };

  const handleEditFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFee) return;

    const orig = Number(editFeeForm.originalAmount);
    if (!orig || orig <= 0) {
      triggerError("Please enter a valid original amount greater than 0.");
      return;
    }
    const disc = Number(editFeeForm.discountPercent);
    if (isNaN(disc) || disc < 0 || disc > 100) {
      triggerError("Discount percentage must be between 0 and 100.");
      return;
    }

    try {
      setSubmitting(true);
      // STRICT: Backend contract for PUT /api/student-fees/:id only allows originalAmount, discountPercent, remarks
      const payload = {
        originalAmount: orig,
        discountPercent: disc,
        remarks: editFeeForm.remarks.trim() || undefined,
      };

      const res = await api.put(`/student-fees/${editingFee.id}`, payload);
      if (res.data?.success) {
        triggerSuccess("Student fee updated successfully.");
        setIsEditFeeModalOpen(false);
        setEditingFee(null);
        await Promise.all([loadStudentFees(), loadFeeSummary()]);
      } else {
        throw new Error(res.data?.message || "Failed to update student fee.");
      }
    } catch (err: any) {
      console.error("Update fee error:", err);
      triggerError(err.response?.data?.message || err.message || "Failed to update student fee.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudentFee = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this fee assignment? Any related installments must be cleared first."
      )
    ) {
      return;
    }
    try {
      const res = await api.delete(`/student-fees/${id}`);
      if (res.data?.success) {
        triggerSuccess("Student fee deleted successfully.");
        await Promise.all([loadStudentFees(), loadFeeSummary(), loadInstallments()]);
      } else {
        throw new Error(res.data?.message || "Failed to delete student fee.");
      }
    } catch (err: any) {
      console.error("Delete student fee error:", err);
      triggerError(err.response?.data?.message || err.message || "Failed to delete student fee.");
    }
  };

  // ==========================================
  // HANDLERS: INSTALLMENTS
  // ==========================================

  const handleOpenCreateInstallmentModal = (preselectedStudentFeeId?: string) => {
    const feeId =
      preselectedStudentFeeId ||
      selectedFeeDetails?.id ||
      studentFees[0]?.id ||
      "";

    // Auto calculate next installment number for that fee
    const fee = studentFees.find((f) => f.id === feeId);
    const existingCount = fee?.installments?.length || 0;

    setCreateInstallmentForm({
      studentFeeId: feeId,
      installmentNumber: existingCount + 1,
      amount: "",
      dueDate: "",
    });
    setErrorMessage(null);
    setIsCreateInstallmentModalOpen(true);
  };

  const handleCreateInstallmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createInstallmentForm.studentFeeId) {
      triggerError("Please select a student fee assignment.");
      return;
    }
    const instNum = Number(createInstallmentForm.installmentNumber);
    if (!instNum || instNum < 1) {
      triggerError("Installment number must be at least 1.");
      return;
    }
    const amt = Number(createInstallmentForm.amount);
    if (!amt || amt <= 0) {
      triggerError("Please enter a valid installment amount.");
      return;
    }
    if (!createInstallmentForm.dueDate) {
      triggerError("Please specify a due date.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        studentFeeId: createInstallmentForm.studentFeeId,
        installmentNumber: instNum,
        amount: amt,
        dueDate: createInstallmentForm.dueDate,
      };

      const res = await api.post("/installments", payload);
      if (res.data?.success) {
        triggerSuccess("Installment created successfully.");
        setIsCreateInstallmentModalOpen(false);
        await Promise.all([loadInstallments(), loadStudentFees(), loadFeeSummary()]);
      } else {
        throw new Error(res.data?.message || "Failed to create installment.");
      }
    } catch (err: any) {
      console.error("Create installment error:", err);
      triggerError(err.response?.data?.message || err.message || "Failed to create installment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditInstallmentModal = (inst: Installment) => {
    setEditingInstallment(inst);
    setEditInstallmentForm({
      amount: String(inst.amount),
      dueDate: inst.dueDate ? inst.dueDate.substring(0, 10) : "",
    });
    setErrorMessage(null);
    setIsEditInstallmentModalOpen(true);
  };

  const handleEditInstallmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstallment) return;

    const amt = Number(editInstallmentForm.amount);
    if (!amt || amt <= 0) {
      triggerError("Please enter a valid amount.");
      return;
    }
    if (!editInstallmentForm.dueDate) {
      triggerError("Please select a due date.");
      return;
    }

    try {
      setSubmitting(true);
      // STRICT: Backend allows amount and dueDate only
      const payload = {
        amount: amt,
        dueDate: editInstallmentForm.dueDate,
      };

      const res = await api.put(`/installments/${editingInstallment.id}`, payload);
      if (res.data?.success) {
        triggerSuccess("Installment updated successfully.");
        setIsEditInstallmentModalOpen(false);
        setEditingInstallment(null);
        await Promise.all([loadInstallments(), loadStudentFees(), loadFeeSummary()]);
      } else {
        throw new Error(res.data?.message || "Failed to update installment.");
      }
    } catch (err: any) {
      console.error("Edit installment error:", err);
      triggerError(err.response?.data?.message || err.message || "Failed to update installment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInstallment = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this installment?")) return;

    try {
      const res = await api.delete(`/installments/${id}`);
      if (res.data?.success) {
        triggerSuccess("Installment deleted successfully.");
        await Promise.all([loadInstallments(), loadStudentFees(), loadFeeSummary()]);
      } else {
        throw new Error(res.data?.message || "Failed to delete installment.");
      }
    } catch (err: any) {
      console.error("Delete installment error:", err);
      triggerError(err.response?.data?.message || err.message || "Failed to delete installment.");
    }
  };

  // ==========================================
  // HANDLERS: RECORD PAYMENT
  // ==========================================

  const handleOpenRecordPaymentModal = (inst: Installment) => {
    setPaymentTargetInstallment(inst);
    const totalPaid = getInstallmentPaidAmount(inst);
    const remaining = Math.max(0, Number(inst.amount) - totalPaid);

    setPaymentForm({
      amount: String(remaining > 0 ? remaining : ""),
      paymentMethod: "CASH",
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
      remarks: "",
    });
    setErrorMessage(null);
    setIsRecordPaymentModalOpen(true);
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTargetInstallment) return;

    const loggedInUser = getLoggedInUser();
    if (!loggedInUser.id) {
      triggerError("Unable to detect authenticated user session. Please re-login.");
      return;
    }

    const payAmt = Number(paymentForm.amount);
    if (!payAmt || payAmt <= 0) {
      triggerError("Payment amount must be greater than 0.");
      return;
    }

    const totalPaid = getInstallmentPaidAmount(paymentTargetInstallment);
    const remaining = Math.max(0, Number(paymentTargetInstallment.amount) - totalPaid);

    if (payAmt > remaining) {
      triggerError(`Payment amount (₹${payAmt}) cannot exceed the remaining balance of ₹${remaining}.`);
      return;
    }

    if (!paymentForm.receiptNumber.trim()) {
      triggerError("Receipt number is required.");
      return;
    }

    // Resolve studentId from installment hierarchy
    const studentId =
      paymentTargetInstallment.studentFee?.studentId ||
      paymentTargetInstallment.studentFee?.student?.id;

    if (!studentId) {
      triggerError("Unable to locate associated student for this installment.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        studentId,
        installmentId: paymentTargetInstallment.id,
        amount: payAmt,
        paymentMethod: paymentForm.paymentMethod,
        receiptNumber: paymentForm.receiptNumber.trim(),
        receivedBy: loggedInUser.id,
        remarks: paymentForm.remarks.trim() || undefined,
      };

      const res = await api.post("/payments", payload);
      if (res.data?.success) {
        triggerSuccess("Payment recorded successfully.");
        setIsRecordPaymentModalOpen(false);
        setPaymentTargetInstallment(null);
        await Promise.all([
          loadPayments(),
          loadInstallments(),
          loadStudentFees(),
          loadFeeSummary(),
        ]);
      } else {
        throw new Error(res.data?.message || "Failed to record payment.");
      }
    } catch (err: any) {
      console.error("Record payment error:", err);
      triggerError(err.response?.data?.message || err.message || "Failed to record payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this payment record? This will adjust the installment balance.")) {
      return;
    }
    try {
      const res = await api.delete(`/payments/${id}`);
      if (res.data?.success) {
        triggerSuccess("Payment deleted and installment status recalculated.");
        await Promise.all([
          loadPayments(),
          loadInstallments(),
          loadStudentFees(),
          loadFeeSummary(),
        ]);
      } else {
        throw new Error(res.data?.message || "Failed to delete payment.");
      }
    } catch (err: any) {
      console.error("Delete payment error:", err);
      triggerError(err.response?.data?.message || err.message || "Failed to delete payment.");
    }
  };

  // ==========================================
  // HANDLERS: CATEGORIES
  // ==========================================

  const handleOpenAddCategoryModal = () => {
    setCategoryForm({ name: "", description: "" });
    setErrorMessage(null);
    setIsAddCategoryModalOpen(true);
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      triggerError("Category name is required.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || undefined,
      };

      const res = await api.post("/fee-categories", payload);
      if (res.data?.success) {
        triggerSuccess("Fee category created successfully.");
        setIsAddCategoryModalOpen(false);
        await loadCategories();
      } else {
        throw new Error(res.data?.message || "Failed to create fee category.");
      }
    } catch (err: any) {
      console.error("Create category error:", err);
      triggerError(err.response?.data?.message || err.message || "Failed to create fee category.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  const loggedInUser = getLoggedInUser();

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Fees Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage fee categories, student fee allocations, installment schedules, and payment collections.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              loadFeeSummary();
              loadStudentFees();
              loadInstallments();
              loadPayments();
              loadCategories();
            }}
            title="Refresh fee data"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {activeTab === "student-fees" && (
            <button
              onClick={handleOpenAssignModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:opacity-95 transition"
            >
              <Plus className="w-4 h-4" />
              Assign Fee
            </button>
          )}

          {activeTab === "installments" && (
            <button
              onClick={() => handleOpenCreateInstallmentModal()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:opacity-95 transition"
            >
              <Plus className="w-4 h-4" />
              Create Installment
            </button>
          )}

          {activeTab === "categories" && (
            <button
              onClick={handleOpenAddCategoryModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:opacity-95 transition"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          )}
        </div>
      </div>

      {/* Global Notifications */}
      {successMessage && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary Error Notice if backend summary API fails */}
      {summaryError && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
          <span>Fee Summary: {summaryError}</span>
          <button
            onClick={loadFeeSummary}
            className="underline hover:text-amber-900 ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top KPI Metrics Cards (Sourced from /api/student-fees/summary) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Fee Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Fee
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">
                {loadingSummary ? (
                  <span className="text-slate-400 text-lg">Loading...</span>
                ) : (
                  `₹${Number(feeSummary?.totalFee || 0).toLocaleString("en-IN")}`
                )}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Gross assigned amount</p>
        </div>

        {/* Discount Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Discount Given
              </p>
              <p className="text-2xl font-extrabold text-purple-600 mt-2">
                {loadingSummary ? (
                  <span className="text-slate-400 text-lg">Loading...</span>
                ) : (
                  `₹${Number(feeSummary?.discount || 0).toLocaleString("en-IN")}`
                )}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
              <Percent className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Waivers & concessions</p>
        </div>

        {/* Net Payable Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Net Payable
              </p>
              <p className="text-2xl font-extrabold text-indigo-600 mt-2">
                {loadingSummary ? (
                  <span className="text-slate-400 text-lg">Loading...</span>
                ) : (
                  `₹${Number(feeSummary?.payable || 0).toLocaleString("en-IN")}`
                )}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Net receivable fees</p>
        </div>

        {/* Total Paid Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Paid
              </p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-2">
                {loadingSummary ? (
                  <span className="text-slate-400 text-lg">Loading...</span>
                ) : (
                  `₹${Number(feeSummary?.paid || 0).toLocaleString("en-IN")}`
                )}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Collected to date</p>
        </div>

        {/* Total Pending Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Pending
              </p>
              <p className="text-2xl font-extrabold text-amber-600 mt-2">
                {loadingSummary ? (
                  <span className="text-slate-400 text-lg">Loading...</span>
                ) : (
                  `₹${Number(feeSummary?.pending || 0).toLocaleString("en-IN")}`
                )}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock3 className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Remaining balance</p>
        </div>
      </div>

      {/* Tabs & Search Bar Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab("student-fees");
              setSearch("");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "student-fees"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Student Fees</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === "student-fees"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {studentFees.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("installments");
              setSearch("");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "installments"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Installments</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === "installments"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {installments.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("payments");
              setSearch("");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "payments"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Payment History</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === "payments"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {payments.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("categories");
              setSearch("");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "categories"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Fee Categories</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === "categories"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {categories.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === "student-fees"
                ? "Search student or category..."
                : activeTab === "installments"
                ? "Search student or status..."
                : activeTab === "payments"
                ? "Search student, receipt, or ref #..."
                : "Search fee categories..."
            }
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-800 placeholder-slate-400 transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: STUDENT FEES                                        */}
      {/* ========================================================= */}
      {activeTab === "student-fees" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {feesError && (
            <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-between">
              <span>{feesError}</span>
              <button
                onClick={loadStudentFees}
                className="underline hover:text-rose-900"
              >
                Retry
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Fee Category
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Original Amount
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Final Payable
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Paid / Pending
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Installments
                  </th>
                  <th className="text-right px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loadingFees ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Loading student fees...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredStudentFees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <CreditCard className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="mt-3 text-sm font-bold text-slate-700">
                        {search ? "No student fees match your search" : "No student fees assigned yet"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {search ? "Try clearing the search query." : "Click 'Assign Fee' to assign a fee category to a student."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredStudentFees.map((fee) => {
                    const paid = getFeePaidAmount(fee);
                    const pending = Math.max(0, Number(fee.finalAmount || 0) - paid);
                    const totalInst = fee.installments?.length || 0;
                    const paidInst =
                      fee.installments?.filter((i) => i.status === "PAID").length || 0;

                    return (
                      <tr key={fee.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4">
                          <div className="font-bold text-sm text-slate-900">
                            {fee.student?.name || "Unknown Student"}
                          </div>
                          {fee.student?.email && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              {fee.student.email}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                            <Tag className="w-3 h-3 text-slate-500" />
                            {fee.category?.name || "Uncategorized"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                          ₹{Number(fee.originalAmount || 0).toLocaleString("en-IN")}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-purple-700">
                          {Number(fee.discountPercent || 0) > 0 ? (
                            <span>{fee.discountPercent}% off</span>
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm font-extrabold text-slate-900">
                          ₹{Number(fee.finalAmount || 0).toLocaleString("en-IN")}
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-xs font-bold text-emerald-600">
                            Paid: ₹{paid.toLocaleString("en-IN")}
                          </div>
                          <div className="text-xs font-semibold text-amber-600 mt-0.5">
                            Pending: ₹{pending.toLocaleString("en-IN")}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {totalInst > 0 ? (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold ${
                                paidInst === totalInst
                                  ? "bg-emerald-50 text-emerald-700"
                                  : paidInst > 0
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {paidInst} / {totalInst} Paid
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              No installments
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedFeeDetails(fee);
                                setIsDetailsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                              title="View Fee Details & Installments"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenEditFeeModal(fee)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                              title="Edit Fee"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteStudentFee(fee.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete Fee Assignment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: INSTALLMENTS                                        */}
      {/* ========================================================= */}
      {activeTab === "installments" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {installmentsError && (
            <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-between">
              <span>{installmentsError}</span>
              <button
                onClick={loadInstallments}
                className="underline hover:text-rose-900"
              >
                Retry
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Fee Category
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Installment #
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Paid / Balance
                  </th>
                  <th className="text-right px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loadingInstallments ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Loading installment schedules...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredInstallments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <Calendar className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="mt-3 text-sm font-bold text-slate-700">
                        {search ? "No installments match your search" : "No installment schedules configured"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {search ? "Try clearing the search query." : "Click 'Create Installment' to schedule a fee payment."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredInstallments.map((inst) => {
                    const paid = getInstallmentPaidAmount(inst);
                    const remaining = Math.max(0, Number(inst.amount) - paid);

                    return (
                      <tr key={inst.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4">
                          <div className="font-bold text-sm text-slate-900">
                            {inst.studentFee?.student?.name || "Unknown Student"}
                          </div>
                          {inst.studentFee?.student?.email && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              {inst.studentFee.student.email}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                            {inst.studentFee?.category?.name || "General Fee"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-extrabold text-slate-800">
                          #{inst.installmentNumber}
                        </td>

                        <td className="px-5 py-4 text-sm font-extrabold text-slate-900">
                          ₹{Number(inst.amount).toLocaleString("en-IN")}
                        </td>

                        <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                          {inst.dueDate
                            ? new Date(inst.dueDate).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </td>

                        <td className="px-5 py-4">
                          {getInstallmentStatusBadge(inst.status)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-xs font-bold text-emerald-600">
                            Paid: ₹{paid.toLocaleString("en-IN")}
                          </div>
                          <div className="text-xs font-semibold text-amber-600 mt-0.5">
                            Bal: ₹{remaining.toLocaleString("en-IN")}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {inst.status !== "PAID" && (
                              <button
                                onClick={() => handleOpenRecordPaymentModal(inst)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition shadow-xs"
                                title="Record payment collection"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Pay</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenEditInstallmentModal(inst)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                              title="Edit Installment"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteInstallment(inst.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete Installment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PAYMENT HISTORY                                    */}
      {/* ========================================================= */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {paymentsError && (
            <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-between">
              <span>{paymentsError}</span>
              <button
                onClick={loadPayments}
                className="underline hover:text-rose-900"
              >
                Retry
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Ref # / Receipt #
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Category & Inst.
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Amount Paid
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Received By
                  </th>
                  <th className="text-right px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loadingPayments ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Loading payment transaction records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <Receipt className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="mt-3 text-sm font-bold text-slate-700">
                        {search ? "No payments match your search" : "No payment collections recorded yet"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {search ? "Try clearing the search query." : "Record payments against installments from the Installments or Student Fees tabs."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => {
                    const instNum = p.installment?.installmentNumber;
                    const catName = p.installment?.studentFee?.category?.name;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4">
                          <div className="font-extrabold text-xs text-indigo-700 font-mono">
                            {p.referenceNumber}
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            Rcpt: {p.receiptNumber}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-bold text-sm text-slate-900">
                            {p.student?.name || "Unknown Student"}
                          </div>
                          {p.student?.email && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              {p.student.email}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-xs font-bold text-slate-700">
                            {catName || "Fee Category"}
                          </div>
                          {instNum !== undefined && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              Installment #{instNum}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm font-extrabold text-emerald-600">
                          ₹{Number(p.amount).toLocaleString("en-IN")}
                        </td>

                        <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                          {p.paymentDate
                            ? new Date(p.paymentDate).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800">
                            {p.paymentMethod}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-500 font-mono truncate max-w-[120px]" title={p.receivedBy}>
                          {p.receivedBy.substring(0, 8)}...
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleDeletePayment(p.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete Payment (Reverts Installment Status)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: FEE CATEGORIES                                     */}
      {/* ========================================================= */}
      {activeTab === "categories" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {categoriesError && (
            <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-between">
              <span>{categoriesError}</span>
              <button
                onClick={loadCategories}
                className="underline hover:text-rose-900"
              >
                Retry
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Created Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loadingCategories ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-sm text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Loading fee categories...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center">
                      <Tag className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="mt-3 text-sm font-bold text-slate-700">
                        {search ? "No categories match your search" : "No fee categories created yet"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {search ? "Try clearing the search query." : "Click 'Add Category' to define tuition, transport, exam, or other fees."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <Tag className="w-4 h-4 text-blue-600" />
                          <span>{cat.name}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {cat.description || <span className="text-slate-400 italic">No description provided</span>}
                      </td>

                      <td className="px-5 py-4">
                        {cat.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                        {cat.createdAt
                          ? new Date(cat.createdAt).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ASSIGN STUDENT FEE                               */}
      {/* ========================================================= */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Assign Fee to Student
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allocate a fee structure with optional scholarship or discount.
                </p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignFeeSubmit} className="p-6 space-y-4">
              {/* Student Select */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Select Student *
                </label>
                <select
                  value={assignForm.studentId}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, studentId: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                >
                  <option value="">-- Choose student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.rollNumber ? `(Roll: ${s.rollNumber})` : ""} {s.email ? `— ${s.email}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fee Category Select */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-600">
                    Fee Category *
                  </label>
                  {loadingCategories && (
                    <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Loading...
                    </span>
                  )}
                </div>
                <select
                  value={assignForm.feeCategoryId}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, feeCategoryId: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                  disabled={loadingCategories}
                >
                  <option value="">-- Choose fee category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {!loadingCategories && categories.length === 0 && (
                  <div className="mt-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                    <p className="text-[11px] text-amber-700 font-medium">
                      No categories found. Please create a Fee Category first.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAssignModalOpen(false);
                        setActiveTab("categories");
                        handleOpenAddCategoryModal();
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 underline ml-2 shrink-0 cursor-pointer"
                    >
                      + Add Category
                    </button>
                  </div>
                )}
              </div>

              {/* Amounts & Discount Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Original Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={assignForm.originalAmount}
                    onChange={(e) =>
                      setAssignForm({ ...assignForm, originalAmount: e.target.value })
                    }
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={assignForm.discountPercent}
                    onChange={(e) =>
                      setAssignForm({ ...assignForm, discountPercent: e.target.value })
                    }
                    placeholder="0 - 100"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Calculated Final Payable Preview */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">
                  Calculated Final Payable:
                </span>
                <span className="text-lg font-extrabold text-blue-700">
                  ₹{calculatedAssignFinal.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  value={assignForm.remarks}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, remarks: e.target.value })
                  }
                  placeholder="Optional notes regarding this fee assignment..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:opacity-95 transition disabled:opacity-50"
                >
                  {submitting ? "Assigning..." : "Assign Fee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: EDIT STUDENT FEE                                 */}
      {/* ========================================================= */}
      {isEditFeeModalOpen && editingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Edit Student Fee
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Student: {editingFee.student?.name} | Category: {editingFee.category?.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditFeeModalOpen(false);
                  setEditingFee(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditFeeSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Original Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={editFeeForm.originalAmount}
                    onChange={(e) =>
                      setEditFeeForm({ ...editFeeForm, originalAmount: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={editFeeForm.discountPercent}
                    onChange={(e) =>
                      setEditFeeForm({ ...editFeeForm, discountPercent: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">
                  Updated Final Payable:
                </span>
                <span className="text-lg font-extrabold text-blue-700">
                  ₹{calculatedEditFinal.toLocaleString("en-IN")}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  value={editFeeForm.remarks}
                  onChange={(e) =>
                    setEditFeeForm({ ...editFeeForm, remarks: e.target.value })
                  }
                  placeholder="Optional remarks..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditFeeModalOpen(false);
                    setEditingFee(null);
                  }}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:opacity-95 transition disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Update Fee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: VIEW FEE DETAILS & MANAGE INSTALLMENTS            */}
      {/* ========================================================= */}
      {isDetailsModalOpen && selectedFeeDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-up">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Fee Allocation Details
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedFeeDetails.student?.name} — {selectedFeeDetails.category?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedFeeDetails(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Financial Summary Card Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Original</span>
                  <p className="text-base font-extrabold text-slate-800 mt-0.5">
                    ₹{Number(selectedFeeDetails.originalAmount).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Discount</span>
                  <p className="text-base font-extrabold text-purple-600 mt-0.5">
                    {Number(selectedFeeDetails.discountPercent || 0)}%
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Final Payable</span>
                  <p className="text-base font-extrabold text-indigo-700 mt-0.5">
                    ₹{Number(selectedFeeDetails.finalAmount).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total Paid</span>
                  <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                    ₹{getFeePaidAmount(selectedFeeDetails).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {selectedFeeDetails.remarks && (
                <div className="text-xs text-slate-600 bg-amber-50/70 border border-amber-100 p-3 rounded-xl">
                  <span className="font-bold text-amber-800">Remarks: </span>
                  {selectedFeeDetails.remarks}
                </div>
              )}

              {/* Installments Breakdown Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Associated Installment Schedule</span>
                  </h3>
                  <button
                    onClick={() => {
                      handleOpenCreateInstallmentModal(selectedFeeDetails.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Installment</span>
                  </button>
                </div>

                {(!selectedFeeDetails.installments || selectedFeeDetails.installments.length === 0) ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-bold text-slate-600 mt-2">No installments scheduled</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Create installments to divide this payable fee across due dates.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedFeeDetails.installments.map((inst) => {
                      const instPaid = getInstallmentPaidAmount(inst);
                      const instRemaining = Math.max(0, Number(inst.amount) - instPaid);

                      return (
                        <div
                          key={inst.id}
                          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-blue-200 transition space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center">
                                #{inst.installmentNumber}
                              </span>
                              <div>
                                <span className="text-sm font-extrabold text-slate-900">
                                  ₹{Number(inst.amount).toLocaleString("en-IN")}
                                </span>
                                <span className="text-xs text-slate-400 ml-2">
                                  Due: {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString("en-IN") : "—"} (Remaining: ₹{instRemaining.toLocaleString("en-IN")})
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {getInstallmentStatusBadge(inst.status)}

                              {inst.status !== "PAID" && (
                                <button
                                  onClick={() => handleOpenRecordPaymentModal(inst)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                  <span>Collect</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Payments under this installment */}
                          {inst.payments && inst.payments.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Payment Records ({inst.payments.length})
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {inst.payments.map((pmt) => (
                                  <div
                                    key={pmt.id}
                                    className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                                  >
                                    <div>
                                      <span className="font-extrabold text-emerald-600">
                                        ₹{Number(pmt.amount).toLocaleString("en-IN")}
                                      </span>
                                      <span className="text-slate-400 ml-2 text-[11px]">
                                        ({pmt.paymentMethod})
                                      </span>
                                    </div>
                                    <span className="font-mono text-[10px] text-slate-500">
                                      {pmt.referenceNumber}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedFeeDetails(null);
                }}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: CREATE INSTALLMENT                               */}
      {/* ========================================================= */}
      {isCreateInstallmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Create Installment
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Schedule an installment for an assigned student fee.
                </p>
              </div>
              <button
                onClick={() => setIsCreateInstallmentModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInstallmentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Select Student Fee *
                </label>
                <select
                  value={createInstallmentForm.studentFeeId}
                  onChange={(e) => {
                    const feeId = e.target.value;
                    const fee = studentFees.find((f) => f.id === feeId);
                    setCreateInstallmentForm({
                      ...createInstallmentForm,
                      studentFeeId: feeId,
                      installmentNumber: (fee?.installments?.length || 0) + 1,
                    });
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                >
                  <option value="">-- Choose student fee --</option>
                  {studentFees.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.student?.name} — {f.category?.name} (Payable: ₹{Number(f.finalAmount).toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Installment # *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={createInstallmentForm.installmentNumber}
                    onChange={(e) =>
                      setCreateInstallmentForm({
                        ...createInstallmentForm,
                        installmentNumber: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Installment Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={createInstallmentForm.amount}
                    onChange={(e) =>
                      setCreateInstallmentForm({
                        ...createInstallmentForm,
                        amount: e.target.value,
                      })
                    }
                    placeholder="e.g. 15000"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={createInstallmentForm.dueDate}
                  onChange={(e) =>
                    setCreateInstallmentForm({
                      ...createInstallmentForm,
                      dueDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateInstallmentModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:opacity-95 transition disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Installment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: EDIT INSTALLMENT                                 */}
      {/* ========================================================= */}
      {isEditInstallmentModalOpen && editingInstallment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Edit Installment #{editingInstallment.installmentNumber}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update amount or due date for this schedule.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditInstallmentModalOpen(false);
                  setEditingInstallment(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditInstallmentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={editInstallmentForm.amount}
                  onChange={(e) =>
                    setEditInstallmentForm({
                      ...editInstallmentForm,
                      amount: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={editInstallmentForm.dueDate}
                  onChange={(e) =>
                    setEditInstallmentForm({
                      ...editInstallmentForm,
                      dueDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditInstallmentModalOpen(false);
                    setEditingInstallment(null);
                  }}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:opacity-95 transition disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Update Installment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: RECORD PAYMENT                                   */}
      {/* ========================================================= */}
      {isRecordPaymentModalOpen && paymentTargetInstallment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Record Payment
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Collect fee against installment #{paymentTargetInstallment.installmentNumber}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsRecordPaymentModalOpen(false);
                  setPaymentTargetInstallment(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4">
              {/* Target Installment Info Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Student:</span>
                  <span className="font-extrabold text-slate-900">
                    {paymentTargetInstallment.studentFee?.student?.name || "Student"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Category:</span>
                  <span className="font-semibold text-slate-700">
                    {paymentTargetInstallment.studentFee?.category?.name || "Fee"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Installment Amount:</span>
                  <span className="font-semibold text-slate-800">
                    ₹{Number(paymentTargetInstallment.amount).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Already Paid:</span>
                  <span className="font-semibold text-emerald-600">
                    ₹{getInstallmentPaidAmount(paymentTargetInstallment).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                  <span className="font-extrabold text-slate-700">Remaining Balance:</span>
                  <span className="font-extrabold text-amber-600 text-sm">
                    ₹{Math.max(
                      0,
                      Number(paymentTargetInstallment.amount) -
                        getInstallmentPaidAmount(paymentTargetInstallment)
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Amount to Pay */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  max={Math.max(
                    0,
                    Number(paymentTargetInstallment.amount) -
                      getInstallmentPaidAmount(paymentTargetInstallment)
                  )}
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-extrabold text-emerald-700"
                  required
                />
              </div>

              {/* Payment Method & Receipt # Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Payment Method *
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        paymentMethod: e.target.value as PaymentMethod,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                    required
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Receipt Number *
                  </label>
                  <input
                    value={paymentForm.receiptNumber}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, receiptNumber: e.target.value })
                    }
                    placeholder="e.g. REC-102938"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Received By (Read-only verified admin user) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Received By (Logged-in Staff)
                </label>
                <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {loggedInUser.name}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {loggedInUser.id ? `ID: ${loggedInUser.id.substring(0, 8)}...` : "Session verified"}
                  </span>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  value={paymentForm.remarks}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, remarks: e.target.value })
                  }
                  placeholder="Optional payment notes..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecordPaymentModalOpen(false);
                    setPaymentTargetInstallment(null);
                  }}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:opacity-95 transition disabled:opacity-50"
                >
                  {submitting ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: ADD FEE CATEGORY                                 */}
      {/* ========================================================= */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Add Fee Category
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define a new category (e.g. Tuition, Transport, Sports).
                </p>
              </div>
              <button
                onClick={() => setIsAddCategoryModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Category Name *
                </label>
                <input
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  placeholder="e.g. Tuition Fee, Bus Transport, Library"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                  placeholder="Optional details about what this fee covers..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:opacity-95 transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesPage;