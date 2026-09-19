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
  Receipt,
  Calendar,
  FileText,
  User,
  RefreshCw,
  Tag,
  Percent,
  Download,
  Eye,
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
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
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
    items: [
      { id: Date.now(), feeCategoryId: "", originalAmount: "", discountPercent: "0", customName: "" }
    ],
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
  const [selectedFeeDetails, setSelectedFeeDetails] = useState<any | null>(null);

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
      const summaryData = res.data?.data || res.data;
      if (summaryData && typeof summaryData === "object") {
        setFeeSummary({
          totalFee: Number(summaryData.totalOriginal ?? summaryData.totalFee ?? 0),
          discount: Number(summaryData.totalDiscount ?? summaryData.discount ?? 0),
          payable: Number(summaryData.totalPayable ?? summaryData.payable ?? 0),
          paid: Number(summaryData.totalPaid ?? summaryData.paid ?? 0),
          pending: Number(summaryData.totalPending ?? summaryData.pending ?? 0),
        });
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
      
      // Also fetch classes and sections here so they are available globally
      api.get("/franchise/classes").then(res => setClasses(Array.isArray(res.data?.data) ? res.data.data : [])).catch(console.error);
      api.get("/franchise/sections").then(res => setSections(Array.isArray(res.data?.data) ? res.data.data : [])).catch(console.error);

      const res = await api.get("/student-fees");
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setStudentFees(list);
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
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setInstallments(list);
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
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setPayments(list);
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
      
      const [res, classRes, secRes] = await Promise.all([
        api.get("/fee-categories"),
        api.get("/franchise/classes").catch(() => ({ data: { data: [] } })),
        api.get("/franchise/sections").catch(() => ({ data: { data: [] } }))
      ]);
      
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
        
      // Sort according to user preference
      const desiredOrder = ["tuition fee", "uniform", "i-card", "transport", "other"];
      list.sort((a: any, b: any) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aIdx = desiredOrder.indexOf(aName);
        const bIdx = desiredOrder.indexOf(bName);
        
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return aName.localeCompare(bName);
      });
      
      setCategories(list);
      
      setClasses(Array.isArray(classRes.data?.data) ? classRes.data.data : []);
      setSections(Array.isArray(secRes.data?.data) ? secRes.data.data : []);
    } catch (err: any) {
      console.error("Failed to load fee categories/classes:", err);
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
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setStudents(list);
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

  

  const handleOpenAssignModal = () => {
    loadCategories();
    loadStudents();
    setAssignForm({
      studentId: "",
      items: [{ id: Date.now(), feeCategoryId: categories[0]?.id || "", originalAmount: "", discountPercent: "0", customName: "" }],
      remarks: "",
    });
    setErrorMessage(null);
    setIsAssignModalOpen(true);
  };

  // Synchronize category selection in Assign Fee modal once categories are loaded
  useEffect(() => {
    if (isAssignModalOpen && assignForm.items[0]?.feeCategoryId === "" && categories.length > 0) {
      setAssignForm((prev) => {
        const newItems = [...prev.items];
        newItems[0].feeCategoryId = categories[0].id;
        return { ...prev, items: newItems };
      });
    }
  }, [isAssignModalOpen, categories, assignForm.items]);

    // GROUPED STUDENT FEES FOR DASHBOARD
  const groupedStudentFees = useMemo(() => {
    const groups: Record<string, any> = {};
    studentFees.forEach(fee => {
      const sId = fee.student?.id;
      if (!sId) return;
      if (!groups[sId]) {
        groups[sId] = {
          student: fee.student,
          fees: [],
          totalPayable: 0,
          totalPaid: 0,
        };
      }
      groups[sId].fees.push(fee);
      
      const payable = Number(fee.finalAmount) || 0;
      let paid = 0;
      fee.installments?.forEach((inst: any) => {
        inst.payments?.forEach((pay: any) => {
          paid += Number(pay.amount) || 0;
        });
      });
      
      groups[sId].totalPayable += payable;
      groups[sId].totalPaid += paid;
    });
    
    return Object.values(groups).map(g => {
      g.fees.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      g.totalPending = Math.max(g.totalPayable - g.totalPaid, 0);
      g.status = g.totalPaid >= g.totalPayable ? "PAID" : g.totalPaid > 0 ? "PARTIAL" : "PENDING";
      return g;
    });
  }, [studentFees]);
  
  const filteredGroupedFees = useMemo(() => {
    return groupedStudentFees.filter(g => {
      if (search && !g.student?.name?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [groupedStudentFees, search]);

  const handleOpenPayForGroup = async (group: any) => {
    let targetInst: Installment | null = null;
    let targetFee: any = null;

    if (group.fees && Array.isArray(group.fees)) {
      // 1. Look for an existing unpaid installment
      for (const fee of group.fees) {
        if (fee.installments && fee.installments.length > 0) {
          for (const inst of fee.installments) {
            const paidAmount = inst.payments?.reduce((s: number, p: any) => s + Number(p.amount || 0), 0) || 0;
            if (inst.status !== "PAID" && Number(inst.amount) > paidAmount) {
              targetInst = inst;
              break;
            }
          }
        }
        if (targetInst) break;
      }

      // 2. If no unpaid installment found, look for an assigned fee with unpaid balance
      if (!targetInst) {
        for (const fee of group.fees) {
          const feePaid = fee.installments?.reduce((sum: number, inst: any) => {
            return sum + (inst.payments?.reduce((s: number, p: any) => s + Number(p.amount || 0), 0) || 0);
          }, 0) || 0;
          
          if (Number(fee.finalAmount) > feePaid) {
            targetFee = fee;
            break;
          }
        }
      }
    }

    if (targetInst) {
      const paidAmount = targetInst.payments?.reduce((s: number, p: any) => s + Number(p.amount || 0), 0) || 0;
      const remaining = Math.max(0, Number(targetInst.amount) - paidAmount);
      setPaymentTargetInstallment(targetInst);
      setPaymentForm({
        amount: remaining.toString(),
        paymentMethod: "CASH",
        receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
        remarks: "",
      });
      setIsRecordPaymentModalOpen(true);
    } else if (targetFee) {
      try {
        setSubmitting(true);
        const today = new Date().toISOString().split("T")[0];
        const instNum = (targetFee.installments?.length || 0) + 1;
        const feePaid = targetFee.installments?.reduce((sum: number, inst: any) => {
          return sum + (inst.payments?.reduce((s: number, p: any) => s + Number(p.amount || 0), 0) || 0);
        }, 0) || 0;
        const unassignedFeeAmount = Math.max(0, Number(targetFee.finalAmount) - feePaid);

        const res = await api.post("/installments", {
          studentFeeId: targetFee.id,
          installmentNumber: instNum,
          amount: unassignedFeeAmount,
          dueDate: today,
        });
        
        const createdInst = res.data?.data || res.data;
        if (createdInst && createdInst.id) {
          createdInst.studentFee = {
            ...targetFee,
            student: group.student,
          };
          setPaymentTargetInstallment(createdInst);
          setPaymentForm({
            amount: unassignedFeeAmount.toString(),
            paymentMethod: "CASH",
            receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
            remarks: "",
          });
          setIsRecordPaymentModalOpen(true);
          await Promise.all([loadStudentFees(), loadInstallments(), loadFeeSummary()]);
        }
      } catch (err: any) {
        console.error("Error creating full payment installment:", err);
        setSelectedFeeDetails(group);
        setIsDetailsModalOpen(true);
      } finally {
        setSubmitting(false);
      }
    } else {
      setSelectedFeeDetails(group);
      setIsDetailsModalOpen(true);
    }
  };

  const handlePrintStudentReceipt = (group: any) => {
    const { student, totalPayable, totalPaid, totalPending, fees } = group;
    const className = classes.find(c => c.id === student?.classId)?.name || 'Unknown';
    const sectionName = sections.find(s => s.id === student?.sectionId)?.name || 'Unknown';
    
    let breakdownHtml = fees.map((fee: any) => {
      const isOther = fee.category?.name.toLowerCase() === "other";
      const name = isOther && fee.remarks ? fee.remarks.split('|')[0].trim() : fee.category?.name;
      const pay = Number(fee.finalAmount);
      let paid = 0;
      fee.installments?.forEach((inst: any) => {
        inst.payments?.forEach((p: any) => paid += Number(p.amount));
      });
      const pend = Math.max(pay - paid, 0);
      return `
        <tr>
          <td>${name}</td>
          <td>Rs. ${pay.toLocaleString('en-IN')}</td>
          <td>Rs. ${paid.toLocaleString('en-IN')}</td>
          <td>Rs. ${pend.toLocaleString('en-IN')}</td>
        </tr>
      `;
    }).join("");

    let paymentsHtml = "";
    fees.forEach((fee: any) => {
      fee.installments?.forEach((inst: any) => {
        inst.payments?.forEach((p: any) => {
          paymentsHtml += `
            <tr>
              <td>${new Date(p.paymentDate).toLocaleDateString()}</td>
              <td>Rs. ${Number(p.amount).toLocaleString('en-IN')}</td>
              <td>${p.paymentMethod}</td>
              <td>${p.receiptNumber || p.referenceNumber || 'N/A'}</td>
              <td>${fee.category?.name}</td>
            </tr>
          `;
        });
      });
    });
    
    if (!paymentsHtml) {
      paymentsHtml = `<tr><td colspan="5" style="text-align: center; color: #64748b;">No payments recorded yet.</td></tr>`;
    }

    const content = `
      <html>
        <head>
          <title>Student Fee Statement - ${student?.name}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; margin: 0 0 10px 0; }
            .subtitle { color: #64748b; margin: 0; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .box { background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .label { font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
            .value { font-size: 16px; font-weight: 600; }
            h3 { font-size: 14px; text-transform: uppercase; margin-top: 30px; margin-bottom: 10px; color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f1f5f9; font-weight: bold; color: #475569; }
            .totals { font-weight: bold; background: #f8fafc; }
            .footer { margin-top: 50px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Student Fee Statement</h1>
            <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="details-grid">
            <div class="box">
              <div class="label">Student Details</div>
              <div class="value">${student?.name || 'Unknown Student'}</div>
              <div style="font-size: 14px; color: #64748b; margin-top: 4px;">
                Class: ${className} - ${sectionName}
              </div>
              <div style="font-size: 14px; color: #64748b; margin-top: 4px;">
                Roll No: ${student?.rollNumber || 'N/A'}
              </div>
            </div>
            <div class="box">
              <div class="label">Account Summary</div>
              <div style="margin-top: 8px; display: flex; justify-content: space-between;">
                <span style="color: #64748b;">Total Payable:</span>
                <strong>Rs. ${Number(totalPayable).toLocaleString('en-IN')}</strong>
              </div>
              <div style="margin-top: 8px; display: flex; justify-content: space-between;">
                <span style="color: #15803d;">Total Paid:</span>
                <strong style="color: #15803d;">Rs. ${Number(totalPaid).toLocaleString('en-IN')}</strong>
              </div>
              <div style="margin-top: 8px; display: flex; justify-content: space-between;">
                <span style="color: #b45309;">Total Pending:</span>
                <strong style="color: #b45309;">Rs. ${Number(totalPending).toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>
          
          <h3>Fee Breakdown</h3>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Payable</th>
                <th>Paid</th>
                <th>Pending</th>
              </tr>
            </thead>
            <tbody>
              ${breakdownHtml}
              <tr class="totals">
                <td>Grand Total</td>
                <td>Rs. ${Number(totalPayable).toLocaleString('en-IN')}</td>
                <td>Rs. ${Number(totalPaid).toLocaleString('en-IN')}</td>
                <td>Rs. ${Number(totalPending).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <h3>Payment History</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Receipt No</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              ${paymentsHtml}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This is a computer-generated statement and does not require a physical signature.</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handlePrintReceipt = (payment: any, feeDetails: any) => {
    const content = `
      <html>
        <head>
          <title>Fee Receipt - ${payment.receiptNumber || payment.id}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; margin: 0 0 10px 0; }
            .subtitle { color: #64748b; margin: 0; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
            .box { background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .label { font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
            .value { font-size: 16px; font-weight: 600; }
            .footer { margin-top: 60px; text-align: center; color: #64748b; font-size: 14px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Fee Receipt</h1>
            <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="details-grid">
            <div class="box">
              <div class="label">Student Details</div>
              <div class="value">${feeDetails.student?.name || 'Student'}</div>
              <div style="font-size: 14px; color: #64748b; margin-top: 4px;">
                Roll No: ${feeDetails.student?.rollNumber || 'N/A'}
              </div>
            </div>
            <div class="box">
              <div class="label">Payment Details</div>
              <div class="value">Amount Paid: Rs. ${Number(payment.amount).toLocaleString('en-IN')}</div>
              <div style="font-size: 14px; color: #64748b; margin-top: 4px;">
                Date: ${new Date(payment.paymentDate).toLocaleDateString()} | Method: ${payment.paymentMethod}
              </div>
              <div style="font-size: 14px; color: #64748b; margin-top: 4px;">
                Receipt No: ${payment.receiptNumber || payment.referenceNumber || 'N/A'}
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>This is a computer-generated receipt and does not require a physical signature.</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handleAssignFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.studentId) {
      triggerError("Please select a student.");
      return;
    }
    
    // Validation
    const validItems = assignForm.items.filter(item => item.feeCategoryId && Number(item.originalAmount) > 0);
    if (validItems.length === 0) {
      triggerError("Please add at least one valid fee item with an amount > 0.");
      return;
    }



    try {
      setSubmitting(true);
      
      const promises = validItems.map(item => {
        let remarks = assignForm.remarks.trim();
        const category = categories.find(c => c.id === item.feeCategoryId);
        if (category?.name.toLowerCase() === "other" && item.customName.trim()) {
           remarks = remarks ? `${item.customName.trim()} | ${remarks}` : item.customName.trim();
        }
        
        return api.post("/student-fees", {
          studentId: assignForm.studentId,
          feeCategoryId: item.feeCategoryId,
          originalAmount: Number(item.originalAmount),
          discountPercent: Number(item.discountPercent) || 0,
          remarks: remarks || undefined,
        });
      });

      const results = await Promise.allSettled(promises);
      const failed = results.filter(r => r.status === 'rejected');
      
      if (failed.length === 0) {
        triggerSuccess(`Successfully assigned ${validItems.length} fee(s).`);
        setIsAssignModalOpen(false);
        await Promise.all([loadStudentFees(), loadFeeSummary()]);
      } else {
        const errorMsg = (failed[0] as PromiseRejectedResult).reason?.response?.data?.message || "Failed to assign some fees.";
        throw new Error(`Failed to assign ${failed.length} fee(s). Reason: ${errorMsg}`);
      }
    } catch (err: any) {
      console.error("Assign fee error:", err);
      triggerError(err.response?.data?.message || err.message || "Failed to assign fee.");
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

    const totalPaid = getFeePaidAmount(editingFee);
    if (calculatedEditFinal < totalPaid) {
      triggerError(`Cannot reduce fee below already paid amount (₹${totalPaid.toFixed(2)}).`);
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
      if ((res.status >= 200 && res.status < 300) || res.data?.success) {
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
      if ((res.status >= 200 && res.status < 300) || res.data?.success) {
        triggerSuccess("Student fee deleted successfully.");
        await Promise.all([loadStudentFees(), loadFeeSummary(), loadInstallments()]);
        
        if (selectedFeeDetails) {
          const newFees = selectedFeeDetails.fees.filter((f: any) => f.id !== id);
          if (newFees.length === 0) {
            setIsDetailsModalOpen(false);
            setSelectedFeeDetails(null);
          } else {
            const totalPayable = newFees.reduce((sum: number, f: any) => sum + Number(f.finalAmount), 0);
            let totalPaid = 0;
            newFees.forEach((f: any) => {
              f.installments?.forEach((inst: any) => {
                inst.payments?.forEach((p: any) => totalPaid += Number(p.amount));
              });
            });
            const totalPending = Math.max(totalPayable - totalPaid, 0);
            const status = totalPaid >= totalPayable ? "PAID" : totalPaid > 0 ? "PARTIAL" : "PENDING";
            setSelectedFeeDetails({
              ...selectedFeeDetails,
              fees: newFees,
              totalPayable,
              totalPaid,
              totalPending,
              status
            });
          }
        }
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

    const fee = studentFees.find((f) => f.id === createInstallmentForm.studentFeeId);
    if (fee) {
      const existingInst = fee.installments?.find(i => i.installmentNumber === instNum);
      if (existingInst) {
        triggerError("This installment number already exists for this fee.");
        return;
      }
      
      const existingTotal = fee.installments?.reduce((sum, i) => sum + Number(i.amount), 0) || 0;
      if (existingTotal + amt > Number(fee.finalAmount) + 0.001) {
        triggerError(`Installment total cannot exceed fee payable amount (₹${Number(fee.finalAmount).toFixed(2)}).`);
        return;
      }
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
      if ((res.status >= 200 && res.status < 300) || res.data?.success) {
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
      if ((res.status >= 200 && res.status < 300) || res.data?.success) {
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
      if ((res.status >= 200 && res.status < 300) || res.data?.success) {
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
      if ((res.status >= 200 && res.status < 300) || res.data?.success) {
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
      if ((res.status >= 200 && res.status < 300) || res.data?.success) {
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
              {groupedStudentFees.length}
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
                    Total Payable
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Total Paid
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Total Pending
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="text-right px-5 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loadingFees ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Loading student fees...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredGroupedFees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <CreditCard className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="mt-3 text-sm font-bold text-slate-700">
                        {search ? "No student fees match your search" : "No student fees assigned yet"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {search ? "Try clearing the search query." : "Click 'Assign Fee' to assign fees to a student."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredGroupedFees.map((group) => {
                    const { student, totalPayable, totalPaid, totalPending, status } = group;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition cursor-pointer" onClick={() => {
                          setSelectedFeeDetails(group);
                          setIsDetailsModalOpen(true);
                      }}>
                        <td className="px-5 py-4">
                          <div className="font-bold text-sm text-slate-900">
                            {student?.name || "Unknown Student"}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {student?.classId ? `Class ${classes.find(c => c.id === student.classId)?.name || 'Unknown'}` : ""} {student?.sectionId ? `- ${sections.find(s => s.id === student.sectionId)?.name || 'Unknown'}` : ""} {student?.rollNumber ? `| Roll: ${student.rollNumber}` : ""}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm font-extrabold text-slate-900">
                          ₹{Number(totalPayable || 0).toLocaleString("en-IN")}
                        </td>
                        
                        <td className="px-5 py-4 text-sm font-bold text-emerald-600">
                          ₹{Number(totalPaid || 0).toLocaleString("en-IN")}
                        </td>
                        
                        <td className="px-5 py-4 text-sm font-bold text-amber-600">
                          ₹{Number(totalPending || 0).toLocaleString("en-IN")}
                        </td>
                        
                        <td className="px-5 py-4">
                           <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                              status === "PAID"
                                ? "bg-emerald-100 text-emerald-700"
                                : status === "PARTIAL"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFeeDetails(group);
                                setIsDetailsModalOpen(true);
                              }}
                              className="p-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {status !== "PAID" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPayForGroup(group);
                                }}
                                className="p-2 rounded-xl text-purple-600 bg-purple-50 hover:bg-purple-100 transition"
                                title="Record Payment"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrintStudentReceipt(group);
                              }}
                              className="p-2 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition"
                              title="Download Statement"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>           </table>
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

                            {getInstallmentPaidAmount(inst) === 0 && (
                              <button
                                onClick={() => handleDeleteInstallment(inst.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Delete Installment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
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
                            {/* Payment deletion is permanently rejected by backend */}
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
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Assign Fee to Student
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allocate multiple fee categories to a student in one go.
                </p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignFeeSubmit} className="flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
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
                        {s.name} {s.rollNumber ? `(Roll: ${s.rollNumber})` : ""} {s.email ? `- ${s.email}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Multi Category Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-600">
                      Fee Breakdown *
                    </label>
                    <button
                      type="button"
                      onClick={() => setAssignForm({
                        ...assignForm,
                        items: [...assignForm.items, { id: Date.now(), feeCategoryId: "", originalAmount: "", discountPercent: "0", customName: "" }]
                      })}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Fee Item
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {assignForm.items.map((item, index) => {
                      const selectedCat = categories.find(c => c.id === item.feeCategoryId);
                      const isOther = selectedCat?.name.toLowerCase() === "other";
                      
                      return (
                        <div key={item.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl relative group">
                          {assignForm.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = assignForm.items.filter(i => i.id !== item.id);
                                setAssignForm({...assignForm, items: newItems});
                              }}
                              className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <select
                                value={item.feeCategoryId}
                                onChange={(e) => {
                                  const newItems = [...assignForm.items];
                                  newItems[index].feeCategoryId = e.target.value;
                                  setAssignForm({ ...assignForm, items: newItems });
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                required
                              >
                                <option value="">-- Category --</option>
                                {categories.map((c) => (
                                  <option key={c.id} value={c.id} disabled={assignForm.items.some(i => i.id !== item.id && i.feeCategoryId === c.id)}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={item.originalAmount}
                                onChange={(e) => {
                                  const newItems = [...assignForm.items];
                                  newItems[index].originalAmount = e.target.value;
                                  setAssignForm({ ...assignForm, items: newItems });
                                }}
                                placeholder="Amount (₹)"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={item.discountPercent}
                                onChange={(e) => {
                                  const newItems = [...assignForm.items];
                                  newItems[index].discountPercent = e.target.value;
                                  setAssignForm({ ...assignForm, items: newItems });
                                }}
                                placeholder="Discount %"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          {isOther && (
                            <div className="mt-2">
                              <input
                                type="text"
                                value={item.customName}
                                onChange={(e) => {
                                  const newItems = [...assignForm.items];
                                  newItems[index].customName = e.target.value;
                                  setAssignForm({ ...assignForm, items: newItems });
                                }}
                                placeholder="Custom Fee Name (e.g. Annual Activity Fee)"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                required
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      Total Original Amount (₹)
                    </label>
                    <input
                      type="text"
                      value={assignForm.items.reduce((sum, item) => sum + (Number(item.originalAmount) || 0), 0).toFixed(2)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none cursor-not-allowed font-semibold text-slate-700"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      Total Discount Amount (₹)
                    </label>
                    <input
                      type="text"
                      value={assignForm.items.reduce((sum, item) => sum + ((Number(item.originalAmount) || 0) * (Number(item.discountPercent) || 0) / 100), 0).toFixed(2)}
                      className="w-full px-3 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-sm outline-none cursor-not-allowed font-semibold text-emerald-700"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Final Payable (₹)
                  </label>
                  <div className="w-full px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-sm font-bold text-blue-700">
                    ₹{(
                      assignForm.items.reduce((sum, item) => sum + ((Number(item.originalAmount) || 0) * (1 - (Number(item.discountPercent) || 0) / 100)), 0)
                    ).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

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
                    placeholder="Optional notes..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
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
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-scale-up">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Student Fee Details
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedFeeDetails.student?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
               {/* Summary */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl">
                     <p className="text-[11px] font-bold text-slate-500 uppercase">Total Payable</p>
                     <p className="text-xl font-black text-slate-900">₹{Number(selectedFeeDetails.totalPayable).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-white border border-emerald-200 p-4 rounded-2xl">
                     <p className="text-[11px] font-bold text-emerald-600 uppercase">Total Paid</p>
                     <p className="text-xl font-black text-emerald-700">₹{Number(selectedFeeDetails.totalPaid).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-white border border-amber-200 p-4 rounded-2xl">
                     <p className="text-[11px] font-bold text-amber-600 uppercase">Total Pending</p>
                     <p className="text-xl font-black text-amber-700">₹{Number(selectedFeeDetails.totalPending).toLocaleString('en-IN')}</p>
                  </div>
               </div>
               
               {/* Category Breakdown */}
               <div>
                 <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">Category Breakdown</h3>
                 <div className="space-y-3">
                   {selectedFeeDetails.fees.map((fee: any) => {
                     const isOther = fee.category?.name.toLowerCase() === "other";
                     const name = isOther && fee.remarks ? fee.remarks.split('|')[0].trim() : fee.category?.name;
                     const orig = Number(fee.originalAmount);
                     const disc = Number(fee.discountPercent);
                     const pay = Number(fee.finalAmount);
                     let paid = 0;
                     fee.installments?.forEach((inst: any) => {
                       inst.payments?.forEach((p: any) => paid += Number(p.amount));
                     });
                     const pend = Math.max(pay - paid, 0);
                     
                     return (
                       <div key={fee.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                         <div>
                           <h4 className="font-bold text-slate-900">{name}</h4>
                           <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                             <span>Original: ₹{orig.toLocaleString('en-IN')}</span>
                             {disc > 0 && <span className="text-purple-600 font-semibold">Discount: {disc}%</span>}
                           </div>
                         </div>
                         <div className="flex items-center gap-6 text-sm font-bold">
                           <div className="text-center">
                             <div className="text-[10px] text-slate-400 uppercase">Payable</div>
                             <div className="text-slate-900">₹{pay.toLocaleString('en-IN')}</div>
                           </div>
                           <div className="text-center">
                             <div className="text-[10px] text-emerald-600 uppercase">Paid</div>
                             <div className="text-emerald-700">₹{paid.toLocaleString('en-IN')}</div>
                           </div>
                           <div className="text-center">
                             <div className="text-[10px] text-amber-600 uppercase">Pending</div>
                             <div className="text-amber-700">₹{pend.toLocaleString('en-IN')}</div>
                           </div>
                           
                           <button
                              onClick={() => {
                                 setIsDetailsModalOpen(false);
                                   setEditingFee(fee);
                                 setEditFeeForm({
                                   originalAmount: fee.originalAmount?.toString() || "",
                                   discountPercent: fee.discountPercent?.toString() || "0",
                                   remarks: fee.remarks || "",
                                 });
                                 setIsEditFeeModalOpen(true);
                              }}
                              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
                           >
                             <Pencil className="w-4 h-4" />
                           </button>
                           
                           {paid === 0 && (
                             <button
                               onClick={() => handleDeleteStudentFee(fee.id)}
                               className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-100 transition"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           )}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
               
               {/* Installments & Payments */}
               <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide flex items-center justify-between">
                    Installments & Payments
                    <button
                      onClick={() => {
                        setCreateInstallmentForm({ studentFeeId: selectedFeeDetails.fees[0]?.id || "", installmentNumber: 1, amount: "", dueDate: "" });
                        setIsCreateInstallmentModalOpen(true);
                      }}
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Installment
                    </button>
                  </h3>
                  
                  <div className="space-y-4">
                     {selectedFeeDetails.fees.map((fee: any) => (
                       fee.installments?.length > 0 && (
                         <div key={fee.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                           <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 font-bold text-sm text-slate-700">
                             {fee.category?.name} Installments
                           </div>
                           <div className="divide-y divide-slate-100">
                             {fee.installments.map((inst: any, idx: number) => {
                               const paid = inst.payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) || 0;
                               const pending = Math.max(Number(inst.amount) - paid, 0);
                               
                               return (
                                 <div key={inst.id} className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                   <div>
                                     <div className="font-bold text-sm text-slate-900">Installment #{inst.installmentNumber || idx + 1} &middot; ₹{Number(inst.amount).toLocaleString('en-IN')}</div>
                                     <div className="text-xs text-slate-500 mt-0.5">Due: {new Date(inst.dueDate).toLocaleDateString()}</div>
                                   </div>
                                   
                                   <div className="flex items-center gap-4">
                                     <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${inst.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : inst.status === 'PARTIAL' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                       {inst.status}
                                     </span>
                                     
                                     {inst.status !== "PAID" && (
                                       <button
                                         onClick={() => {
                                           setPaymentTargetInstallment(inst);
                                           setPaymentForm({
                                             amount: pending.toString(),
                                             paymentMethod: "CASH",
                                             receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
                                             remarks: "",
                                           });
                                           setIsRecordPaymentModalOpen(true);
                                         }}
                                         className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition"
                                       >
                                         Pay
                                       </button>
                                     )}
                                   </div>
                                   
                                   {inst.payments && inst.payments.length > 0 && (
                                     <div className="w-full mt-3 bg-slate-50 rounded-xl border border-slate-200 p-3">
                                       <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Payment Records</div>
                                       <div className="space-y-2">
                                          {inst.payments.map((p: any) => (
                                            <div key={p.id} className="flex items-center justify-between text-xs">
                                              <div className="flex items-center gap-2">
                                                <span className="font-bold text-emerald-700">₹{Number(p.amount).toLocaleString('en-IN')}</span>
                                                <span className="text-slate-500 font-medium bg-slate-200 px-1.5 py-0.5 rounded-md text-[9px]">{p.paymentMethod}</span>
                                                <span className="text-slate-400">{new Date(p.paymentDate).toLocaleDateString()}</span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                 <span className="text-slate-400 font-mono text-[10px]">{p.receiptNumber || p.referenceNumber}</span>
                                                 <button 
                                                    type="button" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePrintReceipt(p, selectedFeeDetails);
                                                    }}
                                                    className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition"
                                                    title="Download Receipt"
                                                 >
                                                   <Download className="w-3 h-3" />
                                                 </button>
                                              </div>
                                            </div>
                                          ))}
                                       </div>
                                     </div>
                                   )}
                                 </div>
                               );
                             })}
                           </div>
                         </div>
                       )
                     ))}
                  </div>
               </div>
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