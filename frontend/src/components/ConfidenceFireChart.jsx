import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { fetchConfidenceFires } from '../services/fireApi';

export default function ConfidenceFireChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchConfidenceFires().then(data => {
      const labels = data.map(d => d.confidence);
      const counts = data.map(d => d.count);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Fire Confidence Level',
            data: counts,
            backgroundColor: ['#38bdf8', '#7dd3fc', '#0ea5e9'],
          },
        ],
      });
    });
  }, []);

  if (!chartData) return <p className="text-gray-600 text-sm">Loading...</p>;

  return (
    <Bar data={chartData} />
  );
}
