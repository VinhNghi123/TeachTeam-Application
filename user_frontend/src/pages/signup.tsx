import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { validateEmail, validatePassword } from '../utils/validation';
import apiService from '../services/api';

const SignUpPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validate inputs
    if (!name.trim()) {
      setErrorMessage('Please enter your name');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage('Password must be at least 8 characters and include uppercase, lowercase, number, and special character');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await apiService.post('/api/auth/register', {
        name,
        email,
        password,
        type: 'tutor' // Only allowing tutor signups as per requirements
      });

      // Redirect to sign-in page on success
      router.push('/signin');
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      setErrorMessage(apiError.response?.data?.message || 'An error occurred during signup');
    } finally {
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
              <h2 className="text-xl font-semibold mb-4">Join TeachTeam as a Tutor</h2>
              <p className="mb-4">
                Register to apply for tutor positions at the School of Computer Science.
              </p>
              <p>
                TeachTeam helps streamline the process of hiring qualified tutors
                for computer science courses.
              </p>
            </div>
          </div>
        </div>
        
        {/* Right side - Sign Up Form */}
        <div className="w-full md:w-1/2 bg-white p-10 rounded-lg md:rounded-l-none shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Create Account</h2>
            <p className="text-gray-600 mt-1">Join TeachTeam as a Tutor</p>
          </div>
          
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block mb-1 font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
                required
              />
            </div>

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
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Create a password"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters and include uppercase, lowercase, number, and special character
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block mb-1 font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex justify-center items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Already have an account? <Link href="/signin" className="text-blue-600 hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;