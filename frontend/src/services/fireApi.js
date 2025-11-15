

// Use environment variable or fallback to localhost
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchYearlyFires() {
  const res = await fetch(`${API_BASE}/fires/yearly`);
  return await res.json();
}

export async function fetchMonthlyFires() {
  const res = await fetch(`${API_BASE}/fires/monthly`);
  return await res.json();
}

export async function fetchConfidenceFires() {
  const res = await fetch(`${API_BASE}/fires/confidence`);
  return res.json();
}

export async function fetchTopDistricts() {
  const res = await fetch(`${API_BASE}/fires/top-districts`);
  return await res.json();
}

export async function fetchHeatmap() {
  const res = await fetch(`${API_BASE}/fires/heatmap`);
  return await res.json();
}

export async function fetchGeoSample() {
  const res = await fetch(`${API_BASE}/fires/geo-sample`);
  return await res.json();
}

