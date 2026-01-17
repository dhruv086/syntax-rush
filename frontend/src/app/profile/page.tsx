"use client";
import React, { useState, useEffect } from "react";
import SideBar from "../components/profile/sideBar";
import Leaderboard from "../components/profile/leaderboard";
import Pro from "../components/profile/pro";
import Friends from "../components/profile/friends";
import Group from "../components/profile/group";
import NavBar from "../components/navBar";
import api from "@/lib/api";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/profile");
        setUser(res.data.data.user);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const renderContent = () => {
    if (loading) return <div className="p-10 text-gray-500">Loading profile...</div>;
    if (!user) return <div className="p-10 text-red-500">User not found. Please log in again.</div>;

    switch (activeTab) {
      case "profile":
        return <Pro user={user} onUserUpdate={(updatedUser: any) => setUser(updatedUser)} />;
      case "leaderboard":
        return <Leaderboard />;
      case "group":
        return <Group />;
      case "friends":
        return <Friends />;
      default:
        return <Friends />;
    }
  };

  return (
    <div>
      <NavBar />
      <div className="min-h-screen bg-[#F7F8FD]">
        {/* Sidebar */}
        <div className="absolute left-0 top-16 w-64 h-full z-10">
          <SideBar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
        </div>
        {/* Main Content */}
        <div className="ml-64 min-h-screen overflow-y-auto h-screen">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
