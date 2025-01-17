import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocations } from '@/hooks/useLocations';
import { useGeolocation } from '@/hooks/useGeolocation';
import { api } from '@/services/api';

export const SearchForm = () => {
  const [location, setLocation] = useState('');
  const [healthIssue, setHealthIssue] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [openLocationPopover, setOpenLocationPopover] = useState(false);
  const [openConditionPopover, setOpenConditionPopover] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [conditionSearch, setConditionSearch] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [isConditionsLoading, setIsConditionsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { locations, isLoading, searchLocations } = useLocations();
  const { getCurrentLocation } = useGeolocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || (!healthIssue && !selectedCondition)) {
      toast({
        title: "Required Fields Missing",
        description: "Please provide both location and health condition details",
        variant: "destructive",
      });
      return;
    }

    const finalHealthIssue = selectedCondition
      ? healthIssue 
        ? `${selectedCondition} - ${healthIssue}`
        : selectedCondition
      : healthIssue;

    navigate('/results', { 
      state: { 
        location, 
        healthIssue: finalHealthIssue 
      } 
    });
  };

  const handleGeolocation = async () => {
    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleLocationSearch = (value: string) => {
    setLocationSearch(value);
    searchLocations(value);
  };

  const handleConditionSearch = (value: string) => {
    setConditionSearch(value);
    searchConditions(value);
  };

  const searchConditions = async (searchTerm: string) => {
    if (!searchTerm) {
      setConditions([]);
      return;
    }
    
    setIsConditionsLoading(true);
    try {
      const results = await api.searchHealthConditions(searchTerm);
      setConditions(results);
    } catch (error) {
      console.error('Error searching conditions:', error);
      setConditions([]);
    } finally {
      setIsConditionsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 w-full max-w-md bg-gradient-to-b from-white to-gray-50 p-8 rounded-xl shadow-xl border border-gray-100"
    >
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Find Healthcare Near You
          </h2>
          <p className="text-gray-600 text-sm">
            Enter your location and health concern to get personalized hospital recommendations
          </p>
        </div>

        {/* Location Input Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Location
          </label>
          <div className="relative">
            <Popover open={openLocationPopover} onOpenChange={setOpenLocationPopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openLocationPopover}
                  className="w-full justify-between border-2 hover:border-primary/50 focus:border-primary transition-colors bg-white pr-12"
                >
                  {location || "Select your location..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100%-2rem)] p-0 shadow-lg border-2 bg-white rounded-lg" align="start">
                <Command className="rounded-lg">
                  <div className="flex items-center border-b px-3 bg-gray-50">
                    <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
                    <input
                      placeholder="Search cities..."
                      value={locationSearch}
                      onChange={(e) => handleLocationSearch(e.target.value)}
                      className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 focus:ring-0"
                    />
                  </div>
                  <CommandList className="max-h-[300px] overflow-auto p-2">
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : locations.length === 0 ? (
                      <CommandEmpty className="py-6 text-center text-sm text-gray-500">
                        No locations found.
                      </CommandEmpty>
                    ) : (
                      <CommandGroup className="space-y-1">
                        {locations.map((loc) => (
                          <CommandItem
                            key={loc.id}
                            onSelect={() => {
                              setLocation(loc.displayString);
                              setOpenLocationPopover(false);
                            }}
                            className="flex items-center px-4 py-3 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{loc.city}, {loc.state}</span>
                              <span className="text-sm text-gray-500">
                                {loc.county} County
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <button
              type="button"
              onClick={handleGeolocation}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary transition-colors rounded-full hover:bg-gray-100"
              title="Use current location"
            >
              <MapPin className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Health Condition Input Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medical Condition
          </label>
          <div className="relative">
            <Popover open={openConditionPopover} onOpenChange={setOpenConditionPopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openConditionPopover}
                  className="w-full justify-between border-2 hover:border-primary/50 focus:border-primary transition-colors bg-white pr-12"
                >
                  {selectedCondition || "Choose your condition"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100%-2rem)] p-0 shadow-lg border-2 bg-white rounded-lg" align="start">
                <Command className="rounded-lg">
                  <div className="flex items-center border-b px-3 bg-gray-50">
                    <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
                    <input
                      placeholder="Search conditions..."
                      value={conditionSearch}
                      onChange={(e) => handleConditionSearch(e.target.value)}
                      className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 focus:ring-0"
                    />
                  </div>
                  <CommandList className="max-h-[300px] overflow-auto p-2">
                    {isConditionsLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : conditions.length === 0 ? (
                      <CommandEmpty className="py-6 text-center text-sm text-gray-500">
                        No conditions found.
                      </CommandEmpty>
                    ) : (
                      <CommandGroup className="space-y-1">
                        {conditions.map((condition, index) => (
                          <CommandItem
                            key={index}
                            onSelect={() => {
                              setSelectedCondition(condition);
                              setOpenConditionPopover(false);
                            }}
                            className="flex items-center px-4 py-3 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                          >
                            {condition}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Additional Health Issue Details */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Details
          </label>
          <Input
            placeholder="Describe your symptoms or concerns (optional)"
            value={healthIssue}
            onChange={(e) => setHealthIssue(e.target.value)}
            className="border-2 hover:border-primary/50 focus:border-primary transition-colors bg-white"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg font-semibold shadow-md transition-colors"
        disabled={!location || (!healthIssue && !selectedCondition)}
      >
        <Search className="w-5 h-5 mr-2" />
        Find Hospitals
      </Button>
    </form>
  );
};
