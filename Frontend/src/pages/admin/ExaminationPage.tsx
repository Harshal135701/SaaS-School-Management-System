import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  BookOpen,
  ClipboardList,
} from "lucide-react";
import api from "../../services/api";

interface Examination {
  id: string;
  franchiseId: string;
  name: string;
  subject: string;
  examDate: string;
  totalMarks: number;
  passingMarks: number;
  status: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ExaminationForm {
  name: string;
  subject: string;
  examDate: string;
  totalMarks: string;
  passingMarks: string;
  status: string;
  description: string;
}

const emptyForm: ExaminationForm = {
  name: "",
  subject: "",
  examDate: "",
  totalMarks: "",
  passingMarks: "",
  status: "UPCOMING",
  description: "",
};

export function ExaminationPage() {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<ExaminationForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // FETCH EXAMINATIONS
  // =========================================================

  const fetchExaminations = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching examinations from: /franchise/examinations");

      const response = await api.get("/franchise/examinations");

      console.log("Examination API response:", response.data);

      if (response.data?.success) {
        setExaminations(response.data.data || []);
      } else {
        setExaminations([]);
        setError(
          response.data?.message || "Failed to fetch examinations"
        );
      }
    } catch (err: any) {
      console.error("Examination fetch error:", err);

      console.error(
        "Examination fetch response:",
        err?.response?.data
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load examinations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExaminations();
  }, []);

  // =========================================================
  // FORM HANDLING
  // =========================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const openEditModal = (exam: Examination) => {
    setEditingId(exam.id);

    setForm({
      name: exam.name || "",
      subject: exam.subject || "",
      examDate: exam.examDate
        ? exam.examDate.substring(0, 10)
        : "",
      totalMarks:
        exam.totalMarks !== undefined
          ? String(exam.totalMarks)
          : "",
      passingMarks:
        exam.passingMarks !== undefined
          ? String(exam.passingMarks)
          : "",
      status: exam.status || "UPCOMING",
      description: exam.description || "",
    });

    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Frontend validation
    if (
      !form.name.trim() ||
      !form.subject.trim() ||
      !form.examDate ||
      !form.totalMarks ||
      !form.passingMarks
    ) {
      setError(
        "Name, subject, exam date, total marks and passing marks are required."
      );
      return;
    }

    const totalMarks = Number(form.totalMarks);
    const passingMarks = Number(form.passingMarks);

    if (Number.isNaN(totalMarks) || Number.isNaN(passingMarks)) {
      setError("Total marks and passing marks must be valid numbers.");
      return;
    }

    if (totalMarks <= 0) {
      setError("Total marks must be greater than 0.");
      return;
    }

    if (passingMarks < 0) {
      setError("Passing marks cannot be negative.");
      return;
    }

    if (passingMarks > totalMarks) {
      setError("Passing marks cannot be greater than total marks.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        subject: form.subject.trim(),
        examDate: form.examDate,
        totalMarks,
        passingMarks,
        status: form.status,
        description: form.description.trim(),
      };

      console.log("Examination payload:", payload);

      if (editingId) {
        const response = await api.put(
          `/franchise/examinations/${editingId}`,
          payload
        );

        console.log("Update examination response:", response.data);

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
              "Failed to update examination"
          );
        }

        setSuccess("Examination updated successfully.");
      } else {
        const response = await api.post(
          "/franchise/examinations",
          payload
        );

        console.log("Create examination response:", response.data);

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
              "Failed to create examination"
          );
        }

        setSuccess("Examination created successfully.");
      }

      setIsModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);

      await fetchExaminations();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      console.error("Examination save error:", err);

      console.error(
        "Examination save response:",
        err?.response?.data
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save examination."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this examination?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await api.delete(
        `/franchise/examinations/${id}`
      );

      console.log("Delete examination response:", response.data);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to delete examination"
        );
      }

      setSuccess("Examination deleted successfully.");

      await fetchExaminations();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      console.error("Examination delete error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete examination."
      );
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredExaminations = examinations.filter((exam) => {
    const searchText = search.toLowerCase();

    return (
      exam.name?.toLowerCase().includes(searchText) ||
      exam.subject?.toLowerCase().includes(searchText) ||
      exam.status?.toLowerCase().includes(searchText)
    );
  });

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const getStatusClass = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return "bg-blue-100 text-blue-700";

      case "ONGOING":
        return "bg-amber-100 text-amber-700";

      case "COMPLETED":
        return "bg-emerald-100 text-emerald-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date: string) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Examinations
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create and manage school examinations.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={18} />
          Add Examination
        </button>
      </div>

      {/* SUCCESS */}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {/* ERROR */}
      {error && !isModalOpen && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Examinations
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {examinations.length}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <ClipboardList size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Upcoming
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {
                  examinations.filter(
                    (exam) => exam.status === "UPCOMING"
                  ).length
                }
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <CalendarDays size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Completed
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {
                  examinations.filter(
                    (exam) => exam.status === "COMPLETED"
                  ).length
                }
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <BookOpen size={22} />
            </div>
          </div>
        </div>

      </div>

      {/* SEARCH */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search examinations..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />

        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-sm text-slate-500">
              Loading examinations...
            </div>
          </div>
        ) : filteredExaminations.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

            <div className="rounded-2xl bg-slate-100 p-4 text-slate-500">
              <ClipboardList size={28} />
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No examinations found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {search
                ? "No examinations match your search."
                : "Create your first examination to get started."}
            </p>

            {!search && (
              <button
                onClick={openAddModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus size={17} />
                Add Examination
              </button>
            )}

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Examination
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Subject
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Exam Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Marks
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Passing
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredExaminations.map((exam) => (
                  <tr
                    key={exam.id}
                    className="transition hover:bg-slate-50"
                  >

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {exam.name}
                        </p>

                        {exam.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {exam.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700">
                        {exam.subject}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays size={16} />
                        {formatDate(exam.examDate)}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-700">
                        {exam.totalMarks}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-700">
                        {exam.passingMarks}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          exam.status
                        )}`}
                      >
                        {exam.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() => openEditModal(exam)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                          title="Edit examination"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                          title="Delete examination"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ====================================================== */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId
                    ? "Edit Examination"
                    : "Add Examination"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingId
                    ? "Update examination details."
                    : "Enter the examination details below."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>

            </div>

            {/* MODAL BODY */}

            <form
              onSubmit={handleSubmit}
              className="max-h-[75vh] overflow-y-auto"
            >

              <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                {/* NAME */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Examination Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. First Semester Examination"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />

                </div>

                {/* SUBJECT */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Subject *
                  </label>

                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="e.g. Mathematics"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />

                </div>

                {/* DATE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Examination Date *
                  </label>

                  <input
                    type="date"
                    name="examDate"
                    value={form.examDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />

                </div>

                {/* TOTAL MARKS */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Total Marks *
                  </label>

                  <input
                    type="number"
                    name="totalMarks"
                    min="1"
                    value={form.totalMarks}
                    onChange={handleChange}
                    placeholder="100"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />

                </div>

                {/* PASSING MARKS */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Passing Marks *
                  </label>

                  <input
                    type="number"
                    name="passingMarks"
                    min="0"
                    value={form.passingMarks}
                    onChange={handleChange}
                    placeholder="40"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />

                </div>

                {/* STATUS */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="UPCOMING">
                      Upcoming
                    </option>

                    <option value="ONGOING">
                      Ongoing
                    </option>

                    <option value="COMPLETED">
                      Completed
                    </option>

                    <option value="CANCELLED">
                      Cancelled
                    </option>
                  </select>

                </div>

                {/* DESCRIPTION */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter examination description..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />

                </div>

                {/* MODAL ERROR */}

                {error && (
                  <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

              </div>

              {/* FOOTER */}

              <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Examination"
                    : "Create Examination"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default ExaminationPage;