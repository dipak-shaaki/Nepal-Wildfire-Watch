import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AlertsManagement() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    forest: "",
    district: "",
    province: "",
    location_details: "",
    latitude: "",
    longitude: "",
    risk_level: "Moderate",
    duration_days: 3,
    temperature: "",
    humidity: "",
    message: "",
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("http://localhost:8000/admin/alerts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      setAlerts(data);
    } catch (e) {
      setError("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    if (!form.forest || !form.district || !form.message) {
      alert("Forest, district and message are required");
      return;
    }
    try {
      const payload = {
        title: `Forest Fire Alert: ${form.forest}`,
        message: form.message,
        forest: form.forest,
        district: form.district,
        province: form.province || "Unknown",
        location_details: form.location_details || "Nepal",
        latitude: form.latitude ? parseFloat(form.latitude) : 0,
        longitude: form.longitude ? parseFloat(form.longitude) : 0,
        risk_level: form.risk_level || "Moderate",
        severity: (form.risk_level || "Moderate").toLowerCase(),
        duration_days: form.duration_days ? parseInt(form.duration_days) : 3,
        weather_data: {
          temperature: form.temperature ? parseFloat(form.temperature) : 25,
          humidity: form.humidity ? parseFloat(form.humidity) : 60,
          wind_speed: 10,
          precipitation: 0,
        },
      };
      const { data } = await axios.post("http://localhost:8000/admin/alerts", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      setAlerts([data, ...alerts]);
      setForm({ forest: "", district: "", province: "", location_details: "", latitude: "", longitude: "", risk_level: "Moderate", duration_days: 3, temperature: "", humidity: "", message: "" });
    } catch (e) {
      alert("Failed to create alert");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this alert?")) return;
    try {
      await axios.delete(`http://localhost:8000/admin/alerts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      setAlerts(alerts.filter((a) => a.id !== id));
    } catch (e) {
      alert("Failed to delete alert");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">Alerts Management</h1>
          <p className="text-gray-600">Create and manage wildfire alerts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">New Alert</h2>

              <div className="space-y-3">
                <input className="w-full px-3 py-2 border rounded" name="forest" placeholder="Forest" value={form.forest} onChange={handleChange} />
                <input className="w-full px-3 py-2 border rounded" name="district" placeholder="District" value={form.district} onChange={handleChange} />
                <input className="w-full px-3 py-2 border rounded" name="province" placeholder="Province" value={form.province} onChange={handleChange} />
                <input className="w-full px-3 py-2 border rounded" name="location_details" placeholder="Location details" value={form.location_details} onChange={handleChange} />
                <div className="grid grid-cols-2 gap-3">
                  <input className="w-full px-3 py-2 border rounded" name="latitude" placeholder="Latitude" value={form.latitude} onChange={handleChange} />
                  <input className="w-full px-3 py-2 border rounded" name="longitude" placeholder="Longitude" value={form.longitude} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input className="w-full px-3 py-2 border rounded" name="temperature" placeholder="Temperature (°C)" value={form.temperature} onChange={handleChange} />
                  <input className="w-full px-3 py-2 border rounded" name="humidity" placeholder="Humidity (%)" value={form.humidity} onChange={handleChange} />
                </div>
                <select className="w-full px-3 py-2 border rounded" name="risk_level" value={form.risk_level} onChange={handleChange}>
                  <option>Low</option>
                  <option>Moderate</option>
                  <option>High</option>
                </select>
                <input className="w-full px-3 py-2 border rounded" name="duration_days" placeholder="Duration (days)" value={form.duration_days} onChange={handleChange} />
                <textarea className="w-full px-3 py-2 border rounded" name="message" rows="4" placeholder="Message / precautions" value={form.message} onChange={handleChange}></textarea>
                <button onClick={handleCreate} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded">Create Alert</button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Existing Alerts</h2>
              {loading ? (
                <div>Loading...</div>
              ) : error ? (
                <div className="text-red-600">{error}</div>
              ) : alerts.length === 0 ? (
                <div>No alerts yet.</div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((a) => (
                    <div key={a.id} className="border rounded p-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-semibold text-red-700">{a.title}</div>
                          <div className="text-sm text-gray-600">
                            {a.forest && <span>Forest: {a.forest} • </span>}
                            {a.district && <span>District: {a.district} • </span>}
                            {a.province && <span>Province: {a.province}</span>}
                          </div>
                          <div className="text-sm mt-2">{a.message}</div>
                        </div>
                        <div className="space-x-2">
                          <button onClick={() => handleDelete(a.id)} className="px-3 py-1 bg-gray-800 text-white rounded">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


