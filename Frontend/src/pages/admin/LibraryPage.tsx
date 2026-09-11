import React, { useCallback, useEffect, useState } from 'react';
import {
  Library,
  Plus,
  Search,
  RefreshCw,
  X,
  Trash2,
  Edit,
  Book
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

const emptyForm = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  quantity: '1',
  description: '',
};

export const LibraryPage: React.FC = () => {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/franchise/books');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setBooks(res.data.data);
      } else {
        setBooks([]);
      }
    } catch (err: any) {
      console.error('Error fetching books:', err);
      setError('Failed to load library catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const openAddModal = () => {
    setEditingBook(null);
    setForm(emptyForm);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (b: BookItem) => {
    setEditingBook(b);
    setForm({
      title: b.title || '',
      author: b.author || '',
      isbn: b.isbn || '',
      category: b.category || '',
      quantity: String(b.quantity || 1),
      description: b.description || '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingBook(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setError(null);
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
      await fetchBooks();
    } catch (err: any) {
      console.error('Error saving book:', err);
      setError(err.response?.data?.message || 'Failed to save book.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b: BookItem) => {
    if (!window.confirm(`Are you sure you want to delete book "${b.title}"?`)) return;
    try {
      setError(null);
      await api.delete(`/franchise/books/${b.id}`);
      await fetchBooks();
    } catch (err: any) {
      console.error('Error deleting book:', err);
      setError(err.response?.data?.message || 'Failed to delete book.');
    }
  };

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      (b.category && b.category.toLowerCase().includes(search.toLowerCase())) ||
      (b.isbn && b.isbn.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Library className="w-7 h-7 text-blue-600" />
            School Library & Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage books catalog, categories, inventory, and circulation status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBooks}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Refresh books"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Book
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, author, category, ISBN..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500"
        />
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading library catalog...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white border border-dashed border-slate-200 p-6">
          <Book className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No books found</p>
          <p className="text-xs text-slate-400 mt-1">
            {search ? 'Try adjusting your search criteria.' : 'Add books to build your school library.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((book) => (
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

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">
                  Available: <span className="text-blue-600">{book.availableQuantity}</span> / {book.quantity}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${book.availableQuantity > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {book.availableQuantity > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL */}
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
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Book Title *
                </label>
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
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Author *
                </label>
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
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Science, Fiction"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Total Quantity *
                  </label>
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
    </div>
  );
};
