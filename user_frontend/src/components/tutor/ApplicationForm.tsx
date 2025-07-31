import React, { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { AvailabilityType } from '../../types/application';
import { useTutorProfile } from '../../contexts/TutorProfileContext';

const ApplicationForm: React.FC = () => {
  const { user } = useContext(AuthContext);
  const {
    academicCredentials,
    setAcademicCredentials,
    availability,
    setAvailability
  } = useTutorProfile();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateAcademicCredentials = (credentials: string): boolean => {
    // Credentials should be at least 10 characters long and not only whitespace
    return credentials.trim().length >= 10;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
    
    // Validate academic credentials
    if (!validateAcademicCredentials(academicCredentials)) {
      setErrorMessage('Academic credentials must be at least 10 characters long.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update user profile in backend (only academic credentials and availability)
      const response = await apiService.put(`/api/users/${user.id}`, {
        academicCredentials,
        availability
      });

      if (response.data) {
        setSuccessMessage('Your profile has been saved successfully!');
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save profile. Please try again.';
      setErrorMessage(errorMessage);
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-black text-2xl font-bold mb-6">Application Form</h2>
      
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
        <div className="mb-4">
          <label htmlFor="academicCredentials" className="text-black block mb-1 font-medium">
            Academic Credentials
          </label>
          <textarea
            id="academicCredentials"
            value={academicCredentials}
            onChange={(e) => setAcademicCredentials(e.target.value)}
            className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your academic credentials"
            rows={4}
            required
          />
        </div>
        <div className="mb-4">
          <label className="text-black block mb-1 font-medium">
            Availability
          </label>
          <div className="flex space-x-4">
            <label className="text-black flex items-center">
              <input
                type="radio"
                value={AvailabilityType.PART_TIME}
                checked={availability === AvailabilityType.PART_TIME}
                onChange={() => setAvailability(AvailabilityType.PART_TIME)}
                className="mr-2"
              />
              Part-time
            </label>
            <label className="text-black flex items-center">
              <input
                type="radio"
                value={AvailabilityType.FULL_TIME}
                checked={availability === AvailabilityType.FULL_TIME}
                onChange={() => setAvailability(AvailabilityType.FULL_TIME)}
                className="mr-2"
              />
              Full-time
            </label>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-cyan-300 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default ApplicationForm;