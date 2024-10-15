/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcryptjs';
import User from 'core/models/User';
import { dbConnect } from 'core/utils/mongosee';
import { NextApiRequest, NextApiResponse } from 'next';

dbConnect();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { user, password } = req.body;

    try {
      const userDoc = await User.findOne({ user });

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

      console.log(userDoc);

      await saveSession(userDoc, req);
      res
        .status(200)
        .json({ success: true, message: 'Logged in successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

async function saveSession(user: any, request: any) {
  console.log('🚀 ~ saveSession ~ user:', user);
  const { idUser, type, name } = user;
  const sessionDuration = 4 * 60 * 60 * 1000;
  const sessionExpiry = Date.now() + sessionDuration;
  request.session.set('user', { idUser, type, name, sessionExpiry });
  await request.session.save({ maxAge: sessionDuration });
}
