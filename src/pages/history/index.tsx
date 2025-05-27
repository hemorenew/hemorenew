/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { useServerSideLogin } from 'core/hooks/permission/useServerSideLogin';
import withSession from 'core/lib/session';
import WashingModal from 'pages/history/components/WashingModal';
import React, { useEffect, useState } from 'react';

import FilterModal from './components/FilterModal';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  ci?: string;
}

interface Washing {
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    ci: string;
  };
  filter: {
    brand: string;
    model: string;
    status: string;
    firstUse: Date;
  };
  startDate: string;
  attended: {
    firstName: string;
    lastName: string;
  };
  residualVolume: any;
  integrityTest: any;
  temperature: any[];
  waterLevel: any[];
  bloodLeak: any[];
  flowRate: any[];
}

interface FilterUsage {
  filter: {
    brand: string;
    model: string;
    firstUse: Date;
    status: string;
  };
  count: number;
}

const HistoryPage: React.FC = () => {
  const [allWashings, setAllWashings] = useState<Washing[]>([]);
  const [patientWashings, setPatientWashings] = useState<Washing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWashing, setSelectedWashing] = useState<Washing | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );
  const [filterStats, setFilterStats] = useState<FilterUsage[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [groupByFilter, setGroupByFilter] = useState(false);
  const [selectedFilterModal, setSelectedFilterModal] = useState<{
    filter: FilterUsage['filter'];
    count: number;
  } | null>(null);

  const [loadingStates, setLoadingStates] = useState({
    colors: false,
    flows: false,
    temperatures: false,
    ultrasounds: false,
  });

  const [loadingModal, setLoadingModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchAllWashings();
  }, []);

  useEffect(() => {
    const patients = extractPatientsFromWashings(allWashings);
    const filtered = patients.filter(
      (patient) =>
        patient.firstName
          .toLowerCase()
          .includes(patientSearchTerm.toLowerCase()) ||
        patient.lastName
          .toLowerCase()
          .includes(patientSearchTerm.toLowerCase()) ||
        (patient.ci?.toLowerCase().includes(patientSearchTerm.toLowerCase()) ??
          false)
    );
    setFilteredPatients(filtered);
  }, [patientSearchTerm, allWashings]);

  const fetchAllWashings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/washings');
      setAllWashings(response.data);
    } catch (error) {
      console.error('Error fetching washings:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractPatientsFromWashings = (washings: Washing[]): Patient[] => {
    const patientMap = new Map<string, Patient>();
    washings.forEach((washing) => {
      if (!patientMap.has(washing.patient._id)) {
        patientMap.set(washing.patient._id, {
          _id: washing.patient._id,
          firstName: washing.patient.firstName,
          lastName: washing.patient.lastName,
          ci: washing.patient.ci,
        });
      }
    });
    return Array.from(patientMap.values());
  };

  const calculateFilterStats = (washings: Washing[]): FilterUsage[] => {
    const filterMap = new Map<string, FilterUsage>();

    washings
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
      .forEach((washing) => {
        const key = `${washing.filter.brand}-${washing.filter.model}`;
        const existing = filterMap.get(key);

        if (existing) {
          existing.count += 1;
        } else {
          filterMap.set(key, {
            filter: {
              ...washing.filter,
              firstUse: new Date(washing.startDate),
              status: washing.filter.status || 'En uso',
            },
            count: 1,
          });
        }
      });

    return Array.from(filterMap.values());
  };

  const handlePatientClick = async (patientId: string) => {
    try {
      setLoading(true);
      setSelectedPatientId(patientId);
      const response = await axios.get(
        `/api/v1/washings?patientId=${patientId}`
      );
      setPatientWashings(response.data);
      setFilterStats(calculateFilterStats(response.data));
      setSelectedPatient(
        filteredPatients.find((p) => p._id === patientId) || null
      );
    } catch (error) {
      console.error('Error fetching patient washings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-UY', { timeZone: 'UTC' });
  };

  // Add retry utility function before the component
  const retryApiCall = async (
    url: string,
    maxRetries = 3,
    delay = 1000
  ): Promise<any> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.get(url, {
          timeout: 10000, // 10 second timeout
        });
        return response;
      } catch (error) {
        console.warn(`Attempt ${attempt} failed for ${url}:`, error);

        if (attempt === maxRetries) {
          throw error;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  };

  const handleWashingClick = async (washing: Washing) => {
    setLoadingModal(true);
    setCancelLoading(false);
    setLoadingStates({
      colors: true,
      flows: true,
      temperatures: true,
      ultrasounds: true,
    });

    try {
      const startDate = washing.startDate;
      const params = new URLSearchParams({ startDate });

      const fetchDataWithRetry = async (
        endpoint: string,
        type: keyof typeof loadingStates
      ) => {
        try {
          // Check if loading was cancelled
          if (cancelLoading) {
            throw new Error('Loading cancelled by user');
          }

          const response = await retryApiCall(`/api/v1/${endpoint}?${params}`);
          setLoadingStates((prev) => ({ ...prev, [type]: false }));
          return response;
        } catch (error) {
          console.error(`Failed to fetch ${type} after retries:`, error);
          setLoadingStates((prev) => ({ ...prev, [type]: false }));
          // Return empty data instead of null to prevent crashes
          return { data: [] };
        }
      };

      // Sequential calls with individual error handling
      const results = await Promise.allSettled([
        fetchDataWithRetry('colors', 'colors'),
        fetchDataWithRetry('flows', 'flows'),
        fetchDataWithRetry('temperatures', 'temperatures'),
        fetchDataWithRetry('ultrasounds', 'ultrasounds'),
      ]);

      // Check if loading was cancelled before proceeding
      if (cancelLoading) {
        return;
      }

      // Extract data from settled promises
      const [colorsResult, flowsResult, temperaturesResult, ultrasoundsResult] =
        results;

      const colors =
        colorsResult.status === 'fulfilled' ? colorsResult.value : { data: [] };
      const flows =
        flowsResult.status === 'fulfilled' ? flowsResult.value : { data: [] };
      const temperatures =
        temperaturesResult.status === 'fulfilled'
          ? temperaturesResult.value
          : { data: [] };
      const ultrasounds =
        ultrasoundsResult.status === 'fulfilled'
          ? ultrasoundsResult.value
          : { data: [] };

      // Check if any critical data failed to load
      const failedRequests = results.filter(
        (result) => result.status === 'rejected'
      ).length;

      if (failedRequests > 0) {
        console.warn(
          `${failedRequests} requests failed, but proceeding with available data`
        );
      }

      setIsModalOpen(true);
      setSelectedWashing({
        ...washing,
        temperature: temperatures.data || [],
        waterLevel: ultrasounds.data || [],
        bloodLeak: colors.data || [],
        flowRate: flows.data || [],
      });
    } catch (error) {
      if (!cancelLoading) {
        console.error('Critical error fetching sensor data:', error);
        // Show error message to user
        alert(
          'Error al cargar los datos del lavado. Por favor, intente nuevamente.'
        );
      }
    } finally {
      setLoadingModal(false);
      setCancelLoading(false);
      // Reset all loading states
      setLoadingStates({
        colors: false,
        flows: false,
        temperatures: false,
        ultrasounds: false,
      });
    }
  };

  const handleCancelLoading = () => {
    setCancelLoading(true);
    setLoadingModal(false);
  };

  const getSortedWashings = () => {
    const sorted = [...patientWashings];

    if (groupByFilter) {
      const grouped = sorted.reduce((acc, washing) => {
        const key = `${washing.filter.brand} - ${washing.filter.model}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(washing);
        return acc;
      }, {} as Record<string, Washing[]>);

      // Sort each group internally by date
      Object.keys(grouped).forEach((key) => {
        grouped[key].sort((a, b) => {
          const comparison =
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
          return sortOrder === 'desc' ? comparison : -comparison;
        });
      });

      return grouped;
    } else {
      // Simple date sort
      return sorted.sort((a, b) => {
        const comparison =
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        return sortOrder === 'desc' ? comparison : -comparison;
      });
    }
  };

  const handleFilterClick = (filter: FilterUsage) => {
    setSelectedFilterModal(filter);
  };

  const getFilterWashingData = (filterId: string) => {
    const washings = patientWashings
      .filter((w) => `${w.filter.brand}-${w.filter.model}` === `${filterId}`)
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

    return {
      labels: washings.map((w) => formatDate(w.startDate)),
      datasets: [
        {
          label: 'Volumen Residual (ml)',
          data: washings.map((w) => w.residualVolume),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.3,
        },
      ],
    };
  };

  return (
    <div className='flex min-h-[84vh] flex-col items-start justify-center bg-gray-50 p-8'>
      <h1 className='mb-8 text-start text-3xl font-bold text-gray-800'>
        Historial de Pacientes y Filtros
      </h1>

      <div className='flex flex-col gap-8 lg:flex-row lg:self-center'>
        <div className='h-fit rounded-lg bg-white p-6 shadow-md'>
          <h2 className='mb-4 text-xl font-semibold text-gray-700'>
            Pacientes
          </h2>
          <input
            type='text'
            placeholder='CI, nombre o apellido'
            value={patientSearchTerm}
            onChange={(e) => setPatientSearchTerm(e.target.value)}
            className='mb-4 w-full rounded-md border border-gray-300 p-2'
          />
          {loading ? (
            <div className='flex h-40 items-center justify-center'>
              <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900'></div>
            </div>
          ) : (
            <ul className='max-h-96 space-y-2 overflow-y-auto'>
              {filteredPatients.map((patient) => (
                <li
                  key={patient._id}
                  className={`cursor-pointer rounded-md p-3 transition-colors duration-200 ${
                    selectedPatientId === patient._id
                      ? 'bg-blue-100 text-blue-800'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handlePatientClick(patient._id)}
                >
                  {patient.firstName} {patient.lastName}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className='w-fit md:col-span-2'>
          <div className='w-fit rounded-lg bg-white p-6 shadow-md'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-gray-700'>
                Historial de Lavados
              </h2>
              <div className='flex gap-4'>
                <button
                  onClick={() =>
                    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
                  }
                  className='rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200'
                >
                  {sortOrder === 'desc' ? '↓ Fecha' : '↑ Fecha'}
                </button>
                <button
                  onClick={() => setGroupByFilter((prev) => !prev)}
                  className={`rounded px-3 py-1 text-sm ${
                    groupByFilter
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Agrupar por filtro
                </button>
              </div>
            </div>

            {loading ? (
              <div className='flex h-40 items-center justify-center'>
                <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900'></div>
              </div>
            ) : selectedPatient ? (
              <>
                <p className='mb-4 text-gray-600'>
                  Total de lavados de {selectedPatient.firstName}{' '}
                  {selectedPatient.lastName}: {patientWashings.length}
                </p>
                <ul className='max-h-96 space-y-4 overflow-y-auto'>
                  {groupByFilter
                    ? Object.entries(
                        getSortedWashings() as Record<string, Washing[]>
                      ).map(([filterName, washings]) => (
                        <li key={filterName} className='space-y-2'>
                          <h3 className='font-semibold text-gray-700'>
                            {filterName}
                          </h3>
                          {washings.map((washing) => (
                            <li
                              key={washing._id}
                              className=' rounded-lg bg-gray-100 p-4 shadow-sm hover:cursor-pointer hover:bg-gray-200'
                              onClick={() => handleWashingClick(washing)}
                            >
                              <p className='text-gray-800'>
                                <span className='font-semibold'>Fecha:</span>{' '}
                                {formatDate(washing.startDate)}
                              </p>
                              <p className='text-gray-800'>
                                <span className='font-semibold'>Filtro:</span>{' '}
                                {washing.filter.brand} - {washing.filter.model}
                              </p>
                              <p className='text-gray-800'>
                                <span className='font-semibold'>
                                  Atendido por:
                                </span>{' '}
                                {washing.attended
                                  ? `${washing.attended.firstName} ${washing.attended.lastName}`
                                  : 'No especificado'}
                              </p>
                              <p className='text-gray-800'>
                                <span className='font-semibold'>
                                  Volumen Residual:
                                </span>{' '}
                                {washing.residualVolume} ml
                              </p>
                              <p className='text-gray-800'>
                                <span className='font-semibold'>
                                  Test de Integridad:
                                </span>{' '}
                                {washing.integrityTest ?? false
                                  ? 'No se detecta ruptura'
                                  : 'Se detecta ruptura'}
                              </p>
                            </li>
                          ))}
                        </li>
                      ))
                    : (getSortedWashings() as Washing[]).map((washing) => (
                        <li
                          key={washing._id}
                          className=' rounded-lg bg-gray-100 p-4 shadow-sm hover:cursor-pointer hover:bg-gray-200'
                          onClick={() => handleWashingClick(washing)}
                        >
                          <p className='text-gray-800'>
                            <span className='font-semibold'>Fecha:</span>{' '}
                            {formatDate(washing.startDate)}
                          </p>
                          <p className='text-gray-800'>
                            <span className='font-semibold'>Filtro:</span>{' '}
                            {washing.filter.brand} - {washing.filter.model}
                          </p>
                          <p className='text-gray-800'>
                            <span className='font-semibold'>Atendido por:</span>{' '}
                            {washing.attended
                              ? `${washing.attended.firstName} ${washing.attended.lastName}`
                              : 'No especificado'}
                          </p>
                          <p className='text-gray-800'>
                            <span className='font-semibold'>
                              Volumen Residual:
                            </span>{' '}
                            {washing.residualVolume} ml
                          </p>
                          <p className='text-gray-800'>
                            <span className='font-semibold'>
                              Test de Integridad:
                            </span>{' '}
                            {washing.integrityTest === 1
                              ? 'No se detecta ruptura'
                              : washing.integrityTest === 2
                              ? 'Se detecta ruptura'
                              : 'Pendiente'}
                          </p>
                        </li>
                      ))}
                </ul>
              </>
            ) : (
              <p className='text-gray-600'>
                Seleccione un paciente para ver su historial
              </p>
            )}
          </div>
        </div>

        <div className='h-fit rounded-lg bg-white p-6 shadow-md'>
          <h2 className='mb-4 text-xl font-semibold text-gray-700'>
            Estadísticas de Filtros
          </h2>
          {loading ? (
            <div className='flex h-40 items-center justify-center'>
              <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900'></div>
            </div>
          ) : selectedPatient ? (
            <>
              <p className='mb-4 text-gray-600'>
                Filtros utilizados por {selectedPatient.firstName}{' '}
                {selectedPatient.lastName}
              </p>
              <ul className='max-h-96 space-y-4 overflow-y-auto'>
                {filterStats.map((stat, index) => (
                  <li
                    key={index}
                    className='rounded-lg bg-gray-100 p-4 shadow-sm hover:cursor-pointer hover:bg-gray-200'
                    onClick={() => handleFilterClick(stat)}
                  >
                    <p className='text-gray-800'>
                      <span className='font-semibold'>Filtro:</span>{' '}
                      {stat.filter.brand} - {stat.filter.model}
                    </p>
                    <p className='text-gray-800'>
                      <span className='font-semibold'>Primer uso:</span>{' '}
                      {formatDate(stat.filter.firstUse.toString())}
                    </p>
                    <p className='text-gray-800'>
                      <span className='font-semibold'>Estado:</span>{' '}
                      {stat.filter.status === 'test'
                        ? 'No pasó test de integridad'
                        : stat.filter.status === 'range'
                        ? 'Volumen residual fuera de rango'
                        : stat.filter.status === 'inactive'
                        ? 'No disponible'
                        : stat.filter.status === 'active'
                        ? 'Disponible'
                        : stat.filter.status}
                    </p>
                    <p className='text-gray-800'>
                      <span className='font-semibold'>Usos:</span> {stat.count}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className='text-gray-600'>
              Seleccione un paciente para ver estadísticas de filtros
            </p>
          )}
        </div>
      </div>

      {loadingModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl'>
            <h3 className='mb-4 text-lg font-semibold'>
              Cargando datos del lavado
            </h3>
            <div className='space-y-3'>
              <div
                className={`flex items-center gap-3 rounded p-2 ${
                  !loadingStates.colors
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-50'
                }`}
              >
                <div className='flex-shrink-0'>
                  {loadingStates.colors ? (
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'></div>
                  ) : (
                    <div className='flex h-4 w-4 items-center justify-center rounded-full bg-green-500'>
                      <span className='text-xs text-white'>✓</span>
                    </div>
                  )}
                </div>
                <span className='font-medium'>Datos de color</span>
              </div>

              <div
                className={`flex items-center gap-3 rounded p-2 ${
                  !loadingStates.flows
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-50'
                }`}
              >
                <div className='flex-shrink-0'>
                  {loadingStates.flows ? (
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'></div>
                  ) : (
                    <div className='flex h-4 w-4 items-center justify-center rounded-full bg-green-500'>
                      <span className='text-xs text-white'>✓</span>
                    </div>
                  )}
                </div>
                <span className='font-medium'>Datos de flujo</span>
              </div>

              <div
                className={`flex items-center gap-3 rounded p-2 ${
                  !loadingStates.temperatures
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-50'
                }`}
              >
                <div className='flex-shrink-0'>
                  {loadingStates.temperatures ? (
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'></div>
                  ) : (
                    <div className='flex h-4 w-4 items-center justify-center rounded-full bg-green-500'>
                      <span className='text-xs text-white'>✓</span>
                    </div>
                  )}
                </div>
                <span className='font-medium'>Datos de temperatura</span>
              </div>

              <div
                className={`flex items-center gap-3 rounded p-2 ${
                  !loadingStates.ultrasounds
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-50'
                }`}
              >
                <div className='flex-shrink-0'>
                  {loadingStates.ultrasounds ? (
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'></div>
                  ) : (
                    <div className='flex h-4 w-4 items-center justify-center rounded-full bg-green-500'>
                      <span className='text-xs text-white'>✓</span>
                    </div>
                  )}
                </div>
                <span className='font-medium'>Datos de ultrasonido</span>
              </div>
            </div>

            <div className='mt-4 text-center text-sm text-gray-500'>
              {Object.values(loadingStates).every((state) => !state)
                ? 'Completado - Abriendo modal...'
                : 'Reintentando automáticamente si es necesario...'}
            </div>

            <div className='mt-6 flex justify-center'>
              <button
                onClick={handleCancelLoading}
                className='rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
                disabled={Object.values(loadingStates).every((state) => !state)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <WashingModal
          washing={selectedWashing || {}}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedWashing(null);
          }}
          data={{
            temperature: selectedWashing?.temperature || [],
            waterLevel: selectedWashing?.waterLevel || [],
            bloodLeak: selectedWashing?.bloodLeak || [],
            flowRate: selectedWashing?.flowRate || [],
          }}
          loadingStates={loadingStates}
        />
      )}

      {selectedFilterModal && (
        <FilterModal
          filter={selectedFilterModal.filter}
          count={selectedFilterModal.count}
          onClose={() => setSelectedFilterModal(null)}
          data={getFilterWashingData(
            `${selectedFilterModal.filter.brand}-${selectedFilterModal.filter.model}`
          )}
        />
      )}
    </div>
  );
};

export const getServerSideProps = withSession(useServerSideLogin);

export default HistoryPage;
