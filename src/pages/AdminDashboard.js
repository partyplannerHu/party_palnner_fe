import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, List, Star, CheckCircle, XCircle, Shield, UserX } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import adminService from '../services/adminService';

const StatCard = ({ label, value, icon: Icon, colorClass, loading }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      {loading ? (
        <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      )}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [listingCount, setListingCount] = useState(null);
  const [reviewCount, setReviewCount] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsRes, listingsRes, reviewsRes] = await Promise.all([
          adminService.getStats(),
          adminService.getListings({ limit: 1 }),
          adminService.getAllReviews({ limit: 1 }),
        ]);
        setStats(statsRes.data || statsRes);
        setListingCount(listingsRes.total ?? listingsRes.count ?? 0);
        setReviewCount(reviewsRes.total ?? reviewsRes.count ?? 0);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const primaryCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: Users, colorClass: 'bg-blue-500' },
    { label: 'Total Providers', value: stats?.totalProviders, icon: Building2, colorClass: 'bg-purple-500' },
    { label: 'Total Listings', value: listingCount, icon: List, colorClass: 'bg-green-500' },
    { label: 'Total Reviews', value: reviewCount, icon: Star, colorClass: 'bg-yellow-500' },
  ];

  const secondaryCards = [
    { label: 'Active Users', value: stats?.activeUsers, icon: CheckCircle, colorClass: 'bg-emerald-500' },
    { label: 'Verified Providers', value: stats?.verifiedUsers, icon: Shield, colorClass: 'bg-indigo-500' },
    { label: 'Inactive Users', value: stats?.inactiveUsers, icon: UserX, colorClass: 'bg-gray-500' },
    { label: 'Unverified Users', value: stats?.unverifiedUsers, icon: XCircle, colorClass: 'bg-red-400' },
  ];

  const quickLinks = [
    { to: '/admin/users', label: 'Manage Users', icon: Users, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
    { to: '/admin/listings', label: 'Manage Listings', icon: List, color: 'bg-green-50 text-green-700 hover:bg-green-100' },
    { to: '/admin/reviews', label: 'Moderate Reviews', icon: Star, color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
    { to: '/admin/categories', label: 'Categories', icon: Shield, color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">{today}</p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {primaryCards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {secondaryCards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map(({ to, label, icon: Icon, color }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-3 p-5 rounded-xl font-semibold text-sm transition ${color}`}
            >
              <Icon size={28} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
