import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Phone, User, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import listingService from '../services/listingService';
import LoadingSpinner from '../components/LoadingSpinner';
import { handleApiError } from '../utils/errorHandler';
import { getImageUrl } from '../utils/imageUrl';

const ListingDetails = () => {
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch listing by ID
        const response = await listingService.getListingById(id);

        if (response.success) {
          setService(response.data);

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
              </div>

              {/* Image navigation dots */}
              {service.images && service.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {service.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition ${
                        currentImageIndex === index ? 'bg-white w-6' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* القسم الأيسر: التفاصيل */}
            <div className="p-8 lg:p-12">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star size={18} fill="currentColor" />
                      <span className="font-bold text-gray-800 text-base">4.5</span>
                      <span className="text-gray-400">(0 reviews)</span>
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
                      ? `$${service.pricing.amount} ${service.pricing.currency || ''}`
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
      </div>
    </div>
  );
};

export default ListingDetails;