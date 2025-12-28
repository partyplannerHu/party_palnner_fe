import React, { useState, useEffect } from 'react';
import { MapPin, Star, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import categoryService from '../services/categoryService';
import listingService from '../services/listingService';
import LoadingSpinner from '../components/LoadingSpinner';
import { handleApiError } from '../utils/errorHandler';
import { getImageUrl } from '../utils/imageUrl';

const BrowseServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories({ isActive: true });
        if (response.success) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch listings when filters or page change
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: currentPage,
          limit,
          isActive: true,
        };

        // Add category filter
        if (selectedCategory !== 'All') {
          params.categoryId = selectedCategory;
        }

        // Add price range filters
        if (minPrice) {
          params.minPrice = parseFloat(minPrice);
        }
        if (maxPrice) {
          params.maxPrice = parseFloat(maxPrice);
        }

        const response = await listingService.getListings(params);

        if (response.success) {
          setListings(response.data);
          setTotalCount(response.total || response.data.length);
          setTotalPages(response.pages || 1);
        }
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [selectedCategory, currentPage, minPrice, maxPrice]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset to first page
  };

  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset to first page when applying filters
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error && !listings.length) {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">

        {/* العنوان العلوي */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Services</h1>
          <p className="text-gray-500 mt-1">
            {loading ? 'Loading...' : `Showing ${listings.length} of ${totalCount} results`}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* 1. Sidebar - القائمة الجانبية للفلاتر */}
          <div className="w-full md:w-1/4">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <Filter size={20} className="text-indigo-600" />
                <h2 className="font-bold text-lg">Filters</h2>
              </div>

              {/* فلتر الفئات */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-gray-800">Category</h3>
                <div className="space-y-3">
                  {/* خيار الكل */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === 'All'}
                      onChange={() => handleCategoryChange('All')}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-gray-600 group-hover:text-indigo-600 transition">All Categories</span>
                  </label>

                  {/* باقي الفئات من البيانات */}
                  {categories.map((cat) => (
                    <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat._id}
                        onChange={() => handleCategoryChange(cat._id)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="text-gray-600 group-hover:text-indigo-600 transition">
                        {cat.name} ({cat.listingCount || 0})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* فلتر السعر */}
              <div>
                <h3 className="font-semibold mb-4 text-gray-800">Price Range</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={handleApplyFilters}
                  className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* 2. Services Grid - شبكة الخدمات */}
          <div className="w-full md:w-3/4">
            {loading ? (
              <LoadingSpinner message="Loading services..." />
            ) : listings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((item) => (
                    <div key={item._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300 flex flex-col">
                      {/* الصورة */}
                      <div className="h-48 overflow-hidden relative bg-gray-200">
                        <img
                          src={getImageUrl(item.images?.[0])}
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-md text-xs font-bold shadow-sm flex items-center gap-1">
                          <Star size={12} className="text-yellow-500 fill-current" />
                          4.5
                        </div>
                      </div>

                      {/* المحتوى */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wide">
                          {item.categoryId?.name || 'Service'}
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2 leading-tight">
                          {item.title}
                        </h3>

                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4 mt-auto">
                          <MapPin size={14} />
                          <span className="truncate">{item.location?.city || 'Location'}</span>
                        </div>

                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                          <div className="font-bold text-xl text-gray-900">
                            {item.pricing?.amount ? (
                              `$${item.pricing.amount}`
                            ) : (
                              <span className="text-sm text-indigo-600">Contact Us</span>
                            )}
                          </div>
                          <Link to={`/service/${item._id}`} className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 transition">
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      // Show first, last, current, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg ${
                              currentPage === page
                                ? 'bg-indigo-600 text-white'
                                : 'border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page}>...</span>;
                      }
                      return null;
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No services found matching your criteria</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default BrowseServicesPage;