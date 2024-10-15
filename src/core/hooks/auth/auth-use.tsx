import { AuthContext } from 'core/context/authContext';
import useUser from 'core/lib/useUser';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';

export const useAuth = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const { user } = useUser({
    redirectTo: '/',
    redirectIfFound: true,
  });
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const currentTime = Date.now();
    const sessionExpiry = user?.sessionExpiry || 0;

    if (
      ((isLoggedIn || user?.isLoggedIn) && router.pathname !== '/') ||
      currentTime > sessionExpiry
    ) {
      router.push('/');
    }
  }, [user, isLoggedIn, router]);

  return { isLoggedIn, user };
};
