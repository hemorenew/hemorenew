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
    const { firstName, lastName, ci, profession, phone, user, password } =
      req.body;

    try {
      const existingUser = await User.findOne({ user });

      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: 'Username already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        firstName,
        lastName,
        ci,
        profession,
        phone,
        user,
        password: hashedPassword,
      });

      await newUser.save();

      res
        .status(201)
        .json({ success: true, message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
