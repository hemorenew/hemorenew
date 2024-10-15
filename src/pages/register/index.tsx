import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

export const professions = [
  'Médico General',
  'Médico Nefrologista',
  'Lic. Enfermero',
];

interface RegisterUser {
  firstName: string;
  lastName: string;
  ci: string;
  profession: string;
  phone: string;
  password: string;
}

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit } = useForm<
    RegisterUser & { confirmPassword: string }
  >();
  const router = useRouter();

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

  const onSubmit = async (data: RegisterUser & { confirmPassword: string }) => {
    if (data.password !== data.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const generatedUsername = generateUsername(
        data.firstName,
        data.lastName,
        data.ci
      );
      const userData = { ...data, user: generatedUsername };
      await axios.post('/api/v1/users', userData);
      alert(
        `Usuario registrado exitosamente. Tu usuario es: ${generatedUsername}`
      );
      router.push('/login');
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      alert('Error al registrar usuario');
    }
  };

  return (
    <div className='flex h-full min-h-screen items-center justify-center bg-gray-100 py-8'>
      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-md rounded-lg bg-white p-6 shadow-md'>
          <h1 className='mb-8 text-2xl font-bold text-gray-800'>
            Registro de Usuario
          </h1>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <input
              {...register('firstName')}
              placeholder='Nombre'
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
            <input
              {...register('lastName')}
              placeholder='Apellido'
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
            <input
              {...register('ci')}
              placeholder='Cédula de Identidad'
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
            <select
              {...register('profession')}
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            >
              <option value=''>Seleccione una profesión</option>
              {professions.map((profession) => (
                <option key={profession} value={profession}>
                  {profession}
                </option>
              ))}
            </select>
            <input
              {...register('phone')}
              placeholder='Teléfono'
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder='Contraseña'
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
            <input
              {...register('confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              placeholder='Confirmar Contraseña'
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
            <div className='flex items-center'>
              <input
                type='checkbox'
                id='showPassword'
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className='mr-2'
              />
              <label htmlFor='showPassword'>Mostrar contraseña</label>
            </div>
            <button
              type='submit'
              className='w-full rounded-md bg-blue-500 py-2 px-4 text-white transition duration-300 hover:bg-blue-600'
            >
              Registrarse
            </button>
          </form>
          <Link
            href='/login'
            className='mt-2 flex content-center justify-end text-sm text-gray-500'
          >
            ¿Ya tienes una cuenta? Inicia Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
