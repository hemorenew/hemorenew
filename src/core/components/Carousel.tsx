/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface CarouselItem {
  image: string;
  title: string;
  description: string;
  details: string;
}

interface CarouselProps {
  onStart: () => void;
  user: any;
}

const Carousel: React.FC<CarouselProps> = ({ onStart, user }) => {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const secondsAutoChangeImage = 10000;

  useEffect(() => {
    axios
      .get('/api/getImage/getCarouselImages')
      .then((response) => {
        const items = response.data.map((src: string, index: number) => {
          const slides = [
            {
              title: 'Sistema HemoRenew',
              description:
                'Reprocesamiento Automatizado de Filtros de Hemodiálisis',
              details:
                'Sistema avanzado para la limpieza y reutilización segura de filtros de diálisis. Optimizamos el proceso, protegemos al personal y reducimos costos manteniendo los más altos estándares de calidad.',
            },
            {
              title: 'Gestión Integral de Pacientes',
              description: 'Registro y Seguimiento Digital',
              details:
                'Permite el registro completo de pacientes en servicios de hemodiálisis, asignación de filtros nuevos y seguimiento digital de cada sesión de reprocesamiento, garantizando un control preciso y eficiente.',
            },
            {
              title: 'Monitoreo Avanzado',
              description: 'Control de Calidad y Seguridad',
              details:
                'Seguimiento detallado del volumen residual y test de integridad de cada filtro. Visualice el rendimiento histórico y tome decisiones informadas sobre la vida útil de los filtros.',
            },
            {
              title: 'Beneficios del Sistema',
              description: 'Optimización y Protección',
              details:
                'Reduce la exposición del personal a sustancias tóxicas como el ácido peracético. Estandariza el proceso de lavado para mantener la integridad funcional de los filtros y permite una reutilización segura y eficiente.',
            },
            {
              title: 'Eficiencia Económica',
              description: 'Reducción de Costos Operativos',
              details:
                'Optimice sus recursos con un sistema que permite la reutilización segura de filtros, reduciendo significativamente los costos operativos mientras mantiene los más altos estándares de calidad y seguridad.',
            },
          ];
          return {
            image: src,
            ...slides[index % slides.length],
          };
        });
        items.forEach((item: any) => {
          const img = new Image();
          img.src = item.image;
        });
        setCarouselItems(items);
      })
      .catch((error) => console.error('Error loading carousel images:', error));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) =>
        prev === carouselItems.length - 1 ? 0 : prev + 1
      );
    }, secondsAutoChangeImage);

    return () => clearInterval(timer);
  }, [carouselItems.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === carouselItems.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? carouselItems.length - 1 : prev - 1
    );
  };

  return (
    <div className='relative min-h-[84vh]'>
      <div className='absolute inset-0 z-0 h-[84vh] w-full'>
        <div className='relative h-full w-full'>
          {carouselItems.length > 0 && (
            <>
              <img
                src={carouselItems[currentImageIndex].image}
                alt={`Slide ${currentImageIndex + 1}`}
                className='h-full w-full object-cover'
              />
              <div className='absolute inset-0 flex flex-col justify-center bg-black/60'>
                <div className='flex h-full flex-col items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24'>
                  <h1 className='mb-4 text-center text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl'>
                    {carouselItems[currentImageIndex].title}
                  </h1>
                  <h2 className='mb-6 text-center text-lg text-white/90 sm:text-xl md:text-2xl lg:text-3xl'>
                    {carouselItems[currentImageIndex].description}
                  </h2>
                  <p className='mb-8 max-w-3xl text-center text-sm text-white/80 sm:text-base md:text-lg lg:text-xl'>
                    {carouselItems[currentImageIndex].details}
                  </p>
                  {user.profession !== 'admin' ? (
                    <button
                      onClick={onStart}
                      className='mt-4 rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition hover:bg-blue-700'
                    >
                      Empezar
                    </button>
                  ) : (
                    <div className='flex gap-4'>
                      <button
                        onClick={() => (window.location.href = '/user')}
                        className='mt-4 rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition hover:bg-blue-700'
                      >
                        Gestión de usuarios
                      </button>
                      <button
                        onClick={() => (window.location.href = '/history')}
                        className='mt-4 rounded-lg bg-green-600 px-8 py-3 text-lg font-semibold text-white transition hover:bg-green-700'
                      >
                        Ver Historial
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          <button
            onClick={prevImage}
            className='absolute left-4 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-2 text-white hover:bg-black/75'
          >
            <FaArrowLeft className='h-6 w-6' />
          </button>
          <button
            onClick={nextImage}
            className='absolute right-4 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-2 text-white hover:bg-black/75'
          >
            <FaArrowRight className='h-6 w-6' />
          </button>
          <div className='absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2'>
            {carouselItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 w-2 rounded-full ${
                  currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carousel;
