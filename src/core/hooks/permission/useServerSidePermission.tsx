/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import {
  redirectToLogin,
  redirectToUnauthorized,
} from 'core/constants/redirects';

export const useServerSidePermission = async (context: any) => {
  const { req } = context;
  const user = req.session.get('user');
  const cookie = context.req.headers.cookie;

  const currentTime = Date.now();
  const sessionExpiry = user?.sessionExpiry || 0;

  if (!user || currentTime > sessionExpiry) {
    return redirectToLogin;
  }

  if (!user) return redirectToLogin;

  try {
    const { data: userData } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/user`,
      {
        headers: { cookie },
      }
    );

    if (userData.isLoggedIn !== true) return redirectToLogin;

    if (userData.type !== 'admin') return redirectToUnauthorized;

    return {
      props: {
        user: userData,
      },
    };
  } catch (error) {
    return redirectToUnauthorized;
  }
};
