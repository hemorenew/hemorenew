/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface WashingModalProps {
  washing: any;
  onClose: () => void;
}

const WashingModal: React.FC<WashingModalProps> = ({ onClose }) => {
  const generateLineData = (
    baseValue: number,
    variance: number,
    length: number
  ) => {
    return Array.from({ length }, (_, i) => {
      const change = (Math.random() - 0.5) * variance;
      return Math.max(0, baseValue + change * (i + 1));
    });
  };

  const labels = Array.from({ length: 20 }, (_, i) => `${i * 2}min`);

  const temperatureData = {
    labels,
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: generateLineData(20, 2, 20),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const waterLevelData = {
    labels,
    datasets: [
      {
        label: 'Nivel de Agua (L)',
        data: generateLineData(30, 5, 20),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  const pressureData = {
    labels: ['Sangre Detectada', 'Sangre No Detectada'],
    datasets: [
      {
        label: 'Presión',
        data: [1, 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const rpmData = {
    labels,
    datasets: [
      {
        label: 'Sensor de flujo',
        data: generateLineData(600, 200, 20),
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  const barOptions = {
    ...lineOptions,
    scales: {
      ...lineOptions.scales,
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Litros',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-2 sm:p-4'>
      <div className='relative h-full max-h-full w-full overflow-y-auto bg-white p-4 shadow-lg sm:rounded-lg sm:p-6 md:p-8 lg:h-auto lg:w-11/12'>
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
          Detalles del Lavado
        </h2>
        <div className='grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2'>
          <ChartCard
            title='Temperatura'
            type='line'
            data={temperatureData}
            options={lineOptions}
          />
          <ChartCard
            title='Nivel de Agua'
            type='bar'
            data={waterLevelData}
            options={barOptions}
          />
          <ChartCard
            title='Sensor fuga de sangre'
            type='doughnut'
            data={pressureData}
            options={doughnutOptions}
          />
          <ChartCard
            title='Sensor de flujo'
            type='line'
            data={rpmData}
            options={lineOptions}
          />
        </div>
      </div>
    </div>
  );
};

interface ChartCardProps {
  title: string;
  type: 'line' | 'bar' | 'doughnut';
  data: any;
  options: any;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  type,
  data,
  options,
}) => (
  <div className='rounded-lg bg-gray-50 shadow-md transition-all duration-300 hover:shadow-lg md:p-4'>
    <h3 className='mb-2 text-lg font-semibold text-gray-800'>{title}</h3>
    <div className='h-64 w-fit md:h-[260px] md:w-auto'>
      {type === 'line' && <Line options={options} data={data} />}
      {type === 'bar' && <Bar options={options} data={data} />}
      {type === 'doughnut' && <Doughnut options={options} data={data} />}
    </div>
  </div>
);

export default WashingModal;
