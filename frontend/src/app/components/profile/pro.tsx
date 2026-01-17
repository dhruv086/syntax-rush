import React, { useState, useEffect } from "react";
import api from "@/lib/api";

interface ProProps {
  user: any;
  onUserUpdate: (user: any) => void;
}

export default function Pro({ user, onUserUpdate }: ProProps) {
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [aboutDraft, setAboutDraft] = useState(user?.about || "");
  const [profileDraft, setProfileDraft] = useState({
    fullname: user?.fullname || "",
    college: user?.college || "",
    country: user?.country || ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAboutDraft(user?.about || "");
    setProfileDraft({
      fullname: user?.fullname || "",
      college: user?.college || "",
      country: user?.country || ""
    });
  }, [user]);

  const handleSaveAbout = async () => {
    setSaving(true);
    try {
      const res = await api.patch("/auth/update-profile", { about: aboutDraft });
      onUserUpdate(res.data.data.user);
      setIsEditingAbout(false);
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.patch("/auth/update-profile", profileDraft);
      onUserUpdate(res.data.data.user);
      setIsEditingProfile(false);
    } catch (err) {
      alert("Failed to update profile info");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="p-10 text-red-500">User not found. Please log in.</div>;

  return (
    <div>
      <div className="grid grid-cols-4 grid-rows-9 gap-4 min-h-[150vh] m-10 ml-10 ">
        <div className="col-span-2 row-span-3 h-full w-full rounded-xl bg-[#6266F0] text-white p-6 flex gap-6">
          <img
            src={user.profilePicture || "/profile.png"}
            alt="profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-white/20"
          />
          <div className="flex flex-col justify-between flex-1">
            <div className="flex justify-between items-start">
              <div>
                {isEditingProfile ? (
                  <input
                    value={profileDraft.fullname}
                    onChange={e => setProfileDraft({ ...profileDraft, fullname: e.target.value })}
                    className="bg-white/20 border border-white/30 rounded px-2 py-1 text-xl font-bold outline-none mb-1"
                  />
                ) : (
                  <h2 className="text-xl font-semibold">{user.fullname}</h2>
                )}
                <p className="text-sm text-gray-300">@{user.username}</p>
              </div>
              <button
                onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20"
                disabled={saving}
              >
                {isEditingProfile ? "Save" : "Edit"}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-gray-300">Total Points</p>
                <p className="text-lg font-semibold">{user.performanceStats?.totalPoints || 0}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-gray-300">Battles</p>
                <p className="text-lg font-semibold">{user.performanceStats?.battleParticipated || 0}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-gray-300">Win rate</p>
                <p className="text-lg font-semibold">{user.performanceStats?.overAllWinRate || 0}%</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              {(user.skills && user.skills.length > 0 ? user.skills : ["No Skills Added"]).map((t: string) => (
                <span
                  key={t}
                  className="text-xs px-3 py-1 rounded-full bg-white/10"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-2 row-span-2 h-full w-full bg-white rounded-xl shadow col-start-3 p-6">
          <h3 className="text-gray-800 font-semibold mb-4">Account Overview</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-4">
              <p className="text-xs text-gray-500">Global Rank</p>
              <p className="text-lg font-semibold text-gray-800">#{user.performanceStats?.currentGlobalRank === Infinity ? "N/A" : user.performanceStats?.currentGlobalRank}</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 p-4">
              <p className="text-xs text-gray-500">Problems Solved</p>
              <p className="text-lg font-semibold text-gray-800">{user.performanceStats?.problemSolved || 0}</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 p-4">
              <p className="text-xs text-gray-500">Current League</p>
              <p className="text-lg font-semibold text-gray-800">{user.performanceStats?.currentLeague || "Unknown"}</p>
            </div>
          </div>
        </div>

        <div className="col-span-2 row-span-2 h-full w-full bg-white rounded-xl shadow col-start-1 row-start-6 p-6">
          <h3 className="text-gray-800 font-semibold mb-4">College & Location</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-gray-700">
              <span className="font-medium">College:</span>
              {isEditingProfile ? (
                <input
                  value={profileDraft.college}
                  onChange={e => setProfileDraft({ ...profileDraft, college: e.target.value })}
                  className="text-right border-b text-sm focus:border-indigo-500 outline-none"
                />
              ) : (
                <span>{user.college || "Not set"}</span>
              )}
            </div>
            <div className="flex items-center justify-between text-gray-700">
              <span className="font-medium">Country:</span>
              {isEditingProfile ? (
                <input
                  value={profileDraft.country}
                  onChange={e => setProfileDraft({ ...profileDraft, country: e.target.value })}
                  className="text-right border-b text-sm focus:border-indigo-500 outline-none"
                />
              ) : (
                <span>{user.country || "Not set"}</span>
              )}
            </div>
          </div>
        </div>

        <div className="row-span-4 h-full w-full bg-white rounded-xl shadow col-start-3 row-start-5 p-6 text-center flex flex-col items-center justify-center space-y-4">
          <h3 className="text-gray-800 font-semibold">Activity Statistics</h3>
          <p className="text-sm text-gray-500">Participated in {user.performanceStats?.contestsParticipated || 0} Contests</p>
          <div className="w-24 h-24 rounded-full border-8 border-indigo-100 border-t-indigo-500 flex items-center justify-center">
            <span className="text-xl font-bold">{user.performanceStats?.contestsWon || 0} Wins</span>
          </div>
        </div>

        <div className="row-span-4 h-full w-full bg-white rounded-xl shadow col-start-4 row-start-5 p-6">
          <h3 className="text-gray-800 font-semibold mb-2">
            Badges
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Collect badges by winning battles
          </p>
          <div className="grid grid-cols-2 gap-3">
            {user.performanceStats?.contestsWon > 0 && (
              <div className="rounded-xl p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center text-xs text-yellow-800 font-semibold">
                🏆 Champion
              </div>
            )}
            {user.performanceStats?.battleWon > 10 && (
              <div className="rounded-xl p-4 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center text-xs text-orange-800 font-semibold">
                🔥 Warrior
              </div>
            )}
            <div className="rounded-xl p-4 bg-gray-50 flex items-center justify-center text-xs text-gray-400 italic">
              More coming soon
            </div>
          </div>
        </div>

        <div className="col-span-2 row-span-2 h-full w-full bg-white rounded-xl shadow col-start-1 row-start-8 p-6">
          <h3 className="text-gray-800 font-semibold mb-4">Skills & Focus</h3>
          <div className="flex gap-3 flex-wrap">
            {(user.skills && user.skills.length > 0 ? user.skills : ["General"]).map((s: string, i: number) => (
              <div
                key={i}
                className="px-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-700"
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 row-span-2 h-full w-full bg-white rounded-xl shadow col-start-1 row-start-4 p-6">
          <h3 className="text-gray-800 font-semibold mb-4">System Details</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            <p><strong>Verified:</strong> {user.isEmailVerified ? "✅ Yes" : "❌ No"}</p>
          </div>
        </div>

        <div className="col-span-2 row-span-2 h-full w-full bg-white rounded-xl shadow col-start-3 row-start-3 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 font-semibold ">About</h3>
            {!isEditingAbout && (
              <button
                className="text-xs px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                onClick={() => {
                  setAboutDraft(user.about || "");
                  setIsEditingAbout(true);
                }}
              >
                Edit
              </button>
            )}
          </div>
          {!isEditingAbout && (
            <p className="text-sm text-gray-700 overflow-y-auto  leading-6">
              {user.about || "No bio added yet."}
            </p>
          )}
          {isEditingAbout && (
            <div className="space-y-3">
              <textarea
                value={aboutDraft}
                onChange={(e) => setAboutDraft(e.target.value)}
                rows={5}
                className="w-full rounded border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <div className="flex gap-2">
                <button
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-[#6266F0] text-white text-xs font-semibold disabled:opacity-50"
                  onClick={handleSaveAbout}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  disabled={saving}
                  className="px-4 py-1.5 rounded border text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setIsEditingAbout(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
