import { useState } from "react";
import { Link } from "react-router";
import {
  TrendingUp, Plus,
  Settings, Users, BarChart2, ChevronRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

export function Sidebar() {
  const { communities, posts, joinCommunity, leaveCommunity } = useApp();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [communitiesOpen, setCommunitiesOpen] = useState(true);

  const topCommunities = [...communities].sort((a, b) => b.members - a.members).slice(0, 5);

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* ── Profile Card (only when logged in) ── */}
      {isAuthenticated && currentUser && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Banner */}
          <div
            className="h-14 bg-gradient-to-r from-orange-400 via-orange-500 to-red-400"
            style={
              (currentUser as any).banner
                ? { backgroundImage: `url(${(currentUser as any).banner})`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          />
          <div className="px-4 pb-4 -mt-6">
            <div className="flex items-end justify-between mb-2">
              <div className="w-12 h-12 rounded-full border-2 border-white shadow overflow-hidden bg-gray-100">
                <img
                  src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`}
                  alt={currentUser.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <Link
                to="/settings"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Edit Profile"
              >
                <Settings className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Link
                to={`/u/${currentUser.username}`}
                className="font-semibold text-sm text-gray-900 hover:text-orange-500 transition-colors"
              >
                u/{currentUser.username}
              </Link>
              {currentUser.role !== "user" && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  currentUser.role === "admin"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}>
                  {currentUser.role}
                </span>
              )}
            </div>
            {(currentUser as any).bio && (
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">{(currentUser as any).bio}</p>
            )}
            <div className="flex gap-4 text-xs text-gray-500 mb-3">
              <div>
                <span className="block font-semibold text-gray-900 text-sm">
                  {(currentUser.karma || 0).toLocaleString()}
                </span>
                karma
              </div>
              <div>
                <span className="block font-semibold text-gray-900 text-sm">
                  {(currentUser.joinedCommunities?.length || 0)}
                </span>
                communities
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/submit"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-orange-500 text-white rounded-full text-xs font-medium hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-3 h-3" /> Post
              </Link>
              <Link
                to="/create-community"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-orange-500 text-orange-500 rounded-full text-xs font-medium hover:bg-orange-50 transition-colors"
              >
                <Users className="w-3 h-3" /> Community
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Guest prompt (not logged in) ── */}
      {!isAuthenticated && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-lg">🏠</div>
            <h3 className="text-gray-800 text-sm font-semibold">Home</h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Your personal ForumHub frontpage. Log in to customize your experience.
          </p>
          <Link
            to="/login"
            className="flex items-center justify-center w-full py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-colors mb-2"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="flex items-center justify-center w-full py-2 border border-orange-500 text-orange-500 rounded-full text-sm font-medium hover:bg-orange-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      )}


      {/* ── Top Communities ── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setCommunitiesOpen(!communitiesOpen)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold text-gray-800">Top Communities</span>
          </div>
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${communitiesOpen ? "rotate-90" : ""}`} />
        </button>

        {communitiesOpen && (
          <div className="border-t border-gray-100 px-4 py-2">
            <div className="flex flex-col gap-1">
              {topCommunities.map((community, index) => {
                const isJoined = currentUser?.joinedCommunities?.includes(community.id) || false;
                return (
                  <div key={community.id} className="flex items-center gap-2 py-1.5 group">
                    <span className="text-xs text-gray-400 w-4 text-right shrink-0">{index + 1}</span>
                    <span className="text-base">{community.icon}</span>
                    <Link
                      to={`/r/${community.name}`}
                      className="flex-1 text-xs text-gray-700 hover:text-blue-600 transition-colors truncate"
                    >
                      r/{community.name}
                    </Link>
                    {isAuthenticated && (
                      <button
                        onClick={() => isJoined ? leaveCommunity(community.id) : joinCommunity(community.id)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors shrink-0 ${
                          isJoined
                            ? "border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500"
                            : "border-orange-500 text-orange-500 hover:bg-orange-50"
                        }`}
                      >
                        {isJoined ? "Joined" : "Join"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <Link
              to="/communities"
              className="flex items-center gap-1 text-xs text-blue-500 hover:underline mt-2 mb-1"
            >
              View All Communities <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-4 h-4 text-gray-400" />
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">ForumHub Stats</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Members", value: communities.reduce((s, c) => s + c.members, 0).toLocaleString() },
            { label: "Online", value: communities.reduce((s, c) => s + c.onlineMembers, 0).toLocaleString() },
            { label: "Posts", value: posts.length.toLocaleString() },
            { label: "Communities", value: communities.length.toLocaleString() },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-lg px-3 py-2">
              <div className="text-sm font-semibold text-gray-900">{item.value}</div>
              <div className="text-[10px] text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer links ── */}
      <div className="text-[10px] text-gray-400 flex flex-wrap gap-x-2 gap-y-1 px-1">
        <Link to="/help" className="hover:underline cursor-pointer">Help</Link>
        <span>•</span>
        <Link to="/rules" className="hover:underline cursor-pointer">Rules</Link>
        <div className="w-full mt-1">ForumHub © 2026</div>
      </div>
    </div>
  );
}