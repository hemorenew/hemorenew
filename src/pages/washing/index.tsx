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

  useEffect(() => {
    const autoUpdatePendingWashings = async () => {
      const currentTime = new Date();
      const pendingWashings = washings.filter(
        (w) =>
          w.residualVolume === 0 &&
          (w.integrityTest === 0 || w.integrityTest === null)
      );

      const washingsToUpdate = pendingWashings.filter((w) => {
        const washingTime = new Date(w.startDate);
        const washingTimeUY = new Date(
          washingTime.toLocaleString('en-US', {
            timeZone: 'America/Montevideo',
          })
        );
        const currentTimeUY = new Date(
          currentTime.toLocaleString('en-US', {
            timeZone: 'America/Montevideo',
          })
        );
        const diffInMinutes =
          (currentTimeUY.getTime() - washingTimeUY.getTime()) / (1000 * 60);
        return diffInMinutes >= 20;
      });

      if (washingsToUpdate.length > 0) {
        let successCount = 0;
        let errorCount = 0;

        for (const washing of washingsToUpdate) {
          const success = await updateWashingData(washing);
          if (success) successCount++;
          else errorCount++;
        }

        await fetchWashings();

        if (successCount > 0) {
          toast.success(
            `${successCount} lavados actualizados automáticamente${
              errorCount > 0 ? `, ${errorCount} errores` : ''
            }`
          );
        }
      }
    };

    if (washings.length > 0) {
      autoUpdatePendingWashings();
    }
  }, [washings]);

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
    try {
      if (!data.patient) {
        toast.error('Por favor seleccione un paciente');
        return;
      }
      if (!data.filter) {
        toast.error('Por favor seleccione un filtro');
        return;
      }
      if (!data.startDate) {
        toast.error('Por favor seleccione una fecha');
        return;
      }

      data.attended = userId;

      const submitData = {
        ...data,
        patient: data.patient._id || data.patient,
        filter: data.filter._id || data.filter,
      };

      if (editingWashing) {
        const updatedData = {
          ...submitData,
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
          .post('/api/v1/washings', submitData)
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
    return new Date(dateString).toLocaleString('es-UY', { timeZone: 'UTC' });
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

  const updateWashingData = async (washing: Washing) => {
    try {
      const params = new URLSearchParams({ startDate: washing.startDate });

      // Obtener datos de sensores
      const [colors, ultrasounds] = await Promise.all([
        axios.get(`/api/v1/colors?${params}`),
        axios.get(`/api/v1/ultrasounds?${params}`),
      ]);

      // Calcular volumen residual del último valor de ultrasonido
      const lastUltrasound =
        ultrasounds.data[ultrasounds.data.length - 1]?.value || 0;
      const residualVolume =
        //capacidad funcional del filtro - volumen residual
        //resta ultrasonido por que esta encima de la probeta apuntando hacia el fondo 0.3 sobre la probeta
        Math.PI * Math.pow(2, 2) * Math.max(0, 19 - (lastUltrasound - 0.3));

      // Determinar test de integridad
      const lastColor = colors.data[colors.data.length - 1]?.value || 'BLANCO';
      const integrityTest = lastColor === 'BLANCO' ? 1 : 2; // 1: No ruptura, 2: Ruptura

      // Actualizar lavado
      await axios.put(`/api/v1/washings/${washing._id}`, {
        residualVolume: Number(residualVolume.toFixed(2)),
        integrityTest,
      });

      return true;
    } catch (error) {
      console.error('Error updating washing:', error);
      return false;
    }
  };

  const updatePendingWashings = async () => {
    try {
      // Filtrar lavados pendientes
      const pendingWashings = washings.filter(
        (w) =>
          w.residualVolume === 0 &&
          (w.integrityTest === 0 || w.integrityTest === null)
      );

      let successCount = 0;
      let errorCount = 0;

      // Actualizar cada lavado pendiente
      for (const washing of pendingWashings) {
        const success = await updateWashingData(washing);
        if (success) successCount++;
        else errorCount++;
      }

      // Refrescar datos
      await fetchWashings();

      // Notificar resultado
      toast.success(
        `${successCount} lavados actualizados correctamente${
          errorCount > 0 ? `, ${errorCount} errores` : ''
        }`
      );
    } catch (error) {
      console.error('Error updating washings:', error);
      toast.error('Error al actualizar los lavados');
    }
  };

  return (
    <div className='flex h-full min-h-[83vh] items-center justify-center bg-gray-100 py-4 sm:py-8'>
      <div className='container mx-auto px-2 sm:px-4'>
        <h1 className='mb-4 text-xl font-bold text-gray-800 sm:mb-8 sm:text-2xl'>
          Gestión de Lavados
        </h1>

        <div className='grid gap-4 sm:gap-8 lg:grid-cols-3'>
          <div className='col-span-1 h-fit rounded-lg bg-white p-4 shadow-md sm:p-6'>
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
              {/* <input
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
              </select> */}

              <button
                type='submit'
                className='w-full rounded-md bg-blue-500 py-2 px-4 text-white transition duration-300 hover:bg-blue-600'
              >
                {editingWashing ? 'Actualizar Lavado' : 'Agregar Lavado'}
              </button>
            </form>
          </div>

          <div className='col-span-1 overflow-hidden rounded-lg bg-white p-4 shadow-md sm:p-6 lg:col-span-2'>
            <div className='mb-4 flex flex-col items-center justify-between gap-2 sm:flex-row'>
              <h2 className='text-lg font-semibold'>Lista de Lavados</h2>
              <div className='flex gap-2'>
                <button
                  onClick={updatePendingWashings}
                  className='w-full rounded-md bg-green-500 py-2 px-4 text-white transition duration-300 hover:bg-green-600 sm:w-auto'
                >
                  📊 Actualizar Pendientes
                </button>
                <button
                  onClick={fetchWashings}
                  className='w-full rounded-md bg-gray-500 py-2 px-4 text-white transition duration-300 hover:bg-gray-600 sm:w-auto'
                >
                  🔄 Actualizar
                </button>
              </div>
            </div>

            <div className='mb-4'>
              <input
                type='text'
                placeholder='Buscar...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div className='-mx-4 overflow-x-auto sm:-mx-6'>
              <div className='inline-block min-w-full align-middle'>
                <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg'>
                  <table className='min-w-full divide-y divide-gray-300'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th
                          scope='col'
                          className='cursor-pointer py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 hover:bg-gray-100 sm:pl-6'
                          onClick={() => handleSort('patient')}
                        >
                          Paciente{' '}
                          <span className='ml-1'>{getSortIcon('patient')}</span>
                        </th>
                        <th
                          scope='col'
                          className='cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-100'
                          onClick={() => handleSort('filter')}
                        >
                          Filtro{' '}
                          <span className='ml-1'>{getSortIcon('filter')}</span>
                        </th>
                        <th
                          scope='col'
                          className='hidden cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-100 sm:table-cell'
                          onClick={() => handleSort('attended')}
                        >
                          Atendido por{' '}
                          <span className='ml-1'>
                            {getSortIcon('attended')}
                          </span>
                        </th>
                        <th
                          scope='col'
                          className='cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-100'
                          onClick={() => handleSort('startDate')}
                        >
                          Fecha{' '}
                          <span className='ml-1'>
                            {getSortIcon('startDate')}
                          </span>
                        </th>
                        <th
                          scope='col'
                          className='hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell'
                        >
                          Vol. Residual
                        </th>
                        <th
                          scope='col'
                          className='hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell'
                        >
                          Test Integridad
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200 bg-white'>
                      {filteredWashings.map((washing) => (
                        <tr key={washing._id} className='hover:bg-gray-50'>
                          <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6'>
                            <div className='font-medium text-gray-900'>
                              {washing.patient.firstName}{' '}
                              {washing.patient.lastName}
                            </div>
                            <div className='text-gray-500 sm:hidden'>
                              Atendido por: {washing.attended.firstName}{' '}
                              {washing.attended.lastName}
                            </div>
                          </td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                            {washing.filter.brand} - {washing.filter.model}
                          </td>
                          <td className='hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell'>
                            {washing.attended.firstName}{' '}
                            {washing.attended.lastName}
                          </td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                            {formatDateForDisplay(washing.startDate)}
                          </td>
                          <td className='hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell'>
                            {washing.residualVolume}
                          </td>
                          <td className='hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell'>
                            {washing.integrityTest === 0
                              ? 'Pendiente'
                              : washing.integrityTest === 1
                              ? 'No se detecta ruptura'
                              : 'Se detecta ruptura'}
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
    </div>
  );
};

export const getServerSideProps = withSession(useServerSideLogin);

export default WashingCRUD;
