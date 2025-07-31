import React, { createContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/api';

export type UserType = 'tutor' | 'lecturer' | null;

export interface User {
  id: number;
  name: string;
  email: string;
  type: UserType;
  createdAt: string;
}

interface LoginResponse {
  message: string;
  user: User;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  userType: UserType;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userType: null,
  user: null,
  login: async () => false,
  logout: () => {},
});

export interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('tt_user');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUser(userData);
        setUserType(userData.type);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('tt_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.post<LoginResponse>('/api/auth/login', { email, password });

      setIsAuthenticated(true);
      setUser(response.data.user);
      setUserType(response.data.user.type);
      
      // Save the logged-in user to localStorage
      localStorage.setItem('tt_user', JSON.stringify(response.data.user));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setUserType(null);
    localStorage.removeItem('tt_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};