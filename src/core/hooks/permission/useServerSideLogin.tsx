/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirectToLogin } from 'core/constants/redirects';

export const useServerSideLogin = async (context: any) => {
  const { req } = context;
  const user = req.session.get('user');
  const currentTime = Date.now();
  const sessionExpiry = user?.sessionExpiry || 0;

  if (!user || currentTime > sessionExpiry) {
    req.session.destroy();
    return redirectToLogin;
  }

  if (!user) return redirectToLogin;

  return { props: {} };
};
