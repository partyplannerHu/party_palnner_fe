import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit, Save, X, Loader2, Filter, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import categoryService from '../services/categoryService';
import subcategoryService from '../services/subcategoryService';
import LoadingSpinner from '../components/LoadingSpinner';
import { handleApiError } from '../utils/errorHandler';

const AdminSubcategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterCategoryId, setFilterCategoryId] = useState('All');

  const [formData, setFormData] = useState({
    name: '',
    categoryId: ''
  });

  // Fetch categories and subcategories
  useEffect(() => {
    fetchData();
  }, []);

  // Filter subcategories when filter changes
  useEffect(() => {
    if (filterCategoryId === 'All') {
      setFilteredSubcategories(subcategories);
    } else {
      setFilteredSubcategories(
        subcategories.filter(sub => sub.categoryId._id === filterCategoryId)
      );
    }
  }, [filterCategoryId, subcategories]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [categoriesResponse, subcategoriesResponse] = await Promise.all([
        categoryService.getCategories({}),
        subcategoryService.getSubcategories({})
      ]);

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }

      if (subcategoriesResponse.success) {
        setSubcategories(subcategoriesResponse.data);
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle add subcategory
  const handleAdd = async (e) => {
    e.preventDefault();

    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    setSubmitting(true);

    try {
      const response = await subcategoryService.createSubcategory(formData);

      if (response.success) {
        // Fetch updated data to get populated category
        await fetchData();
        setIsAdding(false);
        setFormData({ name: '', categoryId: '' });
        toast.success("Subcategory added successfully!");
      }
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit subcategory
  const handleEdit = async (id) => {
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    setSubmitting(true);

    try {
      const response = await subcategoryService.updateSubcategory(id, formData);

      if (response.success) {
        await fetchData();
        setEditingId(null);
        setFormData({ name: '', categoryId: '' });
        toast.success("Subcategory updated successfully!");
      }
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete subcategory
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subcategory? This will fail if the subcategory has listings.")) {
      try {
        const response = await subcategoryService.deleteSubcategory(id);

        if (response.success) {
          setSubcategories(subcategories.filter(sub => sub._id !== id));
          toast.success("Subcategory deleted successfully!");
        }
      } catch (err) {
        toast.error(handleApiError(err));
      }
    }
  };

  // Start editing
  const startEdit = (subcategory) => {
    setEditingId(subcategory._id);
    setFormData({
      name: subcategory.name,
      categoryId: subcategory.categoryId._id
    });
    setIsAdding(false);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name: '', categoryId: '' });
  };

  if (loading) {
    return <LoadingSpinner message="Loading subcategories..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
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
      <div className="container mx-auto px-6 max-w-6xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link
              to="/admin/categories"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition mb-3"
            >
              <ArrowLeft size={18} />
              Back to Categories
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900">Subcategory Management</h1>
            <p className="text-gray-600 mt-2">Manage subcategories for each category</p>
          </div>
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setFormData({ name: '', categoryId: '' });
            }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 shadow-md"
          >
            <Plus size={20} />
            Add Subcategory
          </button>
        </div>

        {/* Filter by Category */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
            <select
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500 ml-auto">
              Showing {filteredSubcategories.length} subcategories
            </span>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {isAdding ? 'Add New Subcategory' : 'Edit Subcategory'}
            </h2>
            <form onSubmit={(e) => isAdding ? handleAdd(e) : handleEdit(editingId)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory Name *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="e.g., Wedding Photography"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {isAdding ? 'Add' : 'Save'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Subcategories Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Subcategory Name</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Parent Category</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-700">Listings</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-700">Status</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubcategories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      No subcategories found
                      {filterCategoryId !== 'All' && ' for this category'}
                    </td>
                  </tr>
                ) : (
                  filteredSubcategories.map((subcategory) => (
                    <tr key={subcategory._id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {subcategory.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                          {subcategory.categoryId?.icon} {subcategory.categoryId?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {subcategory.listingCount || 0}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          subcategory.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {subcategory.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => startEdit(subcategory)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(subcategory._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
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

        {/* Summary */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-indigo-600">{subcategories.length}</p>
              <p className="text-sm text-gray-600">Total Subcategories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {subcategories.filter(s => s.isActive).length}
              </p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {subcategories.filter(s => !s.isActive).length}
              </p>
              <p className="text-sm text-gray-600">Inactive</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {subcategories.reduce((sum, s) => sum + (s.listingCount || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Total Listings</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSubcategoryPage;
