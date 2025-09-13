import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AlertBanner from "./AlertBanner";
import axios from "axios";

export default function UserDashboard() {
    const { logout, userName } = useAuth();
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await axios.get("http://localhost:8000/admin/public/alerts");
                setAlerts(data || []);
            } catch (e) {
                setError("Unable to load alerts right now.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const stats = useMemo(() => {
        const total = alerts.length;
        const active = alerts.filter(a => a.status === "active").length;
        const high = alerts.filter(a => a.risk_level === "High").length;
        const moderate = alerts.filter(a => a.risk_level === "Moderate").length;
        return { total, active, high, moderate };
    }, [alerts]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="p-6 max-w-6xl mx-auto bg-transparent">
                <AlertBanner />
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-semibold text-gray-900">{`Welcome${userName ? ", " + userName : ""}`}</h1>
                    <button onClick={handleLogout} className="px-4 py-2 rounded bg-rose-600 text-white hover:bg-rose-700">
                        Logout
                    </button>
                </div>
                <p className="mb-6 text-gray-600">Access predictions, report incidents, and review current alerts.</p>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white shadow rounded p-4 text-center">
                        <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
                        <div className="text-sm text-gray-500">Total alerts</div>
                    </div>
                    <div className="bg-white shadow rounded p-4 text-center">
                        <div className="text-2xl font-semibold text-gray-900">{stats.active}</div>
                        <div className="text-sm text-gray-500">Active</div>
                    </div>
                    <div className="bg-white shadow rounded p-4 text-center">
                        <div className="text-2xl font-semibold text-gray-900">{stats.high}</div>
                        <div className="text-sm text-gray-500">High risk</div>
                    </div>
                    <div className="bg-white shadow rounded p-4 text-center">
                        <div className="text-2xl font-semibold text-gray-900">{stats.moderate}</div>
                        <div className="text-sm text-gray-500">Moderate risk</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Link to="/live-fire-map" className="bg-white shadow p-5 rounded hover:shadow-md transition">
                                <h2 className="text-lg font-medium text-gray-900 mb-1">Live fire map</h2>
                                <p className="text-gray-600">View current incidents and hotspots.</p>
                            </Link>
                            <Link to="/predict" className="bg-white shadow p-5 rounded hover:shadow-md transition">
                                <h2 className="text-lg font-medium text-gray-900 mb-1">Predict fire risk</h2>
                                <p className="text-gray-600">Check risk for a specific location.</p>
                            </Link>
                            <Link to="/report-fire" className="bg-white shadow p-5 rounded hover:shadow-md transition">
                                <h2 className="text-lg font-medium text-gray-900 mb-1">Report a fire</h2>
                                <p className="text-gray-600">Submit a report for review.</p>
                            </Link>
                            <Link to="/contact" className="bg-white shadow p-5 rounded hover:shadow-md transition">
                                <h2 className="text-lg font-medium text-gray-900 mb-1">Contact & support</h2>
                                <p className="text-gray-600">Get in touch or send feedback.</p>
                            </Link>
                        </div>

                        {/* Recent Alerts */}
                        <div className="bg-white shadow rounded p-5 mt-6">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-base font-medium text-gray-900">Recent alerts</h3>
                                <Link to="/alerts" className="text-sm text-gray-700 hover:text-gray-900">View all</Link>
                            </div>
                            {loading ? (
                                <div className="text-gray-600">Loading alerts...</div>
                            ) : error ? (
                                <div className="text-red-600">{error}</div>
                            ) : alerts.length === 0 ? (
                                <div className="text-gray-600">No active alerts at the moment.</div>
                            ) : (
                                <ul className="divide-y">
                                    {alerts.slice(0, 5).map(a => (
                                        <li key={a.id} className="py-3 flex items-start justify-between">
                                            <div>
                                                <div className="font-medium text-gray-900">{a.title}</div>
                                                <div className="text-sm text-gray-600">{a.district}</div>
                                                <div className="text-xs text-gray-500">{new Date(a.created_at).toLocaleString()}</div>
                                            </div>
                                            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 border border-gray-200">
                                                {a.risk_level}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Tips panel */}
                    <div className="bg-white shadow rounded p-5 h-fit">
                        <h3 className="text-base font-medium mb-2 text-gray-900">Safety tips</h3>
                        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
                            <li>Avoid open flames during dry, windy days.</li>
                            <li>Keep a fire extinguisher accessible at home.</li>
                            <li>Report smoke immediately to local authorities.</li>
                            <li>Follow official evacuation instructions.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
} 