/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { useServerSideLogin } from 'core/hooks/permission/useServerSideLogin';
import withSession from 'core/lib/session';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

interface Washing {
  _id: string;
  patient: any;
  filter: any;
  startDate: string;
  attended: any;
  residualVolume: number;
  integrityTest: number | null;
  status: string;
}

const WashingCRUD: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  const [washings, setWashings] = useState<Washing[]>([]);
  const [editingWashing, setEditingWashing] = useState<Washing | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [filters, setFilters] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWashings, setFilteredWashings] = useState<Washing[]>([]);
  const [sortField, setSortField] = useState<keyof Washing | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isFilterEnabled, setIsFilterEnabled] = useState(false);
  const [isDateEnabled, setIsDateEnabled] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Washing>();

  const dateInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    axios
      .get('/api/auth/user')
      .then((response) => {
        setUserId(response.data.id);
      })
      .catch((error) => console.error('Error fetching user data:', error));
    fetchWashings();
    fetchPatients();
    fetchFilters();
  }, []);

  useEffect(() => {
    const filtered = washings.filter(
      (washing) =>
        washing.patient.firstName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        washing.patient.lastName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        washing.patient.ci.toString().includes(searchTerm)
    );
    setFilteredWashings(filtered);
  }, [searchTerm, washings]);

  const fetchWashings = async () => {
    try {
      const response = await axios.get('/api/v1/washings');
      console.log(response.data);
      setWashings(response.data);
    } catch (error) {
      console.error('Error fetching washings:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get(
        '/api/v1/patients/getPatientFilterActive'
      );
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchFilters = async () => {
    try {
      const response = await axios.get('/api/v1/filters');
      const filtersData = response.data.filters || [];
      setFilters(Array.isArray(filtersData) ? filtersData : []);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchPatientFilters = async (patientId: string) => {
    try {
      const response = await axios.get(
        `/api/v1/filters/filterByPatient?id=${patientId}`
      );
      const filtersData = response.data.filters || [];
      setFilters(Array.isArray(filtersData) ? filtersData : []);
    } catch (error) {
      console.error('Error fetching patient filters:', error);
      setFilters([]);
    }
  };

  const onSubmit = async (data: Washing) => {
    if (
      !data.patient ||
      !data.filter ||
      !data.startDate ||
      data.residualVolume === undefined
    ) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }
    data.attended = userId;

    try {
      if (editingWashing) {
        const updatedData = {
          ...data,
          patient: data.patient._id || data.patient,
          filter: data.filter._id || data.filter,
          integrityTest:
            data.integrityTest === null ? null : Number(data.integrityTest),
          startDate: data.startDate,
        };

        console.log('Sending update:', updatedData);

        await axios
          .put(`/api/v1/washings/${editingWashing._id}`, updatedData)
          .then((response) => {
            console.log('Update response:', response.data);
            toast.success('Lavado actualizado correctamente');
            fetchWashings();
          })
          .catch((error) => {
            console.error('Update error:', error);
            toast.error(
              'Error al actualizar el lavado, ' + error.response?.data?.message
            );
          });
      } else {
        await axios
          .post('/api/v1/washings', data)
          .then(() => {
            toast.success('Lavado registrado correctamente');
          })
          .catch((error) => {
            toast.error(
              'Error al crear el lavado, ' + error.response.data.message
            );
          });
      }
      fetchWashings();
      reset({
        patient: '',
        filter: '',
        startDate: '',
        residualVolume: 0,
        integrityTest: 0,
      });
      setEditingWashing(null);
      setIsFilterEnabled(false);
      setIsDateEnabled(false);
    } catch (error) {
      console.error('Error saving washing:', error);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleSort = (field: keyof Washing) => {
    const newDirection =
      sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);

    const sorted = [...filteredWashings].sort((a, b) => {
      let aValue, bValue;

      if (field === 'startDate') {
        aValue = new Date(a[field]).getTime();
        bValue = new Date(b[field]).getTime();
      } else {
        aValue =
          field === 'patient'
            ? a[field].firstName
            : field === 'filter'
            ? a[field].brand
            : field === 'attended'
            ? a[field].firstName
            : a[field];
        bValue =
          field === 'patient'
            ? b[field].firstName
            : field === 'filter'
            ? b[field].brand
            : field === 'attended'
            ? b[field].firstName
            : b[field];
      }

      if (aValue < bValue) return newDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return newDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredWashings(sorted);
  };

  const getSortIcon = (field: keyof Washing) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const adjustDateForTimezone = (date: string) => {
    const d = new Date(date);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  return (
    <div className='flex h-full  items-center justify-center bg-gray-100 py-8 lg:min-h-[85vh]'>
      <div className='container mx-auto px-4'>
        <h1 className='mb-8 text-2xl font-bold text-gray-800'>
          Gestión de Lavados
        </h1>

        <div className='grid gap-8 lg:grid-cols-3'>
          <div className='col-span-1 h-fit rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-lg font-semibold'>
              {editingWashing
                ? 'Editar Lavado'
                : 'Registrar el procesado de un filtro'}
            </h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='flex flex-col gap-4'
            >
              <select
                {...register('patient', { required: 'Seleccione un paciente' })}
                onChange={(e) => {
                  register('patient').onChange(e);
                  if (e.target.value) {
                    fetchPatientFilters(e.target.value);
                    setIsFilterEnabled(true);
                  } else {
                    setFilters([]);
                    setIsFilterEnabled(false);
                    setIsDateEnabled(false);
                  }
                }}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Seleccionar Paciente</option>
                {patients.map((patient) => (
                  <option
                    key={patient._id}
                    value={patient._id}
                    selected={
                      !!editingWashing &&
                      editingWashing.patient._id === patient._id
                    }
                  >
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
              {errors.patient && (
                <p className='mt-1 text-sm text-red-500'>
                  {errors.patient?.message?.toString()}
                </p>
              )}
              <select
                {...register('filter', { required: 'Seleccione un filtro' })}
                disabled={!isFilterEnabled}
                onChange={(e) => {
                  register('filter').onChange(e);
                  setIsDateEnabled(!!e.target.value);
                }}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100'
              >
                <option value=''>Seleccionar Filtro</option>
                {filters.map((filter) => (
                  <option
                    key={filter._id}
                    value={filter._id}
                    selected={
                      editingWashing?.filter._id === filter._id ?? false
                    }
                  >
                    {filter.brand} - {filter.model}
                  </option>
                ))}
              </select>
              {errors.filter && (
                <p className='mt-1 text-sm text-red-500'>
                  {errors.filter?.message?.toString()}
                </p>
              )}
              <input
                {...register('startDate', { required: 'Seleccione una fecha' })}
                type='datetime-local'
                disabled={!isDateEnabled}
                ref={(e) => {
                  if (e) dateInputRef.current = e;
                  return register('startDate').ref(e);
                }}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100'
                onChange={(e) => {
                  register('startDate').onChange(e);
                  setTimeout(() => {
                    dateInputRef.current?.blur();
                  }, 100);
                }}
              />
              {errors.startDate && (
                <p className='mt-1 text-sm text-red-500'>
                  {errors.startDate?.message?.toString()}
                </p>
              )}
              <input
                {...register('residualVolume', {
                  valueAsNumber: true,
                  max: {
                    value: 200,
                    message: 'El volumen residual debe ser menor que 200',
                  },
                })}
                type='number'
                step='0.1'
                placeholder='Volumen residual (ml)'
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              {errors.residualVolume && (
                <p className='mt-1 text-sm text-red-500'>
                  {errors.residualVolume?.message?.toString()}
                </p>
              )}

              <label htmlFor='integrityTest'>Test de integridad</label>

              <select
                {...register('integrityTest', {
                  setValueAs: (value) => (value === '' ? null : Number(value)),
                })}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                defaultValue={editingWashing?.integrityTest?.toString() ?? ''}
              >
                <option value={0}>Pendiente</option>
                <option value={1}>No se detecta ruptura</option>
                <option value={2}>Se detecta ruptura</option>
              </select>

              <button
                type='submit'
                className='w-full rounded-md bg-blue-500 py-2 px-4 text-white transition duration-300 hover:bg-blue-600'
              >
                {editingWashing ? 'Actualizar Lavado' : 'Agregar Lavado'}
              </button>
            </form>
          </div>

          <div className='col-span-2 overflow-x-auto rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-lg font-semibold'>Lista de Lavados</h2>
            <div className='mb-4'>
              <input
                type='text'
                placeholder='Buscar...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-gray-100'>
                  <th
                    className='cursor-pointer px-4 py-2 text-left hover:bg-gray-200'
                    onClick={() => handleSort('patient')}
                  >
                    Paciente{' '}
                    <span className='ml-1'>{getSortIcon('patient')}</span>
                  </th>
                  <th
                    className='cursor-pointer px-4 py-2 text-left hover:bg-gray-200'
                    onClick={() => handleSort('filter')}
                  >
                    Filtro <span className='ml-1'>{getSortIcon('filter')}</span>
                  </th>
                  <th
                    className='cursor-pointer px-4 py-2 text-left hover:bg-gray-200'
                    onClick={() => handleSort('attended')}
                  >
                    Atendido por{' '}
                    <span className='ml-1'>{getSortIcon('attended')}</span>
                  </th>
                  <th
                    className='cursor-pointer px-4 py-2 text-left hover:bg-gray-200'
                    onClick={() => handleSort('startDate')}
                  >
                    Fecha de Inicio{' '}
                    <span className='ml-1'>{getSortIcon('startDate')}</span>
                  </th>
                  <th className='px-4 py-2 text-left'>Volumen Residual</th>
                  <th className='px-4 py-2 text-left'>Test de Integridad</th>
                  <th className='px-4 py-2 text-left'>Actualizar</th>
                </tr>
              </thead>
              <tbody>
                {filteredWashings.map((washing) => (
                  <tr key={washing._id} className='border-b'>
                    <td className='px-4 py-2'>
                      {washing.patient.firstName} {washing.patient.lastName}
                    </td>
                    <td className='px-4 py-2'>
                      {washing.filter.brand} - {washing.filter.model}
                    </td>
                    <td className='px-4 py-2'>
                      {washing.attended.firstName} {washing.attended.lastName}
                    </td>
                    <td className='px-4 py-2'>
                      {formatDateForDisplay(washing.startDate)}
                    </td>
                    <td className='px-4 py-2'>{washing.residualVolume}</td>
                    <td className='px-4 py-2'>
                      {washing.integrityTest === 0
                        ? 'Pendiente'
                        : washing.integrityTest === 1
                        ? 'No se detecta ruptura'
                        : 'Se detecta ruptura'}
                    </td>
                    <td className='px-4 py-2'>
                      <button
                        className='rounded-md bg-blue-500 py-2 px-4 text-white transition duration-300 hover:bg-blue-600'
                        onClick={() => {
                          setEditingWashing(washing);
                          reset({
                            patient: washing.patient._id,
                            filter: washing.filter._id,
                            startDate: adjustDateForTimezone(washing.startDate),
                            residualVolume: washing.residualVolume,
                            integrityTest: washing.integrityTest,
                          });
                          setIsFilterEnabled(true);
                          setIsDateEnabled(true);
                          fetchPatientFilters(washing.patient._id);
                        }}
                      >
                        Actualizar
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

export const getServerSideProps = withSession(useServerSideLogin);

export default WashingCRUD;
