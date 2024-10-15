/* eslint-disable @typescript-eslint/no-explicit-any */
import withSession from 'core/lib/session';
import { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-iron-session';

interface ExtendedNextApiRequest extends NextApiRequest {
  session: Session;
}

export default withSession(
  async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
    req.session.destroy();

    res.setHeader('Set-Cookie', [
      'root_auth_session=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict',
    ]);

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  }
);
