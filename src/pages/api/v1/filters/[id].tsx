/* eslint-disable @typescript-eslint/no-explicit-any */
import Filter from 'core/models/Filter';
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
        const filter = await Filter.findById(id);
        if (!filter) {
          return res.status(404).end(`Filter not found`);
        }
        return res.status(200).json({ filter });
      } catch (error: any) {
        return res.status(500).json({ msg: error.message });
      }
    case 'PUT':
      try {
        const updatedFilter = await Filter.findByIdAndUpdate(id, body, {
          new: true,
        });
        if (!updatedFilter) return res.status(404).end(`Filter not found`);
        return res.status(200).json({ updatedFilter });
      } catch (error: any) {
        return res.status(400).json({ msg: error.message });
      }
    case 'DELETE':
      try {
        const deletedFilter = await Filter.findByIdAndDelete(id);
        if (!deletedFilter) return res.status(404).end(`Filter not found`);
        return res.status(204).json({ deletedFilter });
      } catch (error: any) {
        return res.status(400).json({ msg: error.message });
      }
    default:
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default handler;
