import Footer from 'core/components/layout/Footer';
import Navbar from 'core/components/layout/Navbar';
import { useRouter } from 'next/router';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const hideNavAndFooter = ['/login', '/register'].includes(router.pathname);

  return (
    <div className='font-primary'>
      {!hideNavAndFooter && <Navbar />}
      <main className='min-h-full'>{children}</main>
      {!hideNavAndFooter && <Footer />}
    </div>
  );
};

export default Layout;
