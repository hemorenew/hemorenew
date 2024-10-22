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
}

interface Washing {
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  filter: {
    brand: string;
    model: string;
  };
  startDate: string;
  attended: {
    firstName: string;
    lastName: string;
  };
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
        patient.lastName.toLowerCase().includes(patientSearchTerm.toLowerCase())
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
        });
      }
    });
    return Array.from(patientMap.values());
  };

  const handlePatientClick = async (patientId: string) => {
    try {
      setLoading(true);
      setSelectedPatientId(patientId);
      const response = await axios.get(
        `/api/v1/washings?patientId=${patientId}`
      );
      setPatientWashings(response.data);
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

  return (
    <div className='flex min-h-[84vh] flex-col items-start justify-center bg-gray-50 p-8'>
      <h1 className='mb-8 text-start text-3xl font-bold text-gray-800'>
        Historial de Pacientes y Filtros
      </h1>

      <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:self-center'>
        <div className='h-fit rounded-lg bg-white p-6 shadow-md'>
          <h2 className='mb-4 text-xl font-semibold text-gray-700'>
            Pacientes
          </h2>
          <input
            type='text'
            placeholder='Buscar paciente...'
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

        <div className='md:col-span-2 lg:col-span-2'>
          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-xl font-semibold text-gray-700'>
              Historial de Lavados
            </h2>
            {loading ? (
              <div className='flex h-40 items-center justify-center'>
                <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900'></div>
              </div>
            ) : selectedPatient ? (
              <>
                <p className='mb-4 text-gray-600'>
                  Total de lavados para {selectedPatient.firstName}{' '}
                  {selectedPatient.lastName}: {patientWashings.length}
                </p>
                <ul className='max-h-96 space-y-4 overflow-y-auto'>
                  {patientWashings.map((washing) => (
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
