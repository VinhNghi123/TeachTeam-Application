import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Course } from '../../types/course';
import { Application, ApplicationRole } from '../../types/application';
import { useTutorProfile } from '../../contexts/TutorProfileContext';
import { AxiosError } from 'axios';

interface CourseRoleSelection {
  courseId: number;
  courseCode: string;
  role: ApplicationRole;
}

const CourseSelection: React.FC = () => {
  const { user } = useContext(AuthContext);
  const {
    academicCredentials,
    skills,
    availability
  } = useTutorProfile();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseRoles, setSelectedCourseRoles] = useState<CourseRoleSelection[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiService.get<Course[]>('/api/courses');
        setCourses(response.data);
      } catch (error) {
        if (error instanceof AxiosError) {
          setErrorMessage('Failed to load courses. Please try again later.');
          console.error('Error loading courses:', error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (!user || courses.length === 0) return;
    const fetchUserApplications = async () => {
      try {
        const response = await apiService.get<Application[]>(`/api/applications/tutor/${user.id}`);
        const userApplications = response.data;
        // Initialize selectedCourseRoles with existing applications
        const initialCourseRoles = userApplications.map(app => {
          const course = courses.find(c => c.id === app.courseId);
          return {
            courseId: app.courseId,
            courseCode: course?.courseCode || '',
            role: app.role
          };
        });
        setSelectedCourseRoles(initialCourseRoles);
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error('Error loading user applications:', error.message);
        }
      }
    };
    fetchUserApplications();
  }, [user, courses]);

  // Validate course codes to ensure they match the COSC format
  const validateCourseSelection = (): boolean => {
    const errors: {[key: string]: string} = {};
    let isValid = true;

    // Check if any courses are selected
    if (selectedCourseRoles.length === 0) {
      setErrorMessage('Please select at least one course to apply for.');
      return false;
    }

    // Check if skills are added
    if (!skills || skills.length === 0) {
      setErrorMessage('Please add at least one skill before applying for courses.');
      return false;
    }

    // Validate each selected course
    selectedCourseRoles.forEach(selection => {
     
      // Check if the course exists in our available courses
      if (!courses.some(course => course.id === selection.courseId)) {
        errors[selection.courseId.toString()] = `Course not found: ${selection.courseId}`;
        isValid = false;
      }

      // Verify role is either TUTOR or LAB_ASSISTANT
      if (selection.role !== ApplicationRole.TUTOR && selection.role !== ApplicationRole.LAB_ASSISTANT) {
        errors[`${selection.courseId}-role`] = `Invalid role selected for ${selection.courseId}`;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    
    if (!isValid) {
      setErrorMessage('Please correct the errors in your selection.');
    } else {
      setErrorMessage('');
    }
    
    return isValid;
  };

  const handleCourseToggle = (courseId: number) => {
    setErrorMessage('');
    
    setSelectedCourseRoles(prev => {
      const exists = prev.some(item => item.courseId === courseId);
      const course = courses.find(c => c.id === courseId);
      
      if (exists) {
        // Remove validation errors for this course when deselecting
        const updatedErrors = {...validationErrors};
        delete updatedErrors[courseId.toString()];
        delete updatedErrors[`${courseId}-role`];
        setValidationErrors(updatedErrors);
        
        return prev.filter(item => item.courseId !== courseId);
      } else {
        return [...prev, { courseId, courseCode: course?.courseCode || '', role: ApplicationRole.TUTOR }];
      }
    });
  };

  const handleRoleChange = (courseId: number, role: ApplicationRole) => {
    const updatedErrors = {...validationErrors};
    delete updatedErrors[`${courseId}-role`];
    setValidationErrors(updatedErrors);
    
    setSelectedCourseRoles(prev => 
      prev.map(item => 
        item.courseId === courseId ? { ...item, role } : item
      )
    );
  };

  const isCourseSelected = (courseId: number) => {
    return selectedCourseRoles.some(item => item.courseId === courseId);
  };

  const getCourseRole = (courseId: number): ApplicationRole => {
    const courseRole = selectedCourseRoles.find(item => item.courseId === courseId);
    return courseRole?.role || ApplicationRole.TUTOR;
  };

  const hasCourseError = (courseId: number): boolean => {
    return !!validationErrors[courseId.toString()];
  };

  const hasRoleError = (courseId: number): boolean => {
    return !!validationErrors[`${courseId}-role`];
  };

  const getErrorMessage = (key: string): string => {
    return validationErrors[key] || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    // Validate selections before submitting
    if (!validateCourseSelection()) {
      setIsSubmitting(false);
      return;
    }

    if (!user) {
      setErrorMessage('User not authenticated');
      setIsSubmitting(false);
      return;
    }

    try {
      // Submit each application individually
      const applicationPromises = selectedCourseRoles.map(({ courseId, role }) => {
        const application = {
          courseId,
          tutorId: user.id,
          status: 'pending' as const,
          role,
          academicCredentials,
          relevantSkills: skills,
          availability
        };
        return apiService.post('/api/applications', application);
      });

      await Promise.all(applicationPromises);
      
      setSuccessMessage('Your course applications have been submitted successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      if (error instanceof AxiosError) {
        setErrorMessage(error.response?.data?.message || 'Failed to submit applications. Please try again.');
        console.error('Error submitting applications:', error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-center text-gray-600">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-black text-2xl font-bold mb-6">Course Applications</h2>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <p className="text-black font-medium mb-2">Select courses you would like to apply for:</p>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {courses.map(course => (
              <div 
                key={course.id} 
                className={`border ${hasCourseError(course.id) ? 'border-red-500' : 'border-gray-200'} rounded-md p-3 hover:bg-gray-50`}
              >
                <div className="flex flex-col">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={isCourseSelected(course.id)}
                      onChange={() => handleCourseToggle(course.id)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <p className="text-black font-medium">{course.courseCode} - {course.name}</p>
                      <p className="text-sm text-gray-600">{course.description}</p>
                      <p className="text-sm text-gray-500 mt-1">{course.semester}, {course.year}</p>
                      
                      {hasCourseError(course.id) && (
                        <p className="text-red-500 text-sm mt-1">{getErrorMessage(course.id.toString())}</p>
                      )}
                    </div>
                  </label>
                  
                  {isCourseSelected(course.id) && (
                    <div className="ml-7 mt-2">
                      <p className="text-black text-sm font-medium mb-1">Select Role:</p>
                      <div className="flex space-x-4">
                        <label className="text-blue-300 flex items-center">
                          <input
                            type="radio"
                            name={`role-${course.id}`}
                            value={ApplicationRole.TUTOR}
                            checked={getCourseRole(course.id) === ApplicationRole.TUTOR}
                            onChange={() => handleRoleChange(course.id, ApplicationRole.TUTOR)}
                            className="mr-1"
                          />
                          <span className="text-sm">Tutor</span>
                        </label>
                        <label className="text-purple-300 flex items-center">
                          <input
                            type="radio"
                            name={`role-${course.id}`}
                            value={ApplicationRole.LAB_ASSISTANT}
                            checked={getCourseRole(course.id) === ApplicationRole.LAB_ASSISTANT}
                            onChange={() => handleRoleChange(course.id, ApplicationRole.LAB_ASSISTANT)}
                            className="mr-1"
                          />
                          <span className="text-sm">Lab Assistant</span>
                        </label>
                      </div>
                      
                      {hasRoleError(course.id) && (
                        <p className="text-red-500 text-sm mt-1">{getErrorMessage(`${course.id}-role`)}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {selectedCourseRoles.length === 0 && (
            <p className="text-yellow-600 mt-2">
              Please select at least one course to apply for.
            </p>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full bg-cyan-300 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || selectedCourseRoles.length === 0}
        >
          {isSubmitting ? 'Submitting...' : 'Apply for Selected Courses'}
        </button>
      </form>
    </div>
  );
};

export default CourseSelection;