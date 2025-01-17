import { Bar } from 'react-chartjs-2';
import { Hospital } from '@/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface HospitalMetricsProps {
  hospitals: Hospital[];
}

export function HospitalMetrics({ hospitals }: HospitalMetricsProps) {
  const averageScore = hospitals.reduce((acc, h) => acc + h.score, 0) / hospitals.length;
  const averageQuality = hospitals.reduce((acc, h) => acc + (h.ratings.quality || 0), 0) / hospitals.length;

  const data = {
    labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
    datasets: [{
      label: 'Hospitals by Score',
      data: hospitals.reduce((acc, h) => {
        const index = Math.floor(h.score / 20);
        acc[index] = (acc[index] || 0) + 1;
        return acc;
      }, Array(5).fill(0)),
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    }]
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow">
      <Bar data={data} />
    </div>
  );
} 