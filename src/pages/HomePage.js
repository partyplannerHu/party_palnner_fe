import React, { useState, useEffect } from 'react';
import { MapPin, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import categoryService from '../services/categoryService';
import listingService from '../services/listingService';
import LoadingSpinner from '../components/LoadingSpinner';
import { handleApiError } from '../utils/errorHandler';
import { getImageUrl } from '../utils/imageUrl';

const HomePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch active categories and featured listings in parallel
        const [categoriesResponse, listingsResponse] = await Promise.all([
          categoryService.getCategories({ isActive: true }),
          listingService.getListings({ isFeatured: true, limit: 6, isActive: true })
        ]);

        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data);
        }

        if (listingsResponse.success) {
          setListings(listingsResponse.data);
        }
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/services');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading homepage..." />;
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
    <div className="min-h-screen bg-gray-50">
      
      {/* 1. Hero Section - القسم العلوي المتدرج */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Plan Your Perfect Event
        </h1>
        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
          Connect with top-rated event service providers in one place
        </p>
        
        {/* مربع البحث */}
        <div className="max-w-2xl mx-auto px-4">
          <form onSubmit={handleSearch} className="bg-white rounded-full p-2 flex shadow-lg">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for venues, photographers, caterers..."
              className="flex-1 px-6 py-3 rounded-full outline-none text-gray-700"
            />
            <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* 2. Categories Section - قسم الفئات */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 text-gray-800">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <Link to={`/services?category=${cat._id}`} key={cat._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition text-center group cursor-pointer">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-gray-800">{cat.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{cat.listingCount || 0} listings</p>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-8">
              No categories available
            </div>
          )}
        </div>
      </div>

      {/* 3. Featured Services - قسم الخدمات المميزة */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Featured Services</h2>
            <Link to="/services" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {listings.length > 0 ? (
              listings.map((item) => (
                <div key={item._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300">
                  {/* صورة الخدمة */}
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={getImageUrl(item.images?.[0])}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-blue-600">
                      {item.categoryId?.name || 'Service'}
                    </span>
                  </div>

                  {/* تفاصيل الكرت */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 text-lg mb-2 truncate">
                      {item.title}
                    </h3>

                    {/* التقييم والموقع */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={16} fill="currentColor" />
                        <span className="font-medium text-gray-700">4.5</span>
                        <span className="text-gray-400">(0)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span className="truncate max-w-[100px]">{item.location?.city || 'Location'}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 my-4"></div>

                    {/* السعر والزر */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-400">Starting from</p>
                        <p className="text-xl font-bold text-blue-600">
                          {item.pricing?.amount ? `$${item.pricing.amount}` : 'Contact Us'}
                        </p>
                      </div>
                      <Link to={`/service/${item._id}`} className="bg-blue-50 text-blue-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 hover:text-white transition">
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                No featured services available
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;