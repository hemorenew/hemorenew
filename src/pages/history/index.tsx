/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { useServerSideLogin } from 'core/hooks/permission/useServerSideLogin';
import withSession from 'core/lib/session';
import WashingModal from 'pages/history/components/WashingModal';
import React, { useEffect, useState } from 'react';

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
    return new Date(dateString).toLocaleString();
  };

  const handleWashingClick = (washing: Washing) => {
    setSelectedWashing(washing);
    setIsModalOpen(true);
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
                    className='rounded-lg bg-gray-100 p-4 shadow-sm'
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

      {isModalOpen && selectedWashing && (
        <WashingModal
          washing={selectedWashing}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export const getServerSideProps = withSession(useServerSideLogin);

export default HistoryPage;
