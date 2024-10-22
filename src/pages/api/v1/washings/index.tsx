/* eslint-disable @typescript-eslint/no-explicit-any */
import Filter from 'core/models/Filter';
import Patient from 'core/models/Patient';
import User from 'core/models/User';
import Washing from 'core/models/Washing';
import { dbConnect } from 'core/utils/mongosee';
import { NextApiRequest, NextApiResponse } from 'next';

dbConnect();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body, query } = req;

  switch (method) {
    case 'GET':
      try {
        let washings;
        if (query.patient) {
          washings = await Washing.find({ patient: query.patient })
            .populate({
              path: 'patient',
              model: Patient,
            })
            .populate({
              path: 'filter',
              model: Filter,
            })
            .populate({
              path: 'attended',
              model: User,
            });
        } else {
          washings = await Washing.find({})
            .populate({
              path: 'patient',
              model: Patient,
            })
            .populate({
              path: 'filter',
              model: Filter,
            })
            .populate({
              path: 'attended',
              model: User,
            });
        }
        return res.status(200).json(washings);
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
