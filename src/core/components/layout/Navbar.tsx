import Link from 'next/link';
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className='h-[10vh] bg-gray-800'>
      <div className='container mx-auto flex items-center justify-between'>
        <div className='text-xl font-bold text-white'>Your App Name</div>
        <ul className='flex space-x-4'>
          <li>
            <Link href='/user' className='text-white hover:text-gray-300'>
              User
            </Link>
          </li>
          <li>
            <Link href='/patient' className='text-white hover:text-gray-300'>
              Patient
            </Link>
          </li>
          <li>
            <Link href='/filter' className='text-white hover:text-gray-300'>
              Filter
            </Link>
          </li>
          <li>
            <Link href='/washing' className='text-white hover:text-gray-300'>
              Washing
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
