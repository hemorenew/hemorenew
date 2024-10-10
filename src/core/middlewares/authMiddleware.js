// import { withIronSession } from 'next-iron-session';

// const ironSessionOptions = {
//   password: process.env.SECRET_COOKIE_PASSWORD,
//   cookieName: 'root_auth_session',
// };

// const authMiddleware = (handler) =>
//   withIronSession(async (req, res) => {
//     const userAgent = req.headers['user-agent'];
//     const isBrowser = /Mozilla/.test(userAgent);
//     const referer = req.headers['referer'];
//     const isFromFrontendApp =
//       referer && referer.startsWith(process.env.NEXT_PUBLIC_API_URL);

//     if (isBrowser && !isFromFrontendApp) {
//       res.writeHead(302, { Location: '/' });
//       res.end();
//       return;
//     }

//     return handler(req, res);
//   }, ironSessionOptions);

// export default authMiddleware;
