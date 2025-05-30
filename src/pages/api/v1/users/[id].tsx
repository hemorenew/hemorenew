/* eslint-disable @typescript-eslint/no-explicit-any */
import User from 'core/models/User';
import { dbConnect } from 'core/utils/mongosee';
import { NextApiRequest, NextApiResponse } from 'next';

dbConnect();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
    body,
    query: { id },
  } = req;
  switch (method) {
    case 'GET':
      try {
        const user = await User.findById(id);
        if (!user) {
          return res.status(404).end(`User not found`);
        }
        return res.status(200).json({ user });
      } catch (error: any) {
        return res.status(500).json({ msg: error.message });
      }
    case 'PUT':
      try {
        const updatedUser = await User.findByIdAndUpdate(id, body, {
          new: true,
        });
        if (!updatedUser)
          return res.status(404).json({ message: 'Usuario no encontrado' });
        return res.status(200).json({ user: updatedUser });
      } catch (error: any) {
        return res.status(400).json({ message: error.message });
      }
    case 'DELETE':
      try {
        const deleteTask = await User.findByIdAndDelete(id);
        if (!deleteTask) return res.status(404).end(`User not found`);
        return res.status(204).json({ deleteTask });
      } catch (error: any) {
        return res.status(400).json({ msg: error.message });
      }
    default:
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default handler;
