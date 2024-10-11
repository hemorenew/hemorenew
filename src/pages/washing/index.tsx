/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface Washing {
  _id: string;
  patient: any;
  filter: any;
  startDate: string;
  status: string;
}

const WashingCRUD: React.FC = () => {
  const [washings, setWashings] = useState<Washing[]>([]);
  const [editingWashing, setEditingWashing] = useState<Washing | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [filters, setFilters] = useState<any[]>([]);

  const { register, handleSubmit, reset, setValue } = useForm<Washing>();

  useEffect(() => {
    fetchWashings();
    fetchPatients();
    fetchFilters();
  }, []);

  const fetchWashings = async () => {
    try {
      const response = await axios.get('/api/v1/washings');
      setWashings(response.data);
    } catch (error) {
      console.error('Error fetching washings:', error);
    }
  };

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
      setFilters(response.data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const onSubmit = async (data: Washing) => {
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

  const deleteWashing = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this washing?')) {
      try {
        await axios.delete(`/api/v1/washings/${id}`);
        fetchWashings();
      } catch (error) {
        console.error('Error deleting washing:', error);
      }
    }
  };

  const editWashing = (washing: Washing) => {
    setEditingWashing(washing);
    setValue('patient', washing.patient._id);
    setValue('filter', washing.filter._id);
    setValue('startDate', formatDateForInput(washing.startDate));
    setValue('status', washing.status);
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className='h-full min-h-max bg-gray-100 py-8'>
      <div className='container mx-auto px-4'>
        <h1 className='mb-8 text-2xl font-bold text-gray-800'>
          Washing Management
        </h1>

        <div className='grid gap-8 lg:grid-cols-3'>
          <div className='col-span-1 rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-lg font-semibold'>
              {editingWashing ? 'Edit Washing' : 'Add New Washing'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <select
                {...register('patient')}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Select Patient</option>
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
                <option value=''>Select Filter</option>
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
                {editingWashing ? 'Update Washing' : 'Add Washing'}
              </button>
            </form>
          </div>

          <div className='col-span-2 overflow-x-auto rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-lg font-semibold'>Washing List</h2>
            <table className='w-full'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='px-4 py-2 text-left'>Patient</th>
                  <th className='px-4 py-2 text-left'>Filter</th>
                  <th className='px-4 py-2 text-left'>Start Date</th>
                  <th className='px-4 py-2 text-left'>Status</th>
                  <th className='px-4 py-2 text-left'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {washings.map((washing) => (
                  <tr key={washing._id} className='border-b'>
                    <td className='px-4 py-2'>
                      {washing.patient.firstName} {washing.patient.lastName}
                    </td>
                    <td className='px-4 py-2'>
                      {washing.filter.brand} - {washing.filter.model}
                    </td>
                    <td className='px-4 py-2'>
                      {formatDateForDisplay(washing.startDate)}
                    </td>
                    <td className='px-4 py-2'>{washing.status}</td>
                    <td className='px-4 py-2'>
                      <button
                        onClick={() => editWashing(washing)}
                        className='mr-2 rounded-md bg-yellow-500 px-2 py-1 text-white transition duration-300 hover:bg-yellow-600'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteWashing(washing._id)}
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

export default WashingCRUD;
