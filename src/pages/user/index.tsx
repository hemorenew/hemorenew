import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  ci: string;
  profession: string;
  phone: string;
  user: string;
  password: string;
  status: string;
}

const UserCRUD: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<User>();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/v1/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const onSubmit = async (data: User) => {
    try {
      if (editingUser) {
        await axios.put(`/api/v1/users/${editingUser._id}`, data);
      } else {
        await axios.post('/api/v1/users', data);
      }
      fetchUsers();
      reset();
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const deleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/v1/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const editUser = (user: User) => {
    setEditingUser(user);
    Object.keys(user).forEach((key) => {
      setValue(key as keyof User, user[key as keyof User]);
    });
  };

  return (
    <div className='h-auto min-h-[83vh] bg-gray-100 py-8'>
      <div className='container mx-auto px-4'>
        <h1 className='mb-8 text-3xl font-bold text-gray-800'>
          User Management
        </h1>

        <div className='grid gap-8 md:grid-cols-2'>
          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-xl font-semibold'>
              {editingUser ? 'Edit User' : 'Create New User'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid gap-4 sm:grid-cols-2'>
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
                  {...register('profession')}
                  placeholder='Profession'
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <input
                  {...register('phone')}
                  placeholder='Phone'
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <input
                  {...register('user')}
                  placeholder='Username'
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <input
                  {...register('password')}
                  type='password'
                  placeholder='Password'
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <button
                type='submit'
                className='w-full rounded-md bg-blue-500 py-2 px-4 text-white transition duration-300 hover:bg-blue-600'
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
            </form>
          </div>

          <div className='overflow-x-auto rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-xl font-semibold'>User List</h2>
            <table className='w-full'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='px-4 py-2 text-left'>Name</th>
                  <th className='px-4 py-2 text-left'>CI</th>
                  <th className='px-4 py-2 text-left'>Profession</th>
                  <th className='px-4 py-2 text-left'>Phone</th>
                  <th className='px-4 py-2 text-left'>Username</th>
                  <th className='px-4 py-2 text-left'>Status</th>
                  <th className='px-4 py-2 text-left'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className='border-b'>
                    <td className='px-4 py-2'>{`${user.firstName} ${user.lastName}`}</td>
                    <td className='px-4 py-2'>{user.ci}</td>
                    <td className='px-4 py-2'>{user.profession}</td>
                    <td className='px-4 py-2'>{user.phone}</td>
                    <td className='px-4 py-2'>{user.user}</td>
                    <td className='px-4 py-2'>{user.status}</td>
                    <td className='px-4 py-2'>
                      <button
                        onClick={() => editUser(user)}
                        className='mr-2 rounded-md bg-yellow-500 px-2 py-1 text-white transition duration-300 hover:bg-yellow-600'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUser(user._id)}
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

export default UserCRUD;
