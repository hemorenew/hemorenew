import Link from 'next/link';
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className='h-[10vh] content-center bg-gray-800'>
      <div className='container mx-auto flex items-center justify-between'>
        <div className='text-xl font-bold text-white'>
          <Link href='/'>HemoRenew</Link>
        </div>
        <ul className='flex space-x-4'>
          <li>
            <Link href='/user' className='text-white hover:text-gray-300'>
              Usuario
            </Link>
          </li>
          <li>
            <Link href='/patient' className='text-white hover:text-gray-300'>
              Paciente
            </Link>
          </li>
          <li>
            <Link href='/filter' className='text-white hover:text-gray-300'>
              Filtro
            </Link>
          </li>
          <li>
            <Link href='/washing' className='text-white hover:text-gray-300'>
              Lavado
            </Link>
          </li>
          <li>
            <Link href='/login' className='text-white hover:text-gray-300'>
              Login
            </Link>
          </li>
          <li>
            <Link href='/register' className='text-white hover:text-gray-300'>
              Register
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
