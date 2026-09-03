import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import api from "../../services/api";

interface Student {
  id: string;
  name: string;
  email?: string;
}

interface Fee {
  id: string;
  studentId: string;
  title: string;
  amount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  paymentDate?: string | null;
  paymentMethod?: string | null;
  remarks?: string | null;
  student?: Student;
}

interface FeeFormData {
  studentId: string;
  title: string;
  amount: string;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  paymentDate: string;
  paymentMethod: string;
  remarks: string;
}

const initialForm: FeeFormData = {
  studentId: "",
  title: "",
  amount: "",
  dueDate: "",
  status: "PENDING",
  paymentDate: "",
  paymentMethod: "",
  remarks: "",
};

export const FeesPage: React.FC = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);

  const [formData, setFormData] = useState<FeeFormData>(initialForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadFees();
    loadStudents();
  }, []);

  const loadFees = async () => {
    try {
      setLoading(true);

      const response = await api.get("/franchise/fees");

      if (response.data?.success) {
        setFees(response.data.data || []);
      }
    } catch (err: any) {
      console.error("Failed to load fees:", err);

      setError(
        err.response?.data?.message || "Failed to load fees"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await api.get(
        "/franchise/students?limit=100"
      );

      if (response.data?.success) {
        setStudents(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    }
  };

  const openCreateModal = () => {
    setEditingFee(null);
    setFormData(initialForm);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (fee: Fee) => {
    setEditingFee(fee);

    setFormData({
      studentId: fee.studentId,
      title: fee.title,
      amount: String(fee.amount),
      dueDate: fee.dueDate
        ? fee.dueDate.substring(0, 10)
        : "",
      status: fee.status,
      paymentDate: fee.paymentDate
        ? fee.paymentDate.substring(0, 10)
        : "",
      paymentMethod: fee.paymentMethod || "",
      remarks: fee.remarks || "",
    });

    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingFee(null);
    setFormData(initialForm);
    setError("");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.studentId ||
      !formData.title ||
      !formData.amount ||
      !formData.dueDate
    ) {
      setError(
        "Student, title, amount and due date are required."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        studentId: formData.studentId,
        title: formData.title,
        amount: Number(formData.amount),
        dueDate: formData.dueDate,
        status: formData.status,
        paymentDate:
          formData.paymentDate || null,
        paymentMethod:
          formData.paymentMethod || null,
        remarks: formData.remarks || null,
      };

      if (editingFee) {
        const response = await api.put(
          `/franchise/fees/${editingFee.id}`,
          payload
        );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
            "Failed to update fee"
          );
        }

        setSuccess("Fee updated successfully.");
      } else {
        const response = await api.post(
          "/franchise/fees",
          payload
        );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
            "Failed to create fee"
          );
        }

        setSuccess("Fee created successfully.");
      }

      closeModal();
      await loadFees();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      console.error("Fee save error:", err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to save fee"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this fee?"
    );

    if (!confirmed) return;

    try {
      const response = await api.delete(
        `/franchise/fees/${id}`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
          "Failed to delete fee"
        );
      }

      setFees((prev) =>
        prev.filter((fee) => fee.id !== id)
      );

      setSuccess("Fee deleted successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      console.error("Delete fee error:", err);

      setError(
        err.response?.data?.message ||
        "Failed to delete fee"
      );
    }
  };

  const filteredFees = fees.filter((fee) => {
    const searchText = search.toLowerCase();

    return (
      fee.title
        ?.toLowerCase()
        .includes(searchText) ||
      fee.student?.name
        ?.toLowerCase()
        .includes(searchText) ||
      fee.status
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  const totalAmount = fees.reduce(
    (sum, fee) => sum + Number(fee.amount || 0),
    0
  );

  const paidAmount = fees
    .filter((fee) => fee.status === "PAID")
    .reduce(
      (sum, fee) => sum + Number(fee.amount || 0),
      0
    );

  const pendingAmount = fees
    .filter((fee) => fee.status === "PENDING")
    .reduce(
      (sum, fee) => sum + Number(fee.amount || 0),
      0
    );

  const getStatusClass = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700";

      case "OVERDUE":
        return "bg-rose-50 text-rose-700";

      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle2 className="w-3.5 h-3.5" />;

      case "OVERDUE":
        return <AlertCircle className="w-3.5 h-3.5" />;

      default:
        return <Clock3 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Fees
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage student fees, payments and dues.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:opacity-95"
        >
          <Plus className="w-4 h-4" />
          Add Fee
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
          {success}
        </div>
      )}

      {/* Error */}
      {error && !isModalOpen && (
        <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Fees
              </p>

              <p className="text-2xl font-extrabold text-slate-900 mt-2">
                ₹{totalAmount.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Paid
              </p>

              <p className="text-2xl font-extrabold text-emerald-600 mt-2">
                ₹{paidAmount.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pending
              </p>

              <p className="text-2xl font-extrabold text-amber-600 mt-2">
                ₹{pendingAmount.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock3 className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search student, fee title or status..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase">
                  Student
                </th>

                <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase">
                  Fee
                </th>

                <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase">
                  Amount
                </th>

                <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase">
                  Due Date
                </th>

                <th className="text-left px-5 py-4 text-xs font-extrabold text-slate-500 uppercase">
                  Status
                </th>

                <th className="text-right px-5 py-4 text-xs font-extrabold text-slate-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    Loading fees...
                  </td>
                </tr>
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center"
                  >
                    <CreditCard className="w-10 h-10 mx-auto text-slate-300" />

                    <p className="mt-3 text-sm font-bold text-slate-700">
                      No fees found
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Add a fee to get started.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => (
                  <tr
                    key={fee.id}
                    className="hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-sm text-slate-900">
                        {fee.student?.name ||
                          "Unknown Student"}
                      </div>

                      {fee.student?.email && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {fee.student.email}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-slate-700">
                        {fee.title}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm font-extrabold text-slate-900">
                        ₹
                        {Number(
                          fee.amount
                        ).toLocaleString("en-IN")}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {new Date(
                        fee.dueDate
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${getStatusClass(
                          fee.status
                        )}`}
                      >
                        {getStatusIcon(fee.status)}
                        {fee.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            openEditModal(fee)
                          }
                          className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(fee.id)
                          }
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {editingFee
                    ? "Edit Fee"
                    : "Add New Fee"}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Enter the fee and payment details.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="p-2 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >
              {error && (
                <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Student */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Student *
                  </label>

                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">
                      Select student
                    </option>

                    {students.map((student) => (
                      <option
                        key={student.id}
                        value={student.id}
                      >
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Fee Title *
                  </label>

                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Tuition Fee"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Amount *
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Due Date *
                  </label>

                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="PENDING">
                      Pending
                    </option>
                    <option value="PAID">
                      Paid
                    </option>
                    <option value="OVERDUE">
                      Overdue
                    </option>
                  </select>
                </div>

                {/* Payment Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Payment Date
                  </label>

                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Payment Method
                  </label>

                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">
                      Select method
                    </option>
                    <option value="CASH">
                      Cash
                    </option>
                    <option value="UPI">
                      UPI
                    </option>
                    <option value="CARD">
                      Card
                    </option>
                    <option value="BANK_TRANSFER">
                      Bank Transfer
                    </option>
                    <option value="CHEQUE">
                      Cheque
                    </option>
                  </select>
                </div>

                {/* Remarks */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Remarks
                  </label>

                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Optional remarks..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingFee
                      ? "Update Fee"
                      : "Create Fee"}
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