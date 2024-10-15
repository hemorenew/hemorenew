/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcryptjs';
import withSession from 'core/lib/session';
import User from 'core/models/User';
import { dbConnect } from 'core/utils/mongosee';
import { NextApiRequest, NextApiResponse } from 'next';

dbConnect();

export default withSession(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const ERROR_CREDENTIALS = 'Invalid email or password';

    if (req.method !== 'POST') {
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { email, password } = req.body;

    const userDoc = await User.findOne({ email });

    if (!userDoc) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, userDoc.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid username or password' });
    }

    try {
      const { id, firstName, lastName, profession } = userDoc;
      await saveSession({ id, firstName, lastName, profession }, req);
      return res.status(200).json({ id, firstName, lastName, profession });
    } catch (error) {
      console.error('validate: ', (error as Error).message);
      return res.status(403).json({ error: ERROR_CREDENTIALS });
    }
  }
);

async function saveSession(user: any, request: any) {
  const { id, firstName, lastName, profession } = user;
  const sessionDuration = 2 * 60 * 60 * 1000; // 4 hours
  const sessionExpiry = Date.now() + sessionDuration;
  request.session.set('user', {
    id,
    firstName,
    lastName,
    profession,
    sessionExpiry,
  });
  await request.session.save();
}
