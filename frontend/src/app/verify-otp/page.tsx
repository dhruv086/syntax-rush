"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const signupData = localStorage.getItem("signupData");
    if (!signupData) {
      router.push("/signup");
    } else {
      setEmail(JSON.parse(signupData).email);
    }
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Step 1: Verify OTP
      await api.post("/auth/verify-otp", { email, otp });

      // Step 2: Register user
      const signupData = JSON.parse(localStorage.getItem("signupData") || "{}");
      const response = await api.post("/auth/register", signupData);

      if (response.status === 201) {
        localStorage.removeItem("signupData");
        router.push("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Verify Email</h1>
        <p className="text-gray-500 mt-2 mb-8">Enter the 6-digit code sent to <br /><span className="font-semibold text-gray-700">{email}</span></p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full text-center text-3xl tracking-[1em] px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-[#6266F0] outline-none transition"
            placeholder="000000"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6266F0] text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Create Account"}
          </button>
        </form>

        <p className="mt-8 text-sm text-gray-500">
          Didn't receive the code?{" "}
          <button
            type="button"
            className="text-[#6266F0] font-semibold hover:underline"
            onClick={async () => {
              try {
                await api.post("/auth/send-otp", { email });
                alert("OTP Resent!");
              } catch (err) { }
            }}
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}
