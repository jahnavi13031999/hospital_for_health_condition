import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

// Temporarily define API_BASE_URL here until config is set up
const API_BASE_URL = 'http://localhost:5000/api';

interface Location {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  displayString: string;
}

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchLocations = async (query: string) => {
    if (!query || query.length < 2) {
      setLocations([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/locations/search?query=${encodeURIComponent(query.trim())}&field=City`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Failed to fetch locations');
      }

      const data = await response.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error searching locations:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch locations. Please try again.",
        variant: "destructive",
      });
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  return { locations, isLoading, searchLocations };
};