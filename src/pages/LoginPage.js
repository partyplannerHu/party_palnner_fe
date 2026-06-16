import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, X, KeyRound, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { handleApiError } from '../utils/errorHandler';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password modal state
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState('forgot'); // 'forgot' | 'reset' | 'done'
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(formData);
      if (response.success) {
        login(response.user, response.token);
        navigate('/');
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setModalStep('forgot');
    setForgotEmail('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setModalError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalError(null);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await authService.forgotPassword(forgotEmail);
      if (res.success) {
        setResetToken(res.resetToken || '');
        setModalStep('reset');
      }
    } catch (err) {
      setModalError(handleApiError(err));
    } finally {
      setModalLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setModalError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setModalError('Password must be at least 6 characters');
      return;
    }
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await authService.resetPassword(resetToken, newPassword);
      if (res.success) {
        setModalStep('done');
      }
    } catch (err) {
      setModalError(handleApiError(err));
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg border border-gray-100">

        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome Back!</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to access your account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">

            <div className="mb-4 relative">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="pl-10 block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-2.5 outline-none transition"
                  placeholder="you@example.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <button
                  type="button"
                  onClick={openModal}
                  className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="pl-10 pr-10 block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-2.5 outline-none transition"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </div>

          <div className="text-sm text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up now
            </Link>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>

            {/* Step 1 — Enter email */}
            {modalStep === 'forgot' && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
                    <p className="text-sm text-gray-500">Enter your email to get a reset token</p>
                  </div>
                </div>

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="pl-10 block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-2.5 outline-none transition"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {modalError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{modalError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="w-full flex justify-center py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 text-sm font-bold transition disabled:opacity-50"
                  >
                    {modalLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Send Reset Token'}
                  </button>
                </form>
              </>
            )}

            {/* Step 2 — Enter new password */}
            {modalStep === 'reset' && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <KeyRound className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Set New Password</h3>
                    <p className="text-sm text-gray-500">Choose a strong new password</p>
                  </div>
                </div>

                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 pr-10 block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-2.5 outline-none transition"
                        placeholder="Min. 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-2.5 outline-none transition"
                        placeholder="Repeat your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {modalError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{modalError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="w-full flex justify-center py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 text-sm font-bold transition disabled:opacity-50"
                  >
                    {modalLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Reset Password'}
                  </button>
                </form>
              </>
            )}

            {/* Step 3 — Success */}
            {modalStep === 'done' && (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-14 w-14 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Password Reset!</h3>
                <p className="text-sm text-gray-500 mb-6">Your password has been updated. You can now sign in with your new password.</p>
                <button
                  onClick={closeModal}
                  className="w-full py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 text-sm font-bold transition"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
