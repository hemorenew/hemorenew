import axios from 'axios';
import { useCallback, useState } from 'react';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface SensorData {
  _id: string;
  value: number | string;
  createdAt: string;
}

interface ApiResponse {
  data: SensorData[];
  pagination: PaginationInfo;
}

interface FetchParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string | null;
  endDate?: string | null;
}

export const useSensorData = () => {
  const [sensorData, setSensorData] = useState<Record<string, SensorData[]>>({
    colors: [],
    flows: [],
    temperatures: [],
    ultrasounds: [],
  });

  const [pagination, setPagination] = useState<Record<string, PaginationInfo>>(
    {}
  );
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | null>>({});

  const fetchSensorData = useCallback(
    async (sensorType: string, params: FetchParams = {}) => {
      setLoading((prev) => ({ ...prev, [sensorType]: true }));
      setError((prev) => ({ ...prev, [sensorType]: null }));

      try {
        const queryParams: any = {
          page: params.page || 1,
          limit: params.limit || 20,
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || 'desc',
        };

        if (params.startDate) {
          queryParams.startDate = params.startDate;
        }
        if (params.endDate) {
          queryParams.endDate = params.endDate;
        }

        const response = await axios.get<ApiResponse>(
          `/api/v1/${sensorType}/paginated`,
          {
            params: queryParams,
          }
        );

        setSensorData((prev) => ({
          ...prev,
          [sensorType]: response.data.data,
        }));

        setPagination((prev) => ({
          ...prev,
          [sensorType]: response.data.pagination,
        }));

        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || err.message || 'Error fetching data';
        setError((prev) => ({ ...prev, [sensorType]: errorMessage }));
        console.error(`Error fetching ${sensorType} data:`, err);
        throw err;
      } finally {
        setLoading((prev) => ({ ...prev, [sensorType]: false }));
      }
    },
    []
  );

  const clearSensorData = useCallback((sensorType?: string) => {
    if (sensorType) {
      setSensorData((prev) => ({ ...prev, [sensorType]: [] }));
      setPagination((prev) => ({
        ...prev,
        [sensorType]: {} as PaginationInfo,
      }));
      setError((prev) => ({ ...prev, [sensorType]: null }));
    } else {
      setSensorData({
        colors: [],
        flows: [],
        temperatures: [],
        ultrasounds: [],
      });
      setPagination({});
      setError({});
    }
  }, []);

  return {
    sensorData,
    pagination,
    loading,
    error,
    fetchSensorData,
    clearSensorData,
  };
};
