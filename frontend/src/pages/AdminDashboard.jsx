import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../config";
import {
  fetchAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
} from "../config/adminApi";

export default function AdminDashboard() {
  const { logout, userName } = useAuth();
  const [view, setView] = useState("alerts");

  // Alerts
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({ title: "", message: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [editedAlert, setEditedAlert] = useState({});
  const [editingAlertId, setEditingAlertId] = useState(null);

  // Messages
  const [messages, setMessages] = useState([]);
  const [replyingId, setReplyingId] = useState(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");

  // Reports
  const [reports, setReports] = useState([]);

  // Fire Risk Scan State
  const [scanLoading, setScanLoading] = useState(false);
  const [highRiskDistricts, setHighRiskDistricts] = useState([]);
  const [scanError, setScanError] = useState("");

  useEffect(() => {
    loadAlerts();
    loadMessages();
    loadReports();
  }, []);

  const loadAlerts = () =>
    axios.get(`${API_BASE_URL}/admin/public/alerts`)
      .then((res) => setAlerts(res.data))
      .catch(console.error);

  const loadMessages = () =>
    axios
      .get(`${API_BASE_URL}/messages`)
      .then((res) => setMessages(res.data))
      .catch(console.error);

  const loadReports = () =>
    axios
      .get(`${API_BASE_URL}/reports`)
      .then((res) => setReports(res.data))
      .catch(console.error);

  // Alert CRUD
  const handleCreate = async () => {
    if (!newAlert.forest || !newAlert.district || !newAlert.message)
      return alert("Forest name, district, and message are required");

    const alertData = {
      title: `Forest Fire Alert: ${newAlert.forest}`,
      message: newAlert.message,
      forest: newAlert.forest,
      district: newAlert.district,
      province: newAlert.province || "Unknown",
      location_details: newAlert.location_details || "Nepal",
      latitude: newAlert.latitude ?? null,
      longitude: newAlert.longitude ?? null,
      risk_level: newAlert.risk_level || "Moderate",
      severity: (newAlert.risk_level || "Moderate").toLowerCase(),
      duration_days: newAlert.duration_days || 3,
      weather_data: {
        temperature: newAlert.temperature || 25,
        humidity: newAlert.humidity || 60,
        wind_speed: 10,
        precipitation: 0
      },
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/admin/alerts`, alertData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      setAlerts([...alerts, res.data]);
      setNewAlert({ title: "", message: "" });
      setEditingAlertId(null);
      alert("Forest fire alert created successfully!");
    } catch (error) {
      console.error("Create alert error:", error);
      alert("Failed to create alert. Check console for details.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this alert?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/admin/alerts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      setAlerts(alerts.filter((a) => a.id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const startEdit = (i) => {
    setEditIndex(i);
    setEditedAlert({ ...alerts[i] });
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditedAlert({});
  };

  const saveEdit = async (id) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/admin/alerts/${id}`, {
        title: editedAlert.title,
        message: editedAlert.message,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      const updated = [...alerts];
      updated[editIndex] = res.data;
      setAlerts(updated);
      cancelEdit();
    } catch {
      alert("Update failed");
    }
  };

  // Edit in form: prefill manual form for an existing alert
  const editInForm = (alert) => {
    setView("alerts");
    setEditingAlertId(alert.id);
    setNewAlert({
      forest: alert.forest || "",
      district: alert.district || "",
      province: alert.province || "",
      location_details: alert.location_details || "",
      latitude: alert.latitude ?? "",
      longitude: alert.longitude ?? "",
      temperature: alert.weather_data?.temperature || "",
      humidity: alert.weather_data?.humidity || "",
      risk_level: alert.risk_level || "Moderate",
      duration_days: 3,
      message: alert.message || "",
    });
  };

  const saveFormEdit = async () => {
    if (!editingAlertId) return;
    try {
      const payload = {
        title: `Forest Fire Alert: ${newAlert.forest}`,
        message: newAlert.message,
        forest: newAlert.forest,
        district: newAlert.district,
        province: newAlert.province,
        location_details: newAlert.location_details,
        latitude: newAlert.latitude,
        longitude: newAlert.longitude,
        risk_level: newAlert.risk_level,
        severity: (newAlert.risk_level || "Moderate").toLowerCase(),
        duration_days: newAlert.duration_days,
        weather_data: {
          temperature: newAlert.temperature,
          humidity: newAlert.humidity,
          wind_speed: 10,
          precipitation: 0,
        },
      };
      const res = await axios.put(`${API_BASE_URL}/admin/alerts/${editingAlertId}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      setAlerts((prev) => prev.map((a) => (a.id === editingAlertId ? res.data : a)));
      setEditingAlertId(null);
      setNewAlert({ title: "", message: "" });
      alert("Alert updated");
    } catch (e) {
      alert("Failed to update alert");
    }
  };

  // Prefill the manual create form from a scanned item
  const prefillFromScan = (item) => {
    setView("alerts");
    setNewAlert({
      forest: item.forest || item.district || "",
      district: item.district || "",
      province: item.province || "",
      location_details: item.location_details || "",
      latitude: item.latitude ?? "",
      longitude: item.longitude ?? "",
      temperature: item.weather_data?.temperature || item.details?.temperature || "",
      humidity: item.weather_data?.humidity || item.details?.humidity || "",
      risk_level: item.fire_risk || "Moderate",
      duration_days: 3,
      message: `High forest fire risk detected in ${item.district || item.forest}. Avoid open flames and report smoke immediately.`,
    });
  };

  // Status helpers


  // Reply to user messages
  const sendReply = async (email) => {
    if (!replySubject || !replyBody) return alert("Fill subject & body");
    try {
      await axios.post(
        "http://localhost:8000/admin/reply",
        {
          to_email: email,
          subject: replySubject,
          message: replyBody,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      alert("Reply sent");
      setReplyingId(null);
      setReplySubject("");
      setReplyBody("");
    } catch (err) {
      console.error(err);
      alert("Failed to send reply");
    }
  };

  // Update report resolution status
  const handleResolve = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:8000/reports/${id}/resolve`, {
        resolved: newStatus,
      });
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, resolved: newStatus } : r))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update report status.");
    }
  };

  // Run full Nepal scan
  const handleScan = async () => {
    setScanLoading(true);
    setScanError("");
    setHighRiskDistricts([]);
    try {
      const { data } = await axios.post(
        "http://localhost:8000/admin/test-scan-nepal",
        {}
      );
      setHighRiskDistricts(data.high_risk_districts || []);
    } catch (err) {
      setScanError("Scan failed. See console for details.");
      console.error(err);
    }
    setScanLoading(false);
  };

  // Logout
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div style={{ padding: "2rem" }}>
        <h2 style={{ fontWeight: "bold" }}>
          {`Welcome${userName ? ", " + userName : ""}`}
          <button
            onClick={handleLogout}
            style={{
              float: "right",
              background: "#e11d48",
              color: "#fff",
              padding: "6px 12px",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </h2>

        {/* View Tabs */}
        <div style={{ marginBottom: "1rem" }}>
          <button
            onClick={() => setView("alerts")}
            style={{
              marginRight: 8,
              padding: "6px 12px",
              background: view === "alerts" ? "#2563eb" : "#e5e7eb",
              color: view === "alerts" ? "#fff" : "#000",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Alerts
          </button>
          <button
            onClick={() => setView("messages")}
            style={{
              marginRight: 8,
              padding: "6px 12px",
              background: view === "messages" ? "#2563eb" : "#e5e7eb",
              color: view === "messages" ? "#fff" : "#000",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            User Messages
          </button>
          <button
            onClick={() => setView("reports")}
            style={{
              padding: "6px 12px",
              background: view === "reports" ? "#2563eb" : "#e5e7eb",
              color: view === "reports" ? "#fff" : "#000",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Fire Reports
          </button>
        </div>

        {/* Fire Risk Scan & Alert Creation */}
        <div style={{ marginBottom: 32, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
          <h3>Fire Risk Management</h3>
          <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            <button onClick={handleScan} disabled={scanLoading} style={{ padding: "8px 16px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
              {scanLoading ? "Scanning Forests..." : " Scan Nepal Forests"}
            </button>
          </div>
          {scanError && <div style={{ color: "red" }}>{scanError}</div>}
          {highRiskDistricts.length > 0 && (
            <div>
              <p><strong>Forest Fire Risk Assessment Complete:</strong> High-risk forest areas detected. Click "Use in Form" on a row to prefill the manual alert form, then publish the alert.</p>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Forest Name</th>
                    <th>District</th>
                    <th>Location</th>
                    <th>Temp (°C)</th>
                    <th>Humidity (%)</th>
                    <th>Risk Level</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {highRiskDistricts.map((d) => (
                    <tr key={d.forest || d.district} style={{ borderBottom: "1px solid #eee" }}>
                      <td><strong>{d.forest || d.district}</strong></td>
                      <td><strong>{d.district}</strong></td>
                      <td>
                        <div style={{ fontSize: "12px" }}>
                          <div><strong>{d.province}</strong></div>
                          <div style={{ color: "#666" }}>{d.location_details}</div>
                          <div style={{ color: "#888", fontSize: "10px" }}>
                            Coordinates: {d.latitude?.toFixed(4)}, {d.longitude?.toFixed(4)}
                          </div>
                        </div>
                      </td>
                      <td>{d.weather_data?.temperature || d.details?.temperature}</td>
                      <td>{d.weather_data?.humidity || d.details?.humidity}</td>
                      <td>
                        <span style={{
                          padding: "2px 6px",
                          borderRadius: "3px",
                          fontSize: "12px",
                          color: "white",
                          backgroundColor: d.fire_risk === "High" ? "#dc2626" : d.fire_risk === "Moderate" ? "#f59e0b" : "#10b981"
                        }}>
                          {d.fire_risk}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => prefillFromScan(d)} style={{ padding: "8px 12px", background: "linear-gradient(to right, #16a34a, #15803d)", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "500" }}>
                          Use in Form
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Alerts Panel */}
        {view === "alerts" && (
          <>
            <div style={{ marginBottom: "2rem" }}>
              <h4>{editingAlertId ? "Edit Alert" : "Create Manual Alert"}</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <input
                  placeholder="Forest Name (e.g., Chitwan National Park)"
                  value={newAlert.forest || ""}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, forest: e.target.value })
                  }
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                />
                <input
                  placeholder="District (e.g., Chitwan)"
                  value={newAlert.district || ""}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, district: e.target.value })
                  }
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                />
                <input
                  placeholder="Province (e.g., Bagmati)"
                  value={newAlert.province || ""}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, province: e.target.value })
                  }
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                />
                <input
                  placeholder="Location Details"
                  value={newAlert.location_details || ""}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, location_details: e.target.value })
                  }
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                />
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Latitude"
                  value={newAlert.latitude || ""}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, latitude: parseFloat(e.target.value) || 0 })
                  }
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                />
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Longitude"
                  value={newAlert.longitude || ""}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, longitude: parseFloat(e.target.value) || 0 })
                  }
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Temperature (°C)"
                  value={newAlert.temperature || ""}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, temperature: parseFloat(e.target.value) || 0 })
                  }
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid " + (editingAlertId ? "#60a5fa" : "#ddd") }}
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Humidity (%)"
                  value={newAlert.humidity || ""}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, humidity: parseFloat(e.target.value) || 0 })
                  }
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid " + (editingAlertId ? "#60a5fa" : "#ddd") }}
                />
                <select
                  value={newAlert.risk_level || "Moderate"}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, risk_level: e.target.value })
                  }
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                >
                  <option value="Low">Low Risk</option>
                  <option value="Moderate">Moderate Risk</option>
                  <option value="High">High Risk</option>
                </select>
                <input
                  type="number"
                  min="1"
                  max="30"
                  placeholder="Duration (days)"
                  value={newAlert.duration_days || 3}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, duration_days: parseInt(e.target.value) || 3 })
                  }
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                />
              </div>
              <textarea
                placeholder="Alert Message/Precautions (e.g., High fire risk due to dry conditions. Avoid open flames, report any smoke immediately.)"
                value={newAlert.message || ""}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, message: e.target.value })
                }
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd", minHeight: "80px" }}
              />
              {!editingAlertId ? (
                <button
                  onClick={handleCreate}
                  style={{ marginTop: "8px", padding: "8px 16px", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  Create Forest Fire Alert
                </button>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={saveFormEdit}
                    style={{ marginTop: "8px", padding: "10px 18px", background: "linear-gradient(to right, #16a34a, #15803d)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => { setEditingAlertId(null); setNewAlert({ title: "", message: "" }); }}
                    style={{ marginTop: "8px", padding: "8px 16px", background: "#6b7280", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <hr />
            <h3>Existing Alerts</h3>
            {alerts.length === 0 ? (
              <p>No alerts yet.</p>
            ) : (
              alerts.map((alert, i) => (
                <div
                  key={alert.id}
                  style={{
                    marginBottom: "1rem",
                    padding: "1rem",
                    border: "1px solid #ccc",
                    borderRadius: 6,
                  }}
                >
                  {editIndex === i ? (
                    <>
                      <input
                        value={editedAlert.title}
                        onChange={(e) =>
                          setEditedAlert({
                            ...editedAlert,
                            title: e.target.value,
                          })
                        }
                        style={{ marginBottom: 6 }}
                      />
                      <br />
                      <input
                        value={editedAlert.message}
                        onChange={(e) =>
                          setEditedAlert({
                            ...editedAlert,
                            message: e.target.value,
                          })
                        }
                        style={{ marginBottom: 6, width: "70%" }}
                      />
                      <br />
                      <button onClick={() => saveEdit(alert.id)}>Save</button>{" "}
                      <button onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div>
                          <strong style={{ fontSize: "16px", color: "#dc2626" }}>{alert.title}</strong>
                          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                            {alert.forest && <span><strong>Forest:</strong> {alert.forest} | </span>}
                            {alert.district && <span><strong>District:</strong> {alert.district} | </span>}
                            {alert.province && <span><strong>Province:</strong> {alert.province} | </span>}
                            {alert.risk_level && (
                              <span style={{
                                padding: "2px 6px",
                                borderRadius: "3px",
                                fontSize: "10px",
                                color: "white",
                                backgroundColor: alert.risk_level === "High" ? "#dc2626" : alert.risk_level === "Moderate" ? "#f59e0b" : "#10b981"
                              }}>
                                {alert.risk_level} Risk
                              </span>
                            )}
                          </div>
                          {alert.latitude && alert.longitude && (
                            <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                              Coordinates: {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                            </div>
                          )}
                          {alert.weather_data && (
                            <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                              Temp: {alert.weather_data.temperature}°C | Humidity: {alert.weather_data.humidity}%
                            </div>
                          )}
                        </div>
                        <div>

                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => startEdit(i)}
                              style={{ padding: "6px 10px", background: "linear-gradient(to right, #16a34a, #15803d)", color: "white", border: "none", borderRadius: "4px", fontSize: "12px", marginRight: "4px", fontWeight: "500" }}
                            >
                              Quick Edit
                            </button>
                            <button
                              onClick={() => editInForm(alert)}
                              style={{ padding: "4px 8px", background: "#f59e0b", color: "white", border: "none", borderRadius: "3px", fontSize: "12px", marginRight: "4px" }}
                            >
                              Edit in Form
                            </button>
                            <button
                              onClick={() => handleDelete(alert.id)}
                              style={{ padding: "4px 8px", background: "#dc2626", color: "white", border: "none", borderRadius: "3px", fontSize: "12px" }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                      <p style={{ marginTop: "8px", lineHeight: "1.4" }}>{alert.message}</p>
                    </>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {/* User Messages Panel */}
        {view === "messages" && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">User Messages</h3>
                  <p className="text-sm text-gray-500">Direct inquiries sent via the contact form.</p>
                </div>
                <span className="text-sm text-gray-500">{messages.length} total</span>
              </div>
              {messages.length === 0 ? (
                <div className="text-center text-gray-600 py-8">No user messages yet.</div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{msg.name} <span className="text-gray-500 font-normal">({msg.email})</span></div>
                          <div className="text-sm text-gray-600 mt-1"><span className="font-medium">Subject:</span> {msg.subject}</div>
                        </div>
                        <div className="flex gap-2">
                          {replyingId !== msg.id && (
                            <button onClick={() => setReplyingId(msg.id)} className="px-3 py-1 text-sm bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors">Reply</button>
                          )}
                          <button onClick={async () => { if (!confirm('Delete this message?')) return; await axios.delete(`http://localhost:8000/messages/${msg.id}`); setMessages((prev) => prev.filter((m) => m.id !== msg.id)); }} className="px-3 py-1 text-sm bg-red-600 text-white rounded">Delete</button>
                        </div>
                      </div>
                      <p className="text-gray-700 mt-3">{msg.message}</p>

                      {replyingId === msg.id && (
                        <div className="mt-4">
                          <input
                            placeholder="Reply Subject"
                            value={replySubject}
                            onChange={(e) => setReplySubject(e.target.value)}
                            className="w-full px-3 py-2 border rounded mb-2"
                          />
                          <textarea
                            placeholder="Reply Message"
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                            className="w-full h-28 px-3 py-2 border rounded mb-2"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => sendReply(msg.email)} className="px-4 py-2 bg-green-600 text-white rounded">Send Reply</button>
                            <button onClick={() => setReplyingId(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fire Reports Panel */}
        {view === "reports" && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Submitted Wildfire Reports</h3>
                  <p className="text-sm text-gray-500">Reports filed by users for suspected or ongoing wildfires.</p>
                </div>
                <span className="text-sm text-gray-500">{reports.length} total</span>
              </div>
              {reports.length === 0 ? (
                <div className="text-center text-gray-600 py-8">No reports submitted yet.</div>
              ) : (
                <div className="space-y-4">
                  {reports.map((r) => (
                    <div key={r.id} className={`border rounded-lg p-4 ${r.resolved ? 'bg-gray-100 opacity-80' : 'bg-amber-50'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{r.name} <span className="text-gray-500 font-normal">({r.email})</span></div>
                          <div className="text-sm text-gray-600 mt-1">Reported on <span className="font-medium">{r.fire_date}</span></div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolve(r.id, !r.resolved)}
                            className={`px-3 py-1 rounded text-white text-sm ${r.resolved ? 'bg-amber-600' : 'bg-emerald-600'}`}
                          >
                            {r.resolved ? 'Mark Unresolved' : 'Mark Resolved'}
                          </button>
                          {r.resolved && (
                            <button
                              onClick={async () => { if (!confirm('Delete this resolved report?')) return; await axios.delete(`http://localhost:8000/reports/${r.id}`); setReports((prev) => prev.filter((x) => x.id !== r.id)); }}
                              className="px-3 py-1 rounded text-white text-sm bg-red-600"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700 mt-3">
                        <div><span className="font-medium">Province:</span> {r.province}</div>
                        <div><span className="font-medium">District:</span> {r.district}</div>
                        <div className="md:col-span-2"><span className="font-medium">Location:</span> {r.location_details}</div>
                      </div>
                      <div className="text-gray-700 mt-2">
                        <span className="font-medium">Description:</span> {r.description}
                      </div>

                      {/* Reply to reporter via email */}
                      <div className="mt-4">
                        {replyingId === r.id ? (
                          <div>
                            <input
                              placeholder="Reply Subject"
                              value={replySubject}
                              onChange={(e) => setReplySubject(e.target.value)}
                              className="w-full px-3 py-2 border rounded mb-2"
                            />
                            <textarea
                              placeholder="Reply Message"
                              value={replyBody}
                              onChange={(e) => setReplyBody(e.target.value)}
                              className="w-full h-28 px-3 py-2 border rounded mb-2"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => sendReply(r.email)} className="px-4 py-2 bg-green-600 text-white rounded">Send Reply</button>
                              <button onClick={() => setReplyingId(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setReplyingId(r.id)} className="px-3 py-1 bg-green-600 text-white rounded mt-2 font-medium hover:bg-green-700 transition-colors">Reply to Reporter</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
