import React, { useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AuthContext } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, userType, user, logout } = useContext(AuthContext);
  const router = useRouter();

  const dashboardPath =
    userType === 'tutor'
      ? '/tutor/dashboard'
      : userType === 'lecturer'
      ? '/lecturer/dashboard'
      : '/';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    ...(isAuthenticated ? [{ name: 'Dashboard', path: dashboardPath }] : []),
    ...(isAuthenticated ? [{ name: 'Profile', path: '/profile' }] : []),
  ];

  return (
    <header className="bg-slate-100 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <span className="text-white text-lg font-semibold">T</span>
          </div>
          <span className="text-2xl font-extrabold text-blue-700 group-hover:tracking-wide transition-all">
            TeachTeam
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex gap-8 text-lg font-semibold text-gray-700">
          {navLinks.map((link) => {
            const isActive = router.pathname === link.path;

            return (
              <Link
                key={link.name}
                href={link.path}
                className={`group relative inline-block pb-2 px-1 transition-all duration-300 transform ${
                  isActive ? 'text-blue-700' : 'hover:text-blue-700'
                } hover:scale-105`}
              >
                <span className="relative z-10">{link.name}</span>
                <span
                  className={`absolute left-0 bottom-0 h-[2px] w-full origin-left transform scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100 transition-transform duration-300 ${
                    isActive ? 'scale-x-100 opacity-100 bg-blue-700' : 'bg-blue-500'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link href="/signin">
                <button className="px-4 py-1.5 text-sm text-gray-700 hover:text-blue-700 transition relative group">
                  Sign In
                  <span className="absolute left-0 bottom-0 h-[2px] w-full bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-4 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition">
                  Sign Up
                </button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {/* Welcome message */}
              <span className="text-sm text-gray-600 italic font-medium">
                 Welcome, <span className="text-blue-700">{user?.name}</span>
              </span>

              {/* Sign out button */}
              <button
                onClick={logout}
                className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow hover:bg-red-700 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
