/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { useEffect, useState } from 'react';

const SensorVisorPage = () => {
  const [activeTab, setActiveTab] = useState('colors');
  const [colors, setColors] = useState([]);
  const [flows, setFlows] = useState([]);
  const [temperatures, setTemperatures] = useState([]);
  const [ultrasounds, setUltrasounds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [colorsRes, flowsRes, tempsRes, ultraRes] = await Promise.all([
          axios.get('/api/v1/colors'),
          axios.get('/api/v1/flows'),
          axios.get('/api/v1/temperatures'),
          axios.get('/api/v1/ultrasounds'),
        ]);

        setColors(colorsRes.data);
        setFlows(flowsRes.data);
        setTemperatures(tempsRes.data);
        setUltrasounds(ultraRes.data);
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      }
    };

    fetchData();
  }, []);

  const sortData = (data: any[], key: string) => {
    return [...data].sort((a, b) => {
      if (key === 'createdAt') {
        const dateA = new Date(a[key]).getTime();
        const dateB = new Date(b[key]).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
  };

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    });
  };

  const renderTable = (data: any[]) => {
    const sortedData = sortData(data, sortConfig.key);
    return (
      <div className='overflow-x-auto'>
        <table className='h-full min-h-[62vh] divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Value
              </th>
              <th
                className='group cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                onClick={() => handleSort('createdAt')}
              >
                Created At
                <span className='ml-1 inline-block'>
                  {sortConfig.key === 'createdAt'
                    ? sortConfig.direction === 'asc'
                      ? '↑'
                      : '↓'
                    : '↕'}
                </span>
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {sortedData.map((item: any) => (
              <tr key={item._id}>
                <td className='whitespace-nowrap px-6 py-4'>
                  {item.value}
                  {activeTab === 'temperatures' ? '°C' : ''}
                </td>
                <td className='whitespace-nowrap px-6 py-4'>
                  {new Date(item.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className='container mx-auto py-6 px-4'>
      <h1 className='mb-6 text-2xl font-bold'>Sensor Data Visualization</h1>

      <div className='mb-4'>
        <nav className='flex space-x-4 border-b'>
          {['colors', 'flows', 'temperatures', 'ultrasounds'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className='mt-4'>
        {activeTab === 'colors' && renderTable(colors)}
        {activeTab === 'flows' && renderTable(flows)}
        {activeTab === 'temperatures' && renderTable(temperatures)}
        {activeTab === 'ultrasounds' && renderTable(ultrasounds)}
      </div>
    </div>
  );
};

export default SensorVisorPage;
