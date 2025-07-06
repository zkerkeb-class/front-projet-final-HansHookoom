// hooks/useApi.js
import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);
  
  // Utiliser useRef pour stocker les options et éviter les re-rendus
  const optionsRef = useRef(options);

  const fetchData = useCallback(async () => {
    if (!endpoint) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`🔄 Fetching: ${API_BASE_URL}${endpoint}`);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...optionsRef.current.headers
        },
        ...optionsRef.current
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      console.log(`✅ Data loaded for ${endpoint}:`, result);
    } catch (err) {
      console.error(`❌ Error fetching ${endpoint}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]); // Suppression de la dépendance options

  useEffect(() => {
    fetchData();
  }, [fetchData, version]);

  const refetch = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  return { data, loading, error, refetch };
};

export default useApi;