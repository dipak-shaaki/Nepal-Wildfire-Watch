import React, { useState } from 'react';
import LiveHotspotsMap from '../components/LiveHotspotsMap';
import AlertBanner from './AlertBanner';

export default function LiveFireMapPage() {
  const [sensor, setSensor] = useState('MODIS_NRT');
  const [days, setDays] = useState(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <AlertBanner />
        <div className="mb-6">
          <h2 className="text-3xl font-semibold text-gray-900">Live Fire Hotspots around Nepal</h2>
          <p className="text-gray-600">Choose a satellite sensor and time window to explore real-time detections.</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-sm text-gray-700">
              <span className="mr-2 font-medium">Sensor:</span>
              <select className="px-3 py-2 border rounded" value={sensor} onChange={e => setSensor(e.target.value)}>
                <option value="MODIS_NRT">MODIS</option>
                <option value="VIIRS_SNPP_NRT">VIIRS S-NPP</option>
                <option value="VIIRS_NOAA20_NRT">VIIRS NOAA-20</option>
              </select>
            </label>
            <label className="text-sm text-gray-700">
              <span className="mr-2 font-medium">Days:</span>
              <select className="px-3 py-2 border rounded" value={days} onChange={e => setDays(e.target.value)}>
                {[1,2,7].map(n => <option key={n} value={n}>{n} day{n>1?'s':''}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '70vh' }}>
          <LiveHotspotsMap sensor={sensor} days={days} />
        </div>
      </div>
    </div>
  );
}
