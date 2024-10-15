/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { useServerSideLogin } from 'core/hooks/permission/useServerSideLogin';
import withSession from 'core/lib/session';
import { motion } from 'framer-motion';
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
    <div className='flex h-full  min-h-[84vh] items-center justify-center bg-gray-100 py-8'>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='rounded-lg bg-white p-8 shadow-2xl'
      >
        <h1 className='mb-4 text-2xl font-bold text-gray-800 sm:text-4xl md:text-5xl'>
          Bienvenido a HemoRenew
        </h1>
        {user && (
          <p className='text-center text-xl text-gray-600 sm:text-2xl md:text-3xl'>
            {user.firstName || ''} {user.lastName || ''}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export const getServerSideProps = withSession(useServerSideLogin);

export default Index;
