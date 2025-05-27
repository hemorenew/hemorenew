import Link from 'next/link';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className='bg-gray-800 text-white'>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        <div className='flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0'>
          <p>
            &copy; {new Date().getFullYear()} Hemorenew. Todos los derechos
            reservados.
          </p>
          <div className='flex space-x-4'>
            <Link href='/' className='hover:text-gray-300 hover:underline'>
              Política de Privacidad
            </Link>
            <Link href='/' className='hover:text-gray-300 hover:underline'>
              Términos y Condiciones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
