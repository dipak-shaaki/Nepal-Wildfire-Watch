import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Get email from URL params or localStorage
        const emailFromParams = searchParams.get("email");
        const emailFromStorage = localStorage.getItem("resetPasswordEmail");

        if (emailFromParams) {
            setEmail(emailFromParams);
        } else if (emailFromStorage) {
            setEmail(emailFromStorage);
        } else {
            // Redirect to forgot password if no email found
            navigate("/forgot-password");
        }
    }, [searchParams, navigate]);

    useEffect(() => {
        // Start countdown for resend button
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, ""); // Only allow digits
        if (value.length <= 6) {
            setOtp(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (otp.length !== 6) {
            setError("Please enter a 6-digit OTP");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const { data } = await axios.post(`${API_BASE_URL}/reset-password`, {
                email: email,
                otp: otp,
                new_password: newPassword
            });

            setMessage(data.message);
            localStorage.removeItem("resetPasswordEmail");

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate("/login");
            }, 3000);

        } catch (err) {
            console.error("Password reset error:", err);
            let errorMessage = "Password reset failed. Please try again.";

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

    const handleResendOTP = async () => {
        setResendLoading(true);
        setError("");

        try {
            const { data } = await axios.post(`${API_BASE_URL}/forgot-password`, {
                email: email
            });

            setMessage(data.message);
            setCountdown(60); // 60 seconds countdown

        } catch (err) {
            console.error("Resend OTP error:", err);
            let errorMessage = "Failed to resend OTP. Please try again.";

            if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (typeof err.response?.data === 'string') {
                errorMessage = err.response.data;
            }

            setError(errorMessage);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
            <div style={{ maxWidth: 450, margin: "0 auto", padding: 32, background: "#fff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <h2 style={{ textAlign: "center", marginBottom: 8, fontSize: "28px", fontWeight: "bold", color: "#166534" }}>Reset Password</h2>

                <p style={{ textAlign: "center", marginBottom: 24, color: "#6b7280", fontSize: "14px" }}>
                    Enter the OTP sent to <strong>{email}</strong> and your new password.
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: "#374151" }}>
                            OTP:
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={handleOtpChange}
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            style={{
                                width: "100%",
                                padding: 12,
                                fontSize: 18,
                                textAlign: "center",
                                letterSpacing: 8,
                                border: "2px solid #d1d5db",
                                borderRadius: 8,
                                outline: "none",
                                transition: "all 0.2s"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#16a34a"}
                            onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                            autoFocus
                        />
                    </div>

                    <div style={{ marginBottom: 20, position: "relative" }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: "#374151" }}>
                            New Password:
                        </label>
                        <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
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
                            onClick={() => setShowNewPassword(!showNewPassword)}
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
                            {showNewPassword ? (
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

                    <div style={{ marginBottom: 20, position: "relative" }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: "600", color: "#374151" }}>
                            Confirm Password:
                        </label>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
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
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                            {showConfirmPassword ? (
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
                        disabled={loading || otp.length !== 6 || !newPassword || !confirmPassword}
                        style={{
                            width: "100%",
                            padding: 14,
                            background: loading || otp.length !== 6 || !newPassword || !confirmPassword ? "#d1d5db" : "linear-gradient(to right, #16a34a, #15803d)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 16,
                            fontWeight: "600",
                            cursor: loading || otp.length !== 6 || !newPassword || !confirmPassword ? "not-allowed" : "pointer",
                            marginBottom: 16,
                            transition: "all 0.2s"
                        }}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: 20 }}>
                    <p style={{ marginBottom: 10, color: "#6b7280", fontSize: "14px" }}>
                        Didn't receive the OTP?
                    </p>
                    <button
                        onClick={handleResendOTP}
                        disabled={resendLoading || countdown > 0}
                        style={{
                            background: "none",
                            border: "none",
                            color: resendLoading || countdown > 0 ? "#d1d5db" : "#16a34a",
                            cursor: resendLoading || countdown > 0 ? "not-allowed" : "pointer",
                            textDecoration: "underline",
                            fontWeight: "500"
                        }}
                    >
                        {resendLoading ? "Sending..." :
                            countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
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