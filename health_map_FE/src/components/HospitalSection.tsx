import { Hospital } from "@/types";
import { HospitalCard } from "./HospitalCard";
import { PaginationControls } from "./PaginationControls";
import { useState } from "react";

interface HospitalSectionProps {
  title: string;
  hospitals: Hospital[];
  description?: string;
  itemsPerPage?: number;
}

export const HospitalSection = ({ 
  title, 
  hospitals, 
  description,
  itemsPerPage = 10 
}: HospitalSectionProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  if (hospitals.length === 0) return null;

  const totalPages = Math.ceil(hospitals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHospitals = hospitals.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        <span className="text-sm text-gray-500 mt-2 block">
          {hospitals.length} {hospitals.length === 1 ? 'hospital' : 'hospitals'} found
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {paginatedHospitals.map((hospital) => (
          <HospitalCard key={hospital.id} hospital={hospital} />
        ))}
      </div>

      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};