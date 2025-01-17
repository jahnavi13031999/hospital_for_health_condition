import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Hospital, GroupedHospitals, FilterState } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { FilterBar } from "@/components/FilterBar";
import { HospitalSection } from "@/components/HospitalSection";
import { searchHospitals } from "@/services/api";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { location: userLocation, healthIssue } = location.state || {};

  const [hospitals, setHospitals] = useState<GroupedHospitals>({
    cityHospitals: [],
    stateHospitals: [],
    otherHospitals: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    location: 'all',
    sortBy: 'score'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);

  // Filter and sort hospitals
  const filteredHospitals = useMemo(() => {
    const allHospitals = {
      cityHospitals: hospitals.cityHospitals.filter(hospital => 
        filters.location === 'all' || 
        (filters.location === 'city' && hospital.locationRelevance === 'city')
      ),
      stateHospitals: hospitals.stateHospitals.filter(hospital =>
        filters.location === 'all' ||
        (filters.location !== 'city' && hospital.locationRelevance === 'state')
      ),
      otherHospitals: hospitals.otherHospitals.filter(hospital =>
        filters.location === 'all' ||
        (filters.location !== 'city' && hospital.locationRelevance === 'other')
      )
    };

    // Apply sorting
    const sortFn = (a: Hospital, b: Hospital) => {
      if (filters.sortBy === 'score') {
        if (a.hasData !== b.hasData) return b.hasData ? 1 : -1;
        return b.score - a.score;
      }
      return a.name.localeCompare(b.name);
    };

    return {
      cityHospitals: [...allHospitals.cityHospitals].sort(sortFn),
      stateHospitals: [...allHospitals.stateHospitals].sort(sortFn),
      otherHospitals: [...allHospitals.otherHospitals].sort(sortFn)
    };
  }, [hospitals, filters]);

  // Fetch hospitals
  useEffect(() => {
    const fetchData = async () => {
      if (!userLocation) {
        setError('Please select a location to search for hospitals.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await searchHospitals(userLocation, healthIssue || '', page, perPage);
        
        setHospitals(response.hospitals);
        setTotalPages(response.total_pages);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch hospitals');
        toast({
          title: "Error",
          description: "Failed to fetch hospitals. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userLocation, healthIssue, toast, page, perPage]);

  // Handle filter reset
  const handleReset = () => {
    setFilters({
      location: 'all',
      sortBy: 'score'
    });
  };

  if (!location.state) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Please select a location to search for hospitals.</p>
        <Button 
          onClick={() => navigate('/')}
          className="mt-4"
        >
          Return to Search
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hospitals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-gray-900">Hospital Search Results</h1>
            <p className="text-gray-600">
              Showing results for {userLocation}
              {healthIssue && <span> - {healthIssue}</span>}
            </p>
          </div>
          <Button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            New Search
          </Button>
        </div>

        <FilterBar
          onSortChange={(value: 'score' | 'name') => setFilters(prev => ({ ...prev, sortBy: value }))}
          onLocationChange={(value: 'all' | 'city' | 'state') => setFilters(prev => ({ ...prev, location: value }))}
          onReset={handleReset}
          currentFilters={filters}
        />

        {error ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredHospitals.cityHospitals.length === 0 && 
             filteredHospitals.stateHospitals.length === 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      No hospitals found in {userLocation} or the surrounding state. 
                      Showing hospitals from other locations that may be relevant.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {filteredHospitals.cityHospitals.length === 0 && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      No hospitals found in {userLocation}.
                      {filteredHospitals.stateHospitals.length > 0 && 
                        " Showing hospitals from surrounding areas."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {filteredHospitals.cityHospitals.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="border-l-4 border-blue-500 p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Hospitals in {userLocation}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    These hospitals are located within your city
                  </p>
                  <div className="divide-y divide-gray-100">
                    <HospitalSection 
                      hospitals={filteredHospitals.cityHospitals}
                      title="Hospitals in City"
                    />
                  </div>
                </div>
              </section>
            )}

            {filteredHospitals.stateHospitals.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="border-l-4 border-green-500 p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Hospitals in Your State
                  </h2>
                  <p className="text-gray-600 mb-4">
                    These hospitals are in your state but outside {userLocation}
                  </p>
                  <div className="divide-y divide-gray-100">
                    <HospitalSection 
                      hospitals={filteredHospitals.stateHospitals}
                      title="State Hospitals"
                    />
                  </div>
                </div>
              </section>
            )}

            {filteredHospitals.otherHospitals.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="border-l-4 border-purple-500 p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Other Relevant Hospitals
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {filteredHospitals.cityHospitals.length === 0 && 
                     filteredHospitals.stateHospitals.length === 0 
                      ? "No local hospitals found. Showing hospitals from other areas that may be relevant."
                      : "These hospitals are outside your state but may be relevant"}
                  </p>
                  <div className="divide-y divide-gray-100">
                    <HospitalSection 
                      hospitals={filteredHospitals.otherHospitals}
                      title="Other Hospitals"
                    />
                  </div>
                </div>
              </section>
            )}

            {Object.values(filteredHospitals).every(arr => arr.length === 0) && (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-lg">
                  No hospitals found matching your criteria.
                </p>
              </div>
            )}

            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="py-2 px-4 bg-white rounded-md shadow-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;