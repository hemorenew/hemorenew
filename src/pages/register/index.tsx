/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

export const professions = [
  'Médico General',
  'Médico Nefrologista',
  'Lic. Enfermero',
  'Técnico',
];

interface RegisterUser {
  firstName: string;
  lastName: string;
  ci: string;
  profession: string;
  phone: string;
  user: string;
  password: string;
}

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterUser & { confirmPassword: string }>();
  const router = useRouter();

  const onSubmit = async (data: RegisterUser & { confirmPassword: string }) => {
    if (data.password !== data.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    setIsSubmitting(true);
    try {
      const userData = { ...data };
      await axios.post('/api/v1/users', userData);
      alert(`Usuario registrado exitosamente`);
      router.push('/login');
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      setError(error.response.data.field);
    } finally {
      setIsSubmitting(false);
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
            <div>
              <input
                {...register('firstName', {
                  required: 'Este campo es requerido',
                  pattern: {
                    value: /^[a-zA-Z\s]+$/,
                    message: 'Solo se permiten letras y espacios',
                  },
                })}
                type='text'
                placeholder='Nombre'
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              {errors.firstName?.type === 'pattern' && (
                <p className='mt-1 text-sm text-red-500'>
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <input
                {...register('lastName', {
                  required: 'Este campo es requerido',
                  pattern: {
                    value: /^[a-zA-Z\s]+$/,
                    message: 'Solo se permiten letras y espacios',
                  },
                })}
                type='text'
                placeholder='Apellido'
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              {errors.lastName?.type === 'pattern' && (
                <p className='mt-1 text-sm text-red-500'>
                  {errors.lastName.message}
                </p>
              )}
            </div>
            <div>
              <input
                {...register('ci', {
                  required: 'Este campo es requerido',
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'Solo se permiten números',
                  },
                })}
                type='number'
                placeholder='Cédula de Identidad'
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              {error === 'ci' && (
                <p className='mt-1 text-sm text-red-500'>
                  Cédula de Identidad ya registrada
                </p>
              )}
            </div>
            <div>
              <select
                {...register('profession', {
                  required: 'Debe seleccionar una profesión',
                })}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Seleccione una profesión</option>
                {professions.map((profession) => (
                  <option key={profession} value={profession}>
                    {profession}
                  </option>
                ))}
              </select>
              {errors.profession && (
                <p className='mt-1 text-sm text-red-500'>
                  {errors.profession.message}
                </p>
              )}
            </div>
            <div>
              <input
                {...register('phone', {
                  required: 'Este campo es requerido',
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'Solo se permiten números',
                  },
                })}
                type='tel'
                placeholder='Teléfono'
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              {error === 'phone' && (
                <p className='mt-1 text-sm text-red-500'>
                  Teléfono ya registrado
                </p>
              )}
            </div>
            <input
              {...register('user', {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Formato de correo electrónico inválido',
                },
              })}
              type='email'
              placeholder='Correo Electrónico'
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
            {error === 'user' && (
              <p className='mt-1 text-sm text-red-500'>
                Correo Electrónico ya registrado
              </p>
            )}
            <input
              {...register('password', {
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres',
                },
              })}
              type={showPassword ? 'text' : 'password'}
              placeholder='Contraseña'
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
            <input
              {...register('confirmPassword', {
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres',
                },
              })}
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
              className='w-full rounded-md bg-blue-500 py-2 px-4 text-white transition duration-300 hover:bg-blue-600 disabled:opacity-50'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registrando...' : 'Registrarse'}
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
