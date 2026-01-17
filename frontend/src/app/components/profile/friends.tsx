"use client";
import React, { useState, useEffect } from "react";
import { Search, UserPlus, Users, MessageCircle, Swords, MoreVertical, Check, X } from "lucide-react";
import api from "@/lib/api";

export default function Friends() {
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = async () => {
    try {
      const res = await api.get("/social/friends");
      setFriends(res.data.data.friends);
    } catch (err) {
      console.error("Failed to fetch friends", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get("/social/requests");
      setRequests(res.data.data.requests);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchFriends(), fetchRequests()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/social/search?query=${q}`);
      setSearchResults(res.data.data.users);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const sendRequest = async (friendId: string) => {
    try {
      await api.post("/social/request", { friendId });
      alert("Friend request sent!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to send request");
    }
  };

  const acceptRequest = async (friendId: string) => {
    try {
      await api.post("/social/accept", { friendId });
      fetchFriends();
      fetchRequests();
    } catch (err) {
      alert("Failed to accept request");
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading social hub...</div>;

  return (
    <div className="h-full bg-[#F7F8FD] flex flex-col relative">
      {/* Header */}
      <div className="absolute top-0 right-0 left-0 z-50 border-b border-gray-200 px-6 py-4 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#232b36]">Social Hub</h1>
          <div className="flex items-center gap-3 flex-1 max-w-md ml-10">
            <div className="relative w-full">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-[#232b36] text-sm"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-64 overflow-y-auto">
                  {searchResults.map((u) => (
                    <div key={u._id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <img src={u.profilePicture || "/profile.png"} className="w-8 h-8 rounded-full" alt="" />
                        <div>
                          <p className="text-sm font-semibold">{u.fullname}</p>
                          <p className="text-xs text-gray-400">@{u.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => sendRequest(u._id)}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                      >
                        <UserPlus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="mt-20 flex-1 overflow-y-auto px-6 py-4">
        {requests.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Pending Requests ({requests.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map((req) => (
                <div key={req._id} className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={req.userId.profilePicture || "/profile.png"} className="w-10 h-10 rounded-full" alt="" />
                    <div>
                      <h4 className="font-semibold text-sm">{req.userId.fullname}</h4>
                      <p className="text-xs text-gray-500">@{req.userId.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => acceptRequest(req.userId._id)} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                      <Check size={16} />
                    </button>
                    <button className="p-2 bg-white text-gray-400 rounded-lg border hover:text-red-500">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Your Friends ({friends.length})</h3>
        <div className="space-y-3">
          {friends.map((item) => (
            <div key={item._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={item.userId.profilePicture || "/profile.png"} className="w-12 h-12 rounded-full object-cover" alt="" />
                  <div>
                    <h3 className="font-semibold text-[#232b36] text-sm">{item.userId.fullname}</h3>
                    <p className="text-xs text-gray-500">@{item.userId.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-[#232b36] hover:bg-gray-100 rounded-lg transition-colors">
                    <Swords size={18} />
                  </button>
                  <button className="p-2 text-[#232b36] hover:bg-gray-100 rounded-lg transition-colors">
                    <MessageCircle size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {friends.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <Users size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500">No friends yet. Start by searching for players!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
