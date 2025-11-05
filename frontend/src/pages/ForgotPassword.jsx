import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const { data } = await axios.post("http://localhost:8000/forgot-password", {
                email: email
            });

            setMessage(data.message);
            // Store email for password reset OTP page
            localStorage.setItem("resetPasswordEmail", email);

            // Redirect to password reset OTP page after 2 seconds
            setTimeout(() => {
                navigate(`/reset-password?email=${email}`);
            }, 2000);

        } catch (err) {
            console.error("Forgot password error:", err);
            let errorMessage = "Failed to send password reset OTP. Please try again.";

            if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (typeof err.response?.data === 'string') {
                errorMessage = err.response.data;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
            <div style={{ maxWidth: 450, margin: "0 auto", padding: 32, background: "#fff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <h2 style={{ textAlign: "center", marginBottom: 8, fontSize: "28px", fontWeight: "bold", color: "#166534" }}>Forgot Password</h2>

                <p style={{ textAlign: "center", marginBottom: 24, color: "#6b7280", fontSize: "14px" }}>
                    Enter your email address and we'll send you a password reset OTP.
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: "#374151" }}>
                            Email Address:
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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

                    <button
                        type="submit"
                        disabled={loading || !email}
                        style={{
                            width: "100%",
                            padding: 14,
                            background: loading || !email ? "#d1d5db" : "linear-gradient(to right, #16a34a, #15803d)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 16,
                            fontWeight: "600",
                            cursor: loading || !email ? "not-allowed" : "pointer",
                            marginBottom: 16,
                            transition: "all 0.2s"
                        }}
                    >
                        {loading ? "Sending..." : "Send Reset OTP"}
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: 20 }}>
                    <button
                        onClick={() => navigate("/login")}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#16a34a",
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontWeight: "500"
                        }}
                    >
                        Back to Login
                    </button>
                </div>

                {message && (
                    <div style={{ color: "#16a34a", marginTop: 16, textAlign: "center", padding: 12, background: "#f0fdf4", borderRadius: 8, fontWeight: "500" }}>
                        {message}
                    </div>
                )}

                {error && (
                    <div style={{ color: "#dc2626", marginTop: 16, textAlign: "center", padding: 12, background: "#fef2f2", borderRadius: 8, fontWeight: "500" }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
} 