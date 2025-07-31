import React, { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../contexts/AuthContext';
import Link from 'next/link';

interface ApiError {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // Password must be at least 8 characters, include uppercase, lowercase, number, and special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoginSuccess(false);

    // Validate inputs
    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage('Password must be at least 8 characters and include uppercase, lowercase, number, and special character');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);
      
      if (success) {
        // Show success message first
        setLoginSuccess(true);
        
        // Get user type for redirection
        const user = JSON.parse(localStorage.getItem('tt_user') || '{}');
        
        // Wait a moment to show the success message before redirecting
        setTimeout(() => {
          if (user.type === 'tutor') {
            router.push('/tutor/dashboard');
          } else if (user.type === 'lecturer') {
            router.push('/lecturer/dashboard');
          }
        }, 1500); // 1.5 second delay to show the success message
      } else {
        setErrorMessage('Invalid email or password');
        setIsLoading(false);
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      const apiError = error as ApiError;
      setErrorMessage(apiError?.message || apiError?.response?.data?.message || 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-4xl">
        {/* Left side - Branding/Information */}
        <div className="hidden md:block md:w-1/2 bg-blue-600 text-white p-10 rounded-l-lg">
          <div className="h-full flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">TeachTeam</h1>
              <p className="text-blue-100">School of Computer Science</p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Welcome Back!</h2>
              <p className="mb-4">
                Sign in to access your TeachTeam dashboard and manage your tutor applications
                or course requirements.
              </p>
              <p>
                New to TeachTeam? <Link href="/signup" className="text-blue-100 hover:text-white underline">Sign up as a tutor</Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Right side - Sign In Form */}
        <div className="w-full md:w-1/2 bg-white p-10 rounded-lg md:rounded-l-none shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Sign In</h2>
            <p className="text-gray-600 mt-1">Welcome back to TeachTeam</p>
          </div>
          
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}
          
          {loginSuccess && (
            <div className="bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded mb-4 flex items-center justify-between animate-pulse">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span>Login successful! Redirecting to your dashboard...</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
                disabled={isLoading || loginSuccess}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
                disabled={isLoading || loginSuccess}
              />
            </div>
            
            <button
              type="submit"
              className={`w-full ${loginSuccess ? 'bg-green-600' : 'bg-blue-600'} text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex justify-center items-center`}
              disabled={isLoading || loginSuccess}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : loginSuccess ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Success!
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="mb-4">
              Don&apos;t have an account? <Link href="/signup" className="text-blue-600 hover:underline">Sign Up as a Tutor</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;