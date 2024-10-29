/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { useServerSideLogin } from 'core/hooks/permission/useServerSideLogin';
import withSession from 'core/lib/session';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Patient>();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    await axios
      .get('/api/v1/patients')
      .then((res) => {
        setPatients(res.data);
      })
      .catch((error) => {
        console.error('Error fetching patients:', error.errorMessage);
        toast.error(error.errorMessage);
      });
  };

  const onSubmit = async (data: Patient) => {
    data.attended = userId;
    try {
      if (editingPatient) {
        await axios
          .put(`/api/v1/patients/${editingPatient._id}`, data)
          .then(() => {
            toast.success('Paciente actualizado exitosamente');
          })
          .catch((error) => {
            toast.error(
              error.response?.data?.errorMessage ||
                'Error al actualizar paciente'
            );
          });
      } else {
        await axios
          .post('/api/v1/patients', data)
          .then(() => {
            toast.success('Paciente registrado exitosamente');
          })
          .catch((error) => {
            toast.error(
              error.response?.data?.errorMessage ||
                'Error al registrar paciente'
            );
          });
      }
      fetchPatients();
      reset();
      setEditingPatient(null);
    } catch (error: any) {
      console.error(
        'Error saving patient:',
        error.response?.data?.errorMessage
      );
      toast.error(
        error.response?.data?.errorMessage || 'Error al guardar paciente'
      );
    }
  };

  const deletePatient = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      await axios
        .delete(`/api/v1/patients/${id}`)
        .then(() => {
          toast.success('Paciente eliminado exitosamente');
        })
        .catch((error) => {
          toast.error(error.errorMessage);
        });
      fetchPatients();
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

  useEffect(() => {
    const filtered = patients.filter(
      (patient) =>
        patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.ci.includes(searchTerm)
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  return (
    <div className='flex min-h-[84vh] flex-col items-center justify-center bg-gray-100 py-8'>
      <div className='container mx-auto px-4'>
        <h1 className='mb-8 text-2xl font-bold text-gray-800 sm:text-3xl'>
          Gestión de Pacientes
        </h1>

        <div className='grid gap-8 lg:grid-cols-3'>
          <div className='min-w-[300px] sm:w-auto lg:col-span-1'>
            <div className='rounded-lg bg-white p-4 shadow-md'>
              <h2 className='mb-4 text-lg font-semibold sm:text-xl'>
                {editingPatient
                  ? 'Editar el ingreso al servicio de un paciente'
                  : 'Agregar el ingreso al servicio de un nuevo paciente'}
              </h2>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className='flex flex-col gap-4'
              >
                <div>
                  <input
                    {...register('firstName', {
                      required: 'Este campo es requerido',
                      pattern: {
                        value: /^[a-zA-Z\s]+$/,
                        message: 'Solo se permiten letras y espacios',
                      },
                    })}
                    placeholder='Nombre'
                    className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  {errors.firstName && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register('lastName', {
                      required: 'Este campo es requerido',
                      pattern: {
                        value: /^[a-zA-Z\s]+$/,
                        message: 'Solo se permiten letras y espacios',
                      },
                    })}
                    placeholder='Apellido'
                    className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  {errors.lastName && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register('ci', {
                      required: 'Este campo es requerido',
                      pattern: {
                        value: /^[0-9]+$/,
                        message: 'Solo se permiten números',
                      },
                    })}
                    type='number'
                    placeholder='Cédula de Identidad'
                    className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  {errors.ci && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.ci.message}
                    </p>
                  )}
                </div>
                <div className='flex flex-col gap-2'>
                  <label className='text-sm text-gray-600' htmlFor='birthDate'>
                    Fecha de Nacimiento
                  </label>
                  <input
                    {...register('birthDate', {
                      required: 'Este campo es requerido',
                      validate: (value) => {
                        const date = new Date(value);
                        const minDate = new Date('1930-01-01');
                        const today = new Date();
                        return (
                          (date >= minDate && date <= today) || 'Fecha inválida'
                        );
                      },
                    })}
                    type='date'
                    min='1930-01-01'
                    max={new Date().toISOString().split('T')[0]}
                    placeholder='Fecha de Nacimiento'
                    className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  {errors.birthDate && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.birthDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register('phone', {
                      required: 'Este campo es requerido',
                      pattern: {
                        value: /^[0-9]{1,8}$/,
                        message: 'Solo se permiten números (máximo 8 dígitos)',
                      },
                      maxLength: {
                        value: 8,
                        message: 'Máximo 8 dígitos permitidos',
                      },
                    })}
                    type='number'
                    placeholder='Teléfono'
                    className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  {errors.phone && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register('dryWeight', {
                      valueAsNumber: true,
                      required: 'Este campo es requerido',
                      min: {
                        value: 0,
                        message: 'El peso seco debe ser mayor que 0',
                      },
                    })}
                    type='number'
                    step='0.1'
                    placeholder='Peso Seco'
                    className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  {errors.dryWeight && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.dryWeight.message}
                    </p>
                  )}
                </div>

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
                Lista de pacientes Registrados
              </h2>
              <div className='mb-4'>
                <input
                  type='text'
                  placeholder='Buscar paciente...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div className='overflow-x-auto'>
                <table className='w-full table-auto text-sm'>
                  <thead>
                    <tr className='bg-gray-100'>
                      <th className='px-4 py-2 text-left'>Nombre</th>
                      <th className='px-4 py-2 text-left'>
                        Cédula de Identidad
                      </th>
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
                    {filteredPatients.map((patient) => (
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
                        <td className='flex flex-wrap items-center justify-center gap-1'>
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
