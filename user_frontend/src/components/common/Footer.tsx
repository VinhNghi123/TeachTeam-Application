import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">TeachTeam</h3>
            <p className="text-sm">
              Streamlining the tutor selection process for computer science courses.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
            <ul className="text-sm">
              <li className="mb-1"><Link href="/" className="hover:underline">Home</Link></li>
              <li className="mb-1"><Link href="/about" className="hover:underline">About</Link></li>
              <li className="mb-1"><Link href="/contact" className="hover:underline">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Contact</h3>
            <p className="text-sm">Email: support@teachteam.edu</p>
            <p className="text-sm">Phone: (03) 9123 4567</p>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-700 text-center text-sm">
          <p>© {new Date().getFullYear()} TeachTeam. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;