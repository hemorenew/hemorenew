import axios from 'axios';
import { useServerSidePermission } from 'core/hooks/permission/useServerSidePermission';
import withSession from 'core/lib/session';
import React, { useEffect, useState } from 'react';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profession: string;
  status: string;
}

const UserCRUD: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

  const toggleUserStatus = async (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleStatusChange = async () => {
    if (!selectedUser) return;

    try {
      const newStatus =
        selectedUser.status === 'active' ? 'inactive' : 'active';
      await axios.put(`/api/v1/users/${selectedUser._id}`, {
        ...selectedUser,
        status: newStatus,
      });
      fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 py-8'>
      <div className='container mx-auto px-4'>
        <h1 className='mb-8 text-2xl font-bold text-gray-800'>
          Estado de Usuarios
        </h1>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {users.map((user) => (
            <div key={user._id} className='rounded-lg bg-white p-6 shadow-md'>
              <div className='flex flex-col items-center'>
                <div className='flex h-20 w-20 items-center justify-center rounded-full bg-gray-200'>
                  <span className='text-2xl font-bold text-gray-600'>
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                  </span>
                </div>
                <h3 className='mt-4 text-center text-lg font-semibold'>
                  {user.firstName} {user.lastName}
                </h3>
                <p className='text-gray-600'>{user.profession}</p>
                <button
                  onClick={() => toggleUserStatus(user)}
                  className={`mt-4 w-full rounded-md px-4 py-2 text-white transition ${
                    user.status === 'active'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {user.status === 'active' ? 'Activo' : 'Inactivo'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && selectedUser && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='rounded-lg bg-white p-8'>
            <h3 className='mb-4 text-lg font-semibold'>
              {selectedUser.status === 'active'
                ? '¿Desea dar de baja al usuario?'
                : '¿Desea dar de alta al usuario?'}
            </h3>
            <div className='flex justify-end gap-4'>
              <button
                onClick={() => setIsModalOpen(false)}
                className='rounded-md bg-gray-500 px-4 py-2 text-white transition hover:bg-gray-600'
              >
                Cancelar
              </button>
              <button
                onClick={handleStatusChange}
                className='rounded-md bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600'
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

export const getServerSideProps = withSession(useServerSidePermission);

export default UserCRUD;
