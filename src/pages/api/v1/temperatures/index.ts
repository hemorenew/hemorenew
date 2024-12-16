/* eslint-disable @typescript-eslint/no-explicit-any */
import Temperature from 'core/models/Temperature';
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

          const temperatures = await Temperature.find({
            date: {
              $gte: start,
              $lte: end,
            },
          });
          return res.status(200).json(temperatures);
        }

        // Si no hay startDate, devuelve todas las temperaturas (comportamiento original)
        const temperatures = await Temperature.find({});
        return res.status(200).json(temperatures);
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }
    case 'POST':
      try {
        const newTemperature = new Temperature(body);
        const savedTemperature = await newTemperature.save();
        return res.status(201).json(savedTemperature);
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }
    default:
      return res.status(400).json({ msg: 'This method is not supported' });
  }
}

export default handler;
