import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [isSignup, setIsSignup] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        nid: "",
        password: "",
        identifier: "",
    });
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            const { data } = await axios.post("http://localhost:8000/register", {
                email: formData.email,
                username: formData.username,
                nid: formData.nid,
                password: formData.password,
            });

            setMessage(data.message);
            
            // Clear form and switch to login
            setFormData({
                email: "",
                username: "",
                nid: "",
                password: "",
                identifier: "",
            });
            
            // Switch to login form after 2 seconds
            setTimeout(() => {
                setIsSignup(false);
                setMessage("Registration successful! Please log in.");
            }, 2000);

        } catch (err) {
            console.error("Signup error:", err);
            let errorMessage = "Registration failed. Please try again.";

            if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (typeof err.response?.data === 'string') {
                errorMessage = err.response.data;
            }

            setError(errorMessage);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            const { data } = await axios.post("http://localhost:8000/login", {
                identifier: formData.identifier,
                password: formData.password,
            });

            setMessage("Login successful!");

            const displayName = data.username || data.email?.split('@')[0] || "User";
            login(data.access_token, data.role, displayName);

            // Redirect based on role
            setTimeout(() => {
                if (data.role === "admin") {
                    navigate("/admin-dashboard");
                } else {
                    navigate("/user-dashboard");
                }
            }, 1000);

        } catch (err) {
            console.error("Login error:", err);
            let errorMessage = "Login failed. Please try again.";

            if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (typeof err.response?.data === 'string') {
                errorMessage = err.response.data;
            }

            setError(errorMessage);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
            <div style={{ maxWidth: 450, margin: "0 auto", padding: 32, background: "#fff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <h2 style={{ textAlign: "center", marginBottom: 8, fontSize: "28px", fontWeight: "bold", color: "#166534" }}>
                    {isSignup ? "Create Account" : "Welcome Back"}
                </h2>
                <p style={{ textAlign: "center", marginBottom: 24, color: "#6b7280", fontSize: "14px" }}>
                    {isSignup ? "Join our forest fire monitoring community" : "Sign in to your account"}
                </p>

                <form onSubmit={isSignup ? handleSignup : handleLogin}>
                    {isSignup ? (
                        <>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: "#374151" }}>
                                    Email:
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
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
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: "#374151" }}>
                                    Username:
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter username"
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
                                    NID:
                                </label>
                                <input
                                    type="text"
                                    name="nid"
                                    value={formData.nid}
                                    onChange={handleChange}
                                    placeholder="Enter NID"
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
                        </>
                    ) : (
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: "#374151" }}>
                                Email or Username:
                            </label>
                            <input
                                type="text"
                                name="identifier"
                                value={formData.identifier}
                                onChange={handleChange}
                                placeholder="Enter email or username"
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
                    )}

                    <div style={{ marginBottom: 20, position: "relative" }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: "#374151" }}>
                            Password:
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                            style={{
                                width: "100%",
                                padding: "12px 40px 12px 12px",
                                border: "2px solid #d1d5db",
                                borderRadius: 8,
                                outline: "none",
                                transition: "all 0.2s"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#16a34a"}
                            onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: "absolute",
                                right: 12,
                                top: 40,
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#6b7280",
                                padding: 4
                            }}
                        >
                            {showPassword ? (
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: 14,
                            background: "linear-gradient(to right, #16a34a, #15803d)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 16,
                            fontWeight: "600",
                            cursor: "pointer",
                            marginBottom: 16,
                            transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.transform = "translateY(-1px)"}
                        onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                    >
                        {isSignup ? "Create Account" : "Sign In"}
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: 16 }}>
                    <button
                        onClick={() => {
                            setIsSignup((s) => !s);
                            setError("");
                            setMessage("");
                        }}
                        style={{ background: "none", border: "none", color: "#16a34a", cursor: "pointer", fontWeight: "500" }}
                    >
                        {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                    </button>
                    {!isSignup && (
                        <div style={{ marginTop: 12 }}>
                            <button
                                onClick={() => navigate("/forgot-password")}
                                style={{ background: "none", border: "none", color: "#16a34a", cursor: "pointer", textDecoration: "underline", fontWeight: "500" }}
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}
                </div>
                {message && <div style={{ color: "#16a34a", marginTop: 16, padding: 12, background: "#f0fdf4", borderRadius: 8, textAlign: "center", fontWeight: "500" }}>{message}</div>}
                {error && <div style={{ color: "#dc2626", marginTop: 16, padding: 12, background: "#fef2f2", borderRadius: 8, textAlign: "center", fontWeight: "500" }}>{error}</div>}
            </div>
        </div>
    );
} 