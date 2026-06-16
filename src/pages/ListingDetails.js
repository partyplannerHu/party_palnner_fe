import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, ArrowLeft, CheckCircle, Mail, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import listingService from '../services/listingService';
import favoriteService from '../services/favoriteService';
import LoadingSpinner from '../components/LoadingSpinner';
import ReviewsSection from '../components/ReviewsSection';
import StarRating from '../components/StarRating';
import { handleApiError } from '../utils/errorHandler';
import { getImageUrl } from '../utils/imageUrl';
import { useAuth } from '../context/AuthContext';

const ListingDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [liveRating, setLiveRating] = useState({ avg: 0, count: 0 });

  const handleRatingUpdate = useCallback((avg, count) => {
    setLiveRating({ avg, count });
  }, []);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch listing by ID
        const response = await listingService.getListingById(id);

        if (response.success) {
          setService(response.data);
          setLiveRating({
            avg: response.data.averageRating || 0,
            count: response.data.reviewCount || 0,
          });

          // Increment view count (fire and forget)
          listingService.incrementView(id).catch(err => {
            console.error('Error incrementing view:', err);
          });
        }
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // Check if this listing is favorited
  useEffect(() => {
    if (!isAuthenticated || !id) return;
    favoriteService.checkFavorite(id)
      .then(res => { if (res.success) setIsFavorited(res.isFavorited); })
      .catch(() => {});
  }, [id, isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to save favorites');
      return;
    }
    setFavLoading(true);
    try {
      const res = await favoriteService.toggleFavorite(id);
      if (res.success) {
        setIsFavorited(res.isFavorited);
        toast.success(res.message);
      }
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setFavLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading service details..." />;
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Service not found!'}</p>
          <Link to="/services" className="text-indigo-600 hover:underline">
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-6">
        
        {/* زر العودة للخلف */}
        <Link to="/services" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition">
          <ArrowLeft size={20} className="mr-2" />
          Back to Services
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* القسم الأيمن: الصورة */}
            <div className="h-64 lg:h-auto relative bg-gray-200">
              <img
                src={getImageUrl(service.images?.[currentImageIndex])}
                alt={service.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-indigo-600 shadow-sm">
                {service.categoryId?.name || 'Service'}
                {service.subcategoryId?.name && (
                  <span className="text-gray-500"> • {service.subcategoryId.name}</span>
                )}
              </div>

              {/* Arrow navigation */}
              {service.images && service.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(i => (i - 1 + service.images.length) % service.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(i => (i + 1) % service.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition"
                  >
                    <ChevronRight size={22} />
                  </button>

                  {/* Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {service.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          currentImageIndex === index ? 'bg-white w-6' : 'bg-white/50 w-2'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
                    {currentImageIndex + 1} / {service.images.length}
                  </div>
                </>
              )}
            </div>

            {/* القسم الأيسر: التفاصيل */}
            <div className="p-8 lg:p-12">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex-1">{service.title}</h1>
                    <button
                      onClick={handleToggleFavorite}
                      disabled={favLoading}
                      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                      className="mt-1 p-2 rounded-full border border-gray-200 hover:border-red-300 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      <Heart
                        size={22}
                        className={isFavorited ? 'text-red-500 fill-current' : 'text-gray-400'}
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <StarRating value={liveRating.avg} size={18} />
                      {liveRating.avg > 0 ? (
                        <span className="font-bold text-gray-800 text-base">{liveRating.avg}</span>
                      ) : null}
                      <span className="text-gray-400">({liveRating.count} {liveRating.count === 1 ? 'review' : 'reviews'})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={18} />
                      {service.location?.city || 'Location'}, {service.location?.area || service.location?.address}
                    </div>
                  </div>
                  {service.views > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{service.views} views</p>
                  )}
                </div>

                {/* السعر */}
                <div className="text-right">
                  <p className="text-sm text-gray-400 mb-1">
                    {service.pricing?.unit && `Price (${service.pricing.unit})`}
                  </p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {service.pricing?.amount
                      ? `${service.pricing.currency || '$'}${service.pricing.amount}`
                      : 'Contact Us'}
                  </p>
                </div>
              </div>

              <hr className="border-gray-100 my-6" />

              {/* الوصف */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">About this Service</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {service.description || "Experience top-tier service tailored to your needs. We ensure professionalism and quality in every detail of your event."}
                </p>

                {/* Capacity */}
                {Boolean(service.capacity) && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Capacity:</span> {service.capacity} people
                    </p>
                  </div>
                )}

                {/* Features */}
                {service.features && service.features.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle size={16} className="text-green-500" /> {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {service.amenities && service.amenities.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Amenities:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {service.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle size={16} className="text-green-500" /> {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* بطاقة التواصل (المزود) */}
              <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide mb-4">Service Provider</h3>

                <div className="flex items-center gap-4 mb-6">
                  {service.providerId?.profileImage ? (
                    <img
                      src={getImageUrl(service.providerId.profileImage)}
                      alt={service.providerId?.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-indigo-300"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-indigo-300">
                      {service.providerId?.name?.charAt(0).toUpperCase() || 'P'}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {service.providerId?.businessName || service.providerId?.name || 'Provider'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {service.providerId?.isVerified ? 'Verified Provider' : 'Provider'}
                    </p>
                  </div>
                </div>

                {/* Contact buttons */}
                <div className="space-y-3">
                  {service.contactInfo?.phone && (
                    <a
                      href={`tel:${service.contactInfo.phone}`}
                      className="flex items-center justify-center gap-3 w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                    >
                      <Phone size={24} />
                      Call: {service.contactInfo.phone}
                    </a>
                  )}

                  {service.contactInfo?.whatsapp && (
                    <a
                      href={`https://wa.me/${service.contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition"
                    >
                      WhatsApp
                    </a>
                  )}

                  {service.contactInfo?.email && (
                    <a
                      href={`mailto:${service.contactInfo.email}`}
                      className="flex items-center justify-center gap-3 w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                    >
                      <Mail size={20} />
                      Email
                    </a>
                  )}
                </div>

                <p className="text-center text-xs text-gray-400 mt-3">
                  Mention "PartyPlanner" when you contact for the best deal!
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mt-6">
          <ReviewsSection
            listingId={id}
            providerId={service.providerId?._id || service.providerId}
            onRatingUpdate={handleRatingUpdate}
          />
        </div>

      </div>
    </div>
  );
};

export default ListingDetails;