/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { useServerSideLogin } from 'core/hooks/permission/useServerSideLogin';
import withSession from 'core/lib/session';
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
    <div className='flex h-full  min-h-[84vh] flex-col items-center justify-center bg-gray-100 py-8'>
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
    </div>
  );
};

export const getServerSideProps = withSession(useServerSideLogin);

export default Index;
