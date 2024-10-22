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
  patient: string;
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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [washings, setWashings] = useState<Washing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm] = useState('');
  const [, setFilteredWashings] = useState<Washing[]>([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWashing, setSelectedWashing] = useState<Washing | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchWashings(selectedPatient);
    }
  }, [selectedPatient]);

  useEffect(() => {
    const filtered = washings.filter(
      (washing) =>
        patients
          .find((p) => p._id === washing.patient)
          ?.firstName.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        patients
          .find((p) => p._id === washing.patient)
          ?.lastName.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setFilteredWashings(filtered);
  }, [searchTerm, washings, patients]);

  useEffect(() => {
    const filtered = patients.filter(
      (patient) =>
        patient.firstName
          .toLowerCase()
          .includes(patientSearchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(patientSearchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [patientSearchTerm, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWashings = async (patientId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/washings?patient=${patientId}`);
      setWashings(response.data);
    } catch (error) {
      console.error('Error fetching washings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = (patientId: string) => {
    setSelectedPatient(patientId);
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
                    selectedPatient === patient._id
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
                  Total de lavados: {washings.length}
                </p>
                <ul className='max-h-96 space-y-4 overflow-y-auto'>
                  {washings.map((washing) => (
                    <li
                      key={washing._id}
                      className='cursor-pointer rounded-lg bg-gray-100 p-4 shadow-sm hover:bg-gray-200'
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
