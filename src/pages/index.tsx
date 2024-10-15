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
    <div className='h-full min-h-[85vh] content-center text-center text-2xl'>
      Bienvenido a HemoRenew {user.firstName || ''} {user.lastName || ''}
    </div>
  );
};

export const getServerSideProps = withSession(useServerSideLogin);

export default Index;
