import React, { useState } from "react";
import API from "../api";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = send OTP, 2 = verify OTP
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  // Step 1 — Send OTP
  async function sendOtp(e) {
    e.preventDefault();
    try {
      await API.post("/user/forgot-password/send-otp", { email });
      setMsg("OTP sent to your email");
      setStep(2);
    } catch (err) {
      setMsg(err.response?.data?.message || "Error occurred");
    }
  }

  // Step 2 — Verify OTP + Reset Password
  async function verifyOtp(e) {
    e.preventDefault();
    try {
      await API.post("/user/forgot-password/verify-otp", {
        email,
        otp,
        newPassword,
      });
      setMsg("Password reset successful. Please login now.");
    } catch (err) {
      setMsg(err.response?.data?.message || "Error occurred");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      
      <h2 className="text-xl font-bold text-center mb-4">
        Forgot Password
      </h2>

      {msg && <p className="text-center text-sm mb-3 text-blue-600">{msg}</p>}

      {step === 1 && (
        <form onSubmit={sendOtp} className="space-y-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border p-3 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button className="w-full bg-blue-600 text-white p-2 rounded">
            Send OTP
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={verifyOtp} className="space-y-3">
          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full border p-3 rounded"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="New Password"
            className="w-full border p-3 rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button className="w-full bg-green-600 text-white p-2 rounded">
            Reset Password
          </button>

          <p className="text-center text-sm mt-3">
            <a href="/login" className="text-blue-500">Back to Login</a>
          </p>
        </form>
      )}
    </div>
  );
}
