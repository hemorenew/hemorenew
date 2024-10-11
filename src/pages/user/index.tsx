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

  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm<
    User & { confirmPassword: string }
  >();

  // Add these lines to watch the password fields
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

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

  const generateUsername = (
    firstName: string,
    lastName: string,
    ci: string
  ) => {
    const initial = firstName.charAt(0).toLowerCase();
    const surname = lastName.split(' ')[0].toLowerCase();
    const ciLastFour = ci.slice(-4);
    return `${initial}${surname}${ciLastFour}`;
  };

  const onSubmit = async (data: User & { confirmPassword: string }) => {
    if (data.password !== data.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    try {
      const generatedUsername = generateUsername(
        data.firstName,
        data.lastName,
        data.ci
      );
      const userData = { ...data, user: generatedUsername };

      if (editingUser) {
        await axios.put(`/api/v1/users/${editingUser._id}`, userData);
      } else {
        await axios.post('/api/v1/users', userData);
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
      if (key !== 'password') {
        setValue(key as keyof User, user[key as keyof User]);
      }
    });
  };

  return (
    <div className='h-full min-h-max bg-gray-100 py-8'>
      <div className='container mx-auto px-4'>
        <h1 className='mb-8 text-2xl font-bold text-gray-800'>
          User Management
        </h1>

        <div className='grid gap-8 lg:grid-cols-3'>
          <div className='col-span-1 rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-lg font-semibold'>
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
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
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder='Password'
                value={password}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <input
                {...register('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                placeholder='Confirm Password'
                value={confirmPassword}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='showPassword'
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className='mr-2'
                />
                <label htmlFor='showPassword'>Show password</label>
              </div>
              <button
                type='submit'
                className='w-full rounded-md bg-blue-500 py-2 px-4 text-white transition duration-300 hover:bg-blue-600'
              >
                {editingUser ? 'Update User' : 'Add User'}
              </button>
            </form>
          </div>

          <div className='col-span-2 overflow-x-auto rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-lg font-semibold'>User List</h2>
            <table className='w-full'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='px-4 py-2 text-left'>Name</th>
                  <th className='px-4 py-2 text-left'>CI</th>
                  <th className='px-4 py-2 text-left'>Profession</th>
                  <th className='px-4 py-2 text-left'>Username</th>
                  <th className='px-4 py-2 text-left'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className='border-b'>
                    <td className='px-4 py-2'>{`${user.firstName} ${user.lastName}`}</td>
                    <td className='px-4 py-2'>{user.ci}</td>
                    <td className='px-4 py-2'>{user.profession}</td>
                    <td className='px-4 py-2'>{user.user}</td>
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
