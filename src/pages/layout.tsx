import React from 'react';

import Footer from '../core/components/layout/footer';
import Navbar from '../core/components/layout/navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className='font-primary'>
      <Navbar />
      <main className='h-full min-h-max'>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
