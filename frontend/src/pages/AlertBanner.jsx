import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

export default function AlertBanner() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/admin/public/alerts`)
      .then((res) => {
        setAlerts(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch alerts", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (alerts.length === 0) return null;

  return (
    <div style={{
      background: '#fee2e2',
      color: '#991b1b',
      padding: '10px 16px',
      borderRadius: '6px',
      marginBottom: '1rem',
      fontWeight: 500
    }}>
      {alerts.map((alert, idx) => (
        <div key={idx}>
          {alert.title} — {alert.message}
        </div>
      ))}
    </div>
  );
}
