import axios from 'axios';
import { useServerSideLogin } from 'core/hooks/permission/useServerSideLogin';
import withSession from 'core/lib/session';
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
  attended: any;
  status: string;
}

const PatientCRUD: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
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
    data.attended = userId;
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

  useEffect(() => {
    axios
      .get('/api/auth/user')
      .then((response) => {
        setUserId(response.data.id);
      })
      .catch((error) => console.error('Error fetching user data:', error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='flex flex min-h-[84vh] flex-col items-center justify-center bg-gray-100 py-8'>
      <div className='container mx-auto px-4'>
        <h1 className='mb-8 text-2xl font-bold text-gray-800 sm:text-3xl'>
          Gestión de Pacientes
        </h1>

        <div className='grid gap-8 lg:grid-cols-3'>
          <div className='min-w-[300px] sm:w-auto lg:col-span-1'>
            <div className='rounded-lg bg-white p-4 shadow-md'>
              <h2 className='mb-4 text-lg font-semibold sm:text-xl'>
                {editingPatient ? 'Editar Paciente' : 'Agregar Nuevo Paciente'}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <input
                  {...register('firstName')}
                  placeholder='Nombre'
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <input
                  {...register('lastName')}
                  placeholder='Apellido'
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <input
                  {...register('ci')}
                  placeholder='Cédula de Identidad'
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <input
                  {...register('birthDate')}
                  type='date'
                  placeholder='Fecha de Nacimiento'
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <input
                  {...register('phone')}
                  placeholder='Teléfono'
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <input
                  {...register('dryWeight', { valueAsNumber: true })}
                  type='number'
                  step='0.1'
                  placeholder='Peso Seco'
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />

                <button
                  type='submit'
                  className='w-full rounded-md bg-blue-500 py-2 px-4 text-white transition duration-300 hover:bg-blue-600 sm:text-lg'
                >
                  {editingPatient ? 'Actualizar Paciente' : 'Agregar Paciente'}
                </button>
              </form>
            </div>
          </div>

          <div className='min-w-[300px] sm:w-auto lg:col-span-2'>
            <div className='overflow-x-auto rounded-lg bg-white p-6 shadow-md'>
              <h2 className='mb-4 text-lg font-semibold sm:text-xl'>
                Lista de Pacientes
              </h2>
              <div className='overflow-x-auto'>
                <table className='w-full table-auto'>
                  <thead>
                    <tr className='bg-gray-100'>
                      <th className='px-4 py-2 text-left'>Nombre</th>
                      <th className='px-4 py-2 text-left'>CI</th>
                      <th className='hidden px-4 py-2 text-left sm:table-cell'>
                        Fecha de Nacimiento
                      </th>
                      <th className='hidden px-4 py-2 text-left sm:table-cell'>
                        Teléfono
                      </th>
                      <th className='hidden px-4 py-2 text-left sm:table-cell'>
                        Peso Seco
                      </th>
                      <th className='hidden px-4 py-2 text-left lg:table-cell'>
                        Registrado por
                      </th>
                      <th className='px-4 py-2 text-left'>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient._id} className='border-b'>
                        <td className='px-4 py-2'>{`${patient.firstName} ${patient.lastName}`}</td>
                        <td className='px-4 py-2'>{patient.ci}</td>
                        <td className='hidden px-4 py-2 sm:table-cell'>
                          {patient.birthDate}
                        </td>
                        <td className='hidden px-4 py-2 sm:table-cell'>
                          {patient.phone}
                        </td>
                        <td className='hidden px-4 py-2 sm:table-cell'>
                          {patient.dryWeight}
                        </td>
                        <td className='hidden px-4 py-2 lg:table-cell'>
                          {patient.attended.firstName}{' '}
                          {patient.attended.lastName}
                        </td>
                        <td className='px-4 py-2'>
                          <button
                            onClick={() => editPatient(patient)}
                            className='mb-2 mr-2 rounded-md bg-yellow-500 px-2 py-1 text-white transition duration-300 hover:bg-yellow-600 sm:mb-0'
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deletePatient(patient._id)}
                            className='rounded-md bg-red-500 px-2 py-1 text-white transition duration-300 hover:bg-red-600'
                          >
                            Eliminar
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
      </div>
    </div>
  );
};

export const getServerSideProps = withSession(useServerSideLogin);

export default PatientCRUD;
