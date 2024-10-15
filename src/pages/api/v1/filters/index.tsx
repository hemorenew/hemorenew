/* eslint-disable @typescript-eslint/no-explicit-any */
import Filter from 'core/models/Filter';
import { dbConnect } from 'core/utils/mongosee';
import { NextApiRequest, NextApiResponse } from 'next';

dbConnect();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;

  switch (method) {
    case 'GET':
      try {
        const allFilters = await Filter.find({});
        return res.status(200).json(allFilters);
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }
    case 'POST':
      try {
        const newFilter = new Filter(body);
        const savedFilter = await newFilter.save();
        return res.status(201).json(savedFilter);
      } catch (error: any) {
        if (error.code === 11000) {
          const field = Object.keys(error.keyValue)[0];
          const value = error.keyValue[field];
          const errorMessage = `El valor '${value}' ya existe para el campo '${field}'. Debe ser único.`;
          return res.status(400).json({ error: errorMessage });
        }
        return res.status(400).json({ error: error.message });
      }
    default:
      return res.status(400).json({ msg: 'This method is not supported' });
  }
}

export default handler;
