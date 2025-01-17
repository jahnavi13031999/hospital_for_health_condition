import { Hospital } from '@/types';
export type { Hospital };

// Determine the API base URL based on the environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  async searchHospitals(location: string, healthIssue: string): Promise<Hospital[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/hospitals/search?location=${encodeURIComponent(location)}&healthIssue=${encodeURIComponent(healthIssue)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          // Remove credentials mode as it's not needed for this public API
          mode: 'cors'
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch hospitals' }));
        throw new Error(errorData.error || 'Failed to fetch hospitals');
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from server');
      }

      return data;
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch hospitals');
    }
  },

  async searchHealthConditions(query: string): Promise<string[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/conditions/search?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch health conditions');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching health conditions:', error);
      throw error;
    }
  },

  async getLocations(query: string, field: string = 'City'): Promise<string[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/locations/search?query=${encodeURIComponent(query)}&field=${encodeURIComponent(field)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  },
};

// Export the searchHospitals function directly
export const searchHospitals = api.searchHospitals;
