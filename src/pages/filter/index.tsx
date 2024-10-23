import axios from 'axios';
import { useServerSideLogin } from 'core/hooks/permission/useServerSideLogin';
import withSession from 'core/lib/session';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface Filter {
  _id: string;
  patient: string;
  brand: string;
  model: string;
  primingReal: number;
  firstUse: Date;
  status: string;
}

const FILTER_DATA = {
  Fresenius: {
    FX800: 118,
    'F8 HPS': 113,
    'F10 HPS': 132,
  },
  Nipro: {
    'NIPRO 210 LH': 115,
    'NIPRO 210 HR': 130,
  },
  BBraun: {
    'Diacap Pro 19L': 109,
    'Diacap Pro 16L': 87,
  },
};

const FilterCRUD: React.FC = () => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [models, setModels] = useState<string[]>([]);
  const [editingFilter, setEditingFilter] = useState<Filter | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<Filter>();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchFilters();
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

  const fetchFilters = async () => {
    try {
      const response = await axios.get('/api/v1/filters');
      console.log('Filters received:', response.data);
      // Extract filters array from response
      const filtersData = response.data.filters || [];
      setFilters(Array.isArray(filtersData) ? filtersData : []);
    } catch (error) {
      console.error('Error fetching filters:', error);
      setFilters([]);
    }
  };

  const onSubmit = async (data: Filter) => {
    try {
      if (editingFilter) {
        await axios.put(`/api/v1/filters/${editingFilter._id}`, data);
      } else {
        console.log('Data to be sent:', data);
        await axios.post('/api/v1/filters', data);
      }
      await fetchFilters();
      setSelectedBrand('');
      setModels([]);
      reset();
      setEditingFilter(null);
    } catch (error) {
      console.error('Error saving filter:', error);
    }
  };

  const deleteFilter = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este filtro?')) {
      try {
        await axios.delete(`/api/v1/filters/${id}`);
        fetchFilters();
      } catch (error) {
        console.error('Error deleting filter:', error);
      }
    }
  };

  const editFilter = (filter: Filter) => {
    setEditingFilter(filter);
    Object.keys(filter).forEach((key) => {
      setValue(key as keyof Filter, filter[key as keyof Filter]);
    });
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    setValue('brand', brand);
    setValue('model', '');
    setValue('primingReal', 0);
    setModels(
      Object.keys(FILTER_DATA[brand as keyof typeof FILTER_DATA] || {})
    );
  };

  const handleModelChange = (model: string) => {
    setValue('model', model);
    const primingValue =
      FILTER_DATA[selectedBrand as keyof typeof FILTER_DATA][
        model as keyof (typeof FILTER_DATA)[keyof typeof FILTER_DATA]
      ];
    setValue('primingReal', primingValue);
  };

  return (
    <div className='flex h-full  items-center justify-center bg-gray-100 py-8 lg:min-h-[85vh]'>
      <div className='container mx-auto px-4'>
        <h1 className='mb-8 text-2xl font-bold text-gray-800'>
          Gestión de Filtros
        </h1>

        <div className='grid gap-8 lg:grid-cols-3'>
          <div className='col-span-1 rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-lg font-semibold'>
              {editingFilter
                ? 'Editar Filtro'
                : 'Designar filtro a un paciente'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <select
                {...register('patient')}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Seleccionar Paciente</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>

              <select
                value={selectedBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Seleccionar Marca</option>
                {Object.keys(FILTER_DATA).map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>

              <select
                {...register('model')}
                onChange={(e) => handleModelChange(e.target.value)}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Seleccionar Modelo</option>
                {models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>

              <input
                {...register('primingReal')}
                type='number'
                placeholder='Priming real'
                readOnly
                className='w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />

              <input
                {...register('firstUse', {
                  validate: (value) =>
                    !value ||
                    new Date(value) <= new Date(today) ||
                    'La fecha no puede ser futura',
                })}
                type='date'
                max={today}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />

              <select
                {...register('status')}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='active'>Activo</option>
                <option value='inactive'>Inactivo</option>
              </select>
              <button
                type='submit'
                className='w-full rounded-md bg-blue-500 py-2 px-4 text-white transition duration-300 hover:bg-blue-600'
              >
                {editingFilter ? 'Actualizar Filtro' : 'Agregar Filtro'}
              </button>
            </form>
          </div>

          <div className='col-span-2 overflow-x-auto rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-lg font-semibold'>Lista de Filtros</h2>
            <table className='w-full'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='px-4 py-2 text-left'>Paciente</th>
                  <th className='px-4 py-2 text-left'>Marca</th>
                  <th className='px-4 py-2 text-left'>Modelo</th>
                  <th className='px-4 py-2 text-left'>Priming</th>
                  <th className='px-4 py-2 text-left'>Estado</th>
                  <th className='px-4 py-2 text-left'>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(filters) && filters.length > 0 ? (
                  filters.map((filter) => (
                    <tr key={filter._id} className='border-b'>
                      <td className='px-4 py-2'>
                        {patients.find((p) => p._id === filter.patient)
                          ?.firstName || 'N/A'}{' '}
                        {patients.find((p) => p._id === filter.patient)
                          ?.lastName || ''}
                      </td>
                      <td className='px-4 py-2'>{filter.brand}</td>
                      <td className='px-4 py-2'>{filter.model}</td>
                      <td className='px-4 py-2'>{filter.primingReal}</td>
                      <td className='px-4 py-2'>
                        {filter.status === 'active' ? 'Activo' : 'Inactivo'}
                      </td>
                      <td className='px-4 py-2'>
                        <button
                          onClick={() => editFilter(filter)}
                          className='mr-2 rounded-md bg-yellow-500 px-2 py-1 text-white transition duration-300 hover:bg-yellow-600'
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteFilter(filter._id)}
                          className='rounded-md bg-red-500 px-2 py-1 text-white transition duration-300 hover:bg-red-600'
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className='px-4 py-2 text-center'>
                      No hay filtros disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = withSession(useServerSideLogin);

export default FilterCRUD;
