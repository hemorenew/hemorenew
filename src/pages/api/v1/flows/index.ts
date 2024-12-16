/* eslint-disable @typescript-eslint/no-explicit-any */
import Flow from 'core/models/Flow';
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

          const flows = await Flow.find({
            date: {
              $gte: start,
              $lte: end,
            },
          });
          return res.status(200).json(flows);
        }

        // Si no hay startDate, devuelve todos los flows (comportamiento original)
        const flows = await Flow.find({});
        return res.status(200).json(flows);
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }
    case 'POST':
      try {
        const newFlow = new Flow(body);
        const savedFlow = await newFlow.save();
        return res.status(201).json(savedFlow);
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }
    default:
      return res.status(400).json({ msg: 'This method is not supported' });
  }
}

export default handler;
