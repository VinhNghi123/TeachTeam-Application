import React, { useState, useEffect } from 'react';

interface SearchSortProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  selectedAvailability: string;
  onAvailabilityChange: (value: string) => void;
  selectedSkill: string;
  onSkillChange: (value: string) => void;
  availableSkills: string[];
  selectedRole?: string;
  onRoleChange?: (value: string) => void;
}

const SearchSort: React.FC<SearchSortProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedAvailability,
  onAvailabilityChange,
  selectedSkill,
  onSkillChange,
  selectedRole = '', 
  onRoleChange = () => {}, 
  availableSkills
}) => {
  // Add state for validation error
  const [searchError, setSearchError] = useState<string>('');
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Update local search term when prop changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Validate search term function
  const validateSearchTerm = (term: string): boolean => {
    // Search term should not contain special characters other than spaces 
    const searchRegex = /^[a-zA-Z0-9\s]*$/;
    return searchRegex.test(term);
  };

  // Handle search change with validation
  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
    
    if (value.trim() === '') {
      // Empty search is always valid
      setSearchError('');
      onSearchChange('');
      return;
    }
    
    if (validateSearchTerm(value)) {
      setSearchError('');
      onSearchChange(value);
    } else {
      setSearchError('Search can only contain letters, numbers, and spaces');
      // Don't update the parent state if invalid
    }
  };

  // Handle search submit (when user presses Enter)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchTerm.trim() === '' || validateSearchTerm(localSearchTerm)) {
      onSearchChange(localSearchTerm);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <form onSubmit={handleSearchSubmit}>
            <label htmlFor="search" className="text-black block text-sm font-medium mb-1">
              Search Applicants
            </label>
            <div className="flex">
              <input
                type="text"
                id="search"
                value={localSearchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by name, email, course, or role..."
                className={`text-sm text-black w-full px-3 py-2 border ${searchError ? 'border-red-500' : 'border-black'} rounded-l-md`}
              />
            </div>
            {searchError && (
              <p className="text-red-500 text-xs mt-1">{searchError}</p>
            )}
          </form>
        </div>
        
        <div>
          <label htmlFor="sortBy" className="text-black block text-sm font-medium mb-1">
            Sort By
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-black w-full px-3 py-2 border border-black rounded-md"
          >
            <option value="name">Applicant Name</option>
            <option value="courseId">Course ID</option>
            <option value="availability">Availability</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="availability" className="text-black block text-sm font-medium mb-1">
            Filter by Availability
          </label>
          <select
            id="availability"
            value={selectedAvailability}
            onChange={(e) => onAvailabilityChange(e.target.value)}
            className="text-black w-full px-3 py-2 border border-black rounded-md"
          >
            <option value="">All</option>
            <option value="part-time">Part-time</option>
            <option value="full-time">Full-time</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="skill" className="text-black block text-sm font-medium mb-1">
            Filter by Skill
          </label>
          <select
            id="skill"
            value={selectedSkill}
            onChange={(e) => onSkillChange(e.target.value)}
            className="text-black w-full px-3 py-2 border border-black rounded-md"
          >
            <option value="">All Skills</option>
            {availableSkills.map((skill, index) => (
              <option key={index} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>
        
        {onRoleChange && (
          <div>
            <label htmlFor="role" className="text-black block text-sm font-medium mb-1">
              Filter by Role
            </label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="text-black w-full px-3 py-2 border border-black rounded-md"
            >
              <option value="">All Roles</option>
              <option value="tutor">Tutor</option>
              <option value="lab-assistant">Lab Assistant</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchSort;