/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/user');
        if (isSubscribed && response.data.id) {
          router.push('/');
        }
      } catch (error) {
        if (isSubscribed) {
          console.log('Error al obtener el usuario:', error);
        }
      }
    };

    checkAuth();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/auth/auth', { user, password });
      if (response.data.id) {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex min-h-screen flex-col-reverse items-center justify-center gap-8 bg-gradient-to-br from-blue-50 to-white p-4 lg:flex-row lg:gap-12 xl:gap-24'>
      <div className='hidden w-full max-w-lg space-y-6 rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl lg:block lg:w-1/2'>
        <div className='space-y-4'>
          <img
            src='images/logo.png'
            alt='HemoRenew Logo'
            className='mx-auto h-16 w-auto'
          />
          <h1 className='text-center text-3xl font-bold text-gray-800'>
            Sistema HemoRenew
          </h1>
          <h2 className='text-center text-xl font-medium text-blue-600'>
            Reprocesamiento de Filtros
          </h2>
          <p className='text-center text-gray-600'>
            Sistema automatizado para la limpieza y desinfección segura de
            filtros de hemodiálisis.
          </p>
        </div>
      </div>

      {/* Login Form Section */}
      <div className='w-full max-w-md rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl sm:p-10'>
        <div className='mb-8 lg:hidden'>
          <img
            src='images/logo.png'
            alt='HemoRenew Logo'
            className='mx-auto h-12 w-auto'
          />
        </div>
        <h3 className='mb-6 text-center text-2xl font-bold text-gray-800 lg:text-start'>
          Iniciar Sesión
        </h3>
        <form onSubmit={handleSubmit} className='space-y-6' id='login-form'>
          <div>
            <label
              className='block text-sm font-medium text-gray-700'
              htmlFor='email'
            >
              Correo electrónico
            </label>
            <input
              type='email'
              name='email'
              id='email'
              autoComplete='username'
              placeholder='usuario@ejemplo.com'
              className='mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
            />
          </div>
          <div className='relative'>
            <label
              className='block text-sm font-medium text-gray-700'
              htmlFor='current-password'
            >
              Contraseña
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name='current-password'
              id='current-password'
              autoComplete='current-password'
              placeholder='••••••••'
              className='mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type='button'
              className='absolute right-3 top-[2.45rem] text-gray-500 transition-colors hover:text-gray-700 focus:outline-none'
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          <div className='flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between'>
            <button
              className='w-full rounded-lg bg-blue-600 px-6 py-2.5 text-white transition duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 sm:w-auto'
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className='flex items-center justify-center gap-2'>
                  <svg className='h-4 w-4 animate-spin' viewBox='0 0 24 24'>
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                      fill='none'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  Procesando...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
            <Link
              href='/register'
              className='text-center text-sm text-blue-600 transition-colors hover:text-blue-700 hover:underline sm:text-right'
            >
              ¿No tienes una cuenta? Regístrate
            </Link>
          </div>
        </form>
        {error && (
          <div className='mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-500'>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
