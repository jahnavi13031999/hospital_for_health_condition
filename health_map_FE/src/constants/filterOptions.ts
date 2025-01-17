export const FILTER_OPTIONS = {
  location: [
    { value: 'all', label: 'All Locations' },
    { value: 'city', label: 'Within City' },
    { value: 'outside', label: 'Outside City' }
  ],
  performance: [
    { value: 'all', label: 'All Performance Levels' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'needs_improvement', label: 'Needs Improvement' }
  ],
  sortBy: [
    { value: 'rating', label: 'Best Rating' },
    { value: 'distance', label: 'Nearest First' },
    { value: 'name', label: 'Hospital Name' }
  ]
};