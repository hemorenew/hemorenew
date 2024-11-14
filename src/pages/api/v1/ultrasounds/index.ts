/* eslint-disable @typescript-eslint/no-explicit-any */
import Ultrasound from 'core/models/Ultrasound';
import { dbConnect } from 'core/utils/mongosee';
import { NextApiRequest, NextApiResponse } from 'next';

dbConnect();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;

  switch (method) {
    case 'GET':
      try {
        const ultrasounds = await Ultrasound.find({});
        return res.status(200).json(ultrasounds);
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }
    case 'POST':
      try {
        const newUltrasound = new Ultrasound(body);
        const savedUltrasound = await newUltrasound.save();
        return res.status(201).json(savedUltrasound);
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }
    default:
      return res.status(400).json({ msg: 'This method is not supported' });
  }
}

export default handler;
