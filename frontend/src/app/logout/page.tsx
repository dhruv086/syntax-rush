"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await api.post("/auth/logout");
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        router.push("/login");
      }
    };
    performLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FD]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-[#232B36]">Signing you out...</h2>
        <p className="text-gray-500 mt-2">Please wait a moment.</p>
      </div>
    </div>
  );
}
