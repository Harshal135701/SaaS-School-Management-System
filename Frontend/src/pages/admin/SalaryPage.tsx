import React, { useEffect, useState, useCallback } from "react";
import {
  Banknote,
  Search,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Users,
  Wallet,
  Calendar,
  FileText,
  X
} from "lucide-react";
import api from "../../services/api";

type TabType = "dashboard" | "profiles" | "monthly" | "payments" | "advances";

interface Staff {
  id: string;
  name: string;
  email: string;
  staffType: string;
  role: string;
}

interface DashboardData {
  totalPayroll: number;
  paidPayroll: number;
  pendingPayroll: number;
  totalAdvances: number;
  totalSalaries: number;
  totalAdvancesCount: number;
  monthlySummary: Record<string, number>;
}

export const SalaryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [search, setSearch] = useState("");

  const [staff, setStaff] = useState<Staff[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [advances, setAdvances] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);

  const [profileForm, setProfileForm] = useState({ teacherId: "", basicSalary: "", allowances: "0", deductions: "0" });
  const [generateForm, setGenerateForm] = useState({ teacherId: "", salaryMonth: "" });
  const [paymentForm, setPaymentForm] = useState({ salaryId: "", amount: "", paymentDate: "", paymentMethod: "BANK_TRANSFER", referenceNumber: "", remarks: "" });
  const [advanceForm, setAdvanceForm] = useState({ teacherId: "", amount: "", recoveryType: "FULL", recoveryValue: "1", startMonth: "", remarks: "" });
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 5000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, dashRes, profRes, salRes, payRes, advRes] = await Promise.allSettled([
        api.get("/franchise/teachers?limit=1000"),
        api.get("/payroll/dashboard"),
        api.get("/salary-profiles"),
        api.get("/monthly-salaries"),
        api.get("/salary-payments"),
        api.get("/salary-advances")
      ]);

      if (staffRes.status === "fulfilled") setStaff(staffRes.value.data.data?.rows || staffRes.value.data.data || []);
      if (dashRes.status === "fulfilled") setDashboard(dashRes.value.data.data);
      if (profRes.status === "fulfilled") setProfiles(profRes.value.data.data || []);
      if (salRes.status === "fulfilled") setSalaries(salRes.value.data.data || []);
      if (payRes.status === "fulfilled") setPayments(payRes.value.data.data || []);
      if (advRes.status === "fulfilled") setAdvances(advRes.value.data.data || []);
    } catch (err: any) {
      console.error(err);
      triggerError("Failed to load some data. Please check connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Unified helper to extract staff detail to handle teaching & non-teaching fully
  const getStaffDetail = (teacherId: string, fallbackTeacher: any) => {
    const fromState = staff.find(s => String(s.id) === String(teacherId));
    return fromState || fallbackTeacher || {};
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/salary-profiles", {
        teacherId: profileForm.teacherId,
        basicSalary: Number(profileForm.basicSalary),
        allowances: Number(profileForm.allowances) || 0,
        deductions: Number(profileForm.deductions) || 0
      });
      if (res.data?.success || res.status === 201) {
        triggerSuccess("Profile created successfully");
        setIsProfileModalOpen(false);
        setProfileForm({ teacherId: "", basicSalary: "", allowances: "0", deductions: "0" });
        loadData();
      }
    } catch (err: any) {
      triggerError(err.response?.data?.message || "Failed to create profile");
    }
  };

  const handleGenerateSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // FIX: Changed from /monthly-salaries to /monthly-salaries/generate
      const res = await api.post("/monthly-salaries/generate", {
        teacherId: generateForm.teacherId,
        salaryMonth: generateForm.salaryMonth
      });
      if (res.data?.success || res.status === 201) {
        triggerSuccess("Salary generated successfully");
        setIsGenerateModalOpen(false);
        setGenerateForm({ teacherId: "", salaryMonth: "" });
        loadData();
      }
    } catch (err: any) {
      triggerError(err.response?.data?.message || "Failed to generate salary");
    }
  };

  const isRefRequired = ["UPI", "BANK_TRANSFER", "CHEQUE"].includes(paymentForm.paymentMethod);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    if (isRefRequired && !paymentForm.referenceNumber.trim()) {
      const methodLabel = paymentForm.paymentMethod === "BANK_TRANSFER" ? "Bank Transfer" : paymentForm.paymentMethod === "UPI" ? "UPI" : "Cheque";
      setPaymentError(`Reference number is required for ${methodLabel}.`);
      return;
    }

    try {
      const res = await api.post("/salary-payments", {
        ...paymentForm,
        amount: Number(paymentForm.amount)
      });
      if (res.data?.success || res.status === 201) {
        triggerSuccess("Payment recorded successfully");
        setIsPaymentModalOpen(false);
        setPaymentForm({ salaryId: "", amount: "", paymentDate: "", paymentMethod: "BANK_TRANSFER", referenceNumber: "", remarks: "" });
        loadData();
      }
    } catch (err: any) {
      triggerError(err.response?.data?.message || "Failed to record payment");
    }
  };

  const handleCreateAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/salary-advances", {
        ...advanceForm,
        amount: Number(advanceForm.amount),
        recoveryValue: Number(advanceForm.recoveryValue)
      });
      if (res.data?.success || res.status === 201) {
        triggerSuccess("Advance recorded successfully");
        setIsAdvanceModalOpen(false);
        setAdvanceForm({ teacherId: "", amount: "", recoveryType: "FULL", recoveryValue: "1", startMonth: "", remarks: "" });
        loadData();
      }
    } catch (err: any) {
      triggerError(err.response?.data?.message || "Failed to create advance");
    }
  };

  // Improved filtering that leverages actual staff objects (includes name, role, staffType)

  const matchesSearch = (staffDetail: any) => {
    if (!searchLower) return true;
    if (!staffDetail) return false;
    
    const name = String(staffDetail.name || "").toLowerCase();
    const role = String(staffDetail.role || "").toLowerCase();
    const staffType = String(staffDetail.staffType || "").toLowerCase();
    
    return name.includes(searchLower) || role.includes(searchLower) || staffType.includes(searchLower);
  };

  const searchLower = search.toLowerCase().trim();
  const getSafeTeacherId = (obj: any) => obj?.teacherId || obj?.TeacherId || obj?.teacher_id || "";
  const getSafeTeacherObj = (obj: any) => obj?.teacher || obj?.Teacher || obj?.teacher_obj || {};

  const filteredProfiles = profiles.filter(p => matchesSearch(getStaffDetail(getSafeTeacherId(p), getSafeTeacherObj(p))));
  const filteredSalaries = salaries.filter(s => matchesSearch(getStaffDetail(getSafeTeacherId(s), getSafeTeacherObj(s))));
  const filteredAdvances = advances.filter(a => matchesSearch(getStaffDetail(getSafeTeacherId(a), getSafeTeacherObj(a))));
  const filteredPayments = payments.filter(p => {
    const tId = getSafeTeacherId(p) || (p.salary ? getSafeTeacherId(p.salary) : "");
    const tObj = getSafeTeacherObj(p) || (p.salary ? getSafeTeacherObj(p.salary) : {});
    const staffDetail = getStaffDetail(tId, tObj);
    return matchesSearch(staffDetail) || (p.receiptNumber || "").toLowerCase().includes(searchLower);
  });

  const teachingStaffCount = staff.filter(s => s.staffType === "TEACHING").length;
  const nonTeachingStaffCount = staff.filter(s => s.staffType === "NON_TEACHING").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Banknote className="w-7 h-7 text-blue-600" />
            Salary & Payroll Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage staff salary profiles, generate monthly payroll, process payments, and track advances.
          </p>
        </div>
        <button onClick={loadData} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div><h3 className="text-sm font-bold text-rose-800">Error</h3><p className="text-xs text-rose-600 mt-1">{error}</p></div>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div><h3 className="text-sm font-bold text-emerald-800">Success</h3><p className="text-xs text-emerald-600 mt-1">{successMsg}</p></div>
        </div>
      )}

      <div className="bg-white p-1 rounded-2xl border border-slate-200 inline-flex shadow-sm overflow-x-auto max-w-full">
        <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "dashboard" ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}><Banknote className="w-4 h-4" /> Dashboard</button>
        <button onClick={() => setActiveTab("profiles")} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "profiles" ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}><Users className="w-4 h-4" /> Profiles</button>
        <button onClick={() => setActiveTab("monthly")} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "monthly" ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}><Calendar className="w-4 h-4" /> Monthly Salaries</button>
        <button onClick={() => setActiveTab("payments")} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "payments" ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}><Wallet className="w-4 h-4" /> Payments</button>
        <button onClick={() => setActiveTab("advances")} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "advances" ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}><FileText className="w-4 h-4" /> Advances</button>
      </div>

      {activeTab !== "dashboard" && (
        <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white" />
          </div>
          <div className="flex gap-2 ml-4">
            {activeTab === "profiles" && <button onClick={() => setIsProfileModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm flex items-center gap-2 whitespace-nowrap"><Plus className="w-4 h-4" /> New Profile</button>}
            {activeTab === "monthly" && <button onClick={() => setIsGenerateModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm flex items-center gap-2 whitespace-nowrap"><Calendar className="w-4 h-4" /> Generate</button>}
            {activeTab === "payments" && <button onClick={() => setIsPaymentModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm flex items-center gap-2 whitespace-nowrap"><Wallet className="w-4 h-4" /> Record Payment</button>}
            {activeTab === "advances" && <button onClick={() => setIsAdvanceModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm flex items-center gap-2 whitespace-nowrap"><Plus className="w-4 h-4" /> New Advance</button>}
          </div>
        </div>
      )}

      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4"><div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-6 h-6" /></div><div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Staff</p><div className="text-2xl font-black text-slate-900">{staff.length}</div><div className="text-xs text-slate-500 mt-1">{teachingStaffCount} Teaching · {nonTeachingStaffCount} Non-Teaching</div></div></div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4"><div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Banknote className="w-6 h-6" /></div><div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Payroll</p><div className="text-2xl font-black text-slate-900">₹{dashboard?.totalPayroll?.toLocaleString('en-IN') || 0}</div><div className="text-xs text-slate-500 mt-1">Historical Net Salaries</div></div></div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4"><div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="w-6 h-6" /></div><div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Paid Payroll</p><div className="text-2xl font-black text-slate-900">₹{dashboard?.paidPayroll?.toLocaleString('en-IN') || 0}</div><div className="text-xs text-slate-500 mt-1">Successfully Disbursed</div></div></div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4"><div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock3 className="w-6 h-6" /></div><div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Payroll</p><div className="text-2xl font-black text-slate-900">₹{dashboard?.pendingPayroll?.toLocaleString('en-IN') || 0}</div><div className="text-xs text-slate-500 mt-1">Awaiting Disbursal</div></div></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Advances Overview</h3>
            <div className="flex gap-12">
              <div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Advances Issued</p><div className="text-xl font-black text-slate-900">₹{dashboard?.totalAdvances?.toLocaleString('en-IN') || 0}</div></div>
              <div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Advances Count</p><div className="text-xl font-black text-slate-900">{dashboard?.totalAdvancesCount || 0}</div></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "profiles" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Staff</th>
                  <th className="px-5 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Role / Type</th>
                  <th className="px-5 py-4 text-right text-xs font-extrabold text-slate-500 uppercase tracking-wider">Basic (₹)</th>
                  <th className="px-5 py-4 text-right text-xs font-extrabold text-slate-500 uppercase tracking-wider">Allowances (₹)</th>
                  <th className="px-5 py-4 text-right text-xs font-extrabold text-slate-500 uppercase tracking-wider">Deductions (₹)</th>
                  <th className="px-5 py-4 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProfiles.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No profiles found</td></tr>
                ) : (
                  filteredProfiles.map(p => {
                    const st = getStaffDetail(getSafeTeacherId(p), getSafeTeacherObj(p));
                    return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm font-bold text-slate-800">{st.name || "Unknown"}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{st.role} <span className="text-[10px] text-slate-400 block">{st.staffType}</span></td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700 text-right">{Number(p.basicSalary).toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm text-emerald-600 text-right">+{Number(p.allowances).toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm text-rose-600 text-right">-{Number(p.deductions).toLocaleString()}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
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

      {activeTab === "monthly" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Staff</th>
                  <th className="px-5 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Month</th>
                  <th className="px-5 py-4 text-right text-xs font-extrabold text-slate-500 uppercase tracking-wider">Gross (₹)</th>
                  <th className="px-5 py-4 text-right text-xs font-extrabold text-slate-500 uppercase tracking-wider">Advance Ded (₹)</th>
                  <th className="px-5 py-4 text-right text-xs font-extrabold text-slate-500 uppercase tracking-wider">Net (₹)</th>
                  <th className="px-5 py-4 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-right text-xs font-extrabold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSalaries.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">No salaries found</td></tr>
                ) : (
                  filteredSalaries.map(s => {
                    const st = getStaffDetail(getSafeTeacherId(s), getSafeTeacherObj(s));
                    const gross = Number(s.basicSalary) + Number(s.allowances) - Number(s.deductions);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 text-sm font-bold text-slate-800">{st.name || "Unknown"} <span className="text-[10px] text-slate-400 block">{st.role}</span></td>
                        <td className="px-5 py-4 text-sm text-slate-600">{s.salaryMonth}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-700 text-right">{gross.toLocaleString()}</td>
                        <td className="px-5 py-4 text-sm text-rose-600 text-right">{Number(s.advanceDeduction) > 0 ? `-${Number(s.advanceDeduction).toLocaleString()}` : '-'}</td>
                        <td className="px-5 py-4 text-sm font-bold text-blue-700 text-right">{Number(s.netSalary).toLocaleString()}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${s.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                           {s.status === 'PENDING' && (
                             <button
                               onClick={() => {
                                 setPaymentForm({ salaryId: s.id, amount: s.netSalary.toString(), paymentDate: "", paymentMethod: "BANK_TRANSFER", referenceNumber: "", remarks: "" });
                                 setPaymentError(null);
                                 setIsPaymentModalOpen(true);
                               }}
                               className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition"
                             >
                               Pay
                             </button>
                           )}
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

      {activeTab === "payments" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Receipt No</th>
                  <th className="px-5 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Staff</th>
                  <th className="px-5 py-4 text-right text-xs font-extrabold text-slate-500 uppercase tracking-wider">Amount (₹)</th>
                  <th className="px-5 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">No payments found</td></tr>
                ) : (
                  filteredPayments.map(p => {
                    const st = getStaffDetail(getSafeTeacherId(p) || (p.salary ? getSafeTeacherId(p.salary) : ""), getSafeTeacherObj(p) || (p.salary ? getSafeTeacherObj(p.salary) : {}));
                    return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">{p.paymentDate}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{p.receiptNumber}</td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-800">{st.name || 'Unknown'}</td>
                      <td className="px-5 py-4 text-sm font-black text-emerald-600 text-right">{Number(p.amount).toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {p.paymentMethod} {p.referenceNumber && <span className="text-xs text-slate-400">({p.referenceNumber})</span>}
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

      {activeTab === "advances" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Staff</th>
                  <th className="px-5 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Start Month</th>
                  <th className="px-5 py-4 text-right text-xs font-extrabold text-slate-500 uppercase tracking-wider">Amount (₹)</th>
                  <th className="px-5 py-4 text-right text-xs font-extrabold text-slate-500 uppercase tracking-wider">Remaining (₹)</th>
                  <th className="px-5 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Recovery</th>
                  <th className="px-5 py-4 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdvances.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No advances found</td></tr>
                ) : (
                  filteredAdvances.map(a => {
                    const st = getStaffDetail(getSafeTeacherId(a), getSafeTeacherObj(a));
                    return (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm font-bold text-slate-800">{st.name || "Unknown"}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{a.startMonth}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700 text-right">{Number(a.amount).toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm font-bold text-rose-600 text-right">{Number(a.remainingAmount).toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {a.recoveryType} ({a.recoveryValue}{a.recoveryType === 'PERCENTAGE' ? '%' : ''})
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${a.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {a.status}
                        </span>
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

      {/* MODALS */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Create Salary Profile</h2>
              <button onClick={() => setIsProfileModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Select Staff *</label>
                <select value={profileForm.teacherId} onChange={e => setProfileForm({...profileForm, teacherId: e.target.value})} required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">-- Select --</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role} - {s.staffType})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Basic Salary (₹) *</label>
                  <input type="number" min="1" required value={profileForm.basicSalary} onChange={e => setProfileForm({...profileForm, basicSalary: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Allowances (₹)</label>
                  <input type="number" min="0" value={profileForm.allowances} onChange={e => setProfileForm({...profileForm, allowances: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Deductions (₹)</label>
                <input type="number" min="0" value={profileForm.deductions} onChange={e => setProfileForm({...profileForm, deductions: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Generate Monthly Salary</h2>
              <button onClick={() => setIsGenerateModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleGenerateSalary} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Select Staff Profile *</label>
                <select value={generateForm.teacherId} onChange={e => setGenerateForm({...generateForm, teacherId: e.target.value})} required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">-- Select --</option>
                  {profiles.map(p => {
                    const st = getStaffDetail(getSafeTeacherId(p), getSafeTeacherObj(p));
                    return <option key={p.teacherId} value={p.teacherId}>{st.name} (Basic: ₹{p.basicSalary})</option>
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Salary Month (YYYY-MM-DD) *</label>
                <input type="date" required value={generateForm.salaryMonth} onChange={e => setGenerateForm({...generateForm, salaryMonth: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                <p className="text-xs text-slate-500 mt-2">Example: Choose the 1st of the month.</p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsGenerateModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl">Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Record Salary Payment</h2>
              <button onClick={() => { setIsPaymentModalOpen(false); setPaymentError(null); }} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Select Pending Salary *</label>
                <select value={paymentForm.salaryId} onChange={e => {
                  const sel = salaries.find(s => s.id === e.target.value);
                  setPaymentForm({...paymentForm, salaryId: e.target.value, amount: sel ? sel.netSalary.toString() : ""});
                }} required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">-- Select --</option>
                  {salaries.filter(s => s.status === 'PENDING').map(s => {
                    const st = getStaffDetail(getSafeTeacherId(s), getSafeTeacherObj(s));
                    return <option key={s.id} value={s.id}>{st.name} ({s.salaryMonth}) - ₹{s.netSalary}</option>;
                  })}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Amount (₹) *</label>
                  <input type="number" required readOnly value={paymentForm.amount} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Payment Date *</label>
                  <input type="date" required value={paymentForm.paymentDate} onChange={e => setPaymentForm({...paymentForm, paymentDate: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Method *</label>
                  <select value={paymentForm.paymentMethod} onChange={e => setPaymentForm({...paymentForm, paymentMethod: e.target.value})} required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Reference No {isRefRequired && <span className="text-rose-500">*</span>}</label>
                  <input type="text" required={isRefRequired} value={paymentForm.referenceNumber} onChange={e => { setPaymentForm({...paymentForm, referenceNumber: e.target.value}); setPaymentError(null); }} className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/20 ${paymentError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'}`} placeholder={isRefRequired ? "Required" : "Optional"} />
                  {paymentError && <p className="text-xs text-rose-500 mt-1">{paymentError}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Remarks</label>
                <input type="text" value={paymentForm.remarks} onChange={e => setPaymentForm({...paymentForm, remarks: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Optional notes" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsPaymentModalOpen(false); setPaymentError(null); }} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdvanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">New Salary Advance</h2>
              <button onClick={() => setIsAdvanceModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateAdvance} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Select Staff *</label>
                <select value={advanceForm.teacherId} onChange={e => setAdvanceForm({...advanceForm, teacherId: e.target.value})} required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">-- Select --</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role} - {s.staffType})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Advance Amount (₹) *</label>
                  <input type="number" min="1" required value={advanceForm.amount} onChange={e => setAdvanceForm({...advanceForm, amount: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Start Month (YYYY-MM-DD) *</label>
                  <input type="date" required value={advanceForm.startMonth} onChange={e => setAdvanceForm({...advanceForm, startMonth: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Recovery Type *</label>
                  <select value={advanceForm.recoveryType} onChange={e => setAdvanceForm({...advanceForm, recoveryType: e.target.value, recoveryValue: e.target.value === 'FULL' ? '1' : advanceForm.recoveryValue})} required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="FULL">FULL</option>
                    <option value="FIXED">FIXED</option>
                    <option value="PERCENTAGE">PERCENTAGE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Recovery Value *</label>
                  <input type="number" min="1" step="any" required readOnly={advanceForm.recoveryType === "FULL"} value={advanceForm.recoveryType === "FULL" ? "1" : advanceForm.recoveryValue} onChange={e => setAdvanceForm({...advanceForm, recoveryValue: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Remarks</label>
                <input type="text" value={advanceForm.remarks} onChange={e => setAdvanceForm({...advanceForm, remarks: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Optional notes" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAdvanceModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl">Create Advance</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
