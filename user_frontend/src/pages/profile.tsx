import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../contexts/AuthContext';
import Link from 'next/link';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-400 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const joinDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  // Get role-specific colors and icons
  const getRoleConfig = (userType: string | null) => {
    switch (userType) {
      case 'tutor':
        return {
          bgGradient: 'from-blue-500 to-indigo-600',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          badgeColor: 'bg-blue-100 text-blue-800',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          )
        };
      case 'lecturer':
        return {
          bgGradient: 'from-purple-500 to-pink-600',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          badgeColor: 'bg-purple-100 text-purple-800',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )
        };
      default:
        return {
          bgGradient: 'from-green-500 to-teal-600',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          badgeColor: 'bg-green-100 text-green-800',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )
        };
    }
  };

  const roleConfig = getRoleConfig(user?.type || null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-200 to-pink-200 opacity-20 blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header with breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">Profile</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        </div>

        {/* Main profile card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm bg-opacity-95 transition-all duration-300 hover:shadow-2xl">
          {/* Header section with gradient background */}
          <div className={`relative px-8 py-12 bg-gradient-to-r ${roleConfig.bgGradient} text-white overflow-hidden`}>
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
            
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center text-3xl sm:text-4xl font-bold text-white ring-4 ring-white ring-opacity-30 transition-all duration-300 hover:scale-105">
                  {getInitials(user.name)}
                </div>
                {/* Status indicator */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* User info */}
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">{user.name}</h2>
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleConfig.badgeColor} bg-white bg-opacity-20 backdrop-blur-sm`}>
                    <div className={`w-4 h-4 mr-2 ${roleConfig.iconColor}`}>
                      {roleConfig.icon}
                    </div>
                    {user?.type ? user.type.charAt(0).toUpperCase() + user.type.slice(1) : 'User'}
                  </span>
                  <span className="text-blue-100 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {user.email}
                  </span>
                </div>
                <p className="mt-3 text-blue-100 text-sm opacity-90">
                  Welcome to your TeachTeam profile! Manage your information and access your dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Profile details section */}
          <div className="px-8 py-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className={`w-8 h-8 ${roleConfig.iconBg} rounded-lg flex items-center justify-center mr-3`}>
                <svg className={`w-4 h-4 ${roleConfig.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Account Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Full Name</label>
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl transition-all duration-200 group-hover:bg-gray-100">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-gray-900 font-medium">{user.name}</span>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Email Address</label>
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl transition-all duration-200 group-hover:bg-gray-100">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-900 font-medium">{user.email}</span>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Role</label>
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl transition-all duration-200 group-hover:bg-gray-100">
                    <div className={`w-5 h-5 text-gray-400 mr-3`}>
                      {roleConfig.icon}
                    </div>
                    <span className="text-gray-900 font-medium capitalize">{user?.type || 'User'}</span>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Member Since</label>
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl transition-all duration-200 group-hover:bg-gray-100">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-900 font-medium">{joinDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href={user?.type === 'tutor' ? '/tutor/dashboard' : '/lecturer/dashboard'}
                className={`group inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r ${roleConfig.bgGradient} hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105`}
              >
                <svg className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Go to Dashboard
              </Link>
              
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
                
                <Link
                  href="/signin"
                  onClick={() => {
                    localStorage.removeItem('tt_user');
                    window.location.href = '/signin';
                  }}
                  className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-xl text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Additional features section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Stats Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Account Status</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Security</p>
                <p className="text-2xl font-bold text-blue-600">Protected</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Last Login Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Last Login</p>
                <p className="text-2xl font-bold text-purple-600">Today</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;