/* eslint-disable @typescript-eslint/no-explicit-any */
import Filter from 'core/models/Filter';
import Patient from 'core/models/Patient';
import { dbConnect } from 'core/utils/mongosee';
import { NextApiRequest, NextApiResponse } from 'next';

dbConnect();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;

  switch (method) {
    case 'GET':
      try {
        const allFilters = await Filter.find({}).populate({
          path: 'patient',
          model: Patient,
        });
        return res.status(200).json({ filters: allFilters });
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }
    case 'POST':
      try {
        console.log('Received body:', body);
        const newFilter = new Filter(body);
        console.log('Created filter object:', newFilter);
        const savedFilter = await newFilter.save();
        return res.status(201).json({ filter: savedFilter });
      } catch (error: any) {
        console.error('Detailed error:', error);
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
