import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import API_KEYS from '../config/apiKeys';

// Fire data API - Using AREA endpoint since country endpoint is deprecated
// Nepal STRICT bounding box 
// West=80.088, South=26.347, East=88.199, North=30.447
const FIRE_CSV_URL = (key, sensor = 'MODIS_NRT', days = 1) =>
  `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${key}/${sensor}/80.088,26.347,88.199,30.447/${days}`;

// Fire dots layer
function FireMarkers({ fires }) {
  const map = useMap();

  useEffect(() => {
    const layerGroup = L.layerGroup();

    fires.forEach(fire => {
      const lat = parseFloat(fire.latitude);
      const lon = parseFloat(fire.longitude);

      const marker = L.circleMarker([lat, lon], {
        radius: 4,
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.8,
        weight: 0,
        pane: 'markerPane',
      });

      marker.bindPopup(`
        <strong>Acq Date:</strong> ${fire.acq_date} <br />
        <strong>Confidence:</strong> ${fire.confidence} <br />
        <strong>Bright T:</strong> ${fire.bright_ti4 || fire.bright_t31 || 'N/A'} K
      `);

      marker.addTo(layerGroup);
    });

    layerGroup.addTo(map);

    return () => {
      map.removeLayer(layerGroup);
    };
  }, [fires, map]);

  return null;
}

// Nepal Border Layer
function NepalBorderLayer({ nepalGeoJSON }) {
  if (!nepalGeoJSON) return null;

  return (
    <GeoJSON
      data={nepalGeoJSON}
      style={{
        color: '#FFD700',
        weight: 3,
        opacity: 1,
        fillOpacity: 0,
      }}
    />
  );
}

// Main Map Component
export default function LiveHotspotsMap({ sensor = 'MODIS_NRT', days = 1 }) {
  const [fires, setFires] = useState([]);
  const [filteredFires, setFilteredFires] = useState([]);
  const [nepalGeoJSON, setNepalGeoJSON] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load Nepal boundary (FeatureCollection with Nepal feature)
  useEffect(() => {
    const sources = [
      'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson',
      'https://raw.githubusercontent.com/johan/world.geo.json/master/countries/NPL.geo.json',
      'https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson'
    ];

    const manualNepalBoundary = {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "properties": { "name": "Nepal" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [80.05, 30.42], [80.3, 30.1], [81.0, 30.2], [81.5, 30.3],
            [82.0, 30.1], [82.5, 29.9], [83.0, 29.8], [83.5, 29.5],
            [84.0, 29.3], [84.5, 28.9], [85.0, 28.6], [85.5, 28.3],
            [86.0, 28.1], [86.5, 27.9], [87.0, 27.7], [87.5, 27.5],
            [88.0, 27.3], [88.2, 27.1], [88.1, 26.8], [87.8, 26.5],
            [87.5, 26.4], [87.0, 26.35], [86.5, 26.4], [86.0, 26.45],
            [85.5, 26.5], [85.0, 26.6], [84.5, 26.7], [84.0, 26.85],
            [83.5, 27.0], [83.0, 27.2], [82.5, 27.4], [82.0, 27.7],
            [81.5, 28.0], [81.0, 28.3], [80.5, 28.7], [80.2, 29.2],
            [80.05, 29.7], [80.05, 30.42]
          ]]
        }
      }]
    };

    const tryFetch = async () => {
      for (const url of sources) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data.type === 'FeatureCollection') {
              const nepalFeature = data.features.find(f =>
                f.properties && (
                  f.properties.name === 'Nepal' ||
                  f.properties.ADMIN === 'Nepal' ||
                  f.properties.NAME === 'Nepal' ||
                  f.properties.iso_a3 === 'NPL'
                )
              );
              if (nepalFeature) {
                setNepalGeoJSON({ type: 'FeatureCollection', features: [nepalFeature] });
                return;
              }
            } else if (data.type === 'Feature') {
              setNepalGeoJSON({ type: 'FeatureCollection', features: [data] });
              return;
            }
          }
        } catch (err) {
          console.warn(`Failed to load from ${url}:`, err.message);
          continue;
        }
      }
      setNepalGeoJSON(manualNepalBoundary);
    };

    tryFetch().catch(() => setNepalGeoJSON(manualNepalBoundary));
  }, []);

  // Fetch fire points (CSV)
  useEffect(() => {
    setLoading(true);
    setError(null);
    const url = FIRE_CSV_URL(API_KEYS.FIRMS_MAP_KEY, sensor, days);

    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.text();
      })
      .then(text => {
        if (!text || text.trim() === '') {
          setFires([]);
          setLoading(false);
          return;
        }
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
          setFires([]);
          setLoading(false);
          return;
        }
        const headers = lines[0].split(',');
        const data = lines.slice(1).map(line => {
          const parts = line.split(',');
          return Object.fromEntries(parts.map((p, i) => [headers[i], p]));
        });
        setFires(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('CSV fetch failed', err);
        setError(err.message);
        setLoading(false);
      });
  }, [sensor, days]);

  // Point-in-polygon check (ray casting)
  function pointInRing(lon, lat, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      const intersect = ((yi > lat) !== (yj > lat)) &&
        (lon < (xj - xi) * (lat - yi) / (yj - yi + 0.000000000001) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function isPointInPolygon(lat, lon, geometry) {
    if (!geometry) return false;
    if (geometry.type === 'Polygon') {
      const rings = geometry.coordinates;
      const inOuter = pointInRing(lon, lat, rings[0]);
      if (!inOuter) return false;
      for (let k = 1; k < rings.length; k++) {
        if (pointInRing(lon, lat, rings[k])) return false;
      }
      return true;
    }
    if (geometry.type === 'MultiPolygon') {
      for (const poly of geometry.coordinates) {
        const rings = poly;
        const inOuter = pointInRing(lon, lat, rings[0]);
        if (inOuter) {
          let inHole = false;
          for (let k = 1; k < rings.length; k++) {
            if (pointInRing(lon, lat, rings[k])) { inHole = true; break; }
          }
          if (!inHole) return true;
        }
      }
      return false;
    }
    return false;
  }

  // Filter fires to only those inside Nepal
  useEffect(() => {
    if (!nepalGeoJSON) {
      setFilteredFires([]);
      return;
    }
    const feature = nepalGeoJSON.features && nepalGeoJSON.features[0];
    const geometry = feature && feature.geometry;
    if (!geometry || fires.length === 0) {
      setFilteredFires([]);
      return;
    }
    const filtered = fires.filter(f => {
      const lat = parseFloat(f.latitude);
      const lon = parseFloat(f.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lon)) return false;
      return isPointInPolygon(lat, lon, geometry);
    });
    setFilteredFires(filtered);
  }, [nepalGeoJSON, fires]);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={[28.4, 84.1]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        {/* Satellite Basemap */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri — Source: Esri, Earthstar Geographics"
        />

        {/* Nepal Border Overlay */}
        <NepalBorderLayer nepalGeoJSON={nepalGeoJSON} />

        {/* Fire Points */}
        {!loading && !error && <FireMarkers fires={filteredFires} />}
      </MapContainer>

      {/* Loading Indicator */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px 30px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #ff0000',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span>Loading fire data...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fee',
          color: '#c00',
          padding: '12px 20px',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxWidth: '80%',
          textAlign: 'center'
        }}>
          <strong>Error:</strong> Failed to load fire data. {error}
        </div>
      )}

      {/* No Data Message */}
      {!loading && !error && filteredFires.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fffbea',
          color: '#856404',
          padding: '12px 20px',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 1000,
          textAlign: 'center'
        }}>
          ℹ️ No active fires detected in the selected time range
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        background: 'white',
        padding: '6px 10px',
        borderRadius: '5px',
        boxShadow: '0 0 8px rgba(0,0,0,0.2)',
        fontSize: '14px',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: 10,
            height: 10,
            backgroundColor: 'red',
            borderRadius: '50%',
          }} />
          <span>Active Fire Point {!loading && `(${filteredFires.length})`}</span>
        </div>
      </div>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}