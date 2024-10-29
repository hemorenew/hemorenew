/* eslint-disable @typescript-eslint/no-explicit-any */
import Filter from 'core/models/Filter';
import Patient from 'core/models/Patient';
import Washing from 'core/models/Washing';
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
        if (error.code === 11000) {
          const field = Object.keys(error.keyPattern)[0];
          return res.status(400).json({
            errorMessage: `El ${field} '${body[field]}' ya está en uso`,
          });
        }
        return res.status(400).json({ msg: error.message });
      }
    case 'DELETE':
      try {
        // Check for existing filters
        const filterExists = await Filter.findOne({ patient: id });
        if (filterExists) {
          return res.status(400).json({
            message:
              'No se puede eliminar el paciente porque tiene filtros registrados',
          });
        }

        // Check for existing washings
        const washingExists = await Washing.findOne({ patient: id });
        if (washingExists) {
          return res.status(400).json({
            message:
              'No se puede eliminar el paciente porque tiene lavados registrados',
          });
        }

        const deletedPatient = await Patient.findByIdAndDelete(id);
        if (!deletedPatient) return res.status(404).end(`Patient not found`);
        return res.status(204).json({ deletedPatient });
      } catch (error: any) {
        return res.status(400).json({ message: error.message });
      }
    default:
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default handler;
