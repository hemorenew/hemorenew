/* eslint-disable @typescript-eslint/no-explicit-any */
import withSession from 'lib/session';
import authMiddleware from 'middlewares/authMiddleware';

export default authMiddleware(
  withSession(async (req: any, res: any) => {
    const user = req.session.get('user');

    if (user) {
      res.json({
        isLoggedIn: true,
        ...user,
      });
    } else {
      res.json({
        isLoggedIn: false,
      });
    }
  })
);
