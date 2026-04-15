import { useState } from "react";
import { Link } from "react-router";
import { Users, Search } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

export function CommunitiesPage() {
  const { communities, joinCommunity, leaveCommunity } = useApp();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");

  const filtered = communities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20 pb-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl text-gray-900">All Communities</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search communities..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(community => {
          const isJoined = currentUser?.joinedCommunities?.includes(community.id) || false;
          return (
            <div key={community.id} className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4 items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl shrink-0">
                {community.icon}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/r/${community.name}`} className="font-semibold text-gray-900 hover:text-blue-600 block truncate">
                  r/{community.name}
                </Link>
                <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {community.members.toLocaleString()}</span>
                  <span>•</span>
                  <span>{community.description}</span>
                </div>
              </div>
              {currentUser && (
                <button
                  onClick={() => isJoined ? leaveCommunity(community.id) : joinCommunity(community.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
                    isJoined
                      ? "border border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                >
                  {isJoined ? "Leave" : "Join"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
