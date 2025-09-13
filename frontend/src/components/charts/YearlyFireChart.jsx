
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { fetchYearlyFires } from '../../services/fireApi';

export default function YearlyFireChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchYearlyFires().then(setData);
  }, []);

  const chartData = {
    labels: data.map(d => d.year),
    datasets: [{
      label: 'Fires per Year',
      data: data.map(d => d.count),
      fill: false,
      borderColor: '#0ea5e9',
      backgroundColor: '#0ea5e9',
      tension: 0.3,
    }],
  };

  return <Line data={chartData} />;
}
