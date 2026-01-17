"use client";
import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type SoloRow = { username: string; fullname: string; performanceStats: any; profilePicture?: string };
type GroupRow = { name: string; members: any[]; stats: any };

export default function Leaderboard() {
  const [mode, setMode] = useState<"solo" | "group">("solo");
  const [soloData, setSoloData] = useState<SoloRow[]>([]);
  const [groupData, setGroupData] = useState<GroupRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        if (mode === "solo") {
          const res = await api.get("/auth/leaderboard");
          setSoloData(res.data.data.users);
        } else {
          // Assuming we have a group/leaderboard endpoint or similar
          const res = await api.get("/group/search?query="); // temp fallback
          setGroupData(res.data.data.groups);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [mode]);

  const rows = useMemo(() => {
    if (mode === "solo") return soloData;
    return groupData;
  }, [mode, soloData, groupData]);

  return (
    <div className="w-full min-h-screen bg-[#F7F8FD]">
      {/* Header + Toggle */}
      <div className="max-w-[1100px] mx-auto px-6 pt-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Leaderboard</h1>
          <div className="flex gap-2">
            <button
              className={`px-5 py-2 rounded-full text-sm transition ${mode === "solo"
                  ? "bg-[#232b36] text-white"
                  : "bg-white text-gray-500 shadow"
                }`}
              onClick={() => setMode("solo")}
            >
              Solo
            </button>
            <button
              className={`px-5 py-2 rounded-full text-sm transition ${mode === "group"
                  ? "bg-[#232b36] text-white"
                  : "bg-white text-gray-500 shadow"
                }`}
              onClick={() => setMode("group")}
            >
              Group
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow overflow-y-auto h-[85vh]">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading leaderboard...</div>
          ) : (
            <>
              <div className="grid grid-cols-12 px-6 py-3 text-xs font-medium text-gray-500 border-b">
                <div className="col-span-1">Rank</div>
                <div className="col-span-6 md:col-span-6">
                  {mode === "solo" ? "Player" : "Team"}
                </div>
                {mode === "group" && <div className="hidden md:block col-span-2">Members</div>}
                <div className="col-span-2 text-right">Score</div>
                <div className="col-span-3 md:col-span-2 text-right">Battles</div>
              </div>

              <ul>
                {rows.map((row: any, idx) => {
                  const rank = idx + 1;
                  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";

                  return (
                    <li
                      key={idx}
                      className="grid grid-cols-12 items-center px-6 py-3 border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="col-span-1 text-gray-400">
                        {medal || `${rank}.`}
                      </div>
                      <div className="col-span-6 md:col-span-6 flex items-center gap-3">
                        <img
                          src={mode === "solo" ? (row.profilePicture || "/profile.png") : "/profile.png"}
                          className="w-7 h-7 rounded-full bg-gray-200 object-cover"
                          alt=""
                        />
                        <span className="text-gray-800 text-sm">
                          {mode === "solo" ? row.fullname : row.name}
                        </span>
                      </div>
                      {mode === "group" && (
                        <div className="hidden md:block col-span-2 text-gray-500 text-sm">
                          {row.members?.length || 0}
                        </div>
                      )}
                      <div className="col-span-2 text-right text-gray-800 text-sm">
                        {mode === "solo" ? (row.performanceStats?.totalPoints || 0) : (row.stats?.totalPoints || 0)}
                      </div>
                      <div className="col-span-3 md:col-span-2 text-right text-gray-500 text-sm">
                        {mode === "solo" ? (row.performanceStats?.battleParticipated || 0) : (row.stats?.totalBattles || 0)}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {rows.length === 0 && <div className="p-10 text-center text-gray-500">No data available</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
