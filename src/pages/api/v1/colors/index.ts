/* eslint-disable @typescript-eslint/no-explicit-any */
import Color from 'core/models/Color';
import { dbConnect } from 'core/utils/mongosee';
import { NextApiRequest, NextApiResponse } from 'next';

dbConnect();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;

  switch (method) {
    case 'GET':
      try {
        const colors = await Color.find({});
        return res.status(200).json(colors);
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }
    case 'POST':
      try {
        const newColor = new Color(body);
        const savedColor = await newColor.save();
        return res.status(201).json(savedColor);
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }
    default:
      return res.status(400).json({ msg: 'This method is not supported' });
  }
}

export default handler;
