import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function LocationSelector({ onSelect }) {
  const [marker, setMarker] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarker([lat, lng]);
      onSelect(lat, lng);
    },
  });

  return marker ? (
    <Marker position={marker}>
      <Popup>Selected Fire Location</Popup>
    </Marker>
  ) : null;
}

export default function ReportFire() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    province: "",
    district: "",
    location_details: "",
    fire_date: "",
    description: "",
    lat: null,
    lon: null,
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationSelected, setLocationSelected] = useState(false);

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const setLocation = (lat, lon) => {
    setForm({ ...form, lat, lon });
    setLocationSelected(true);
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.trim()) return "Email is required";
    if (!form.province.trim()) return "Province is required";
    if (!form.district.trim()) return "District is required";
    if (!form.location_details.trim()) return "Location details are required";
    if (!form.fire_date) return "Fire date is required";
    if (!form.description.trim()) return "Description is required";
    if (form.description.trim().length < 10) return "Description must be at least 10 characters";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const reportData = {
        ...form,
        fire_date: form.fire_date,
        status: "new",
        resolved: false
      };

      const res = await axios.post("http://localhost:8000/reports/", reportData);
      setSubmitted(true);

      // Redirect to appropriate dashboard after 3 seconds
      setTimeout(() => {
        if (userRole === 'admin') {
          navigate("/admin-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      }, 3000);

    } catch (err) {
      console.error("Fire report error:", err);
      let errorMessage = "Failed to submit fire report. Please try again.";

      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Redirect to appropriate dashboard
    if (userRole === 'admin') {
      navigate("/admin-dashboard");
    } else {
      navigate("/user-dashboard");
    }
  };

  const nepaliProvinces = [
    "Province 1", "Province 2", "Bagmati Province",
    "Gandaki Province", "Lumbini Province",
    "Karnali Province", "Sudurpaschim Province"
  ];

  const nepaliDistricts = {
    "Province 1": ["Bhojpur", "Dhankuta", "Ilam", "Jhapa", "Khotang", "Morang", "Okhaldhunga", "Panchthar", "Sankhuwasabha", "Solukhumbu", "Sunsari", "Taplejung", "Terhathum", "Udayapur"],
    "Province 2": ["Bara", "Dhanusa", "Mahottari", "Parsa", "Rautahat", "Saptari", "Sarlahi", "Siraha"],
    "Bagmati Province": ["Bhaktapur", "Chitwan", "Dhading", "Dolakha", "Kavrepalanchok", "Kathmandu", "Lalitpur", "Makwanpur", "Nuwakot", "Ramechhap", "Rasuwa", "Sindhuli", "Sindhupalchok"],
    "Gandaki Province": ["Baglung", "Gorkha", "Kaski", "Lamjung", "Manang", "Mustang", "Myagdi", "Nawalpur", "Parbat", "Syangja", "Tanahun"],
    "Lumbini Province": ["Arghakhanchi", "Banke", "Bardiya", "Dang", "Eastern Rukum", "Gulmi", "Kapilvastu", "Parasi", "Palpa", "Pyuthan", "Rolpa", "Rupandehi"],
    "Karnali Province": ["Dailekh", "Dolpa", "Humla", "Jajarkot", "Jumla", "Kalikot", "Mugu", "Salyan", "Surkhet", "Western Rukum"],
    "Sudurpaschim Province": ["Achham", "Baitadi", "Bajhang", "Bajura", "Dadeldhura", "Darchula", "Doti", "Kailali", "Kanchanpur"]
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
        <div style={{ maxWidth: 600, margin: "0 auto", padding: 32, background: "#fff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <h2 style={{ color: "#16a34a", marginBottom: 16, fontSize: "28px", fontWeight: "bold" }}>Report Submitted Successfully!</h2>
          <p style={{ color: "#6b7280", marginBottom: 24, lineHeight: "1.6" }}>
            Thank you for reporting this wildfire. Our admin team will review your report and take appropriate action.
          </p>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 32, background: "#fff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <h2 style={{ textAlign: "center", marginBottom: 12, color: "#dc2626", fontSize: "32px", fontWeight: "bold" }}>Report a Wildfire</h2>

        <p style={{ textAlign: "center", marginBottom: 32, color: "#6b7280", lineHeight: "1.6" }}>
          If you've spotted a wildfire, please provide the details below. This information will be reviewed by our admin team.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: "#374151" }}>
                Your Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={update}
                placeholder="Enter your full name"
                required
                style={{
                  width: "100%",
                  padding: 12,
                  border: "2px solid #d1d5db",
                  borderRadius: 8,
                  outline: "none",
                  transition: "all 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#16a34a"}
                onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: "#374151" }}>
                Email Address *
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={update}
                placeholder="Enter your email"
                required
                style={{
                  width: "100%",
                  padding: 12,
                  border: "2px solid #d1d5db",
                  borderRadius: 8,
                  outline: "none",
                  transition: "all 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#16a34a"}
                onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: "#374151" }}>
                Province *
              </label>
              <select
                name="province"
                value={form.province}
                onChange={update}
                required
                style={{
                  width: "100%",
                  padding: 12,
                  border: "2px solid #d1d5db",
                  borderRadius: 8,
                  outline: "none",
                  transition: "all 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#16a34a"}
                onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
              >
                <option value="">Select Province</option>
                {nepaliProvinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: "#374151" }}>
                District *
              </label>
              <select
                name="district"
                value={form.district}
                onChange={update}
                required
                disabled={!form.province}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "2px solid #d1d5db",
                  borderRadius: 8,
                  outline: "none",
                  opacity: form.province ? 1 : 0.6,
                  transition: "all 0.2s"
                }}
                onFocus={(e) => form.province && (e.target.style.borderColor = "#16a34a")}
                onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
              >
                <option value="">Select District</option>
                {form.province && nepaliDistricts[form.province]?.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: "#374151" }}>
              Exact Location / Landmark *
            </label>
            <input
              name="location_details"
              value={form.location_details}
              onChange={update}
              placeholder="e.g., Near Pashupatinath Temple, Kathmandu"
              required
              style={{
                width: "100%",
                padding: 12,
                border: "2px solid #d1d5db",
                borderRadius: 8,
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#16a34a"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: "#374151" }}>
              Date of Fire Incident *
            </label>
            <input
              name="fire_date"
              type="date"
              value={form.fire_date}
              onChange={update}
              required
              max={new Date().toISOString().split('T')[0]}
              style={{
                width: "100%",
                padding: 12,
                border: "2px solid #d1d5db",
                borderRadius: 8,
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#16a34a"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: "#374151" }}>
              Description of the Fire *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={update}
              placeholder="Describe what you saw, the size of the fire, any visible damage, etc. (minimum 10 characters)"
              rows={4}
              required
              style={{
                width: "100%",
                padding: 12,
                border: "2px solid #d1d5db",
                borderRadius: 8,
                outline: "none",
                resize: "vertical",
                transition: "all 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#16a34a"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              {form.description.length}/10 characters minimum
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h4 style={{ marginBottom: 12, fontWeight: "600", color: "#374151" }}>Optional: Select Location on Map</h4>
            <p style={{ color: "#6b7280", marginBottom: 12, fontSize: 14, lineHeight: "1.6" }}>
              Click on the map below to mark the exact location of the fire. This helps emergency responders locate the incident quickly.
            </p>
            <MapContainer
              center={[28.4, 84.1]}
              zoom={7}
              style={{ height: 300, borderRadius: 8, border: "2px solid #d1d5db" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationSelector onSelect={setLocation} />
            </MapContainer>
            {locationSelected && (
              <div style={{ marginTop: 8, color: "#16a34a", fontSize: 14, fontWeight: "500" }}>
                Location selected: {form.lat?.toFixed(4)}, {form.lon?.toFixed(4)}
              </div>
            )}
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "#d1d5db" : "linear-gradient(to right, #dc2626, #b91c1c)",
                color: "#fff",
                padding: "14px 32px",
                border: "none",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                marginRight: 12,
                transition: "all 0.2s"
              }}
            >
              {loading ? "Submitting..." : "Submit Fire Report"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              style={{
                background: "#6b7280",
                color: "#fff",
                padding: "14px 24px",
                border: "none",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Cancel
            </button>
          </div>

          {error && (
            <div style={{ color: "#dc2626", marginTop: 16, textAlign: "center", padding: 12, background: "#fef2f2", borderRadius: 8, fontWeight: "500" }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
