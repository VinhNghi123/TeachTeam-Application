import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Sign Up', path: '/signup' },
  { name: 'Sign In', path: '/signin' },
];

const Header: React.FC = () => {
  const router = useRouter();

  return (
    <header className="bg-blue-50	 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        



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
<nav className="flex gap-10 text-lg font-semibold text-gray-700">
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

        {/* Underline Effect */}
        <span
          className={`absolute left-0 bottom-0 h-[2px] w-full origin-left transform scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100 transition-transform duration-300 ${
            isActive ? 'scale-x-100 opacity-100 bg-blue-700' : 'bg-blue-500'
          }`}
        />
      </Link>
    );
  })}
</nav>






        
      </div>
    </header>
  );
};

export default Header;
