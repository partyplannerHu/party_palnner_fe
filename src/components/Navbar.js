import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, Heart, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 h-20 fixed w-full top-0 z-50 flex items-center">
      <div className="container mx-auto px-6 flex justify-between items-center">

        {/* الشعار */}
        <Link to="/" className="text-3xl font-extrabold text-indigo-600 tracking-tight flex items-center gap-2">
          <span>🎉</span>
          PartyPlanner
        </Link>

        {/* الأزرار */}
        <div className="flex items-center gap-4 md:gap-6">

          {/* روابط سريعة - تظهر فقط للمستخدمين المسجلين */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-4 mr-2">
              {/* Provider Dashboard - للمزودين والأدمن فقط */}
              {(user?.role === 'provider' || user?.role === 'admin') && (
                <Link to="/my-listings" className="text-gray-500 hover:text-indigo-600 transition" title="Provider Dashboard">
                  <LayoutDashboard size={20} />
                </Link>
              )}

              {/* Admin Panel - للأدمن فقط */}
              {user?.role === 'admin' && (
                <Link to="/admin/categories" className="text-gray-500 hover:text-indigo-600 transition" title="Admin Panel">
                  <Shield size={20} />
                </Link>
              )}

              <Link to="/favorites" className="text-gray-500 hover:text-red-500 transition" title="My Favorites">
                <Heart size={20} />
              </Link>
              <Link to="/profile" className="text-gray-500 hover:text-indigo-600 transition" title="Profile">
                <User size={20} />
              </Link>
            </div>
          )}

          {isAuthenticated && <div className="h-6 w-px bg-gray-200 hidden md:block"></div>}

          {/* زر تسجيل الدخول أو قائمة المستخدم */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition">
                {user?.profileImage ? (
                  <img
                    src={getImageUrl(user.profileImage)}
                    alt={user?.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-indigo-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm border-2 border-indigo-200">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-bold text-gray-800 hidden md:inline">
                  {user?.name}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 font-bold text-sm transition flex items-center gap-2"
                title="Logout"
              >
                <LogOut size={18} />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-gray-600 hover:text-indigo-600 font-bold text-sm transition"
            >
              Sign In
            </Link>
          )}

          {/* زر إضافة خدمة - للمزودين والأدمن فقط */}
          {(!isAuthenticated || user?.role === 'provider' || user?.role === 'admin') && (
            <Link
              to="/add-listing"
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
              Add Service
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;