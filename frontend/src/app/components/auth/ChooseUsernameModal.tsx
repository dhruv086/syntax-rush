"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, Sparkles, AtSign } from "lucide-react";

interface ChooseUsernameModalProps {
  onSuccess: () => void;
  onSkip: () => void;
}

export default function ChooseUsernameModal({ onSuccess, onSkip }: ChooseUsernameModalProps) {
  const [username, setUsername] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);
  const [reason, setReason] = useState("");
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Debounced username availability check
  useEffect(() => {
    if (!username || username.length < 3) {
      setAvailable(null);
      setReason("");
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await api.get(`/auth/check-username?username=${username}`);
        setAvailable(res.data.data.available);
        setReason(res.data.data.reason || "");
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async () => {
    if (!available || saving) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/auth/set-username", { username });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to set username");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0f1a]/80 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md animate-in zoom-in-95 duration-300">
        {/* Animated background orbs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl" />

        {/* Card */}
        <div className="relative z-10 bg-[#1e1e2e] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/20">
              <AtSign size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Choose Your Handle</h2>
            <p className="text-gray-400 text-xs leading-relaxed max-w-[250px] mx-auto">
              This is how other players will see you on SyntaxRush. Pick something memorable.
            </p>
          </div>

          {/* Username Input */}
          <div className="mb-6">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                maxLength={20}
                placeholder="your_username"
                className="w-full pl-10 pr-12 py-3.5 bg-[#252536] border-2 rounded-2xl text-white font-mono text-base outline-none transition-all placeholder:text-gray-600 focus:bg-[#2a2a3e]"
                style={{
                  borderColor: available === true ? "#10b981" : available === false ? "#ef4444" : "rgba(255,255,255,0.05)",
                }}
                autoFocus
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {checking && <Loader2 size={18} className="text-indigo-400 animate-spin" />}
                {!checking && available === true && <Check size={18} className="text-emerald-400" />}
                {!checking && available === false && <X size={18} className="text-red-400" />}
              </div>
            </div>

            {/* Status message */}
            <div className="mt-2 min-h-[20px] px-1">
              {username.length > 0 && username.length < 3 && (
                <p className="text-amber-400 text-[11px] font-medium">Minimum 3 characters</p>
              )}
              {!checking && available === true && (
                <p className="text-emerald-400 text-[11px] font-medium flex items-center gap-1.5">
                  <Sparkles size={10} /> This username is available!
                </p>
              )}
              {!checking && available === false && reason && (
                <p className="text-red-400 text-[11px] font-medium">{reason}</p>
              )}
            </div>
          </div>

          {/* Rules */}
          <div className="bg-[#252536]/50 rounded-xl p-4 mb-6 border border-white/5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2">Username Rules</p>
            <ul className="text-[11px] text-gray-400 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className={`w-1 h-1 rounded-full ${username.length >= 3 ? "bg-emerald-400" : "bg-gray-600"}`} />
                3–20 characters long
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-1 h-1 rounded-full ${/^[a-zA-Z0-9_]*$/.test(username) && username.length > 0 ? "bg-emerald-400" : "bg-gray-600"}`} />
                Letters, numbers, and underscores only
              </li>
            </ul>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-xs font-medium text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!available || saving}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Setting handle...
              </span>
            ) : (
              "Claim This Handle"
            )}
          </button>

          {/* Skip */}
          <button
            onClick={onSkip}
            className="w-full mt-3 py-2 text-gray-500 hover:text-gray-300 text-[10px] font-bold uppercase tracking-widest transition"
          >
            Skip for now — use default
          </button>
        </div>
      </div>
    </div>
  );
}
