
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
  { key: 'latitude', label: 'Latitude' },
  { key: 'longitude', label: 'Longitude' },
  { key: 'temperature', label: 'Temperature (°C)' },
  { key: 'humidity', label: 'Humidity (%)' },
  { key: 'wind_speed', label: 'Wind Speed (m/s)' },
  { key: 'precipitation', label: 'Precipitation (mm)' },
  { key: 'elevation', label: 'Elevation (m)' },
  { key: 'vpd', label: 'VPD' },
];

const WEATHER_KEY = API_KEYS.OPEN_WEATHER_MAP;

/* ====================================== */
/* main component                         */
export default function Predict() {
  const [location, setLocation] = useState(null);
  const [params, setParams] = useState(Object.fromEntries(fieldList.map(f => [f.key, ''])));
  const [loadingData, setLoadingData] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const allFilled = fieldList.every(({ key }) => {
    const val = params[key];
    return val !== '' && !isNaN(parseFloat(val));
  });

  /* -------- live fetch on map click -------- */
  const handleMapClick = async (lat, lon) => {
    setLocation({ lat, lon });
    setParams(prev => ({ ...prev, latitude: lat.toFixed(4), longitude: lon.toFixed(4) }));
    setResult(null);
    setError('');
    setLoadingData(true);
    try {
      /* Weather */
      const wURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_KEY}`;
      const { data: w } = await axios.get(wURL);
      const { temp, humidity } = w.main;
      const wind = w.wind.speed;
      const precip = w.rain?.['1h'] || 0;

      /* Elevation */
      const eURL = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`;
      const { data: e } = await axios.get(eURL);
      const elevation = e.results[0].elevation;

      /* VPD */
      const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
      const vpd = svp * (1 - humidity / 100);

      setParams({
        latitude: lat.toFixed(4),
        longitude: lon.toFixed(4),
        temperature: temp.toFixed(2),
        humidity: humidity.toFixed(2),
        wind_speed: wind.toFixed(2),
        precipitation: precip.toFixed(2),
        elevation: elevation.toFixed(2),
        vpd: vpd.toFixed(3),
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
    // Validate all required fields
    const missing = fieldList.filter(({ key }) => params[key] === '' || isNaN(parseFloat(params[key])));
    if (missing.length > 0) {
      setError('Please fill all input parameters before predicting.');
      return;
    }
    const lat = parseFloat(params.latitude);
    const lon = parseFloat(params.longitude);

    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      setError('Please enter valid latitude and longitude values.');
      return;
    }

    setPredicting(true);
    setError('');
    setResult(null);
    try {
      //  CREATE PAYLOAD - Convert form data to numbers
      const payload = {
        latitude: +params.latitude,
        longitude: +params.longitude,
        temperature: +params.temperature,
        humidity: +params.humidity,
        wind_speed: +params.wind_speed,
        precipitation: +params.precipitation,
        elevation: +params.elevation,
        vpd: +params.vpd,
      };
      const { data } = await axios.post('http://127.0.0.1:8000/predict-manual', payload);
      setResult(data); //for storing data in state // data = {fire_occurred, risk_level, probability, risk_message, ...}
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
          <h2 className="text-3xl font-semibold text-gray-900">Check Fire Risk</h2>
          <p className="text-gray-600">Enter parameters manually or click on the map to auto-fill environmental data.</p>
        </div>

        {/* Map card */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Step 1: Select Location (Optional)</h3>
          <p className="text-sm text-gray-600 mb-3">Click on the map to auto-fill coordinates and fetch weather data, or enter values manually below.</p>
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

        {/* Manual Input Form - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Manual parameters */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Step 2: Enter/Review Parameters</h3>
            <div className="grid grid-cols-1 gap-3">
              {fieldList.map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    name={key}
                    type="number"
                    step="any"
                    value={params[key]}
                    onChange={handleInput}
                    placeholder={key === 'latitude' ? 'e.g., 28.3949' : key === 'longitude' ? 'e.g., 84.1240' : ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handlePredict}
              disabled={predicting || !allFilled}
              className="mt-4 w-full px-5 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-medium hover:from-green-700 hover:to-green-800 disabled:opacity-60 transition-all"
            >
              {predicting ? 'Predicting...' : 'Predict Fire Risk'}
            </button>
          </div>

          {/* Auto-filled summary */}
          {location && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Map Selection Info</h3>
              <p className="text-sm text-gray-700 mb-3"><span className="font-medium">Selected Location:</span> {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</p>
              {loadingData ? (
                <p className="text-gray-600 text-sm">Loading live data...</p>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Auto-fetched values:</p>
                  <ul className="text-sm text-gray-800 space-y-1">
                    {fieldList.filter(f => f.key !== 'latitude' && f.key !== 'longitude').map(({ key, label }) => (
                      <li key={key}><span className="font-medium">{label}:</span> {params[key]}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 mt-3">These values were automatically fetched. You can modify them in the form on the left.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Result card */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6 border-l-4 
            {result.risk_level === 'High' ? 'border-red-500' : result.risk_level === 'Moderate' ? 'border-amber-500' : 'border-green-500'}">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Fire Risk Assessment Results</h3>

            {/* Risk Level Badge */}
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-600">Risk Classification:</span>
              <div className={`inline-block ml-3 px-4 py-2 rounded-full font-bold text-lg ${result.risk_level === 'High'
                ? 'bg-red-100 text-red-800 border-2 border-red-300'
                : result.risk_level === 'Moderate'
                  ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                  : 'bg-green-100 text-green-800 border-2 border-green-300'
                }`}>
                {result.risk_level} Risk
              </div>
            </div>

            {/* Probability */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Model Confidence Score</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${result.risk_level === 'High' ? 'bg-red-600' :
                      result.risk_level === 'Moderate' ? 'bg-amber-500' : 'bg-green-600'
                      }`}
                    style={{ width: `${(result.probability * 100).toFixed(0)}%` }}
                  />
                </div>
                <span className="font-bold text-gray-800 min-w-[60px]">
                  {(result.probability * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Main Risk Message */}
            <div className={`p-4 rounded-lg mb-4 ${result.risk_level === 'High' ? 'bg-red-50 border border-red-200' :
              result.risk_level === 'Moderate' ? 'bg-amber-50 border border-amber-200' :
                'bg-green-50 border border-green-200'
              }`}>
              <h4 className="font-semibold text-gray-900 mb-2">Assessment Details:</h4>
              <p className="text-gray-800 leading-relaxed">
                {result.risk_message}
              </p>
            </div>

            {/* Additional Context */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Understanding Your Results:</p>
              <p className="text-sm text-blue-800 leading-relaxed mb-2">
                Our AI model analyzed <strong>8 environmental factors</strong> including temperature, humidity, wind speed,
                precipitation, elevation, and vapor pressure deficit to calculate this fire risk assessment.
              </p>
              <p className="text-sm text-blue-800 leading-relaxed">
                <strong>Remember:</strong> This prediction is based on current conditions. Weather can change rapidly,
                so always stay updated with local authorities and follow official fire safety guidelines for your area.
              </p>
            </div>

            <button
              onClick={resetAll}
              className="mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-gray-700 to-gray-900 text-white font-medium hover:from-gray-800 hover:to-black transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Check Another Location
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
