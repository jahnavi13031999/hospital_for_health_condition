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
  location: string;
  performance: string;
  sortBy: string;
  onlyWithData: boolean;
  maxDistance: number;
}

export interface GroupedHospitals {
  cityHospitals: Hospital[];
  stateHospitals: Hospital[];
  otherHospitals: Hospital[];
}