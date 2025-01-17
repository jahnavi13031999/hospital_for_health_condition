import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FilterState } from "@/types";
import { FILTER_OPTIONS } from "@/constants/filterOptions";

interface ResultsHeaderProps {
  filters: FilterState;
  totalHospitals: number;
  userLocation: string;
  healthIssue: string;
  onResetFilter: (key: keyof FilterState) => void;
  onResetAll: () => void;
}

export const ResultsHeader = ({
  filters,
  totalHospitals,
  userLocation,
  healthIssue,
  onResetFilter,
  onResetAll,
}: ResultsHeaderProps) => {
  return (
    <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Found {totalHospitals} hospitals
              {healthIssue && <span className="text-gray-600"> for {healthIssue}</span>}
              {userLocation && <span className="text-gray-600"> near {userLocation}</span>}
            </h1>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
              onClick={onResetAll}
            >
              Reset all filters
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.location !== 'all' && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {FILTER_OPTIONS.location.find(opt => opt.value === filters.location)?.label}
                <X
                  className="h-3 w-3 cursor-pointer ml-1"
                  onClick={() => onResetFilter('location')}
                />
              </Badge>
            )}
            {filters.performance !== 'all' && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {FILTER_OPTIONS.performance.find(opt => opt.value === filters.performance)?.label}
                <X
                  className="h-3 w-3 cursor-pointer ml-1"
                  onClick={() => onResetFilter('performance')}
                />
              </Badge>
            )}
            {filters.sortBy !== 'rating' && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Sorted by: {FILTER_OPTIONS.sortBy.find(opt => opt.value === filters.sortBy)?.label}
                <X
                  className="h-3 w-3 cursor-pointer ml-1"
                  onClick={() => onResetFilter('sortBy')}
                />
              </Badge>
            )}
            {filters.onlyWithData && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                With available data only
                <X
                  className="h-3 w-3 cursor-pointer ml-1"
                  onClick={() => onResetFilter('onlyWithData')}
                />
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};