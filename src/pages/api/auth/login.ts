import bcrypt from 'bcryptjs';
import User from 'core/models/User';
import { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from 'utils/mongosee';

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

      // Here you would typically create a session or JWT token
      // For simplicity, we're just sending a success message
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
