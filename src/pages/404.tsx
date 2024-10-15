import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className='flex h-screen items-center justify-center bg-gray-100'>
      <div className='text-center'>
        <h1 className='mb-4 text-6xl font-bold text-gray-800'>404</h1>
        <p className='mb-4 text-xl text-gray-600'>Oops! Page not found.</p>
        <Link
          href='/login'
          className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600'
        >
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}
