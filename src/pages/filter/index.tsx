import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface Filter {
  _id: string;
  brand: string;
  model: string;
  serial: string;
  status: string;
}

const FilterCRUD: React.FC = () => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [editingFilter, setEditingFilter] = useState<Filter | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<Filter>();

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const response = await axios.get('/api/v1/filters');
      setFilters(response.data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const onSubmit = async (data: Filter) => {
    try {
      if (editingFilter) {
        await axios.put(`/api/v1/filters/${editingFilter._id}`, data);
      } else {
        await axios.post('/api/v1/filters', data);
      }
      fetchFilters();
      reset();
      setEditingFilter(null);
    } catch (error) {
      console.error('Error saving filter:', error);
    }
  };

  const deleteFilter = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this filter?')) {
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

  return (
    <div className='h-full min-h-max bg-gray-100 py-8'>
      <div className='container mx-auto px-4'>
        <h1 className='mb-8 text-2xl font-bold text-gray-800'>
          Filter Management
        </h1>

        <div className='grid gap-8 lg:grid-cols-3'>
          <div className='col-span-1 rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-lg font-semibold'>
              {editingFilter ? 'Edit Filter' : 'Add New Filter'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <input
                {...register('brand')}
                placeholder='Brand'
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <input
                {...register('model')}
                placeholder='Model'
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <input
                {...register('serial')}
                placeholder='Serial'
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <select
                {...register('status')}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='active'>Active</option>
                <option value='inactive'>Inactive</option>
              </select>
              <button
                type='submit'
                className='w-full rounded-md bg-blue-500 py-2 px-4 text-white transition duration-300 hover:bg-blue-600'
              >
                {editingFilter ? 'Update Filter' : 'Add Filter'}
              </button>
            </form>
          </div>

          <div className='col-span-2 overflow-x-auto rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-lg font-semibold'>Filter List</h2>
            <table className='w-full'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='px-4 py-2 text-left'>Brand</th>
                  <th className='px-4 py-2 text-left'>Model</th>
                  <th className='px-4 py-2 text-left'>Serial</th>
                  <th className='px-4 py-2 text-left'>Status</th>
                  <th className='px-4 py-2 text-left'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filters.map((filter) => (
                  <tr key={filter._id} className='border-b'>
                    <td className='px-4 py-2'>{filter.brand}</td>
                    <td className='px-4 py-2'>{filter.model}</td>
                    <td className='px-4 py-2'>{filter.serial}</td>
                    <td className='px-4 py-2'>{filter.status}</td>
                    <td className='px-4 py-2'>
                      <button
                        onClick={() => editFilter(filter)}
                        className='mr-2 rounded-md bg-yellow-500 px-2 py-1 text-white transition duration-300 hover:bg-yellow-600'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteFilter(filter._id)}
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

export default FilterCRUD;
