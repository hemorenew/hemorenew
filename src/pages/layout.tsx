import Footer from 'core/components/layout/Footer';
import Navbar from 'core/components/layout/Navbar';
import { AuthProvider } from 'core/context/authContext';
import { useRouter } from 'next/router';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const hideNavAndFooter = ['/login', '/register', '/404'].includes(
    router.pathname
  );

  return (
    <AuthProvider>
      <div className='flex min-h-screen flex-col font-primary'>
        {!hideNavAndFooter && <Navbar />}
        <main className='flex-1'>{children}</main>
        {!hideNavAndFooter && <Footer />}
      </div>
    </AuthProvider>
  );
};

export default Layout;
