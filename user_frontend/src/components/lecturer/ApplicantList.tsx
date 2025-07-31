import React, { useState, useEffect } from 'react';
import { useSubscription } from '@apollo/client';
import { gql } from '@apollo/client';
import apiService from '../../services/api';
import { Application, ApplicationStatus } from '../../types/application';
import { Tutor } from '../../types/user';
import { Course } from '../../types/course';
import ApplicantDetails from './ApplicantDetails';

// GraphQL Subscription for candidate availability changes
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

interface ApplicantListProps {
  searchTerm?: string;
  selectedAvailability?: string;
  selectedSkill?: string;
  selectedRole?: string;
  assignedCourses: Course[];
  courses: Course[];
  unavailableCandidates?: Map<string, UnavailableCandidate>;
  onCandidateStatusChange?: (tutorId: string, isUnavailable: boolean) => void;
}

interface UnavailableCandidate {
  tutorId: string;
  tutorName: string;
  message: string;
  timestamp: Date;
}

const ApplicantList: React.FC<ApplicantListProps> = ({
  searchTerm: initialSearchTerm = '',
  selectedAvailability: initialAvailability = '',
  selectedSkill: initialSkill = '',
  selectedRole: initialRole = '',
  assignedCourses,
  courses = [],
  unavailableCandidates: externalUnavailableCandidates,
  onCandidateStatusChange
}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [noResults, setNoResults] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedAvailability, setSelectedAvailability] = useState(initialAvailability);
  const [selectedSkill, setSelectedSkill] = useState(initialSkill);
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [selectedCourse, setSelectedCourse] = useState<number | 'all'>('all');
  
  // Real-time availability tracking - use external state if provided, otherwise manage internally
  const [internalUnavailableCandidates, setInternalUnavailableCandidates] = useState<Map<string, UnavailableCandidate>>(new Map());
  const [realtimeNotifications, setRealtimeNotifications] = useState<UnavailableCandidate[]>([]);
  
  // Use external unavailable candidates if provided, otherwise use internal state
  const unavailableCandidates = externalUnavailableCandidates || internalUnavailableCandidates;

  // Subscribe to candidate availability changes
  const { data: subscriptionData, error: subscriptionError } = useSubscription(
    CANDIDATE_AVAILABILITY_SUBSCRIPTION,
    {
      onError: (error) => {
        console.warn('Subscription error (non-blocking):', error.message);
      }
    }
  );

  // Handle real-time subscription updates (only if managing internal state)
  useEffect(() => {
    if (subscriptionData?.candidateAvailabilityChanged && !externalUnavailableCandidates) {
      const update = subscriptionData.candidateAvailabilityChanged;
      const candidate: UnavailableCandidate = {
        tutorId: update.tutorId,
        tutorName: update.tutorName,
        message: update.message,
        timestamp: new Date()
      };

      if (!update.isAvailable) {
        // Candidate became unavailable
        setInternalUnavailableCandidates((prev: Map<string, UnavailableCandidate>) => new Map(prev.set(update.tutorId, candidate)));
        
        // Add to notifications (keep last 5)
        setRealtimeNotifications((prev: UnavailableCandidate[]) => [candidate, ...prev.slice(0, 4)]);
        
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Candidate Unavailable', {
            body: `${update.tutorName} is no longer available for hiring`,
            icon: '/favicon.ico'
          });
        }
      } else {
        // Candidate became available again
        setInternalUnavailableCandidates((prev: Map<string, UnavailableCandidate>) => {
          const newMap = new Map(prev);
          newMap.delete(update.tutorId);
          return newMap;
        });
      }
      
      // Notify parent component if callback provided
      if (onCandidateStatusChange) {
        onCandidateStatusChange(update.tutorId, !update.isAvailable);
      }
    }
  }, [subscriptionData, externalUnavailableCandidates, onCandidateStatusChange]);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
    setSelectedAvailability(initialAvailability);
    setSelectedSkill(initialSkill);
    setSelectedRole(initialRole);
  }, [initialSearchTerm, initialAvailability, initialSkill, initialRole]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        setNoResults(false);

        // Build query parameters based on selected filters
        const queryParams = new URLSearchParams();
        if (selectedAvailability) queryParams.append('availability', selectedAvailability);
        if (selectedRole) queryParams.append('role', selectedRole);
        if (selectedSkill) queryParams.append('skill', selectedSkill);
        if (searchTerm) queryParams.append('search', searchTerm);
        if (selectedCourse !== 'all') queryParams.append('course', selectedCourse.toString());

        // Fetch applications and users separately to handle errors independently
        let applicationsData: Application[] = [];
        let usersData: Tutor[] = [];

        try {
          const applicationsResponse = await apiService.get<Application[]>(`/api/applications?${queryParams.toString()}`);
          applicationsData = applicationsResponse.data;
        } catch (error: unknown) {
          console.error('Error fetching applications:', error);
          if (error instanceof Error && 'response' in error && 
              (error as { response?: { status?: number, data?: { message?: string } } }).response?.status === 404 && 
              (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'No tutors found matching your search criteria') {
            setNoResults(true);
            setApplications([]);
          } else {
            setErrorMessage('Failed to load applications. Please try again later.');
            setApplications([]);
          }
        }

        try {
          const usersResponse = await apiService.get<Tutor[]>('/api/users?type=tutor');
          usersData = usersResponse.data;
        } catch (error) {
          console.error('Error fetching users:', error);
          setErrorMessage('Failed to load user data. Please try again later.');
          setUsers([]);
        }

        // Filter applications based on assigned courses if no specific course is selected
        let filteredApplications = applicationsData;
        if (selectedCourse === 'all') {
          filteredApplications = applicationsData.filter((app: Application) => 
            assignedCourses.some(course => course.id === app.courseId)
          );
        } else {
          // Filter applications for the selected course
          filteredApplications = applicationsData.filter((app: Application) => 
            app.courseId === selectedCourse
          );
        }

        setApplications(filteredApplications);
        setUsers(usersData);
      } catch (error) {
        console.error('Error in fetchData:', error);
        setErrorMessage('An unexpected error occurred. Please try again later.');
        setApplications([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedAvailability, selectedRole, selectedSkill, searchTerm, selectedCourse, assignedCourses]);

  const handleStatusChange = async (applicationId: number, newStatus: ApplicationStatus) => {
    try {
      await apiService.patch<Application>(`/api/applications/${applicationId}/status`, {
        status: newStatus
      });

      setApplications((prev: Application[]) => 
        prev.map((app: Application) => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      setErrorMessage('');
    } catch (error) {
      console.error('Error updating status:', error);
      setErrorMessage('Failed to update status. Please try again.');
    }
  };

  const handleRankChange = async (applicationId: number, value: string) => {
    try {
      const rank = value === '' ? null : parseInt(value);
      
      await apiService.patch<Application>(`/api/applications/${applicationId}/ranking`, {
        ranking: rank
      });

      setApplications((prev: Application[]) => 
        prev.map((app: Application) => 
          app.id === applicationId ? { ...app, ranking: rank } : app
        )
      );

      setErrorMessage('');
    } catch (error) {
      console.error('Error updating ranking:', error);
      setErrorMessage('Failed to update ranking. Please try again.');
    }
  };

  const handleCommentsChange = async (applicationId: number, comments: string) => {
    try {
      await apiService.patch<Application>(`/api/applications/${applicationId}/comments`, {
        comments
      });

      setApplications((prev: Application[]) => 
        prev.map((app: Application) => 
          app.id === applicationId ? { ...app, comments } : app
        )
      );

      setErrorMessage('');
    } catch (error) {
      console.error('Error updating comments:', error);
      setErrorMessage('Failed to update comments. Please try again.');
    }
  };

  // Check if a candidate is unavailable
  const isCandidateUnavailable = (tutorId: number): boolean => {
    return unavailableCandidates.has(tutorId.toString());
  };

  // Get unavailability details for a candidate
  const getUnavailabilityDetails = (tutorId: number): UnavailableCandidate | undefined => {
    return unavailableCandidates.get(tutorId.toString());
  };

  return (
    <div className="space-y-6 h-full">
      {/* Real-time Notifications Banner */}
      {realtimeNotifications.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Real-time Candidate Availability Updates
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <div className="max-h-20 overflow-y-auto">
                  {realtimeNotifications.slice(0, 3).map((notification: UnavailableCandidate) => (
                    <div key={`${notification.tutorId}-${notification.timestamp.getTime()}`} className="flex justify-between items-center py-1">
                      <span>
                        <strong>{notification.tutorName}</strong> is now unavailable
                      </span>
                      <span className="text-xs text-yellow-600">
                        {notification.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
                {realtimeNotifications.length > 3 && (
                  <div className="text-xs text-yellow-600 mt-1">
                    +{realtimeNotifications.length - 3} more notifications
                  </div>
                )}
              </div>
            </div>
            <div className="ml-3">
              <button
                onClick={() => setRealtimeNotifications([])}
                className="bg-yellow-50 text-yellow-500 hover:text-yellow-600 rounded-md p-1"
                title="Clear notifications"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Status Indicator */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            subscriptionError ? 'bg-red-400' : 'bg-green-400 animate-pulse'
          }`}></div>
          <span className="text-xs text-gray-500">
            {subscriptionError ? 'Real-time updates disconnected' : 'Real-time updates active'}
          </span>
        </div>
        {unavailableCandidates.size > 0 && (
          <div className="flex items-center space-x-2">
            <svg className="h-4 w-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-orange-700">
              {unavailableCandidates.size} candidate(s) unavailable
            </span>
          </div>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="courseSelect" className="text-black block mb-2 font-medium">
          Select Course
        </label>
        <select
          id="courseSelect"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="text-black w-full px-3 py-2 border border-gray-1000 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.id} - {course.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading applicants...</p>
          </div>
        ) : errorMessage ? (
          <div className="text-center py-4">
            <p className="text-red-500">{errorMessage}</p>
          </div>
        ) : noResults ? (
          <div className="text-center py-4">
            <p className="text-gray-600">No tutors found matching your search criteria</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600">No applications found for the selected filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {applications.map((application: Application) => {
              const tutor = users.find((user: Tutor) => user.id === application.tutorId);
              if (!tutor) return null;

              const isUnavailable = isCandidateUnavailable(application.tutorId);
              const unavailabilityDetails = getUnavailabilityDetails(application.tutorId);

              return (
                <div 
                  key={application.id} 
                  className={`bg-white p-4 rounded-lg shadow transition-all duration-300 ${
                    isUnavailable 
                      ? 'opacity-60 bg-red-50 border-2 border-red-200' 
                      : 'hover:shadow-md'
                  }`}
                >
                  {/* Unavailability Warning Banner */}
                  {isUnavailable && unavailabilityDetails && (
                    <div className="mb-4 bg-red-100 border border-red-300 rounded-lg p-3">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-red-800">
                            Candidate Unavailable for Hiring
                          </h4>
                          <p className="text-sm text-red-700 mt-1">
                            {unavailabilityDetails.message}
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            Updated: {unavailabilityDetails.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <ApplicantDetails
                    application={application}
                    tutor={tutor}
                    onUpdateStatus={(userId, status) => handleStatusChange(application.id, status as ApplicationStatus)}
                    onUpdateRanking={(tutorId, ranking) => handleRankChange(application.id, ranking?.toString() || '')}
                    onUpdateComments={(tutorId, comments) => handleCommentsChange(application.id, comments)}
                    isUnavailable={isUnavailable}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantList;