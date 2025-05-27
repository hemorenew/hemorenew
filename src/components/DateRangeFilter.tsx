import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: string | null, endDate: string | null) => void;
  startDate: string | null;
  endDate: string | null;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  onDateRangeChange,
  startDate,
  endDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStartDateChange = (date: string) => {
    onDateRangeChange(date, endDate);
  };

  const handleEndDateChange = (date: string) => {
    onDateRangeChange(startDate, date);
  };

  const clearFilters = () => {
    onDateRangeChange(null, null);
    setIsOpen(false);
  };

  const hasActiveFilters = startDate || endDate;

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
          hasActiveFilters
            ? 'border-blue-200 bg-blue-50 text-blue-700'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <CalendarIcon className='h-4 w-4' />
        <span className='hidden sm:inline'>Filtrar por fecha</span>
        <span className='sm:hidden'>Fecha</span>
        {hasActiveFilters && (
          <span className='rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800'>
            Activo
          </span>
        )}
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 z-10 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg'>
          <div className='p-4'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-sm font-medium text-gray-900'>
                Filtrar por rango de fechas
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <XMarkIcon className='h-4 w-4' />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  Fecha de inicio
                </label>
                <input
                  type='datetime-local'
                  value={startDate || ''}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  Fecha de fin
                </label>
                <input
                  type='datetime-local'
                  value={endDate || ''}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div className='flex gap-2 pt-2'>
                <button
                  onClick={clearFilters}
                  className='flex-1 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200'
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className='flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700'
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
