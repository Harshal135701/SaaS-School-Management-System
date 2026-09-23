import React, { useCallback, useEffect, useState } from 'react';
import {
  Library,
  Plus,
  Search,
  RefreshCw,
  X,
  Trash2,
  Edit,
  Book,
  CheckCircle2,
  ArrowLeftRight,
  BookOpen
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import api from '../../services/api';

interface BookItem {
  id: string;
  franchiseId: string;
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  quantity: number;
  availableQuantity: number;
  status: string;
  description?: string;
  createdAt?: string;
}

interface Student {
  id: string;
  name: string;
  email?: string;
}

interface BookIssue {
  id: string;
  book: { id: string; title: string; author: string };
  student: { id: string; name: string; email?: string };
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE';
  remarks: string | null;
}

const emptyForm = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  quantity: '1',
  description: '',
};

export const LibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CATALOGUE' | 'HISTORY'>('CATALOGUE');

  const [books, setBooks] = useState<BookItem[]>([]);
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedBookForIssue, setSelectedBookForIssue] = useState<BookItem | null>(null);
  const [issueForm, setIssueForm] = useState({
    studentId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    remarks: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [booksRes, issuesRes, studentsRes] = await Promise.all([
        api.get('/franchise/books'),
        api.get('/franchise/book-issues'),
        api.get('/franchise/students')
      ]);

      if (booksRes.data?.success && Array.isArray(booksRes.data.data)) {
        setBooks(booksRes.data.data);
      } else {
        setBooks([]);
      }

      if (issuesRes.data?.success && Array.isArray(issuesRes.data.data)) {
        setIssues(issuesRes.data.data);
      } else {
        setIssues([]);
      }

      if (studentsRes.data?.success && Array.isArray(studentsRes.data.data)) {
        setStudents(studentsRes.data.data);
      } else {
        setStudents([]);
      }
    } catch (err: any) {
      console.error('Error fetching library data:', err);
      setError('Failed to load library catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAddModal = () => {
    setEditingBook(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (book: BookItem) => {
    setEditingBook(book);
    setForm({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      category: book.category || '',
      quantity: String(book.quantity || 1),
      description: book.description || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBook(null);
    setForm(emptyForm);
  };

  const openIssueModal = (book: BookItem) => {
    setSelectedBookForIssue(book);
    setIssueForm({
      studentId: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      remarks: ''
    });
    setIsIssueModalOpen(true);
  };

  const closeIssueModal = () => {
    setIsIssueModalOpen(false);
    setSelectedBookForIssue(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setError(null);

    if (!form.title.trim()) {
      setError('Book title is required.');
      return;
    }
    if (!form.author.trim()) {
      setError('Author is required.');
      return;
    }

    const qty = parseInt(form.quantity, 10);
    if (isNaN(qty) || qty < 1) {
      setError('Quantity must be at least 1.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: form.title.trim(),
        author: form.author.trim(),
        isbn: form.isbn.trim() || undefined,
        category: form.category.trim() || undefined,
        quantity: qty,
        description: form.description.trim() || undefined,
      };

      if (editingBook) {
        await api.put(`/franchise/books/${editingBook.id}`, payload);
      } else {
        await api.post('/franchise/books', payload);
      }

      closeModal();
      await fetchData();
    } catch (err: any) {
      console.error('Error saving book:', err);
      setError(err.response?.data?.message || 'Failed to save book.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (book: BookItem) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) return;

    try {
      setError(null);
      await api.delete(`/franchise/books/${book.id}`);
      await fetchData();
    } catch (err: any) {
      console.error('Error deleting book:', err);
      setError(err.response?.data?.message || 'Failed to delete book.');
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForIssue || !issueForm.studentId || !issueForm.dueDate) return;

    if (issueForm.dueDate < issueForm.issueDate) {
      alert("Due date cannot be before issue date");
      return;
    }

    try {
      setIssuing(true);
      await api.post('/franchise/book-issues', {
        bookId: selectedBookForIssue.id,
        ...issueForm
      });
      closeIssueModal();
      await fetchData();
    } catch (err: any) {
      console.error('Error issuing book:', err);
      alert(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setIssuing(false);
    }
  };

  const handleReturnBook = async (issueId: string) => {
    if (!window.confirm("Mark this book as returned?")) return;

    try {
      await api.put(`/franchise/book-issues/${issueId}/return`);
      await fetchData();
    } catch (err: any) {
      console.error('Error returning book:', err);
      alert(err.response?.data?.message || 'Failed to return book');
    }
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(search.toLowerCase()) ||
    book.author.toLowerCase().includes(search.toLowerCase()) ||
    (book.isbn && book.isbn.includes(search)) ||
    (book.category && book.category.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredIssues = issues.filter((issue) =>
    issue.book.title.toLowerCase().includes(search.toLowerCase()) ||
    issue.student.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalBooks = books.reduce((acc, b) => acc + b.quantity, 0);
  const availableCopies = books.reduce((acc, b) => acc + b.availableQuantity, 0);
  const issuedCopies = totalBooks - availableCopies;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Library className="w-6 h-6 text-blue-600" />
            Library Management
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Manage books, monitor inventory, and track student issues
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            Add New Book
          </button>
        </div>
      </div>

      {/* DASHBOARD METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md" className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Books</p>
            <p className="text-2xl font-black text-slate-900">{totalBooks}</p>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Available Copies</p>
            <p className="text-2xl font-black text-slate-900">{availableCopies}</p>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
            <ArrowLeftRight className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Issued Copies</p>
            <p className="text-2xl font-black text-slate-900">{issuedCopies}</p>
          </div>
        </Card>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium border border-rose-100 flex items-start gap-3">
          <X className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* TABS */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('CATALOGUE')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'CATALOGUE' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Book Catalogue
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'HISTORY' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Issue History
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={activeTab === 'CATALOGUE' ? "Search books by title, author, category or ISBN..." : "Search issues by student name or book title..."}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
        />
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-600">Loading library data...</p>
        </div>
      ) : activeTab === 'CATALOGUE' ? (
        filteredBooks.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
            <Book className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-slate-900">No Books Found</h3>
            <p className="text-sm text-slate-500 mt-1">
              {search ? 'Try adjusting your search terms.' : 'Add your first book to the catalog.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((book) => (
              <Card key={book.id} hoverLift padding="md" className="flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-extrabold uppercase tracking-wide border border-indigo-100">
                      {book.category || 'General'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(book)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        title="Edit Book"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(book)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        title="Delete Book"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mt-3">{book.title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">By {book.author}</p>
                  {book.isbn && <p className="text-[11px] text-slate-400 mt-1">ISBN: {book.isbn}</p>}
                  {book.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{book.description}</p>
                  )}
                </div>

                <div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-slate-700">
                      Available: <span className="text-blue-600">{book.availableQuantity}</span> / {book.quantity}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${book.availableQuantity > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      {book.availableQuantity > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                    </span>
                  </div>
                  <button
                    onClick={() => openIssueModal(book)}
                    disabled={book.availableQuantity <= 0}
                    className="w-full py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Issue Book
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* HISTORY TAB */
        filteredIssues.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
            <ArrowLeftRight className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-slate-900">No Issue History Found</h3>
            <p className="text-sm text-slate-500 mt-1">
              {search ? 'Try adjusting your search terms.' : 'Books issued to students will appear here.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Book</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Dates</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIssues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-slate-900">{issue.student.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-slate-900">{issue.book.title}</p>
                        <p className="text-xs text-slate-500">{issue.book.author}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs">
                          <p><span className="font-semibold text-slate-500">Issued:</span> {issue.issueDate}</p>
                          <p><span className="font-semibold text-slate-500">Due:</span> {issue.dueDate}</p>
                          {issue.returnDate && (
                            <p><span className="font-semibold text-emerald-600">Returned:</span> {issue.returnDate}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {issue.status === 'ISSUED' && <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase border border-blue-100">Issued</span>}
                        {issue.status === 'RETURNED' && <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase border border-emerald-100">Returned</span>}
                        {issue.status === 'OVERDUE' && <span className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 text-[10px] font-extrabold uppercase border border-rose-100">Overdue</span>}
                      </td>
                      <td className="px-4 py-3">
                        {(issue.status === 'ISSUED' || issue.status === 'OVERDUE') && (
                          <button
                            onClick={() => handleReturnBook(issue.id)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg transition-colors"
                          >
                            Mark Returned
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* BOOK CATALOGUE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Book Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Fundamentals of Physics"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Author *</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="e.g. Halliday & Resnick"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Science, Fiction"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Total Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  ISBN <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={form.isbn}
                  onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                  placeholder="e.g. 978-0-123456-47-2"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Description <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Book summary or edition details..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                >
                  {saving ? 'Saving...' : editingBook ? 'Save Changes' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE BOOK MODAL */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-blue-50/50">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                Issue Book
              </h2>
              <button onClick={closeIssueModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="p-5 space-y-4">
              {selectedBookForIssue && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                  <p className="text-sm font-extrabold text-slate-900">{selectedBookForIssue.title}</p>
                  <p className="text-xs text-slate-500">By {selectedBookForIssue.author}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Student *</label>
                <select
                  value={issueForm.studentId}
                  onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 font-medium bg-white"
                >
                  <option value="">Select a student...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Issue Date *</label>
                  <input
                    type="date"
                    value={issueForm.issueDate}
                    onChange={(e) => setIssueForm({ ...issueForm, issueDate: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={issueForm.dueDate}
                    onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 font-medium text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Remarks <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <textarea
                  value={issueForm.remarks}
                  onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })}
                  placeholder="Note condition or special instructions..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeIssueModal}
                  disabled={issuing}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issuing || !issueForm.studentId || !issueForm.dueDate}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
                >
                  {issuing ? 'Issuing...' : 'Issue Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
