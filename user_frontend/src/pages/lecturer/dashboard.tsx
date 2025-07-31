import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSubscription } from '@apollo/client';
import { gql } from '@apollo/client';
import { AuthContext } from '../../contexts/AuthContext';
import Layout from '../../components/common/Layout';
import ApplicantList from '../../components/lecturer/ApplicantList';
import SearchSort from '../../components/lecturer/SearchSort';
import VisualData from '../../components/lecturer/VisualData';
import { Course } from '../../types/course';
import apiService, { notificationUtils } from '../../services/api';
import { Application } from '../../types/application';

// GraphQL Subscription for real-time updates
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

interface LecturerCourse {
  id: number;
  lecturerId: number;
  courseId: number;
  course: Course;
  isActive: boolean;
}

interface UnavailableCandidate {
  tutorId: string;
  tutorName: string;
  message: string;
  timestamp: Date;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

const LecturerDashboard: React.FC = () => {
  const { isAuthenticated, userType, user } = useContext(AuthContext);
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Real-time availability tracking
  const [unavailableCandidates, setUnavailableCandidates] = useState<Map<string, UnavailableCandidate>>(new Map());
  const [realtimeNotifications, setRealtimeNotifications] = useState<UnavailableCandidate[]>([]);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  // Subscribe to real-time candidate availability changes
  const { data: subscriptionData } = useSubscription(
    CANDIDATE_AVAILABILITY_SUBSCRIPTION,
    {
      onError: (error) => {
        console.warn('Real-time subscription error:', error.message);
        setSubscriptionStatus('disconnected');
      },
      onComplete: () => {
        console.log('Subscription completed');
        setSubscriptionStatus('disconnected');
      }
    }
  );

  // Update subscription status when data is received
  useEffect(() => {
    if (subscriptionData) {
      setSubscriptionStatus('connected');
    }
  }, [subscriptionData]);

  // Handle real-time subscription updates
  useEffect(() => {
    if (subscriptionData?.candidateAvailabilityChanged) {
      const update = subscriptionData.candidateAvailabilityChanged;
      const candidate: UnavailableCandidate = {
        tutorId: update.tutorId,
        tutorName: update.tutorName,
        message: update.message,
        timestamp: new Date()
      };

      if (!update.isAvailable) {
        // Candidate became unavailable
        setUnavailableCandidates(prev => new Map(prev.set(update.tutorId, candidate)));
        
        // Add to notifications list (keep last 10)
        setRealtimeNotifications(prev => [candidate, ...prev.slice(0, 9)]);
        
        // Show notification banner
        setShowNotificationBanner(true);
        
        // Auto-hide banner after 10 seconds
        setTimeout(() => setShowNotificationBanner(false), 10000);
        
        // Show browser notification
        notificationUtils.showCandidateUnavailable(update.tutorName, update.message);
      } else {
        // Candidate became available again
        setUnavailableCandidates(prev => {
          const newMap = new Map(prev);
          newMap.delete(update.tutorId);
          return newMap;
        });
        
        // Show available notification
        notificationUtils.showCandidateAvailable(update.tutorName);
      }
    }
  }, [subscriptionData]);

  // Request notification permission on mount
  useEffect(() => {
    notificationUtils.requestPermission();
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeDashboard = async () => {
      // Check if user is already logged in from localStorage
      const storedUser = localStorage.getItem('tt_user');
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.type !== 'lecturer') {
            router.push('/signin');
            return;
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('tt_user');
          router.push('/signin');
          return;
        }
      } else if (!isAuthenticated || userType !== 'lecturer') {
        router.push('/signin');
        return;
      }

      // Wait a short moment to ensure user data is loaded
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!mounted) return;

      const fetchData = async () => {
        try {
          // Get the current user ID either from context or localStorage
          const currentUser = user || JSON.parse(localStorage.getItem('tt_user') || 'null');
          
          if (!currentUser?.id) {
            console.error('No user ID available');
            setError('User information not available. Please try logging in again.');
            setIsLoading(false);
            return;
          }

          // Fetch assigned courses for the lecturer
          const response = await apiService.get<LecturerCourse[]>(`/api/lecturer-courses/lecturer/${currentUser.id}`);
          const lecturerCourses = response.data;
          
          if (!mounted) return;
          
          // Extract course information
          const courses = lecturerCourses.map(lc => lc.course);
          setAssignedCourses(courses);

          // Get all unique skills from applications instead of users
          try {
            const applicationsResponse = await apiService.get<Application[]>('/api/applications');
            const applications = applicationsResponse.data;
            const allSkills = new Set<string>();
            
            applications.forEach(application => {
              if (application.relevantSkills && Array.isArray(application.relevantSkills)) {
                application.relevantSkills.forEach(skill => {
                  if (skill && skill.trim()) {
                    allSkills.add(skill.trim());
                  }
                });
              }
            });
            
            if (!mounted) return;
            setAvailableSkills(Array.from(allSkills));
          } catch (skillError) {
            console.warn('Failed to fetch skills from applications:', skillError);
            // Set empty skills array if fetch fails
            setAvailableSkills([]);
          }
        } catch (err: unknown) {
          console.error('Error fetching data:', err);
          if (mounted) {
            const error = err as ApiError;
            setError(error.response?.data?.message || error.message || 'Failed to load data. Please try again.');
          }
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      };

      fetchData();
    };

    initializeDashboard();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, userType, router, user]);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }
  
  if (!isAuthenticated || userType !== 'lecturer') {
    return null;
  }
  
  return (
    <main>
      <div className="max-w-5xl mx-auto">
        {/* Header with Real-time Status */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Lecturer Dashboard</h1>
          
          {/* Real-time Connection Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                subscriptionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                subscriptionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                'bg-red-400'
              }`}></div>
              <span className="text-xs text-gray-600">
                {subscriptionStatus === 'connected' ? 'Real-time updates active' :
                 subscriptionStatus === 'connecting' ? 'Connecting...' :
                 'Real-time updates disconnected'}
              </span>
            </div>
            
            {unavailableCandidates.size > 0 && (
              <div className="flex items-center space-x-1 bg-orange-100 px-2 py-1 rounded-full">
                <svg className="h-4 w-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-orange-700">
                  {unavailableCandidates.size} unavailable
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Notification Banner */}
        {showNotificationBanner && realtimeNotifications.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-md animate-slideIn">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Candidate Availability Alert
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <div className="max-h-20 overflow-y-auto">
                    {realtimeNotifications.slice(0, 3).map((notification) => (
                      <div key={`${notification.tutorId}-${notification.timestamp.getTime()}`} 
                           className="flex justify-between items-center py-1">
                        <span>
                          <strong>{notification.tutorName}</strong> is now unavailable for hiring
                        </span>
                        <span className="text-xs text-yellow-600">
                          {notification.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  {realtimeNotifications.length > 3 && (
                    <div className="text-xs text-yellow-600 mt-1">
                      +{realtimeNotifications.length - 3} more candidates unavailable
                    </div>
                  )}
                </div>
              </div>
              <div className="ml-3 flex-shrink-0">
                <button
                  onClick={() => setShowNotificationBanner(false)}
                  className="bg-yellow-50 rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <SearchSort
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          selectedAvailability={selectedAvailability}
          onAvailabilityChange={setSelectedAvailability}
          selectedSkill={selectedSkill}
          onSkillChange={setSelectedSkill}
          selectedRole={selectedRole}       
          onRoleChange={setSelectedRole}     
          availableSkills={availableSkills}
        />
        
        <div className="grid grid-cols-1 gap-8">
          {/* Enhanced Applicant List with Real-time Features */}
          <ApplicantList 
            searchTerm={searchTerm}
            selectedAvailability={selectedAvailability}
            selectedSkill={selectedSkill}
            selectedRole={selectedRole}
            assignedCourses={assignedCourses}
            courses={assignedCourses}
            unavailableCandidates={unavailableCandidates}
            onCandidateStatusChange={(tutorId: string, isUnavailable: boolean) => {
              if (!isUnavailable) {
                setUnavailableCandidates(prev => {
                  const newMap = new Map(prev);
                  newMap.delete(tutorId);
                  return newMap;
                });
              }
            }}
          />
          
          {/* Visual Data Dashboard */}
          <VisualData assignedCourses={assignedCourses} />
        </div>

        {/* Real-time Notifications History */}
        {realtimeNotifications.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Availability Changes</h2>
              <button
                onClick={() => setRealtimeNotifications([])}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear History
              </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {realtimeNotifications.map((notification) => (
                <div 
                  key={`${notification.tutorId}-${notification.timestamp.getTime()}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {notification.tutorName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {notification.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Status Footer */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-blue-900">Real-time Features Active</span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-blue-700">
              <span>
                Status: {subscriptionStatus === 'connected' ? '✅ Connected' : 
                        subscriptionStatus === 'connecting' ? '🔄 Connecting' : 
                        '❌ Disconnected'}
              </span>
              <span>|</span>
              <span>Unavailable Candidates: {unavailableCandidates.size}</span>
              <span>|</span>
              <span>Notifications: {realtimeNotifications.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -30px, 0);
          }
          70% {
            transform: translate3d(0, -15px, 0);
          }
          90% {
            transform: translate3d(0, -4px, 0);
          }
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </main>
  );
};

export default LecturerDashboard;