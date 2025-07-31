import React, { useState, useEffect } from 'react';
import { Application, Tutor } from '../../types/user';
import apiService from '../../services/api';

interface ApplicantDetailsProps {
  application: Application;
  tutor: Tutor;
  onUpdateStatus: (tutorId: number, status: 'pending' | 'selected' | 'rejected') => void;
  onUpdateRanking: (tutorId: number, ranking: number | null) => void;
  onUpdateComments: (tutorId: number, comments: string) => void;
  isUnavailable?: boolean; // New prop to indicate if candidate is unavailable
}

const ApplicantDetails: React.FC<ApplicantDetailsProps> = ({
  application,
  tutor,
  onUpdateStatus,
  onUpdateRanking,
  onUpdateComments,
  isUnavailable = false
}) => {
  const [commentText, setCommentText] = useState(application.comments || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [maxRanking, setMaxRanking] = useState<number>(0);

  useEffect(() => {
    const fetchMaxRanking = async () => {
      try {
        const response = await apiService.get<{ maxRanking: number }>(`/api/applications/course/${application.courseId}/max-ranking`);
        setMaxRanking(response.data.maxRanking);
      } catch {
        console.error('Error fetching max ranking');
      }
    };

    fetchMaxRanking();
  }, [application.courseId]);

  const handleSaveComment = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      await onUpdateComments(tutor.id, commentText);
      setSaveMessage('Comments saved successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch {
      setSaveMessage('Failed to save comments');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRankingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') {
      onUpdateRanking(tutor.id, null);
    } else {
      onUpdateRanking(tutor.id, parseInt(value));
    }
  };

  const handleStatusChange = (newStatus: 'pending' | 'selected' | 'rejected') => {
    if (isUnavailable && newStatus === 'selected') {
      const confirmSelection = window.confirm(
        `Warning: ${tutor.name} is currently marked as unavailable for hiring. Are you sure you want to select them?`
      );
      if (!confirmSelection) {
        return;
      }
    }
    onUpdateStatus(tutor.id, newStatus);
  };

  return (
    <div className={`border border-gray-200 rounded-lg p-4 mb-4 transition-all duration-300 ${
      isUnavailable ? 'bg-red-50 border-red-200' : 'bg-white'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Candidate Header with Availability Status */}
          <div className="flex items-center mb-2">
            <h3 className={`text-lg font-semibold ${isUnavailable ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {tutor.name}
            </h3>
            {isUnavailable && (
              <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                </svg>
                Unavailable
              </span>
            )}
          </div>
          
          <p className={`mb-2 ${isUnavailable ? 'text-gray-400' : 'text-gray-600'}`}>
            {tutor.email}
          </p>
          
          <div className="mt-2 flex items-center">
            <span className="text-black font-medium mr-2">Applied Role:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              application.role === 'tutor' 
                ? isUnavailable ? 'bg-blue-50 text-blue-400' : 'bg-blue-100 text-blue-800'
                : isUnavailable ? 'bg-purple-50 text-purple-400' : 'bg-purple-100 text-purple-800'
            }`}>
              {application.role === 'tutor' ? 'Tutor' : 'Lab Assistant'}
            </span>
          </div>
          
          <p className="mt-2">
            <span className="text-black font-medium">Availability:</span> 
            <span className={`font-small ml-1 ${isUnavailable ? 'text-gray-400' : 'text-black'}`}>
              {application.availability}
            </span>
          </p>
          
          <p className="mt-1">
            <span className="text-black font-medium">Academic Credentials:</span> 
            <span className={`font-small ml-1 ${isUnavailable ? 'text-gray-400' : 'text-black'}`}>
              {application.academicCredentials}
            </span>
          </p>
          
          <div className="mt-2">
            <span className="text-black font-medium">Skills:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {application.relevantSkills?.map((skill: string, index: number) => (
                <span 
                  key={index} 
                  className={`px-2 py-1 text-sm rounded font-medium ${
                    isUnavailable 
                      ? 'bg-orange-200 text-orange-600' 
                      : 'bg-orange-500 text-white'
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-2">
            <span className="text-black font-medium">Previous Roles:</span>
            <ul className={`list-disc pl-5 mt-1 ${isUnavailable ? 'text-gray-400' : 'text-black'}`}>
              {tutor.previousRoles && tutor.previousRoles.length > 0 ? (
                tutor.previousRoles.map((role, index) => (
                  <li key={index}>{role}</li>
                ))
              ) : (
                <li>No previous roles</li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-3 ml-4">
          {/* Action Buttons with Unavailability Warning */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusChange('selected')}
              className={`px-3 py-1 rounded transition-all duration-200 ${
                application.status === 'selected' 
                  ? 'bg-green-500 text-white' 
                  : isUnavailable
                    ? 'bg-gray-200 text-gray-400 hover:bg-yellow-100 hover:text-yellow-700 border border-yellow-300'
                    : 'bg-gray-200 hover:bg-green-100 hover:text-green-700'
              }`}
              title={isUnavailable ? 'Warning: Candidate is currently unavailable' : 'Select candidate'}
            >
              {isUnavailable && application.status !== 'selected' && (
                <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              Select
            </button>
            <button
              onClick={() => handleStatusChange('rejected')}
              className={`px-3 py-1 rounded ${
                application.status === 'rejected' 
                  ? 'bg-red-500 text-white' 
                  : isUnavailable
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-gray-200 hover:bg-red-100 hover:text-red-700'
              }`}
              disabled={isUnavailable}
            >
              Reject
            </button>
          </div>
          
          {/* Ranking Section */}
          <div>
            <label className="block text-sm font-medium">
              Ranking
            </label>
            <select
              value={application.ranking || ''}
              onChange={handleRankingChange}
              className={`w-full mt-1 px-2 py-1 border border-gray-300 rounded ${
                isUnavailable ? 'bg-gray-100 text-gray-400' : 'bg-white'
              }`}
              disabled={isUnavailable}
              title={isUnavailable ? 'Ranking disabled for unavailable candidates' : ''}
            >
              <option value="">Not ranked</option>
              {Array.from({ length: maxRanking }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i === 0 ? '(Highest)' : i === maxRanking - 1 ? '(Lowest)' : ''}
                </option>
              ))}
            </select>
            {isUnavailable && (
              <p className="text-yellow-600 text-xs mt-1">
                ⚠️ Candidate unavailable - ranking disabled
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Comments Section */}
      <div className="mt-4">
        <label className="block text-sm font-medium">
          Comments
        </label>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className={`w-full mt-1 px-3 py-2 border border-gray-300 rounded ${
            isUnavailable ? 'bg-gray-50 text-gray-500' : 'bg-white'
          }`}
          rows={3}
          placeholder={
            isUnavailable 
              ? "Comments disabled for unavailable candidates..." 
              : "Add comments about this applicant..."
          }
          disabled={isUnavailable}
        />
        <div className="mt-2 flex items-center justify-between">
          <button
            onClick={handleSaveComment}
            disabled={isSaving || isUnavailable}
            className={`px-4 py-2 rounded transition-colors ${
              isSaving || isUnavailable
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            title={isUnavailable ? 'Comments disabled for unavailable candidates' : ''}
          >
            {isSaving ? 'Saving...' : 'Save Comments'}
          </button>
          {saveMessage && (
            <span className={`text-sm ${
              saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'
            }`}>
              {saveMessage}
            </span>
          )}
          {isUnavailable && (
            <span className="text-yellow-600 text-sm flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Actions limited - candidate unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetails;