import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BrowseServicesPage from './pages/BrowseServicesPage';
import ListingDetails from './pages/ListingDetails';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AddListingPage from './pages/AddListingPage';
import EditListingPage from './pages/EditListingPage';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminCategoryPage from './pages/AdminCategoryPage';
import AdminSubcategoryPage from './pages/AdminSubcategoryPage';
import UserProfilePage from './pages/UserProfilePage';
import FavoritesPage from './pages/FavoritesPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <div className="min-h-screen bg-gray-50 pt-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<BrowseServicesPage />} />
            <Route path="/service/:id" element={<ListingDetails />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected route - Provider and Admin only */}
            <Route
              path="/add-listing"
              element={
                <ProtectedRoute allowedRoles={['provider', 'admin']}>
                  <AddListingPage />
                </ProtectedRoute>
              }
            />

            {/* Protected route - Provider and Admin only */}
            <Route
              path="/edit-listing/:id"
              element={
                <ProtectedRoute allowedRoles={['provider', 'admin']}>
                  <EditListingPage />
                </ProtectedRoute>
              }
            />

            {/* Protected route - Provider and Admin only */}
            <Route
              path="/my-listings"
              element={
                <ProtectedRoute allowedRoles={['provider', 'admin']}>
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected route - Admin only */}
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCategoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subcategories"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSubcategoryPage />
                </ProtectedRoute>
              }
            />

            {/* Protected route - All authenticated users */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />

            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;