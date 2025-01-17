export interface Hospital {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    score: number;
    hasData: boolean;
    performanceLevel: string;
    description: string;
    locationRelevance: 'city' | 'state' | 'other';
    ratings?: {
      overall: number | null;
      quality: number | null;
      safety: number | null;
    };
    statistics?: {
      denominator: string;
      lowerEstimate: string;
      higherEstimate: string;
      measureName: string;
    };
}

export interface FilterState {
    location: 'all' | 'city' | 'state';
    sortBy: 'score' | 'name';
}

export interface GroupedHospitals {
    cityHospitals: Hospital[];
    stateHospitals: Hospital[];
    otherHospitals: Hospital[];
}

export interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
}

export interface PaginatedResponse {
  hospitals: Hospital[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}