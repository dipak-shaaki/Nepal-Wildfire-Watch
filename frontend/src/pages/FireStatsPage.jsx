
import React, { useEffect, useState } from 'react';
import YearlyFireChart from '../components/charts/YearlyFireChart';
import MonthlyFireChart from '../components/charts/MonthlyFireChart';
import ConfidenceFireChart from '../components/ConfidenceFireChart';
import { fetchTopDistricts, fetchHeatmap, fetchGeoSample } from '../services/fireApi';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function FireStatsPage() {
  const [topDistricts, setTopDistricts] = useState([]);
  const [heatmap, setHeatmap] = useState({ years: [], months: [], matrix: [] });
  const [geoSample, setGeoSample] = useState([]);

  useEffect(() => {
    fetchTopDistricts().then(setTopDistricts).catch(() => setTopDistricts([]));
    fetchHeatmap().then(setHeatmap).catch(() => setHeatmap({ years: [], months: [], matrix: [] }));
    fetchGeoSample().then(setGeoSample).catch(() => setGeoSample([]));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">Nepal Wildfire Statistics</h2>

        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <section className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Fires Over the Years</h3>
            <div className="h-64">
        <YearlyFireChart />
            </div>
      </section>
          <section className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Monthly Fire Distribution</h3>
            <div className="h-64">
        <MonthlyFireChart />
            </div>
      </section>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <section className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-medium text-gray-900">Fires by Detection Confidence</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">Confidence is the satellite algorithm’s estimated certainty that a detected hotspot is a real fire. Higher confidence typically means fewer false positives under clear-sky conditions.</p>
            <div className="h-64">
        <ConfidenceFireChart />
            </div>
          </section>
          <section className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Top Districts by Fire Count</h3>
            {topDistricts.length === 0 ? (
              <div className="text-gray-600">No data available.</div>
            ) : (
              <ul className="grid grid-cols-1 gap-3">
                {topDistricts.map((d) => (
                  <li key={d.district} className="flex items-center justify-between border rounded p-3">
                    <span className="text-gray-800">{d.district}</span>
                    <span className="text-gray-600">{d.count}</span>
                  </li>
                ))}
              </ul>
            )}
      </section>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Year–Month Heatmap</h3>
            {heatmap.years.length === 0 ? (
              <div className="text-gray-600">No data available.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left text-gray-600">Year</th>
                      {heatmap.months.map((m) => (
                        <th key={m} className="px-2 py-1 text-gray-600 text-xs">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmap.years.map((y, yi) => (
                      <tr key={y}>
                        <td className="px-2 py-1 text-gray-800 text-sm">{y}</td>
                        {heatmap.matrix[yi].map((val, mi) => (
                          <td key={mi} className="px-1 py-1">
                            <div className="w-6 h-6 rounded" style={{ backgroundColor: val === 0 ? '#f1f5f9' : `rgba(14,165,233, ${Math.min(1, val / Math.max(1, Math.max(...heatmap.matrix[yi])))})` }} title={`${y}-${mi+1}: ${val}`}></div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <section className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Geographic Distribution (sample)</h3>
            {geoSample.length === 0 ? (
              <div className="text-gray-600">No data available.</div>
            ) : (
              <div className="h-64 rounded overflow-hidden">
                <MapContainer center={[28.4, 84.1]} zoom={7} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {geoSample.map((p, i) => (
                    <CircleMarker key={i} center={[p.latitude, p.longitude]} radius={3} pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.6 }}>
                      <Tooltip>
                        <div className="text-xs">
                          <div><strong>{p.district || 'Unknown district'}</strong></div>
                          {p.acq_date && <div>{p.acq_date}</div>}
                          {p.confidence !== undefined && <div>Conf: {p.confidence}</div>}
                        </div>
                      </Tooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            )}
          </section>
        </div>

        {/* Explanation */}
        <section className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-xl font-medium text-gray-900 mb-2">How to read these figures</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li><span className="font-medium">Fires Over the Years</span>: trend of recorded hotspots per year based on the dataset.</li>
            <li><span className="font-medium">Monthly Distribution</span>: seasonality signal; peaks indicate dry-season risk.</li>
            <li><span className="font-medium">Detection Confidence</span>: algorithm certainty bands from the satellite product; use alongside other indicators.</li>
            <li><span className="font-medium">Top Districts</span>: districts with the highest counts in this dataset; may reflect reporting density and ecology.</li>
            <li><span className="font-medium">Year–Month Heatmap</span>: matrix view to spot strong seasonal cycles across years.</li>
            <li><span className="font-medium">Geographic Distribution</span>: sample of hotspots for spatial context; zoom the map to explore clusters.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
