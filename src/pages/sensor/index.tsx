/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

import DateRangeFilter from '../../components/DateRangeFilter';
import { useSensorData } from '../../hooks/useSensorData';

interface SensorData {
  _id: string;
  value: number | string;
  createdAt: string;
}

const SensorVisorPage = () => {
  const [activeTab, setActiveTab] = useState('colors');
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({
    colors: 1,
    flows: 1,
    temperatures: 1,
    ultrasounds: 1,
  });
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc' as 'asc' | 'desc',
  });
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const { sensorData, pagination, loading, error, fetchSensorData } =
    useSensorData();

  const tabs = [
    { id: 'colors', name: 'Colores', icon: '🎨' },
    { id: 'flows', name: 'Flujos', icon: '💧' },
    { id: 'temperatures', name: 'Temperaturas', icon: '🌡️' },
    { id: 'ultrasounds', name: 'Ultrasonidos', icon: '📡' },
  ];

  useEffect(() => {
    fetchSensorData(activeTab, {
      page: currentPage[activeTab],
      limit: itemsPerPage,
      sortBy: sortConfig.key,
      sortOrder: sortConfig.direction,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
  }, [
    activeTab,
    currentPage,
    itemsPerPage,
    sortConfig,
    dateRange,
    fetchSensorData,
  ]);

  const handlePageChange = (sensorType: string, newPage: number) => {
    setCurrentPage((prev) => ({
      ...prev,
      [sensorType]: newPage,
    }));
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage((prev) => ({
      ...prev,
      [activeTab]: 1,
    }));
  };

  const handleDateRangeChange = (
    startDate: string | null,
    endDate: string | null
  ) => {
    setDateRange({ startDate, endDate });
    setCurrentPage((prev) => ({
      ...prev,
      [activeTab]: 1,
    }));
  };

  const renderPagination = (sensorType: string) => {
    const paginationInfo = pagination[sensorType];
    if (!paginationInfo) return null;

    const {
      currentPage: current,
      totalPages,
      hasPrevPage,
      hasNextPage,
    } = paginationInfo;

    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, current - delta);
        i <= Math.min(totalPages - 1, current + delta);
        i++
      ) {
        range.push(i);
      }

      if (current - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (current + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className='flex flex-col items-center justify-between gap-4 border-t border-gray-200 bg-white px-4 py-3 sm:flex-row'>
        <div className='flex items-center gap-2 text-sm text-gray-700'>
          <span>Mostrar</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className='rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>de {paginationInfo.totalItems} registros</span>
        </div>

        <div className='flex items-center gap-1'>
          <button
            onClick={() => handlePageChange(sensorType, current - 1)}
            disabled={!hasPrevPage}
            className='rounded-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <ChevronLeftIcon className='h-4 w-4' />
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() =>
                typeof page === 'number' && handlePageChange(sensorType, page)
              }
              disabled={page === '...'}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                page === current
                  ? 'bg-blue-600 text-white'
                  : page === '...'
                  ? 'cursor-default text-gray-400'
                  : 'border border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(sensorType, current + 1)}
            disabled={!hasNextPage}
            className='rounded-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <ChevronRightIcon className='h-4 w-4' />
          </button>
        </div>
      </div>
    );
  };

  const renderTable = (sensorType: string) => {
    const data = sensorData[sensorType] || [];
    const isLoading = loading[sensorType];
    const errorMessage = error[sensorType];

    if (isLoading) {
      return (
        <div className='flex h-64 items-center justify-center'>
          <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
        </div>
      );
    }

    if (errorMessage) {
      return (
        <div className='flex h-64 flex-col items-center justify-center text-red-500'>
          <div className='mb-4 text-4xl'>⚠️</div>
          <p className='text-lg font-medium'>Error al cargar los datos</p>
          <p className='text-sm'>{errorMessage}</p>
          <button
            onClick={() =>
              fetchSensorData(sensorType, {
                page: currentPage[sensorType],
                limit: itemsPerPage,
                sortBy: sortConfig.key,
                sortOrder: sortConfig.direction,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
              })
            }
            className='mt-4 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className='flex h-64 flex-col items-center justify-center text-gray-500'>
          <div className='mb-4 text-4xl'>📊</div>
          <p className='text-lg font-medium'>No hay datos disponibles</p>
          <p className='text-sm'>
            Los datos aparecerán aquí cuando estén disponibles
          </p>
        </div>
      );
    }

    return (
      <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6'>
                  Valor
                </th>
                <th
                  className='cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors hover:bg-gray-100 sm:px-6'
                  onClick={() => handleSort('createdAt')}
                >
                  <div className='flex items-center gap-1'>
                    Fecha de Creación
                    <span className='text-gray-400'>
                      {sortConfig.key === 'createdAt'
                        ? sortConfig.direction === 'asc'
                          ? '↑'
                          : '↓'
                        : '↕'}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {data.map((item: SensorData) => (
                <tr
                  key={item._id}
                  className='transition-colors hover:bg-gray-50'
                >
                  <td className='whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 sm:px-6'>
                    <div className='flex items-center gap-2'>
                      {item.value}
                      {sensorType === 'temperatures' && (
                        <span className='text-gray-500'>°C</span>
                      )}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-4 py-4 text-sm text-gray-500 sm:px-6'>
                    {new Date(item.createdAt).toLocaleString('es-ES', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {renderPagination(sensorType)}
      </div>
    );
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto max-w-7xl px-4 py-6'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='mb-2 text-2xl font-bold text-gray-900 sm:text-3xl'>
            Visualización de Datos de Sensores
          </h1>
          <p className='text-gray-600'>
            Monitorea y analiza los datos de tus sensores en tiempo real
          </p>
        </div>

        {/* Tabs */}
        <div className='mb-6'>
          <div className='border-b border-gray-200'>
            <nav className='-mb-px flex space-x-1 overflow-x-auto'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <span className='text-lg'>{tab.icon}</span>
                  <span className='hidden sm:inline'>{tab.name}</span>
                  <span className='sm:hidden'>{tab.name.split(' ')[0]}</span>
                  {pagination[tab.id] && (
                    <span className='ml-1 rounded-full bg-gray-100 py-1 px-2 text-xs text-gray-600'>
                      {pagination[tab.id].totalItems}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className='mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <DateRangeFilter
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateRangeChange={handleDateRangeChange}
          />

          {(dateRange.startDate || dateRange.endDate) && (
            <div className='text-sm text-gray-600'>
              {dateRange.startDate && dateRange.endDate ? (
                <>
                  Mostrando datos desde{' '}
                  <span className='font-medium'>
                    {new Date(dateRange.startDate).toLocaleDateString('es-ES')}
                  </span>{' '}
                  hasta{' '}
                  <span className='font-medium'>
                    {new Date(dateRange.endDate).toLocaleDateString('es-ES')}
                  </span>
                </>
              ) : dateRange.startDate ? (
                <>
                  Mostrando datos desde{' '}
                  <span className='font-medium'>
                    {new Date(dateRange.startDate).toLocaleDateString('es-ES')}
                  </span>
                </>
              ) : (
                <>
                  Mostrando datos hasta{' '}
                  <span className='font-medium'>
                    {new Date(dateRange.endDate!).toLocaleDateString('es-ES')}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className='mb-6'>{renderTable(activeTab)}</div>
      </div>
    </div>
  );
};

export default SensorVisorPage;
