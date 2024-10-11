/* eslint-disable @typescript-eslint/no-explicit-any */
import Filter from 'core/models/Filter';
import Patient from 'core/models/Patient';
import Washing from 'core/models/Washing';
import { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from 'utils/mongosee';

dbConnect();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;

  switch (method) {
    case 'GET':
      try {
        const allWashings = await Washing.find({})
          .populate({
            path: 'patient',
            model: Patient,
          })
          .populate({
            path: 'filter',
            model: Filter,
          });
        return res.status(200).json(allWashings);
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }
    case 'POST':
      try {
        const newWashing = new Washing(body);
        const savedWashing = await newWashing.save();
        return res.status(201).json(savedWashing);
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }
    default:
      return res.status(400).json({ msg: 'This method is not supported' });
  }
}

export default handler;
