import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, MapPin, BarChart3 } from 'lucide-react';
import { toast } from 'react-toastify';
import listingService from '../services/listingService';
import LoadingSpinner from '../components/LoadingSpinner';
import { handleApiError } from '../utils/errorHandler';
import { getImageUrl } from '../utils/imageUrl';

const ProviderDashboard = () => {
  const [myServices, setMyServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch provider's listings
  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await listingService.getProviderListings();

        if (response.success) {
          setMyServices(response.data);
        }
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, []);

  // Delete listing
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        const response = await listingService.deleteListing(id);

        if (response.success) {
          // Remove from local state
          setMyServices(myServices.filter(item => item._id !== id));
          toast.success("Service deleted successfully!");
        }
      } catch (err) {
        toast.error(handleApiError(err));
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your services..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
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
      <div className="container mx-auto px-6">
        
        {/* رأس الصفحة مع زر إضافة خدمة جديدة */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">My Services</h1>
            <p className="text-gray-500 mt-1">Manage your listings and view performance</p>
          </div>
          <Link 
            to="/add-listing" 
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            <Plus size={20} />
            Add New Service
          </Link>
        </div>

        {/* شبكة الخدمات */}
        {myServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myServices.map((item) => (
              <div key={item._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">

                {/* صورة الخدمة */}
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={getImageUrl(item.images?.[0])}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                    {item.categoryId?.name || 'Service'}
                  </div>
                  {/* Status badge */}
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-bold ${
                    item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {/* المحتوى */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{item.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      {item.location?.city || 'Location'}
                    </div>
                    <div className="flex items-center gap-1 text-indigo-600">
                      <BarChart3 size={14} />
                      {item.views || 0} views
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-lg font-bold text-gray-900">
                      {item.pricing?.amount ? `$${item.pricing.amount}` : 'Contact'}
                    </p>
                  </div>

                  {/* أزرار التحكم (تعديل، حذف، مشاهدة) */}
                  <div className="flex gap-2 border-t border-gray-100 pt-4">
                    <Link to={`/service/${item._id}`} className="flex-1 flex justify-center items-center gap-1 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 text-sm font-medium transition">
                      <Eye size={16} /> View
                    </Link>
                    <Link to={`/edit-listing/${item._id}`} className="flex-1 flex justify-center items-center gap-1 py-2 rounded-lg bg-gray-50 text-blue-600 hover:bg-blue-50 hover:text-blue-700 text-sm font-medium transition">
                      <Edit size={16} /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex-1 flex justify-center items-center gap-1 py-2 rounded-lg bg-gray-50 text-red-500 hover:bg-red-50 hover:text-red-600 text-sm font-medium transition"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // في حال لم يكن لديه خدمات
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <h3 className="text-xl font-bold text-gray-400 mb-4">No services listed yet</h3>
            <Link to="/add-listing" className="text-indigo-600 font-bold hover:underline">
              Create your first listing now
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProviderDashboard;