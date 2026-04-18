"use client";
import React, { useState, useEffect } from "react";
import NavBar from "../components/navBar";
import api from "@/lib/api";
import {
  Trophy,
  Crown,
  Medal,
  Swords,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  Search,
  Flame,
  Shield,
  Star,
  Zap,
  Diamond,
  Award,
} from "lucide-react";

interface UserStats {
  totalPoints: number;
  battlePoints: number;
  contestPoints: number;
  battleWon: number;
  battleLost: number;
  battleParticipated: number;
  problemSolved: number;
  currentLeague: string;
  overAllWinRate: number;
}

interface LeaderboardUser {
  _id: string;
  username: string;
  fullname: string;
  profilePicture: string;
  performanceStats: UserStats;
}

const LEAGUE_CONFIG: Record<
  string,
  { color: string; bg: string; border: string; icon: React.ReactNode; glow: string }
> = {
  Master: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    glow: "shadow-red-500/20",
    icon: <Crown size={14} />,
  },
  Diamond: {
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    glow: "shadow-cyan-500/20",
    icon: <Diamond size={14} />,
  },
  Platinum: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
    icon: <Shield size={14} />,
  },
  Gold: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
    icon: <Star size={14} />,
  },
  Silver: {
    color: "text-gray-300",
    bg: "bg-gray-400/10",
    border: "border-gray-400/30",
    glow: "shadow-gray-400/20",
    icon: <Medal size={14} />,
  },
  Bronze: {
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    glow: "shadow-orange-500/20",
    icon: <Award size={14} />,
  },
  unknown: {
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/30",
    glow: "shadow-gray-500/20",
    icon: <Zap size={14} />,
  },
};

function LeagueBadge({ league }: { league: string }) {
  const config = LEAGUE_CONFIG[league] || LEAGUE_CONFIG.unknown;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${config.color} ${config.bg} border ${config.border}`}
    >
      {config.icon}
      {league === "unknown" ? "Unranked" : league}
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="relative">
        <div className="absolute -inset-2 bg-amber-400/20 rounded-full blur-md animate-pulse" />
        <div className="relative w-11 h-11 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 ring-2 ring-amber-300/50">
          <Crown size={20} className="text-white drop-shadow" />
        </div>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-11 h-11 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg shadow-gray-400/30 ring-2 ring-gray-300/50">
        <span className="text-white font-black text-sm">2</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-11 h-11 bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-400/30 ring-2 ring-orange-300/50">
        <span className="text-white font-black text-sm">3</span>
      </div>
    );
  }
  return (
    <div className="w-11 h-11 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center">
      <span className="text-gray-400 font-black text-sm">{rank}</span>
    </div>
  );
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"totalPoints" | "battlePoints" | "problemSolved">("totalPoints");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get("/auth/leaderboard");
        setUsers(res.data.data.users || []);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const filteredUsers = users
    .filter(
      (u) =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.fullname.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a.performanceStats?.[sortBy] || 0;
      const bVal = b.performanceStats?.[sortBy] || 0;
      return bVal - aVal;
    });

  const topThree = filteredUsers.slice(0, 3);
  const rest = filteredUsers.slice(3);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FD]">
        <NavBar />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
              Loading Rankings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FD]">
      <NavBar />

      <div className="container mx-auto px-6 pt-8 pb-20">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6">
            <Trophy size={14} />
            Global Rankings
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-[#232B36] tracking-tighter mb-4">
            Leader<span className="text-[#6266F0]">board</span>
          </h1>
          <p className="text-gray-400 font-medium max-w-md mx-auto">
            The top coders ranked by total points, battle wins, and problems solved.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 transition-all shadow-sm"
            />
          </div>

          {/* Sort Tabs */}
          <div className="flex bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100/50 shadow-inner">
            {(
              [
                { key: "totalPoints", label: "Points", icon: <TrendingUp size={13} /> },
                { key: "battlePoints", label: "ELO", icon: <Swords size={13} /> },
                { key: "problemSolved", label: "Solved", icon: <Flame size={13} /> },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSortBy(tab.key)}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                  sortBy === tab.key
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium */}
        {topThree.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 md:gap-8 mb-12 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            {/* 2nd Place */}
            <div className="flex flex-col items-center mt-8">
              <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 md:p-8 text-center shadow-sm hover:shadow-md transition-all group w-full">
                <div className="relative mx-auto w-16 h-16 mb-4">
                  <div className="absolute -inset-1 bg-gray-300/30 rounded-full blur-sm" />
                  <img
                    src={topThree[1].profilePicture || "/profile.png"}
                    alt={topThree[1].username}
                    className="relative w-16 h-16 rounded-full object-cover ring-3 ring-gray-300/50"
                  />
                </div>
                <RankBadge rank={2} />
                <h3 className="font-black text-[#232B36] mt-3 text-sm md:text-base truncate">
                  {topThree[1].username}
                </h3>
                <p className="text-gray-400 text-xs font-medium truncate">{topThree[1].fullname}</p>
                <div className="mt-3">
                  <LeagueBadge league={topThree[1].performanceStats?.currentLeague || "unknown"} />
                </div>
                <p className="text-2xl font-black text-[#232B36] mt-3">
                  {(topThree[1].performanceStats?.totalPoints || 0).toLocaleString()}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Points</p>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <div className="relative bg-white border border-indigo-100 rounded-[2.5rem] p-6 md:p-8 text-center shadow-lg shadow-indigo-100/50 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group w-full">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-amber-300/30">
                    Champion
                  </div>
                </div>
                <div className="relative mx-auto w-20 h-20 mb-4 mt-2">
                  <div className="absolute -inset-2 bg-amber-400/20 rounded-full blur-md animate-pulse" />
                  <img
                    src={topThree[0].profilePicture || "/profile.png"}
                    alt={topThree[0].username}
                    className="relative w-20 h-20 rounded-full object-cover ring-4 ring-amber-400/50"
                  />
                </div>
                <RankBadge rank={1} />
                <h3 className="font-black text-[#232B36] mt-3 text-base md:text-lg truncate">
                  {topThree[0].username}
                </h3>
                <p className="text-gray-400 text-xs font-medium truncate">{topThree[0].fullname}</p>
                <div className="mt-3">
                  <LeagueBadge league={topThree[0].performanceStats?.currentLeague || "unknown"} />
                </div>
                <p className="text-3xl font-black text-[#6266F0] mt-3">
                  {(topThree[0].performanceStats?.totalPoints || 0).toLocaleString()}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Points</p>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center mt-8">
              <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 md:p-8 text-center shadow-sm hover:shadow-md transition-all group w-full">
                <div className="relative mx-auto w-16 h-16 mb-4">
                  <div className="absolute -inset-1 bg-orange-300/30 rounded-full blur-sm" />
                  <img
                    src={topThree[2].profilePicture || "/profile.png"}
                    alt={topThree[2].username}
                    className="relative w-16 h-16 rounded-full object-cover ring-3 ring-orange-300/50"
                  />
                </div>
                <RankBadge rank={3} />
                <h3 className="font-black text-[#232B36] mt-3 text-sm md:text-base truncate">
                  {topThree[2].username}
                </h3>
                <p className="text-gray-400 text-xs font-medium truncate">{topThree[2].fullname}</p>
                <div className="mt-3">
                  <LeagueBadge league={topThree[2].performanceStats?.currentLeague || "unknown"} />
                </div>
                <p className="text-2xl font-black text-[#232B36] mt-3">
                  {(topThree[2].performanceStats?.totalPoints || 0).toLocaleString()}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Points</p>
              </div>
            </div>
          </div>
        )}

        {/* Full Table */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-300">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Player</div>
            <div className="col-span-2">League</div>
            <div className="col-span-1 text-center">Solved</div>
            <div className="col-span-2 text-center">Battles</div>
            <div className="col-span-2 text-right">Points</div>
          </div>

          {/* Rows */}
          {(topThree.length >= 3 ? rest : filteredUsers).map((user, i) => {
            const rank = topThree.length >= 3 ? i + 4 : i + 1;
            const stats = user.performanceStats;
            const winRate =
              stats?.battleParticipated > 0
                ? Math.round(
                    ((stats?.battleWon || 0) / stats.battleParticipated) * 100
                  )
                : 0;
            return (
              <div
                key={user._id}
                className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-gray-50/80 hover:bg-indigo-50/30 transition-all cursor-pointer group items-center"
                onClick={() => (window.location.href = `/profile?user=${user._id}`)}
              >
                <div className="col-span-1">
                  <RankBadge rank={rank} />
                </div>

                <div className="col-span-4 flex items-center gap-3">
                  <img
                    src={user.profilePicture || "/profile.png"}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-100 group-hover:border-indigo-200 transition-all"
                  />
                  <div className="min-w-0">
                    <p className="font-black text-[#232B36] text-sm truncate group-hover:text-[#6266F0] transition-colors">
                      {user.username}
                    </p>
                    <p className="text-gray-400 text-xs truncate">{user.fullname}</p>
                  </div>
                </div>

                <div className="col-span-2 flex items-center">
                  <LeagueBadge league={stats?.currentLeague || "unknown"} />
                </div>

                <div className="col-span-1 text-center">
                  <span className="font-black text-[#232B36]">
                    {stats?.problemSolved || 0}
                  </span>
                </div>

                <div className="col-span-2 text-center">
                  <span className="font-black text-emerald-500 text-xs">
                    {stats?.battleWon || 0}W
                  </span>
                  <span className="text-gray-300 mx-1">/</span>
                  <span className="font-black text-red-400 text-xs">
                    {stats?.battleLost || 0}L
                  </span>
                  {winRate > 0 && (
                    <span className="ml-2 text-[10px] text-gray-300 font-bold">
                      ({winRate}%)
                    </span>
                  )}
                </div>

                <div className="col-span-2 text-right">
                  <span className="font-black text-lg text-[#232B36] group-hover:text-[#6266F0] transition-colors">
                    {(stats?.totalPoints || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredUsers.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-300 font-bold text-sm">No players found</p>
              <p className="text-gray-200 text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
