/* eslint-disable @typescript-eslint/no-explicit-any */
import Filter from 'core/models/Filter';
import { dbConnect } from 'core/utils/mongosee';
import { NextApiRequest, NextApiResponse } from 'next';

dbConnect();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
    query: { id },
  } = req;

  if (method === 'GET') {
    try {
      const filters = await Filter.find({
        patient: id,
        status: 'active',
      });
      return res.status(200).json({ filters });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  }

  return res.status(405).end(`Method ${method} Not Allowed`);
}

export default handler;
