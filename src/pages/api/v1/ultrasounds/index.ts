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
        const { startDate } = req.query;

        if (startDate) {
          const start = new Date(startDate as string);
          const end = new Date(start.getTime() + 30 * 60000); // 30 minutos en milisegundos

          const ultrasounds = await Ultrasound.find({
            date: {
              $gte: start,
              $lte: end,
            },
          });
          return res.status(200).json(ultrasounds);
        }

        // Si no hay startDate, devuelve todos los ultrasounds (comportamiento original)
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
