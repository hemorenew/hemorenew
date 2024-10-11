import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className=' bg-gray-800 text-white'>
      <div className='container mx-auto text-center'>
        <p>&copy; {new Date().getFullYear()} Hemorenew. All rights reserved.</p>
        <div>
          <a href='/privacy' className='mr-4 hover:underline'>
            Privacy Policy
          </a>
          <a href='/terms' className='hover:underline'>
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
