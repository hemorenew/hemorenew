/* eslint-disable @typescript-eslint/no-explicit-any */
import withSession from 'core/lib/session';
// import authMiddleware from 'core/middlewares/authMiddleware';

export default withSession(async (req: any, res: any) => {
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
});
