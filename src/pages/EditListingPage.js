import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, DollarSign, MapPin, Phone, Type, Image as ImageIcon, X, Loader2, Plus, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import categoryService from '../services/categoryService';
import subcategoryService from '../services/subcategoryService';
import listingService from '../services/listingService';
import LoadingSpinner from '../components/LoadingSpinner';
import { handleApiError } from '../utils/errorHandler';
import { getImageUrl } from '../utils/imageUrl';

const EditListingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [categories, setCategories] = useState([]);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState(null);

  // Form data matching backend schema
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    subcategoryId: '',
    description: '',
    // Location fields
    address: '',
    city: '',
    area: '',
    // Pricing fields
    pricingAmount: '',
    pricingCurrency: 'USD',
    pricingUnit: '',
    // Capacity
    capacity: '',
    // Contact info
    phone: '',
    whatsapp: '',
    email: '',
    // Features and amenities
    features: [],
    amenities: []
  });

  // Image states
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imagesToKeep, setImagesToKeep] = useState([]);

  // Tag input states
  const [featureInput, setFeatureInput] = useState('');
  const [amenityInput, setAmenityInput] = useState('');

  // Fetch categories and listing data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const catResponse = await categoryService.getCategories({ isActive: true });
        if (catResponse.success) {
          setCategories(catResponse.data);
        }

        // Fetch listing data
        const listingResponse = await listingService.getListingById(id);
        if (listingResponse.success) {
          const listing = listingResponse.data;

          // Pre-fill form data
          const categoryId = listing.categoryId?._id || listing.categoryId || '';
          const subcategoryId = listing.subcategoryId?._id || listing.subcategoryId || '';

          setFormData({
            title: listing.title || '',
            categoryId: categoryId,
            subcategoryId: subcategoryId,
            description: listing.description || '',
            address: listing.location?.address || '',
            city: listing.location?.city || '',
            area: listing.location?.area || '',
            pricingAmount: listing.pricing?.amount || '',
            pricingCurrency: listing.pricing?.currency || 'USD',
            pricingUnit: listing.pricing?.unit || '',
            capacity: listing.capacity || '',
            phone: listing.contactInfo?.phone || '',
            whatsapp: listing.contactInfo?.whatsapp || '',
            email: listing.contactInfo?.email || '',
            features: listing.features || [],
            amenities: listing.amenities || []
          });

          // Set existing images
          setExistingImages(listing.images || []);
          setImagesToKeep(listing.images || []);

          // Fetch subcategories for the listing's category
          if (categoryId) {
            try {
              const subResponse = await subcategoryService.getSubcategoriesByCategory(categoryId);
              if (subResponse.success) {
                setAvailableSubcategories(subResponse.data);
              }
            } catch (err) {
              console.error('Error fetching subcategories:', err);
            }
          }
        }
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle category change - fetch subcategories
  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setFormData({ ...formData, categoryId, subcategoryId: '' });

    if (categoryId) {
      try {
        const response = await subcategoryService.getSubcategoriesByCategory(categoryId);
        if (response.success) {
          setAvailableSubcategories(response.data);
        }
      } catch (err) {
        console.error('Error fetching subcategories:', err);
        setAvailableSubcategories([]);
      }
    } else {
      setAvailableSubcategories([]);
    }
  };

  // Handle new file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);

    // Create preview URLs
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Remove new image
  const removeNewImage = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    URL.revokeObjectURL(imagePreviews[index]);

    setSelectedFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  // Remove existing image
  const removeExistingImage = (imagePath) => {
    setImagesToKeep(imagesToKeep.filter(img => img !== imagePath));
  };

  // Restore existing image
  const restoreExistingImage = (imagePath) => {
    if (!imagesToKeep.includes(imagePath)) {
      setImagesToKeep([...imagesToKeep, imagePath]);
    }
  };

  // Add feature tag
  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
      setFeatureInput('');
    }
  };

  // Remove feature tag
  const removeFeature = (feature) => {
    setFormData({ ...formData, features: formData.features.filter(f => f !== feature) });
  };

  // Add amenity tag
  const addAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData({ ...formData, amenities: [...formData.amenities, amenityInput.trim()] });
      setAmenityInput('');
    }
  };

  // Remove amenity tag
  const removeAmenity = (amenity) => {
    setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== amenity) });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calculate total images
    const totalImages = imagesToKeep.length + selectedFiles.length;

    // Validate images (need at least 3 total)
    if (totalImages < 3) {
      toast.error('Please keep or add at least 3 images total');
      return;
    }

    if (totalImages > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setSubmitting(true);

    try {
      let imagePaths = [...imagesToKeep];

      // Upload new images if any
      if (selectedFiles.length > 0) {
        setUploadingImages(true);
        const imgResponse = await listingService.uploadImages(selectedFiles);
        const newImagePaths = imgResponse.data;
        imagePaths = [...imagePaths, ...newImagePaths];
        setUploadingImages(false);
      }

      // Update listing
      const listingData = {
        title: formData.title,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId,
        description: formData.description,
        images: imagePaths,
        location: {
          address: formData.address,
          city: formData.city,
          area: formData.area
        },
        pricing: {
          amount: formData.pricingAmount ? parseFloat(formData.pricingAmount) : undefined,
          currency: formData.pricingCurrency,
          unit: formData.pricingUnit || undefined
        },
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        contactInfo: {
          phone: formData.phone,
          whatsapp: formData.whatsapp || undefined,
          email: formData.email || undefined
        },
        features: formData.features,
        amenities: formData.amenities
      };

      const response = await listingService.updateListing(id, listingData);

      if (response.success) {
        toast.success('Service updated successfully!');
        navigate('/my-listings');
      }
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setSubmitting(false);
      setUploadingImages(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading listing..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/my-listings')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Back to My Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900">Edit Service</h1>
          <p className="mt-2 text-gray-600">Update your service details</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">

            {/* 1. Basic Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Basic Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Title */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Title *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Type className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      className="pl-10 block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none"
                      placeholder="e.g., Luxury Wedding Photography"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    name="categoryId"
                    required
                    value={formData.categoryId}
                    className="block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none bg-white"
                    onChange={handleCategoryChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory *</label>
                  <select
                    name="subcategoryId"
                    required
                    value={formData.subcategoryId}
                    className="block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    onChange={handleChange}
                    disabled={!formData.categoryId || availableSubcategories.length === 0}
                  >
                    <option value="">
                      {!formData.categoryId
                        ? 'Select category first'
                        : availableSubcategories.length === 0
                        ? 'No subcategories available'
                        : 'Select Subcategory'}
                    </option>
                    {availableSubcategories.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (people)</label>
                  <input
                    type="number"
                    name="capacity"
                    min="1"
                    value={formData.capacity}
                    className="block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none"
                    placeholder="e.g., 100"
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  rows="4"
                  required
                  maxLength="2000"
                  value={formData.description}
                  className="block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none"
                  placeholder="Describe your service in detail..."
                  onChange={handleChange}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000 characters</p>
              </div>
            </div>

            {/* 2. Location Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Location</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      className="pl-10 block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none"
                      placeholder="e.g., Amman"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    className="block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none"
                    placeholder="e.g., Abdoun"
                    onChange={handleChange}
                  />
                </div>

                {/* Address */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    className="block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none"
                    placeholder="Street address"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* 3. Pricing */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Pricing</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="pricingAmount"
                      min="0"
                      step="0.01"
                      value={formData.pricingAmount}
                      className="pl-10 block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none"
                      placeholder="e.g., 500"
                      onChange={handleChange}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Leave empty for "Contact us"</p>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    name="pricingCurrency"
                    value={formData.pricingCurrency}
                    className="block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none bg-white"
                    onChange={handleChange}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="JOD">JOD (JD)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                {/* Pricing Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Unit</label>
                  <select
                    name="pricingUnit"
                    value={formData.pricingUnit}
                    className="block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none bg-white"
                    onChange={handleChange}
                  >
                    <option value="">Select unit</option>
                    <option value="per hour">Per Hour</option>
                    <option value="per day">Per Day</option>
                    <option value="per event">Per Event</option>
                    <option value="per person">Per Person</option>
                    <option value="fixed">Fixed Price</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Contact Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Contact Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      className="pl-10 block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none"
                      placeholder="079 xxxxxxx"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    className="block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none"
                    placeholder="079 xxxxxxx"
                    onChange={handleChange}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      className="pl-10 block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none"
                      placeholder="contact@example.com"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Features */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Features</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Features (optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="flex-1 border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none"
                    placeholder="e.g., Professional lighting"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                  >
                    <Plus size={18} /> Add
                  </button>
                </div>

                {/* Feature tags */}
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.features.map((feature, index) => (
                      <span key={index} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {feature}
                        <button type="button" onClick={() => removeFeature(feature)} className="hover:text-indigo-900">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 6. Amenities */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Amenities</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Amenities (optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                    className="flex-1 border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none"
                    placeholder="e.g., Free parking"
                  />
                  <button
                    type="button"
                    onClick={addAmenity}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                  >
                    <Plus size={18} /> Add
                  </button>
                </div>

                {/* Amenity tags */}
                {formData.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.amenities.map((amenity, index) => (
                      <span key={index} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {amenity}
                        <button type="button" onClick={() => removeAmenity(amenity)} className="hover:text-green-900">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 7. Images Management */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Manage Images (3-10 total required)</h3>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Current Images</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((imagePath, index) => {
                      const isKept = imagesToKeep.includes(imagePath);
                      return (
                        <div key={index} className="relative group">
                          <img
                            src={getImageUrl(imagePath)}
                            alt={`Current ${index + 1}`}
                            className={`w-full h-32 object-cover rounded-lg border-2 ${
                              isKept ? 'border-green-500' : 'border-gray-300 opacity-50'
                            }`}
                          />
                          {isKept ? (
                            <button
                              type="button"
                              onClick={() => removeExistingImage(imagePath)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                              disabled={submitting}
                            >
                              <X size={16} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => restoreExistingImage(imagePath)}
                              className="absolute inset-0 bg-black bg-opacity-50 text-white rounded-lg flex items-center justify-center hover:bg-opacity-60 transition"
                              disabled={submitting}
                            >
                              <Plus size={24} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Click X to remove or + to restore. Keeping {imagesToKeep.length} of {existingImages.length} images.
                  </p>
                </div>
              )}

              {/* Upload New Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add New Images (optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                    disabled={submitting}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-1">Click to upload additional images</p>
                    <p className="text-xs text-gray-500">Max 5MB per image. PNG, JPG, JPEG</p>
                  </label>
                </div>

                {/* New Image previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      New Images ({imagePreviews.length})
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`New ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                            disabled={submitting}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  Total images: {imagesToKeep.length + selectedFiles.length} (min: 3, max: 10)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting || (imagesToKeep.length + selectedFiles.length) < 3}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {uploadingImages ? 'Uploading images...' : 'Updating service...'}
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Update Service
                  </>
                )}
              </button>
              {(imagesToKeep.length + selectedFiles.length) < 3 && (
                <p className="text-red-500 text-sm text-center mt-2">
                  Please keep or add at least 3 images total
                </p>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditListingPage;
