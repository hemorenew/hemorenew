/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  redirectToLogin,
  redirectToUnauthorized,
} from 'core/constants/redirects';

export const useServerSidePermission = async (context: any) => {
  const { req } = context;
  const user = req.session.get('user');
  const currentTime = Date.now();
  const sessionExpiry = user?.sessionExpiry || 0;

  if (!user || currentTime > sessionExpiry) {
    return redirectToLogin;
  }

  if (user?.profession !== 'admin') {
    return redirectToUnauthorized;
  }

  return { props: {} };
};
