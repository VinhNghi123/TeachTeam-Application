// pages/tutor/dashboard.tsx
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../contexts/AuthContext';
import ApplicationForm from '../../components/tutor/ApplicationForm';
import CourseSelection from '../../components/tutor/CourseSelection';
import SkillsList from '../../components/tutor/SkillsList';
import { TutorProfileProvider } from '../../contexts/TutorProfileContext';

const TutorDashboard: React.FC = () => {
  const { isAuthenticated, userType } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('tt_user');
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.type !== 'tutor') {
        router.push('/signin');
      }
    } else if (!isAuthenticated || userType !== 'tutor') {
      router.push('/signin');
    }
    
    setIsLoading(false);
  }, [isAuthenticated, userType, router]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated || userType !== 'tutor') {
    return null;
  }
  
  return (
    <main>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue">Tutor Dashboard</h1>
        <TutorProfileProvider>
          <div className="grid grid-cols-1 gap-8">
            <CourseSelection />
            <SkillsList />
            <ApplicationForm />
          </div>
        </TutorProfileProvider>
      </div>
    </main>
  );
};

export default TutorDashboard;