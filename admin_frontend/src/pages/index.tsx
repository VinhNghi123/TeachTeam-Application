import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { gql, useQuery, useSubscription } from '@apollo/client';
import Layout from '../components/Layout';
import { getAuthToken } from '../services/auth';

// GraphQL Queries
const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    getCourses {
      id
      courseCode
      name
      semester
      year
      isActive
    }
    getLecturers {
      id
      name
      email
    }
    getCandidates {
      id
      name
      email
      isBlocked
    }
  }
`;

const CANDIDATE_AVAILABILITY_SUBSCRIPTION = gql`
  subscription OnCandidateAvailabilityChanged {
    candidateAvailabilityChanged {
      tutorId
      tutorName
      isAvailable
      message
    }
  }
`;

// Types
interface User {
  id: string;
  name: string;
  email: string;
  isBlocked?: boolean;
}

interface Course {
  id: string;
  courseCode: string;
  name: string;
  semester: string;
  year: number;
  isActive: boolean;
}

interface AvailabilityUpdate {
  tutorId: string;
  tutorName: string;
  isAvailable: boolean;
  message: string;
  timestamp?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [availabilityUpdates, setAvailabilityUpdates] = useState<AvailabilityUpdate[]>([]);
  
  // Check authentication on component mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // GraphQL queries and subscriptions
  const { data, loading, error, refetch } = useQuery(GET_DASHBOARD_STATS, {
    errorPolicy: 'all'
  });
  
  const { data: subscriptionData } = useSubscription(
    CANDIDATE_AVAILABILITY_SUBSCRIPTION,
    {
      onError: (error) => {
        console.log('Subscription error (non-blocking):', error.message);
      }
    }
  );

  // Handle real-time availability updates
  useEffect(() => {
    if (subscriptionData?.candidateAvailabilityChanged) {
      const update = subscriptionData.candidateAvailabilityChanged;
      setAvailabilityUpdates((prev) => [
        {
          ...update,
          timestamp: new Date().toISOString()
        },
        ...prev,
      ].slice(0, 10)); // Keep only the last 10 updates
    }
  }, [subscriptionData]);

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <strong>Error loading dashboard:</strong>
            </div>
            <p className="mb-3">{error.message}</p>
            <button 
              onClick={() => refetch()} 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate statistics
  const activeCourses = data?.getCourses?.filter((c: Course) => c.isActive).length || 0;
  const totalCourses = data?.getCourses?.length || 0;
  const totalLecturers = data?.getLecturers?.length || 0;
  const activeCandidates = data?.getCandidates?.filter((c: User) => !c.isBlocked).length || 0;
  const blockedCandidates = data?.getCandidates?.filter((c: User) => c.isBlocked).length || 0;
  const totalCandidates = data?.getCandidates?.length || 0;

  // Statistics configuration
  const stats = [
    {
      name: 'Active Courses',
      value: activeCourses,
      total: totalCourses,
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      gradientStart: 'blue-500',
      gradientEnd: 'blue-600',
      bgColor: 'bg-blue-500',
      href: '/courses'
    },
    {
      name: 'Total Lecturers',
      value: totalLecturers,
      total: null,
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradientStart: 'green-500',
      gradientEnd: 'green-600',
      bgColor: 'bg-green-500',
      href: '/lecturers'
    },
    {
      name: 'Active Candidates',
      value: activeCandidates,
      total: totalCandidates,
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradientStart: 'purple-500',
      gradientEnd: 'purple-600',
      bgColor: 'bg-purple-500',
      href: '/candidates'
    },
    {
      name: 'Blocked Candidates',
      value: blockedCandidates,
      total: totalCandidates,
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
        </svg>
      ),
      gradientStart: 'red-500',
      gradientEnd: 'red-600',
      bgColor: 'bg-red-500',
      href: '/candidates'
    },
  ];

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900">TeachTeam Admin Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700">
              Comprehensive management system for the tutoring application platform
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer"
                onClick={() => router.push(stat.href)}
              >
                <dt>
                  <div className={`absolute rounded-md ${stat.bgColor} p-3`}>
                    {stat.icon}
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-500">
                    {stat.name}
                  </p>
                </dt>
                <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                  {stat.total !== null && (
                    <p className="ml-2 text-sm font-medium text-gray-500">
                      / {stat.total}
                    </p>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-60" 
                       style={{ background: `linear-gradient(to right, var(--tw-${stat.gradientStart}), var(--tw-${stat.gradientEnd}))` }}></div>
                </dd>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Candidate Availability Updates */}
        <div className="mt-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-3"></div>
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Real-time Candidate Availability Updates
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Live
                </span>
                <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm">
                  {availabilityUpdates.length}/10
                </span>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {availabilityUpdates.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {availabilityUpdates.map((update, index) => (
                    <li key={`${update.tutorId}-${update.timestamp}-${index}`} 
                        className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <div className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                            update.isAvailable ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {update.tutorName}
                              </p>
                              <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                                update.isAvailable 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {update.isAvailable ? 'Available' : 'Unavailable'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate">{update.message}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="text-xs text-gray-400">
                            {update.timestamp ? new Date(update.timestamp).toLocaleTimeString() : 'Now'}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="text-gray-400 text-4xl mb-4">📡</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Monitoring System Active</h3>
                  <p className="text-gray-500">
                    Real-time candidate availability updates will appear here when they occur.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Updates include candidate blocking/unblocking and availability changes
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/courses"
              className="group relative rounded-lg p-6 bg-white shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200 hover:border-blue-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Manage Courses
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Add, edit, or remove courses for the semester. Manage course details and availability.
                </p>
              </div>
              <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </Link>

            <Link
              href="/lecturers"
              className="group relative rounded-lg p-6 bg-white shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200 hover:border-green-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Assign Lecturers
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Assign lecturers to courses for the semester. Manage teaching assignments and workloads.
                </p>
              </div>
              <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </Link>

            <Link
              href="/candidates"
              className="group relative rounded-lg p-6 bg-white shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200 hover:border-purple-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Manage Candidates
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Block or unblock candidate access to the system. Monitor candidate availability in real-time.
                </p>
              </div>
              <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </Link>

            <Link
              href="/reports"
              className="group relative rounded-lg p-6 bg-white shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200 hover:border-orange-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-orange-50 text-orange-700 ring-4 ring-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  View Reports
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Generate comprehensive reports on candidates, assignments, and system analytics.
                </p>
              </div>
              <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {/* System Health Dashboard */}
        <div className="mt-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">System Health & Analytics</h2>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">All systems operational</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {totalCandidates > 0 ? ((activeCandidates / totalCandidates) * 100).toFixed(1) : '0'}%
                </div>
                <div className="text-sm text-gray-500">Active Candidates</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {totalCourses > 0 ? ((activeCourses / totalCourses) * 100).toFixed(1) : '0'}%
                </div>
                <div className="text-sm text-gray-500">Active Courses</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{totalLecturers}</div>
                <div className="text-sm text-gray-500">Available Lecturers</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{availabilityUpdates.length}</div>
                <div className="text-sm text-gray-500">Recent Updates</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <h2 className="text-xl font-semibold mb-4">HD Assignment Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">GraphQL Integration</h3>
                  <p className="text-xs text-indigo-200">Complete GraphQL API with queries, mutations, and subscriptions</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Real-time Updates</h3>
                  <p className="text-xs text-indigo-200">Live candidate availability notifications using GraphQL subscriptions</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Admin Dashboard</h3>
                  <p className="text-xs text-indigo-200">Separate admin interface with comprehensive management tools</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="mt-8 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">System Status</p>
                    <p className="text-xs text-gray-500">All services running normally</p>
                  </div>
                </div>
                <span className="text-green-600 text-sm font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Database Connection</p>
                    <p className="text-xs text-gray-500">Connected to cloud MySQL database</p>
                  </div>
                </div>
                <span className="text-green-600 text-sm font-medium">Connected</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Real-time Subscriptions</p>
                    <p className="text-xs text-gray-500">WebSocket connection active</p>
                  </div>
                </div>
                <span className="text-green-600 text-sm font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}