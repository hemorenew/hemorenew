import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/auth/auth', { user, password });
      if (response.data.id) {
        router.push('/');
      }
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex h-full min-h-screen items-center justify-center bg-gray-100'>
      <div className='w-full max-w-md rounded-lg bg-white px-8 py-6 shadow-2xl'>
        <h3 className='mb-2 text-start text-2xl font-bold text-gray-800'>
          Iniciar Sesión
        </h3>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label
              className='block text-sm font-medium text-gray-700'
              htmlFor='user'
            >
              Correo electrónico
            </label>
            <input
              type='text'
              placeholder='Correo electrónico'
              className='mt-1 w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
            />
          </div>
          <div className='relative'>
            <label className='block text-sm font-medium text-gray-700'>
              Contraseña
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='Contraseña'
              className='mt-1 w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type='button'
              className='absolute right-3 top-9 text-gray-500 focus:outline-none'
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className='flex items-center justify-between'>
            <button
              className='rounded-lg bg-blue-600 px-6 py-2 text-white transition duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
            <Link
              href='/register'
              className='text-sm text-blue-600 hover:underline'
            >
              ¿No tienes una cuenta? Regístrate
            </Link>
          </div>
        </form>
        {error && (
          <p className='mt-4 text-center text-sm text-red-500'>{error}</p>
        )}
      </div>
    </div>
  );
};

export default Login;
