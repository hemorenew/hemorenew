/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import Carousel from 'core/components/Carousel';
import { useServerSideLogin } from 'core/hooks/permission/useServerSideLogin';
import withSession from 'core/lib/session';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const Index = () => {
  const [user, setUser] = useState<any>('');
  const [showMainContent, setShowMainContent] = useState(false);

  useEffect(() => {
    setShowMainContent(false);

    axios
      .get('/api/auth/user')
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => console.error('Error fetching user data:', error));
  }, []);

  if (!showMainContent) {
    return (
      <>
        <Carousel onStart={() => setShowMainContent(true)} user={user} />
      </>
    );
  }

  return (
    <div className='flex h-full min-h-[84vh] flex-col items-center justify-center bg-gray-100 py-8'>
      <h1 className='mb-4 text-2xl font-bold text-gray-800 sm:text-4xl md:text-5xl'>
        Bienvenido a HemoRenew
      </h1>
      {user && (
        <>
          <p className='text-center text-xl font-bold text-gray-600 sm:text-2xl md:text-3xl'>
            {user.profession || ''}
          </p>
          <p className='text-center text-xl text-gray-600 sm:text-2xl md:text-3xl'>
            {user.firstName || ''} {user.lastName || ''}
          </p>
        </>
      )}

      <div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8'>
        <Link
          href='/patient'
          className='group relative overflow-hidden rounded-xl border-2 border-blue-200 bg-white p-6 text-center transition-all duration-300 hover:border-blue-400 hover:shadow-lg'
        >
          <div className='absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
          <div className='relative z-10'>
            <span className='mb-2 block text-blue-500'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='mx-auto h-8 w-8'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
                />
              </svg>
            </span>
            <h3 className='text-lg font-semibold text-gray-800'>
              Nuevo Paciente
            </h3>
            <p className='mt-1 text-sm text-gray-600'>
              Ingresar datos de un nuevo paciente
            </p>
          </div>
        </Link>

        <Link
          href='/filter'
          className='group relative overflow-hidden rounded-xl border-2 border-green-200 bg-white p-6 text-center transition-all duration-300 hover:border-green-400 hover:shadow-lg'
        >
          <div className='absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
          <div className='relative z-10'>
            <span className='mb-2 block text-green-500'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='mx-auto h-8 w-8'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                />
              </svg>
            </span>
            <h3 className='text-lg font-semibold text-gray-800'>
              Nuevo Filtro
            </h3>
            <p className='mt-1 text-sm text-gray-600'>
              Designar un filtro nuevo a un paciente
            </p>
          </div>
        </Link>

        <Link
          href='/washing'
          className='group relative overflow-hidden rounded-xl border-2 border-purple-200 bg-white p-6 text-center transition-all duration-300 hover:border-purple-400 hover:shadow-lg'
        >
          <div className='absolute inset-0 bg-gradient-to-r from-purple-50 to-fuchsia-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
          <div className='relative z-10'>
            <span className='mb-2 block text-purple-500'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='mx-auto h-8 w-8'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
                />
              </svg>
            </span>
            <h3 className='text-lg font-semibold text-gray-800'>
              Realizar Lavado
            </h3>
            <p className='mt-1 text-sm text-gray-600'>
              Realizar lavado de filtro
            </p>
          </div>
        </Link>

        <Link
          href='/history'
          className='group relative overflow-hidden rounded-xl border-2 border-amber-200 bg-white p-6 text-center transition-all duration-300 hover:border-amber-400 hover:shadow-lg'
        >
          <div className='absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
          <div className='relative z-10'>
            <span className='mb-2 block text-amber-500'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='mx-auto h-8 w-8'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
                />
              </svg>
            </span>
            <h3 className='text-lg font-semibold text-gray-800'>Historial</h3>
            <p className='mt-1 text-sm text-gray-600'>
              Ver historial de filtros
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export const getServerSideProps = withSession(useServerSideLogin);

export default Index;
