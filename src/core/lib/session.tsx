/* eslint-disable @typescript-eslint/no-explicit-any */
import { withIronSession } from 'next-iron-session';

export default function withSession(handler: any) {
  return withIronSession(handler, {
    password: process.env.SECRET_COOKIE_PASSWORD as string,
    cookieName: 'root_auth_session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  });
}
