/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { useServerSideLogin } from 'core/hooks/permission/useServerSideLogin';
import withSession from 'core/lib/session';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const Index = () => {
  const [user, setUser] = useState<any>('');

  useEffect(() => {
    axios
      .get('/api/auth/user')
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => console.error('Error fetching user data:', error));
  }, []);

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

      <div className='mt-8 grid grid-cols-2 gap-4'>
        <Link
          href='/patient'
          className='rounded-lg border-2 border-gray-300 bg-white p-4 text-center text-lg font-medium text-gray-700 shadow-sm hover:bg-gray-50'
        >
          Ingresar datos de un nuevo paciente
        </Link>
        <Link
          href='/filter'
          className='rounded-lg border-2 border-gray-300 bg-white p-4 text-center text-lg font-medium text-gray-700 shadow-sm hover:bg-gray-50'
        >
          Designar un filtro nuevo a un paciente
        </Link>
        <Link
          href='/washing'
          className='rounded-lg border-2 border-gray-300 bg-white p-4 text-center text-lg font-medium text-gray-700 shadow-sm hover:bg-gray-50'
        >
          Realizar lavado
        </Link>
        <Link
          href='/history'
          className='rounded-lg border-2 border-gray-300 bg-white p-4 text-center text-lg font-medium text-gray-700 shadow-sm hover:bg-gray-50'
        >
          Ver historial de filtros
        </Link>
      </div>
    </div>
  );
};

export const getServerSideProps = withSession(useServerSideLogin);

export default Index;
