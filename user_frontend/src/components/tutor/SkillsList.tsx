// components/tutor/SkillsList.tsx
import React, { useState } from 'react';
import { useTutorProfile } from '../../contexts/TutorProfileContext';

const SkillsList: React.FC = () => {
  const {
    skills,
    setSkills,
    experience,
    setExperience
  } = useTutorProfile();
  const [newSkill, setNewSkill] = useState('');
  const [newExperience, setNewExperience] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [skillError, setSkillError] = useState('');
  const [experienceError, setExperienceError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate skill input
  const validateSkill = (skill: string): boolean => {
    setSkillError('');
    const trimmedSkill = skill.trim();
    if (!trimmedSkill) {
      setSkillError('Skill cannot be empty');
      return false;
    }
    if (trimmedSkill.length < 2) {
      setSkillError('Skill must be at least 2 characters');
      return false;
    }
    if (trimmedSkill.length > 30) {
      setSkillError('Skill must be less than 30 characters');
      return false;
    }
    if (!/^[A-Za-z0-9\s.+#/\-_]+$/.test(trimmedSkill)) {
      setSkillError('Skill contains invalid characters');
      return false;
    }
    if (skills.includes(trimmedSkill)) {
      setSkillError('This skill is already in your list');
      return false;
    }
    return true;
  };

  const handleAddSkill = () => {
    if (validateSkill(newSkill)) {
      const trimmedSkill = newSkill.trim();
      setSkills([...skills, trimmedSkill]);
      setNewSkill('');
    }
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Experience management
  const validateExperience = (exp: string): boolean => {
    setExperienceError('');
    const trimmedExp = exp.trim();
    if (!trimmedExp) {
      setExperienceError('Experience cannot be empty');
      return false;
    }
    if (trimmedExp.length < 5) {
      setExperienceError('Experience must be at least 5 characters');
      return false;
    }
    if (trimmedExp.length > 100) {
      setExperienceError('Experience must be less than 100 characters');
      return false;
    }
    if (experience.includes(trimmedExp)) {
      setExperienceError('This experience is already in your list');
      return false;
    }
    return true;
  };

  const handleAddExperience = () => {
    if (validateExperience(newExperience)) {
      const trimmedExp = newExperience.trim();
      setExperience([...experience, trimmedExp]);
      setNewExperience('');
    }
  };

  const handleExperienceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddExperience();
    }
  };

  const handleRemoveExperience = (expToRemove: string) => {
    setExperience(experience.filter(exp => exp !== expToRemove));
  };

  // No backend update here, just update context
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Simulate a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccessMessage('Skills and experience updated!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-black text-2xl font-bold mb-6">Skills</h2>
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="text-black block mb-2 font-medium">
            Skills
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              className={`text-black flex-grow px-3 py-2 border ${skillError ? 'border-red-500' : 'border-gray-300'} rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Add a skill (e.g., JavaScript)"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              data-testid="add-skill-button"
              className="bg-cyan-400 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
          </div>
          {skillError && (
            <p className="text-red-500 text-sm mt-1 mb-2">{skillError}</p>
          )}
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((skill, index) => (
              <div key={index} className="text-black bg-cyan-300 px-3 py-1 rounded-full flex items-center">
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  aria-label={`Remove ${skill}`}
                >
                  ×
                </button>
              </div>
            ))}
            {skills.length === 0 && (
              <p className="text-gray-500 text-sm">No skills added yet. Add your technical and teaching skills above.</p>
            )}
          </div>
        </div>
        <div className="mb-6">
          <label className="text-black block mb-2 font-medium">
            Previous Roles / Relevant Experience
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={newExperience}
              onChange={(e) => setNewExperience(e.target.value)}
              onKeyDown={handleExperienceKeyDown}
              className={`text-black flex-grow px-3 py-2 border ${experienceError ? 'border-red-500' : 'border-gray-300'} rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Add a previous role or experience (e.g., COSC1111 Lab Assistant)"
            />
            <button
              type="button"
              onClick={handleAddExperience}
              className="bg-cyan-400 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
          </div>
          {experienceError && (
            <p className="text-red-500 text-sm mt-1 mb-2">{experienceError}</p>
          )}
          <div className="flex flex-wrap gap-2 mb-2">
            {experience.map((exp, index) => (
              <div key={index} className="text-black bg-purple-200 px-3 py-1 rounded-full flex items-center">
                {exp}
                <button
                  type="button"
                  onClick={() => handleRemoveExperience(exp)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  aria-label={`Remove ${exp}`}
                >
                  ×
                </button>
              </div>
            ))}
            {experience.length === 0 && (
              <p className="text-gray-500 text-sm">No previous roles or experience added yet. Add your teaching or technical experience above.</p>
            )}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-cyan-300 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
};

export default SkillsList;