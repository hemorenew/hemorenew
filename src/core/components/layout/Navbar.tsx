/* eslint-disable @next/next/no-img-element */
import axios from 'axios';
import Link from 'next/link';
import router from 'next/router';
import React, { useEffect, useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const [profession, setProfession] = useState('');

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');

      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    axios
      .get('/api/auth/user')
      .then((response) => {
        setProfession(response.data.profession);
      })
      .catch((error) => console.error('Error fetching user data:', error));
  }, []);

  return (
    <nav className=' bg-gray-800'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          <div className='flex items-center'>
            <div
              className='flex items-center gap-2 hover:cursor-pointer'
              onClick={() => router.push('/')}
            >
              <div className='rounded-full bg-white p-1'>
                <img
                  src='/icons/icon-256x256.png'
                  alt='HemoRenew'
                  className='h-8 w-8'
                />
              </div>
              <Link href='/' className='text-xl font-bold text-white'>
                HemoRenew
              </Link>
            </div>
          </div>
          <div className='hidden md:block'>
            <div className='ml-10 flex items-baseline space-x-4'>
              {profession === 'admin' && (
                <>
                  <NavLink href='/user'>Gestión Usuarios</NavLink>
                  <NavLink href='/history'>Historial</NavLink>
                </>
              )}
              {profession !== 'admin' && (
                <>
                  <NavLink href='/patient'>Paciente</NavLink>
                  <NavLink href='/filter'>Filtro</NavLink>
                  <NavLink href='/washing'>Lavado</NavLink>
                  <NavLink href='/history'>Historial</NavLink>
                </>
              )}
              <NavLink href='/profile'>Perfil</NavLink>
              <NavLink href='/login' onClick={handleLogout}>
                Cerrar Sesión
              </NavLink>
            </div>
          </div>
          <div className='flex md:hidden'>
            <button
              onClick={toggleMenu}
              className='inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'
            >
              <span className='sr-only'>Open main menu</span>
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className='md:hidden'>
          <div className='space-y-1 px-2 pb-3 pt-2 sm:px-3'>
            {profession === 'admin' && (
              <>
                <NavLink href='/user' mobile>
                  Gestión Usuarios
                </NavLink>
                <NavLink href='/history' mobile>
                  Historial
                </NavLink>
              </>
            )}
            {profession !== 'admin' && (
              <>
                <NavLink href='/patient' mobile>
                  Paciente
                </NavLink>
                <NavLink href='/filter' mobile>
                  Filtro
                </NavLink>
                <NavLink href='/washing' mobile>
                  Lavado
                </NavLink>
                <NavLink href='/history' mobile>
                  Historial
                </NavLink>
              </>
            )}
            <NavLink href='/profile' mobile>
              Perfil
            </NavLink>
            <NavLink href='/login' mobile onClick={handleLogout}>
              Cerrar Sesión
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink: React.FC<{
  href: string;
  children: React.ReactNode;
  mobile?: boolean;
  onClick?: () => void;
}> = ({ href, children, mobile, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    className={`${
      mobile
        ? 'block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
        : 'rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
    }`}
  >
    {children}
  </Link>
);

export default Navbar;
