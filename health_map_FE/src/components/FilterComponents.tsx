import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { FilterState } from "@/types";
import { FILTER_OPTIONS } from "@/constants/filterOptions";

interface FilterComponentsProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  onResetFilter: (key: keyof FilterState) => void;
  onResetAll: () => void;
}

export const FilterComponents = ({
  filters,
  onFilterChange,
  onResetFilter,
  onResetAll,
}: FilterComponentsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-6 rounded-lg shadow-sm">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Location</label>
        <Select
          value={filters.location}
          onValueChange={(value) => onFilterChange('location', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select location filter" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.location.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Performance Rating</label>
        <Select
          value={filters.performance}
          onValueChange={(value) => onFilterChange('performance', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select performance filter" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.performance.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Sort By</label>
        <Select
          value={filters.sortBy}
          onValueChange={(value) => onFilterChange('sortBy', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select sorting option" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.sortBy.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Only Show Hospitals with Data</label>
        <Switch
          checked={filters.onlyWithData}
          onCheckedChange={(checked) => onFilterChange('onlyWithData', checked)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Maximum Distance (miles)</label>
        <Slider
          value={[filters.maxDistance]}
          onValueChange={([value]) => onFilterChange('maxDistance', value)}
          max={100}
          step={1}
        />
      </div>

      <div className="flex justify-end items-end">
        <Button
          variant="ghost"
          onClick={onResetAll}
          className="text-gray-600 hover:text-gray-900"
        >
          Reset all filters
        </Button>
      </div>
    </div>
  );
};