/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

interface ProfileForm {
  firstName: string;
  lastName: string;
  ci: string;
  profession: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>();

  const newPassword = watch('newPassword');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get('/api/auth/user');
        const userId = userResponse.data.id;

        if (!userId) {
          toast.error('Error: No se pudo obtener el ID del usuario');
          return;
        }

        const detailedUserResponse = await axios.get(`/api/v1/users/${userId}`);
        const userData = detailedUserResponse.data.user;

        setUser(userData);
        reset({
          firstName: userData.firstName,
          lastName: userData.lastName,
          ci: userData.ci,
          profession: userData.profession,
          phone: userData.phone,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error al cargar los datos del usuario');
      }
    };
    fetchUserData();
  }, [reset]);

  const onSubmit = async (data: ProfileForm) => {
    try {
      if (isChangingPassword) {
        if (data.newPassword !== data.confirmPassword) {
          alert('Las contraseñas nuevas no coinciden');
          return;
        }

        await axios
          .put(`/api/v1/users/${user._id}/password`, {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          })
          .then(() => {
            toast.success('Contraseña actualizada exitosamente');
            setIsChangingPassword(false);
          })
          .catch((error) => {
            toast.error(error.response?.data?.message);
          });
      } else {
        await axios
          .put(`/api/v1/users/${user._id}`, {
            firstName: data.firstName,
            lastName: data.lastName,
            ci: data.ci,
            profession: data.profession,
            phone: data.phone,
          })
          .then((response) => {
            setUser(response.data.user);
            toast.success('Perfil actualizado exitosamente');
          })
          .catch((error) => {
            toast.error(
              error.response?.data?.message || 'Error al actualizar el perfil'
            );
          });
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al actualizar el perfil'
      );
    }
  };

  if (!user) {
    return <div>Cargando...</div>;
  }

  if (!user?._id) {
    toast.error('Error: No se pudo cargar el ID del usuario');
    return <div>Error al cargar el perfil</div>;
  }

  return (
    <div className='flex min-h-[84vh] items-center justify-center bg-gray-100 py-8'>
      <div className='w-full max-w-md rounded-lg bg-white p-8 shadow-md'>
        <h1 className='mb-6 text-2xl font-bold text-gray-800'>Mi Perfil</h1>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {!isChangingPassword ? (
            <>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Nombre
                </label>
                <input
                  {...register('firstName', { required: 'Campo requerido' })}
                  className='mt-1 w-full rounded-md border border-gray-300 p-2'
                />
                {errors.firstName && (
                  <span className='text-sm text-red-500'>
                    {errors.firstName.message}
                  </span>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Apellido
                </label>
                <input
                  {...register('lastName', { required: 'Campo requerido' })}
                  className='mt-1 w-full rounded-md border border-gray-300 p-2'
                />
                {errors.lastName && (
                  <span className='text-sm text-red-500'>
                    {errors.lastName.message}
                  </span>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Cédula de Identidad
                </label>
                <input
                  {...register('ci', { required: 'Campo requerido' })}
                  className='mt-1 w-full rounded-md border border-gray-300 p-2'
                />
                {errors.ci && (
                  <span className='text-sm text-red-500'>
                    {errors.ci.message}
                  </span>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Profesión
                </label>
                <input
                  {...register('profession', { required: 'Campo requerido' })}
                  className='mt-1 w-full rounded-md border border-gray-300 p-2'
                />
                {errors.profession && (
                  <span className='text-sm text-red-500'>
                    {errors.profession.message}
                  </span>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Teléfono
                </label>
                <input
                  {...register('phone', { required: 'Campo requerido' })}
                  className='mt-1 w-full rounded-md border border-gray-300 p-2'
                />
                {errors.phone && (
                  <span className='text-sm text-red-500'>
                    {errors.phone.message}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Contraseña Actual
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('currentPassword', {
                    required: 'Campo requerido',
                  })}
                  className='mt-1 w-full rounded-md border border-gray-300 p-2'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Nueva Contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('newPassword', {
                    required: 'Campo requerido',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres',
                    },
                  })}
                  className='mt-1 w-full rounded-md border border-gray-300 p-2'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Campo requerido',
                    validate: (value) =>
                      value === newPassword || 'Las contraseñas no coinciden',
                  })}
                  className='mt-1 w-full rounded-md border border-gray-300 p-2'
                />
              </div>

              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='showPassword'
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className='mr-2'
                />
                <label htmlFor='showPassword' className='text-sm text-gray-600'>
                  Mostrar contraseña
                </label>
              </div>
            </>
          )}

          <div className='flex justify-between'>
            <button
              type='button'
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className='rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600'
            >
              {isChangingPassword
                ? 'Volver a Editar Perfil'
                : 'Cambiar Contraseña'}
            </button>
            <button
              type='submit'
              className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
