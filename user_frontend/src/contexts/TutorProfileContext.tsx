import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TutorProfile {
  academicCredentials: string;
  skills: string[];
  experience: string[];
  availability: string;
  setAcademicCredentials: (val: string) => void;
  setSkills: (val: string[]) => void;
  setExperience: (val: string[]) => void;
  setAvailability: (val: string) => void;
}

const TutorProfileContext = createContext<TutorProfile | undefined>(undefined);

export const TutorProfileProvider = ({ children }: { children: ReactNode }) => {
  const [academicCredentials, setAcademicCredentials] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState<string[]>([]);
  const [availability, setAvailability] = useState('part-time');

  return (
    <TutorProfileContext.Provider value={{
      academicCredentials,
      skills,
      experience,
      availability,
      setAcademicCredentials,
      setSkills,
      setExperience,
      setAvailability,
    }}>
      {children}
    </TutorProfileContext.Provider>
  );
};

export const useTutorProfile = () => {
  const context = useContext(TutorProfileContext);
  if (!context) {
    throw new Error('useTutorProfile must be used within a TutorProfileProvider');
  }
  return context;
}; 