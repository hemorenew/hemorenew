/* eslint-disable @typescript-eslint/no-explicit-any */
import Washing from 'core/models/Washing';
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
        const washing = await Washing.findById(id);
        if (!washing) {
          return res.status(404).end(`Washing not found`);
        }
        return res.status(200).json({ washing });
      } catch (error: any) {
        return res.status(500).json({ msg: error.message });
      }
    case 'PUT':
      try {
        const updatedWashing = await Washing.findByIdAndUpdate(
          id,
          {
            patient: body.patient,
            filter: body.filter,
            startDate: body.startDate,
            attended: body.attended,
            status: body.status,
          },
          { new: true }
        )
          .populate('patient')
          .populate('filter');
        if (!updatedWashing) return res.status(404).end(`Washing not found`);
        return res.status(200).json(updatedWashing);
      } catch (error: any) {
        return res.status(400).json({ msg: error.message });
      }
    case 'DELETE':
      try {
        const deletedWashing = await Washing.findByIdAndDelete(id);
        if (!deletedWashing) return res.status(404).end(`Washing not found`);
        return res.status(204).json({ deletedWashing });
      } catch (error: any) {
        return res.status(400).json({ msg: error.message });
      }
    default:
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default handler;
