/* eslint-disable @typescript-eslint/no-explicit-any */
import withSession from 'lib/session';

export default withSession(async (req: any, res: any) => {
  req.session.destroy();

  res.setHeader('Set-Cookie', [
    `root_auth_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; HttpOnly`,
  ]);

  res.redirect('/login');
});
