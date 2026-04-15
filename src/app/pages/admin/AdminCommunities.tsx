import { useState } from "react";
import { Users, FileText, Calendar, ExternalLink, Shield } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router";
import { Trash2 } from "lucide-react";

export function AdminCommunities() {
  const { communities, posts, users, deleteCommunity } = useApp();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = communities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCommunity = communities.find((c) => c.id === selected);
  const communityPosts = selectedCommunity
    ? posts.filter((p) => p.community === selectedCommunity.id)
    : [];
  const communityMods = selectedCommunity
    ? selectedCommunity.moderators.map((mod: any) => {
        // Handle populated objects (MongoDB returns {_id, username, avatar})
        if (typeof mod === 'object' && mod.username) return { ...mod, id: mod._id || mod.id };
        // Handle plain string IDs
        return users.find((u) => u.id === mod || u.id === mod?._id);
      }).filter(Boolean)
    : [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-gray-900 text-2xl">Community Management</h1>
        <p className="text-sm text-gray-500 mt-1">Overview and management of all communities</p>
      </div>

      <div className="flex gap-4">
        {/* Left: List */}
        <div className="flex-1 min-w-0">
          {/* Search */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search communities..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-3">
            {filtered.map((community) => {
              const communityPostCount = posts.filter((p) => p.community === community.id).length;
              const isSelected = selected === community.id;

              return (
                <div
                  key={community.id}
                  onClick={() => setSelected(isSelected ? null : community.id)}
                  className={`bg-white border rounded-xl overflow-hidden cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-400 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="h-16 relative overflow-hidden bg-gradient-to-r from-orange-400 to-orange-500">
                    {community.banner && (
                      <img
                        src={community.banner}
                        alt=""
                        className="w-full h-full object-cover absolute inset-0 opacity-50"
                      />
                    )}
                  </div>
                  <div className="p-4 flex items-start gap-3">
                    <div className="text-3xl -mt-8 bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
                      {community.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-800 text-sm">r/{community.name}</span>
                        </div>
                        <Link
                          to={`/r/${community.name}`}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-blue-500"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{community.description}</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {community.members.toLocaleString()} members
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {communityPostCount} posts
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          {community.onlineMembers.toLocaleString()} online
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detail */}
        {selectedCommunity && (
          <div className="w-72 shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-6">
              <div className="bg-gray-900 px-4 py-3">
                <h3 className="text-white text-sm">r/{selectedCommunity.name}</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Members</span>
                    <span className="text-gray-800">{selectedCommunity.members.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Online Now</span>
                    <span className="text-gray-800">{selectedCommunity.onlineMembers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Posts</span>
                    <span className="text-gray-800">{communityPosts.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Active Posts</span>
                    <span className="text-gray-800">{communityPosts.filter(p => !p.isRemoved).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-800">{formatDistanceToNow(new Date(selectedCommunity.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>

                {communityMods.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-1 mb-2">
                      <Shield className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">Moderators</span>
                    </div>
                    <div className="space-y-2">
                      {communityMods.map((mod) => mod && (
                        <Link
                          key={mod.id}
                          to={`/u/${mod.username}`}
                          target="_blank"
                          className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                        >
                          <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden">
                            <img src={mod.avatar} alt={mod.username} className="w-full h-full" />
                          </div>
                          u/{mod.username}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCommunity.rules.length > 0 && (
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <span className="text-xs text-gray-500 block mb-2">Rules ({selectedCommunity.rules.length})</span>
                    <div className="space-y-1">
                      {selectedCommunity.rules.map((rule, i) => (
                        <div key={i} className="text-xs text-gray-600">
                          <span className="text-orange-500">{i + 1}. </span>
                          {rule.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 mt-4">
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to completely delete this community?")) {
                        deleteCommunity(selectedCommunity.id);
                        setSelected(null);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Community
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
