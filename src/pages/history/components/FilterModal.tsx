import React from 'react';
import { Line } from 'react-chartjs-2';

interface FilterModalProps {
  onClose: () => void;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension: number;
    }[];
  };
}

const FilterModal: React.FC<FilterModalProps> = ({ onClose, data }) => {
  const chartData = data || {
    labels: [],
    datasets: [
      {
        label: '',
        data: [],
        borderColor: '#000',
        backgroundColor: '#000',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2'>
      <div className='w-full rounded-lg bg-white p-3 shadow-xl sm:p-6 md:w-[90vw]'>
        <div className='mb-2 flex items-center justify-between sm:mb-4'>
          <h2 className='text-lg font-bold sm:text-xl'>
            Historial usos del filtro
          </h2>
          <button
            className='rounded-full bg-red-500 p-2 text-white transition-colors duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400'
            onClick={onClose}
            aria-label='Cerrar'
          >
            <svg
              className='h-6 w-6 sm:h-8 sm:w-8'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='h-[60vh] sm:h-[70vh] md:h-[80vh]'>
          <Line
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  display: true,
                  ticks: {
                    font: {
                      size: 12,
                    },
                  },
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    font: {
                      size: 12,
                    },
                  },
                },
              },
            }}
            data={chartData}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
