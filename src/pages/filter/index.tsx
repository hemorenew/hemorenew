/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { useServerSideLogin } from 'core/hooks/permission/useServerSideLogin';
import withSession from 'core/lib/session';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface Filter {
  _id: string;
  patient: any;
  brand: string;
  model: string;
  primingReal: number;
  firstUse: string;
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState<Filter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFilters, setFilteredFilters] = useState<Filter[]>([]);

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

  const onSubmit = async (data: any) => {
    const selectedPatient = patients.find((p) => p._id === data.patient);

    if (!selectedPatient) {
      alert('Por favor seleccione un paciente');
      return;
    }

    const formattedData = {
      ...data,
      patient: selectedPatient,
    };

    setFormData(formattedData);
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (!formData) return;

    try {
      if (editingFilter) {
        await axios.put(`/api/v1/filters/${editingFilter._id}`, formData);
      } else {
        await axios.post('/api/v1/filters', formData);
      }
      await fetchFilters();
      setSelectedBrand('');
      setModels([]);
      reset();
      setEditingFilter(null);
      setShowConfirmModal(false);
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
    setSelectedBrand(filter.brand);
    handleBrandChange(filter.brand);

    setValue('patient', filter.patient._id);
    setValue('brand', filter.brand);
    setValue('model', filter.model);
    setValue('primingReal', filter.primingReal);

    if (filter.firstUse) {
      const date = new Date(filter.firstUse);
      const formattedDate = date.toISOString().split('T')[0];
      setValue('firstUse', formattedDate);
    }

    setValue('status', filter.status);
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

  // Add this useEffect for search filtering
  useEffect(() => {
    const filtered = filters.filter((filter) =>
      filter.patient
        ? filter.patient.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          filter.patient.lastName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          filter.patient.ci.includes(searchTerm)
        : false
    );
    setFilteredFilters(filtered);
  }, [searchTerm, filters]);

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      active: 'Activo',
      test: 'No pasa test de integridad',
      range: 'Volumen residual fuera de rango',
      inactive: 'Inactivo',
    };
    return statusMap[status] || status;
  };

  return (
    <div className='flex h-full items-center justify-center bg-gray-100 py-8 lg:min-h-[85vh]'>
      <div className='container mx-auto px-4'>
        <h1 className='mb-8 text-2xl font-bold text-gray-800'>
          Gestión de Filtros
        </h1>

        <div className='grid gap-8 lg:grid-cols-3'>
          <div className='col-span-1 h-fit rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-lg font-semibold'>
              {editingFilter
                ? 'Editar Filtro'
                : 'Designar filtro a un paciente'}
            </h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='flex flex-col gap-4'
            >
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
                placeholder='Priming'
                readOnly
                className='w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />

              <label htmlFor='firstUse'>Fecha de primer uso</label>

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
                <option value='test'>No pasa test de integridad</option>
                <option value='range'>Volumen residual fuera de rango</option>
                <option value='inactive'>Inactivo</option>
              </select>
              <button
                type='submit'
                className='w-full rounded-md bg-blue-500 py-2 px-4 text-white transition duration-300 hover:bg-blue-600'
              >
                {editingFilter ? 'Actualizar ' : 'Asignar filtro al Paciente'}
              </button>
            </form>
          </div>

          <div className='col-span-2 overflow-x-auto rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-lg font-semibold'>Lista de Filtros</h2>
            <div className='mb-4'>
              <input
                type='text'
                placeholder='Buscar paciente...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <table className='w-full'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='px-4 py-2 text-left'>Paciente</th>
                  <th className='px-4 py-2 text-left'>Marca</th>
                  <th className='px-4 py-2 text-left'>Modelo</th>
                  <th className='px-4 py-2 text-left'>Priming</th>
                  <th className='px-4 py-2 text-left'>Priming real</th>
                  <th className='px-4 py-2 text-left'>Primer uso</th>
                  <th className='px-4 py-2 text-left'>Estado</th>
                  <th className='px-4 py-2 text-left'>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(filteredFilters) &&
                filteredFilters.length > 0 ? (
                  filteredFilters.map((filter) => (
                    <tr key={filter._id} className='border-b'>
                      <td className='px-4 py-2'>
                        {filter.patient?.firstName || 'N/A'}{' '}
                        {filter.patient?.lastName || ''}
                      </td>
                      <td className='px-4 py-2'>{filter.brand}</td>
                      <td className='px-4 py-2'>{filter.model}</td>
                      <td className='px-4 py-2'>{filter.primingReal}</td>
                      <td className='px-4 py-2'>
                        {(filter.primingReal * 0.8).toFixed(2)}
                      </td>
                      <td className='px-4 py-2'>
                        {filter.firstUse
                          ? new Date(filter.firstUse).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className='px-4 py-2'>
                        {getStatusText(filter.status)}
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
                    <td colSpan={8} className='px-4 py-2 text-center'>
                      No hay filtros disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showConfirmModal && formData && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='w-full max-w-md rounded-lg bg-white p-6'>
            <h2 className='mb-4 text-xl font-bold'>
              Confirmar datos del filtro
            </h2>

            <div className='space-y-2'>
              <p>
                <strong>Paciente:</strong> {formData.patient.firstName}{' '}
                {formData.patient.lastName}
              </p>
              <p>
                <strong>Marca:</strong> {formData.brand}
              </p>
              <p>
                <strong>Modelo:</strong> {formData.model}
              </p>
              <p>
                <strong>Priming:</strong> {formData.primingReal}
              </p>
              <p>
                <strong>Primer uso:</strong>{' '}
                {new Date(formData.firstUse).toLocaleDateString()}
              </p>
              <p>
                <strong>Estado:</strong> {getStatusText(formData.status)}
              </p>
            </div>

            <div className='mt-6 flex justify-end space-x-4'>
              <button
                onClick={() => setShowConfirmModal(false)}
                className='rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600'
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className='rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const getServerSideProps = withSession(useServerSideLogin);

export default FilterCRUD;
