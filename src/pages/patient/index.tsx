import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  ci: string;
  birthDate: string;
  phone: string;
  dryWeight: number;
  attended: string;
  status: string;
}

const PatientCRUD: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<Patient>();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/v1/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const onSubmit = async (data: Patient) => {
    try {
      if (editingPatient) {
        await axios.put(`/api/v1/patients/${editingPatient._id}`, data);
      } else {
        await axios.post('/api/v1/patients', data);
      }
      fetchPatients();
      reset();
      setEditingPatient(null);
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  };

  const deletePatient = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await axios.delete(`/api/v1/patients/${id}`);
        fetchPatients();
      } catch (error) {
        console.error('Error deleting patient:', error);
      }
    }
  };

  const editPatient = (patient: Patient) => {
    setEditingPatient(patient);
    Object.keys(patient).forEach((key) => {
      setValue(key as keyof Patient, patient[key as keyof Patient]);
    });
  };

  return (
    <div className='h-full min-h-max bg-gray-100 py-8'>
      <div className='container mx-auto px-4'>
        <h1 className='mb-8 text-2xl font-bold text-gray-800'>
          Patient Management
        </h1>

        <div className='grid gap-8 lg:grid-cols-3'>
          <div className='col-span-1 rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-lg font-semibold'>
              {editingPatient ? 'Edit Patient' : 'Add New Patient'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <input
                {...register('firstName')}
                placeholder='First Name'
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <input
                {...register('lastName')}
                placeholder='Last Name'
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <input
                {...register('ci')}
                placeholder='CI'
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <input
                {...register('birthDate')}
                type='date'
                placeholder='Birth Date'
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <input
                {...register('phone')}
                placeholder='Phone'
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <input
                {...register('dryWeight', { valueAsNumber: true })}
                type='number'
                step='0.1'
                placeholder='Dry Weight'
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />

              <button
                type='submit'
                className='w-full rounded-md bg-blue-500 py-2 px-4 text-white transition duration-300 hover:bg-blue-600'
              >
                {editingPatient ? 'Update Patient' : 'Add Patient'}
              </button>
            </form>
          </div>

          <div className='col-span-2 overflow-x-auto rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-lg font-semibold'>Patient List</h2>
            <table className='w-full'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='px-4 py-2 text-left'>Name</th>
                  <th className='px-4 py-2 text-left'>CI</th>
                  <th className='px-4 py-2 text-left'>Birth Date</th>
                  <th className='px-4 py-2 text-left'>Phone</th>
                  <th className='px-4 py-2 text-left'>Dry Weight</th>
                  <th className='px-4 py-2 text-left'>Status</th>
                  <th className='px-4 py-2 text-left'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient._id} className='border-b'>
                    <td className='px-4 py-2'>{`${patient.firstName} ${patient.lastName}`}</td>
                    <td className='px-4 py-2'>{patient.ci}</td>
                    <td className='px-4 py-2'>{patient.birthDate}</td>
                    <td className='px-4 py-2'>{patient.phone}</td>
                    <td className='px-4 py-2'>{patient.dryWeight}</td>
                    <td className='px-4 py-2'>{patient.status}</td>
                    <td className='px-4 py-2'>
                      <button
                        onClick={() => editPatient(patient)}
                        className='mr-2 rounded-md bg-yellow-500 px-2 py-1 text-white transition duration-300 hover:bg-yellow-600'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deletePatient(patient._id)}
                        className='rounded-md bg-red-500 px-2 py-1 text-white transition duration-300 hover:bg-red-600'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientCRUD;
