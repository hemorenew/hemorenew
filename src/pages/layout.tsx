import Footer from 'core/components/layout/Footer';
import Navbar from 'core/components/layout/Navbar';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className='font-primary'>
      <Navbar />
      <main className='h-[85vh] min-h-full'>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
