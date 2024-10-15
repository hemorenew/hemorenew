/* eslint-disable @typescript-eslint/no-explicit-any */
import Patient from 'core/models/Patient';
import { dbConnect } from 'core/utils/mongosee';
import { NextApiRequest, NextApiResponse } from 'next';

dbConnect();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
    body,
    query: { id },
  } = req;
  switch (method) {
    case 'GET':
      try {
        const patient = await Patient.findById(id);
        if (!patient) {
          return res.status(404).end(`Patient not found`);
        }
        return res.status(200).json({ patient });
      } catch (error: any) {
        return res.status(500).json({ msg: error.message });
      }
    case 'PUT':
      try {
        const updatedPatient = await Patient.findByIdAndUpdate(id, body, {
          new: true,
        });
        if (!updatedPatient) return res.status(404).end(`Patient not found`);
        return res.status(200).json({ updatedPatient });
      } catch (error: any) {
        return res.status(400).json({ msg: error.message });
      }
    case 'DELETE':
      try {
        const deletedPatient = await Patient.findByIdAndDelete(id);
        if (!deletedPatient) return res.status(404).end(`Patient not found`);
        return res.status(204).json({ deletedPatient });
      } catch (error: any) {
        return res.status(400).json({ msg: error.message });
      }
    default:
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default handler;
