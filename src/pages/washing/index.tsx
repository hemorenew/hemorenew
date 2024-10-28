/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { useServerSideLogin } from 'core/hooks/permission/useServerSideLogin';
import withSession from 'core/lib/session';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface Washing {
  _id: string;
  patient: any;
  filter: any;
  startDate: string;
  attended: any;
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

  const { register, handleSubmit, reset } = useForm<Washing>();

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
    data.attended = userId;

    try {
      if (editingWashing) {
        const updatedData = {
          ...data,
          patient: data.patient._id || data.patient,
          filter: data.filter._id || data.filter,
        };
        await axios.put(`/api/v1/washings/${editingWashing._id}`, updatedData);
      } else {
        await axios.post('/api/v1/washings', data);
      }
      fetchWashings();
      reset();
      setEditingWashing(null);
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
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <select
                {...register('patient')}
                onChange={(e) => {
                  register('patient').onChange(e);
                  if (e.target.value) {
                    fetchPatientFilters(e.target.value);
                  } else {
                    setFilters([]);
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
              <select
                {...register('filter')}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
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
              <input
                {...register('startDate')}
                type='datetime-local'
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />

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
            <table className='w-full'>
              <thead>
                <tr className='bg-gray-100'>
                  <th
                    className='cursor-pointer px-4 py-2 text-left hover:bg-gray-200'
                    onClick={() => handleSort('patient')}
                  >
                    Paciente{' '}
                    {sortField === 'patient' &&
                      (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className='cursor-pointer px-4 py-2 text-left hover:bg-gray-200'
                    onClick={() => handleSort('filter')}
                  >
                    Filtro{' '}
                    {sortField === 'filter' &&
                      (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className='cursor-pointer px-4 py-2 text-left hover:bg-gray-200'
                    onClick={() => handleSort('attended')}
                  >
                    Atendido por{' '}
                    {sortField === 'attended' &&
                      (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className='cursor-pointer px-4 py-2 text-left hover:bg-gray-200'
                    onClick={() => handleSort('startDate')}
                  >
                    Fecha de Inicio{' '}
                    {sortField === 'startDate' &&
                      (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
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
