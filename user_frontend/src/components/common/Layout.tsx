import React, { ReactNode } from 'react';
import Header from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300">
      <Header />
      {/* Add margin or padding to main */}
      <main className="flex-grow container mx-auto px-4 pt-10 pb-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
