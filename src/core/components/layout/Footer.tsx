import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className='bg-gray-800 text-white'>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        <div className='flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0'>
          <p>
            &copy; {new Date().getFullYear()} Hemorenew. All rights reserved.
          </p>
          <div className='flex space-x-4'>
            <a href='/privacy' className='hover:text-gray-300 hover:underline'>
              Privacy Policy
            </a>
            <a href='/terms' className='hover:text-gray-300 hover:underline'>
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
