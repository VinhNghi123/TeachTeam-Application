import { useEffect, useState } from 'react';
import { gql, useQuery, useSubscription } from '@apollo/client';
import Link from 'next/link';
import Layout from '../components/Layout';

const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    getCourses {
      id
      courseCode
      name
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
      timestamp
      reason
    }
  }
`;

interface UnavailableCandidate {
  tutorId: string;
  tutorName: string;
  message: string;
  timestamp: Date;
  reason?: string;
}

interface Course {
  id: string;
  courseCode: string;
  name: string;
  isActive: boolean;
}

interface Lecturer {
  id: string;
  name: string;
  email: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
}

interface DashboardData {
  getCourses: Course[];
  getLecturers: Lecturer[];
  getCandidates: Candidate[];
}

export default function Dashboard() {
  const [availabilityUpdates, setAvailabilityUpdates] = useState<UnavailableCandidate[]>([]);
  const [unavailableCandidates, setUnavailableCandidates] = useState<Map<string, UnavailableCandidate>>(new Map());
  const { data, loading, error, refetch } = useQuery<DashboardData>(GET_DASHBOARD_STATS);
  const { data: subscriptionData } = useSubscription(CANDIDATE_AVAILABILITY_SUBSCRIPTION);

  useEffect(() => {
    if (subscriptionData?.candidateAvailabilityChanged) {
      const update = subscriptionData.candidateAvailabilityChanged;
      const candidate: UnavailableCandidate = {
        tutorId: update.tutorId,
        tutorName: update.tutorName,
        message: update.message,
        timestamp: new Date(update.timestamp || new Date().toISOString()),
        reason: update.reason
      };

      if (!update.isAvailable) {
        // Add to unavailable candidates map
        setUnavailableCandidates(prev => new Map(prev.set(update.tutorId, candidate)));
        
        // Add to recent updates list
        setAvailabilityUpdates(prev => [candidate, ...prev].slice(0, 10));
      } else {
        // Remove from unavailable candidates map
        setUnavailableCandidates(prev => {
          const newMap = new Map(prev);
          newMap.delete(update.tutorId);
          return newMap;
        });
      }
    }
  }, [subscriptionData]);

  useEffect(() => {
    if (data?.getCandidates) {
      const blocked = data.getCandidates.filter((c: Candidate) => c.isBlocked);
      if (blocked.length > 0) {
        setAvailabilityUpdates(prev => [
          ...blocked.map((c: Candidate) => ({
            tutorId: c.id,
            tutorName: c.name,
            message: 'Blocked by admin',
            timestamp: new Date(),
            reason: 'Blocked'
          })),
          ...prev
        ]);
        setUnavailableCandidates(prev => {
          const newMap = new Map(prev);
          blocked.forEach((c: Candidate) => {
            newMap.set(c.id, {
              tutorId: c.id,
              tutorName: c.name,
              message: 'Blocked by admin',
              timestamp: new Date(),
              reason: 'Blocked'
            });
          });
          return newMap;
        });
      }
    }
  }, [data]);

  if (loading) return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Error loading dashboard: {error.message}
          </div>
          <button 
            onClick={() => refetch()} 
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </Layout>
  );

  const activeCourses = data?.getCourses.filter((c: Course) => c.isActive).length || 0;
  const totalCourses = data?.getCourses.length || 0;
  const totalLecturers = data?.getLecturers.length || 0;
  const activeCandidates = data?.getCandidates.filter((c: Candidate) => !c.isBlocked).length || 0;
  const blockedCandidates = data?.getCandidates.filter((c: Candidate) => c.isBlocked).length || 0;
  const totalCandidates = data?.getCandidates.length || 0;

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
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500'
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
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500'
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
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500'
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
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500'
    },
  ];

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700">
              Overview and management of the TeachTeam tutoring system.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow-lg hover:shadow-xl transition-shadow duration-200"
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
                  {stat.total && (
                    <p className="ml-2 text-sm font-medium text-gray-500">
                      / {stat.total}
                    </p>
                  )}
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
                <h2 className="text-lg font-semibold text-white">
                  Real-time Candidate Availability Updates
                </h2>
              </div>
              <span className="bg-white bg-opacity-20 text-black px-3 py-1 rounded-full text-sm">
                {unavailableCandidates.size} Unavailable
              </span>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {availabilityUpdates.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {availabilityUpdates.map((update) => (
                    <li key={`${update.tutorId}-${update.timestamp.getTime()}`} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            unavailableCandidates.has(update.tutorId) ? 'bg-red-400' : 'bg-green-400'
                          }`}></div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">{update.tutorName}</p>
                              <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                                unavailableCandidates.has(update.tutorId)
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {unavailableCandidates.has(update.tutorId) ? 'Unavailable' : 'Available'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{update.message}</p>
                            {update.reason && (
                              <p className="text-xs text-gray-400 mt-1">Reason: {update.reason}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">
                            {update.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="text-gray-400 text-4xl mb-4">📡</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Updates</h3>
                  <p className="text-gray-500">
                    Real-time candidate availability updates will appear here when they occur.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/courses"
              className="group relative rounded-lg p-6 bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
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
                  Add, edit, or remove courses for the semester.
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
              className="group relative rounded-lg p-6 bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
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
                  Assign lecturers to courses for the semester.
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
              className="group relative rounded-lg p-6 bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
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
                  Block or unblock candidate access to the system.
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
              className="group relative rounded-lg p-6 bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
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
                  Generate reports on candidates and assignments.
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

        {/* System Health */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">System Health</h2>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">All systems operational</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {((activeCandidates / totalCandidates) * 100 || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Active Candidates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {((activeCourses / totalCourses) * 100 || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Active Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalLecturers}</div>
                <div className="text-sm text-gray-500">Available Lecturers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}