import { memo } from 'react';
import { Hospital } from '@/types';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HospitalCardProps {
  hospital: Hospital;
  className?: string;
}

export const HospitalCard = memo(({ hospital, className }: HospitalCardProps) => {
  const rating = hospital.ratings?.overall || 0;

  return (
    <div className={cn("rounded-lg border border-gray-200 bg-white shadow-sm", className)}>
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{hospital.name}</h3>
          <p className="text-gray-600 text-sm">
            {hospital.address}, {hospital.city}, {hospital.state} {hospital.zipCode}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Performance</p>
            <p className="text-lg font-bold text-primary">
              {hospital.performanceLevel}
            </p>
          </div>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < Math.floor(rating) 
                    ? "text-yellow-400 fill-current" 
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {hospital.description}
        </div>

        {hospital.statistics && (
          <div className="text-sm text-gray-500">
            <p>Sample size: {hospital.statistics.denominator}</p>
            <p>Range: {hospital.statistics.lowerEstimate}% - {hospital.statistics.higherEstimate}%</p>
          </div>
        )}
      </div>
    </div>
  );
});

HospitalCard.displayName = 'HospitalCard'; 