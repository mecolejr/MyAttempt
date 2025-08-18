import { useState, useEffect } from 'react';
import { GovernmentDataResponse } from '@/lib/services/governmentData';

export function useGovernmentData(city: string, state: string, type: string = 'comprehensive') {
  const [data, setData] = useState<GovernmentDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city || !state) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          city,
          state,
          type
        });

        const response = await fetch(`/api/government-data?${params}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [city, state, type]);

  return { data, loading, error };
}