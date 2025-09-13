// src/pages/Predict.jsx
import React, { useState } from 'react';
import axios from 'axios';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import API_KEYS from '../config/apiKeys';
import AlertBanner from './AlertBanner';


/* ---------- helper: click -> lat/lon marker ---------- */
function LocationMarker({ onSelect }) {
  const [position, setPosition] = useState(null);
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      onSelect(lat, lng);
    },
  });
  return position ? (
    <Marker position={position}>
      <Popup>Selected Location</Popup>
    </Marker>
  ) : null;
}

/* ---------- field definitions ---------- */
const fieldList = [
  { key: 'temperature',  label: 'Temperature (°C)' },
  { key: 'humidity',     label: 'Humidity (%)' },
  { key: 'wind_speed',   label: 'Wind Speed (m/s)' },
  { key: 'precipitation',label: 'Precipitation (mm)' },
  { key: 'elevation',    label: 'Elevation (m)' },
  { key: 'vpd',          label: 'VPD' },
];

const WEATHER_KEY = API_KEYS.OPEN_WEATHER_MAP;

/* ====================================== */
/* main component                         */
export default function Predict() {
  const [location, setLocation]   = useState(null);
  const [params,   setParams]     = useState(Object.fromEntries(fieldList.map(f => [f.key, ''])));
  const [loadingData, setLoadingData] = useState(false);
  const [predicting,  setPredicting]  = useState(false);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState('');

  /* -------- live fetch on map click -------- */
  const handleMapClick = async (lat, lon) => {
    setLocation({ lat, lon });
    setResult(null);
    setError('');
    setLoadingData(true);
    try {
      /* Weather */
      const wURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_KEY}`;
      const { data: w } = await axios.get(wURL);
      const { temp, humidity } = w.main;
      const wind   = w.wind.speed;
      const precip = w.rain?.['1h'] || 0;

      /* Elevation */
      const eURL = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`;
      const { data: e } = await axios.get(eURL);
      const elevation = e.results[0].elevation;

      /* VPD */
      const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
      const vpd = svp * (1 - humidity / 100);

      setParams({
        temperature:   temp.toFixed(2),
        humidity:      humidity.toFixed(2),
        wind_speed:    wind.toFixed(2),
        precipitation: precip.toFixed(2),
        elevation:     elevation.toFixed(2),
        vpd:           vpd.toFixed(3),
      });
    } catch (err) {
      console.error(err);
      setError('Failed to fetch live data.');
    } finally {
      setLoadingData(false);
    }
  };

  /* ---------- manual input change ---------- */
  const handleInput = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  /* ---------- prediction request ---------- */
  const handlePredict = async () => {
    if (!location) {
      setError('Select a location on the map first.');
      return;
    }
    setPredicting(true);
    setError('');
    setResult(null);
    try {
      const payload = {
        latitude:  +location.lat,
        longitude: +location.lon,
        ...Object.fromEntries(Object.entries(params).map(([k,v]) => [k, parseFloat(v)])),
      };
      const { data } = await axios.post('http://127.0.0.1:8000/predict-manual', payload);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Prediction failed.');
    } finally {
      setPredicting(false);
    }
  };

  /* ---------- reset all to initial ---------- */
  const resetAll = () => {
    setLocation(null);
    setParams(Object.fromEntries(fieldList.map(f => [f.key, ''])));
    setResult(null);
    setError('');
  };

  /* ---------- render ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <AlertBanner />
        <div className="mb-6">
          <h2 className="text-3xl font-semibold text-gray-900">Check Fire Risk by Location</h2>
          <p className="text-gray-600">Click on the map to auto-fill environmental data, adjust if needed, then run the prediction.</p>
        </div>

        {/* Map card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="h-96 rounded overflow-hidden">
            <MapContainer
              center={[28.3949, 84.1240]}
              zoom={7}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <LocationMarker onSelect={handleMapClick} />
            </MapContainer>
          </div>
        </div>

        {/* Forms row */}
        {location && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Manual parameters */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Manual Parameters</h3>
              <div className="grid grid-cols-1 gap-3">
                {fieldList.map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm text-gray-700 mb-1">{label}</label>
                    <input
                      name={key}
                      type="number"
                      step="any"
                      value={params[key]}
                      onChange={handleInput}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handlePredict}
                disabled={predicting}
                className="mt-4 px-5 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60"
              >
                {predicting ? 'Predicting…' : 'Predict Fire Risk'}
              </button>
            </div>

            {/* Auto-filled summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Auto-filled from Map</h3>
              <p className="text-sm text-gray-700 mb-3"><span className="font-medium">Location:</span> {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</p>
              {loadingData ? (
                <p className="text-gray-600 text-sm">Loading live data…</p>
              ) : (
                <ul className="text-sm text-gray-800 space-y-1">
                  {fieldList.map(({ key, label }) => (
                    <li key={key}><span className="font-medium">{label}:</span> {params[key]}</li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-gray-500 mt-3">Values are fetched automatically. You can fine-tune them on the left.</p>
            </div>
          </div>
        )}

        {/* Result card */}
        {result && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-medium text-gray-900">Prediction Result</h3>
            <div className="mt-2 text-sm text-gray-800">
              <p>
                <span className="font-medium">Risk level:</span>{' '}
                <span className={
                  result.risk_level === 'High'
                    ? 'text-red-700 font-semibold'
                    : result.risk_level === 'Moderate'
                    ? 'text-amber-600 font-semibold'
                    : 'text-emerald-600 font-semibold'
                }>
                  {result.risk_level}
                </span>
              </p>
              <p className="mt-1"><span className="font-medium">Model probability:</span> {result.probability}</p>
              <div className="mt-3 p-3 bg-sky-50 border border-sky-100 rounded text-xs text-gray-700">
                <p className="mb-1"><span className="font-medium">How to interpret:</span> Probability reflects the model’s estimated likelihood of fire given current weather and terrain. Combine with local context before action.</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li><span className="font-medium">High</span>: take precautions and monitor closely.</li>
                  <li><span className="font-medium">Moderate</span>: remain alert; avoid open flames.</li>
                  <li><span className="font-medium">Low</span>: safe conditions but continue best practices.</li>
                </ul>
              </div>
            </div>
            <button
              onClick={resetAll}
              className="mt-4 px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900"
            >
              Predict another location
            </button>
          </div>
        )}

        {error && <p className="text-red-600 mt-4">Error: {error}</p>}
      </div>

      {/* overlay spinner */}
      {predicting && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#fff', zIndex: 9999
        }}>
          <div style={{
            width: 48, height: 48, border: '6px solid #fff',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: 12, fontSize: '1.1rem' }}>Analyzing environmental data…</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
    </div>
  );
}
