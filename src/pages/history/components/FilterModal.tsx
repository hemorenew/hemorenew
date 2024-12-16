/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Line } from 'react-chartjs-2';

interface FilterModalProps {
  filter: {
    brand: string;
    model: string;
    firstUse: Date;
    status: string;
  };
  count: number;
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
  functionalCapacityData?: {
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

const FilterModal: React.FC<FilterModalProps> = ({
  onClose,
  data,
  functionalCapacityData,
}) => {
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

  const calculatePercentages = (values: number[]) => {
    if (!values.length) return Array(10).fill(0);
    const firstValue = values[0];
    const percentages = Array(10).fill(0);
    values.forEach((value, index) => {
      percentages[index] = (value / firstValue) * 100;
    });
    return percentages;
  };

  const capacityChartData = {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    datasets: [
      {
        label: 'Capacidad funcional (TCV)',
        data: calculatePercentages(
          functionalCapacityData?.datasets[0]?.data || [100, 90, 80]
        ),
        borderColor: '#FFA500',
        backgroundColor: '#FFA500',
        tension: 0.1,
      },
      {
        label: 'Límite recomendado (80%)',
        data: Array(10).fill(80),
        borderColor: '#FF0000',
        backgroundColor: '#FF0000',
        borderDash: [5, 5],
        tension: 0,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: true,
        ticks: {
          font: { size: 12 },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 12 },
        },
      },
    },
  };

  const capacityOptions = {
    ...commonOptions,
    scales: {
      ...commonOptions.scales,
      y: {
        ...commonOptions.scales.y,
        max: 110,
        title: {
          display: true,
          text: 'Capacidad funcional del filtro (%)',
        },
      },
      x: {
        ...commonOptions.scales.x,
        title: {
          display: true,
          text: 'Número de reutilizaciones',
        },
      },
    },
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-2 sm:p-4'>
      <div className='relative h-fit max-h-full w-full overflow-y-auto bg-white p-4 shadow-lg sm:rounded-lg sm:p-6 md:p-8 lg:h-auto lg:w-11/12'>
        <button
          className='absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white transition-colors duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 sm:top-4 sm:right-4'
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
        <h2 className='mb-4 text-start text-xl font-bold sm:text-2xl md:text-3xl'>
          Historial de uso del filtro
        </h2>
        <div className='grid sm:grid-cols-1'>
          <ChartCard
            title='Datos de uso'
            type='line'
            data={chartData}
            options={commonOptions}
          />
          {/* <ChartCard
            title='Capacidad funcional'
            type='line'
            data={capacityChartData}
            options={capacityOptions}
          /> */}
        </div>
      </div>
    </div>
  );
};

interface ChartCardProps {
  title: string;
  type: 'line';
  data: any;
  options: any;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, data, options }) => (
  <div className='rounded-lg bg-gray-50 shadow-md transition-all duration-300 hover:shadow-lg md:p-4'>
    <h3 className='mb-2 text-lg font-semibold text-gray-800'>{title}</h3>
    <div className='h-64 w-fit md:h-[260px] md:w-auto'>
      <Line options={options} data={data} />
    </div>
  </div>
);

export default FilterModal;
