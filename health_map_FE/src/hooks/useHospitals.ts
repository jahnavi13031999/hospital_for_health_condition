import { useQuery } from '@tanstack/react-query';
import { Hospital } from '@/types';

export function useHospitals(location: string, healthIssue: string) {
  return useQuery<Hospital[], Error>({
    queryKey: ['hospitals', location, healthIssue],
    queryFn: async () => {
      const params = new URLSearchParams({
        location,
        healthIssue
      });
      const response = await fetch(`/api/hospitals/search?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch hospitals');
      }
      return response.json();
    },
    enabled: !!location // Only fetch when location is provided
  });
} 