import bcrypt from 'bcryptjs';
import User from 'core/models/User';
import { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from 'utils/mongosee';

dbConnect();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;

  switch (method) {
    case 'GET':
      try {
        const allUsers = await User.find({});
        return res.status(200).json(allUsers);
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }
    case 'POST':
      try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(body.password, saltRounds);
        body.password = hashedPassword;
        const newUser = new User(body);
        const savedUser = await newUser.save();
        return res.status(201).json(savedUser);
      } catch (error: any) {
        console.error('Error stack:', error.stack);

        if (error.code === 11000) {
          const field = Object.keys(error.keyValue)[0];
          const value = error.keyValue[field];
          const errorMessage = `El valor '${value}' ya existe para el campo '${field}'. Debe ser único.`;
          return res.status(400).json({ error: errorMessage });
        }

        return res.status(400).json({ error: error.message });
      }

    default:
      return res.status(400).json({ msg: 'This method is not supported' });
  }
}

export default handler;
