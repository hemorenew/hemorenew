import Filter from 'core/models/Filter';
import Patient from 'core/models/Patient';
import { dbConnect } from 'core/utils/mongosee';
import { NextApiRequest, NextApiResponse } from 'next';

dbConnect();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const patientsWithFilters = await Patient.find({
        _id: {
          $in: await Filter.distinct('patient', { status: 'active' }),
        },
      });
      return res.status(200).json(patientsWithFilters);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
  return res.status(405).json({ msg: 'Method not allowed' });
}

export default handler;
