import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterState } from "@/types";

interface FilterBarProps {
  onSortChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onReset: () => void;
  currentFilters: FilterState;
}

export const FilterBar = ({
  onSortChange,
  onLocationChange,
  onReset,
  currentFilters,
}: FilterBarProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Location Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location Range
          </label>
          <Select
            value={currentFilters.location}
            onValueChange={onLocationChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="city">City Only</SelectItem>
              <SelectItem value="state">State Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <Select
            value={currentFilters.sortBy}
            onValueChange={onSortChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Performance Score</SelectItem>
              <SelectItem value="name">Hospital Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={onReset}
            className="h-10"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};