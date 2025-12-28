import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import categoryService from '../services/categoryService';
import LoadingSpinner from '../components/LoadingSpinner';
import { handleApiError } from '../utils/errorHandler';

const AdminCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
    displayOrder: 0
  });

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await categoryService.getCategories({});

      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle add category
  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await categoryService.createCategory(formData);

      if (response.success) {
        setCategories([...categories, response.data]);
        setIsAdding(false);
        setFormData({ name: '', icon: '', description: '', displayOrder: 0 });
        toast.success("Category added successfully!");
      }
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit category
  const handleEdit = async (id) => {
    setSubmitting(true);

    try {
      const response = await categoryService.updateCategory(id, formData);

      if (response.success) {
        setCategories(categories.map(cat =>
          cat._id === id ? response.data : cat
        ));
        setEditingId(null);
        setFormData({ name: '', icon: '', description: '', displayOrder: 0 });
        toast.success("Category updated successfully!");
      }
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete category
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category? This will fail if the category has listings.")) {
      try {
        const response = await categoryService.deleteCategory(id);

        if (response.success) {
          setCategories(categories.filter(cat => cat._id !== id));
          toast.success("Category deleted successfully!");
        }
      } catch (err) {
        toast.error(handleApiError(err));
      }
    }
  };

  // Start editing
  const startEdit = (category) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      icon: category.icon,
      description: category.description || '',
      displayOrder: category.displayOrder || 0
    });
    setIsAdding(false);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name: '', icon: '', description: '', displayOrder: 0 });
  };

  if (loading) {
    return <LoadingSpinner message="Loading categories..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchCategories}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* العنوان والزر */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Category Management</h1>
            <p className="text-gray-500 mt-1">Add, edit, or remove service categories dynamically</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            <Plus size={20} />
            Add Category
          </button>
        </div>

        {/* نموذج إضافة فئة (يظهر عند الضغط على الزر) */}
        {isAdding && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-indigo-100 mb-8 animate-fade-in">
            <h3 className="font-bold text-lg mb-4">Add New Category</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                    placeholder="e.g. Florists"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji) *</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 text-center text-2xl"
                    placeholder="🌹"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                  placeholder="Describe this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* جدول الفئات */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">Icon</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Category Name</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Description</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Listings</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  editingId === cat._id ? (
                    // Edit mode
                    <tr key={cat._id} className="bg-indigo-50">
                      <td className="p-4">
                        <input
                          type="text"
                          className="w-16 p-1 border rounded text-2xl text-center"
                          value={formData.icon}
                          onChange={(e) => setFormData({...formData, icon: e.target.value})}
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="text"
                          className="w-full p-1 border rounded"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="text"
                          className="w-full p-1 border rounded"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                      </td>
                      <td className="p-4 text-sm text-gray-500">{cat.listingCount || 0}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(cat._id)}
                          disabled={submitting}
                          className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded transition disabled:opacity-50"
                        >
                          {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-50 rounded transition"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </tr>
                  ) : (
                    // View mode
                    <tr key={cat._id} className="hover:bg-gray-50 transition">
                      <td className="p-4 text-2xl">{cat.icon}</td>
                      <td className="p-4 font-medium text-gray-900">{cat.name}</td>
                      <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{cat.description || 'No description'}</td>
                      <td className="p-4 text-sm text-gray-500">{cat.listingCount || 0} listings</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => startEdit(cat)}
                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No categories found. Add your first category above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default AdminCategoryPage;