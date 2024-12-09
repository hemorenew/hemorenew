export const dynamic = 'force-dynamic';

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
  data: {
    temperature: { value: any; date: string }[];
    waterLevel: { value: any; date: string }[];
    bloodLeak: { value: any; date: string }[];
    flowRate: { value: any; date: string }[];
  };
  loadingStates?: {
    colors: boolean;
    flows: boolean;
    temperatures: boolean;
    ultrasounds: boolean;
  };
}

const WashingModal: React.FC<WashingModalProps> = ({
  onClose,
  data,
  loadingStates,
}) => {
  const safeData = {
    temperature: data?.temperature || [],
    waterLevel: data?.waterLevel || [],
    bloodLeak: data?.bloodLeak || [],
    flowRate: data?.flowRate || [],
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 4);
    return date.toLocaleString('es-UY', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const lastWaterLevel =
    safeData.waterLevel[safeData.waterLevel.length - 1]?.value || 0;
  const residualVolume = Math.PI * Math.pow(2, 2) * lastWaterLevel;

  const temperatureData = {
    labels: safeData.temperature.map((t) => formatDate(t.date)),
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: safeData.temperature.map((t) => t.value),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const waterLevelData = {
    labels: safeData.waterLevel.map((w) => formatDate(w.date)),
    datasets: [
      {
        label: `Nivel de Agua (cm) - Volumen Residual: ${residualVolume.toFixed(
          2
        )}ml`,
        data: safeData.waterLevel.map((w) => w.value),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  const hasBloodLeak = safeData.bloodLeak.some((b) => b.value === 'PURPURA');
  const pressureData = {
    labels: ['Sangre Detectada', 'Sangre No Detectada'],
    datasets: [
      {
        label: 'Estado',
        data: [hasBloodLeak ? 1 : 0, hasBloodLeak ? 0 : 1],
        backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const flowRateData = {
    labels: safeData.flowRate.map((f) => formatDate(f.date)),
    datasets: [
      {
        label: 'Flujo (ml/min)',
        data: safeData.flowRate.map((f) => f.value),
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
          text: 'Centímetros',
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
            isLoading={loadingStates?.temperatures}
          />
          <ChartCard
            title='Sensor de ultrasonido'
            type='bar'
            data={waterLevelData}
            options={barOptions}
            isLoading={loadingStates?.ultrasounds}
          />
          <ChartCard
            title='Sensor fuga de sangre'
            type='doughnut'
            data={pressureData}
            options={doughnutOptions}
            isLoading={loadingStates?.colors}
          />
          <ChartCard
            title='Sensor de flujo'
            type='line'
            data={flowRateData}
            options={lineOptions}
            isLoading={loadingStates?.flows}
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
  isLoading?: boolean;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  type,
  data,
  options,
  isLoading,
}) => (
  <div className='rounded-lg bg-gray-50 shadow-md transition-all duration-300 hover:shadow-lg md:p-4'>
    <h3 className='mb-2 text-lg font-semibold text-gray-800'>{title}</h3>
    <div className='h-64 w-fit md:h-[260px] md:w-auto'>
      {isLoading ? (
        <div className='flex h-full w-full items-center justify-center'>
          <div className='h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500'></div>
        </div>
      ) : (
        <>
          {type === 'line' && <Line options={options} data={data} />}
          {type === 'bar' && <Bar options={options} data={data} />}
          {type === 'doughnut' && <Doughnut options={options} data={data} />}
        </>
      )}
    </div>
  </div>
);

export default WashingModal;
