/* eslint-disable @typescript-eslint/no-explicit-any */
import { IronSessionProps } from 'core/interface/type';
import { withIronSession } from 'next-iron-session';

const ironSessionOptions: IronSessionProps = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: 'root_auth_session',
};

const authMiddleware = (handler: any) =>
  withIronSession(async (req: any, res: any) => {
    const userAgent = req.headers['user-agent'];
    const isBrowser = /Mozilla/.test(userAgent);
    const referer = req.headers['referer'];
    const isFromFrontendApp =
      referer &&
      referer.startsWith(process.env.MONGO_URL) &&
      referer.startsWith(process.env.NEXT_PUBLIC_URL) &&
      !req.url.startsWith('/api/');

    if (isBrowser && !isFromFrontendApp) {
      //location / and /user/userRegister
      const location = req.url === '/' ? '/login' : '/register';

      res.writeHead(302, { Location: location });

      res.end();
      return;
    }

    return handler(req, res);
  }, ironSessionOptions);

export default authMiddleware;
