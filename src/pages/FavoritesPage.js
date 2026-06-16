import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Trash2, Heart } from 'lucide-react';
import { toast } from 'react-toastify';
import favoriteService from '../services/favoriteService';
import LoadingSpinner from '../components/LoadingSpinner';
import { handleApiError } from '../utils/errorHandler';
import { getImageUrl, getPlaceholderImage } from '../utils/imageUrl';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch favorites on component mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoriteService.getFavorites();

      if (response.success) {
        setFavorites(response.data);
      }
    } catch (error) {
      const errorMsg = handleApiError(error);

      // If unauthorized, redirect to login
      if (error.message?.includes('Not authorized') || error.message?.includes('token')) {
        toast.error('Please login to view favorites');
        navigate('/login');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (listingId) => {
    if (window.confirm("Remove this item from favorites?")) {
      try {
        const response = await favoriteService.removeFavorite(listingId);

        if (response.success) {
          setFavorites(favorites.filter(item => item.listingId._id !== listingId));
          toast.success('Removed from favorites');
        }
      } catch (error) {
        toast.error(handleApiError(error));
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading favorites..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-6">

        <div className="flex items-center gap-3 mb-8">
          <Heart className="text-red-500 fill-current" size={32} />
          <h1 className="text-3xl font-extrabold text-gray-900">My Favorites</h1>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => {
              const listing = fav.listingId;
              if (!listing) return null;

              return (
                <div key={fav._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300 relative group">

                  {/* زر الحذف من المفضلة */}
                  <button
                    onClick={() => removeFavorite(listing._id)}
                    className="absolute top-3 right-3 z-10 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 transition shadow-sm"
                    title="Remove from favorites"
                  >
                    <Trash2 size={18} />
                  </button>

                  {/* الصورة */}
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={getImageUrl(listing.images?.[0]) || getPlaceholderImage()}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute bottom-3 left-3 bg-white/90 px-2 py-1 rounded-md text-xs font-bold text-indigo-600">
                      {listing.categoryId?.icon} {listing.categoryId?.name}
                    </span>
                  </div>

                  {/* المحتوى */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 truncate">
                      {listing.title}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={16} fill="currentColor" />
                        <span className="font-medium text-gray-700">{listing.rating || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span className="truncate max-w-[100px]">
                          {listing.location?.city || listing.location?.split(',')[0] || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                      <span className="font-bold text-lg text-indigo-600">
                        {listing.pricing?.amount ? `${listing.pricing?.currency || '$'}${listing.pricing.amount}` : 'Contact for Price'}
                      </span>
                      <Link to={`/service/${listing._id}`} className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition">
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // حالة عدم وجود مفضلة
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-6">Start browsing and save items you like!</p>
            <Link to="/services" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-indigo-700 transition">
              Browse Services
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default FavoritesPage;