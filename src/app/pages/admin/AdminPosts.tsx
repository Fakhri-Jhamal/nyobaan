import { useState } from "react";
import { Search, Pin, Lock, Trash2, ExternalLink, Eye, EyeOff } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router";

export function AdminPosts() {
  const { posts, users, communities, removePost, pinPost, lockPost } = useApp();
  const [search, setSearch] = useState("");
  const [communityFilter, setCommunityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showRemoveModal, setShowRemoveModal] = useState<string | null>(null);
  const [removeReason, setRemoveReason] = useState("");

  const getAuthor = (id: string) => users.find((u) => u.id === id);
  const getCommunity = (id: string) => communities.find((c) => c.id === id);

  const filtered = posts.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      getAuthor(p.authorId)?.username.toLowerCase().includes(search.toLowerCase());
    const matchCommunity = communityFilter === "all" || p.community === communityFilter;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !p.isRemoved) ||
      (statusFilter === "removed" && p.isRemoved) ||
      (statusFilter === "pinned" && p.isPinned) ||
      (statusFilter === "locked" && p.isLocked);
    return matchSearch && matchCommunity && matchStatus;
  });

  const handleRemove = () => {
    if (showRemoveModal) {
      removePost(showRemoveModal, removeReason || "Violated community rules");
      setShowRemoveModal(null);
      setRemoveReason("");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-gray-900 text-2xl">Post Moderation</h1>
        <p className="text-sm text-gray-500 mt-1">Review and moderate posts across all communities</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Posts", value: posts.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active", value: posts.filter(p => !p.isRemoved).length, color: "text-green-600", bg: "bg-green-50" },
          { label: "Removed", value: posts.filter(p => p.isRemoved).length, color: "text-red-600", bg: "bg-red-50" },
          { label: "Pinned", value: posts.filter(p => p.isPinned).length, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} rounded-xl p-4`}>
            <div className={`text-2xl ${item.color}`}>{item.value}</div>
            <div className="text-sm text-gray-600 mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={communityFilter}
          onChange={(e) => setCommunityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
        >
          <option value="all">All Communities</option>
          {communities.map((c) => (
            <option key={c.id} value={c.id}>r/{c.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="removed">Removed</option>
          <option value="pinned">Pinned</option>
          <option value="locked">Locked</option>
        </select>
      </div>

      {/* Posts Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Post</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Community</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Author</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Score</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Posted</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-gray-400">No posts found</td>
                </tr>
              ) : filtered.map((post) => {
                const author = getAuthor(post.authorId);
                const community = getCommunity(post.community);
                return (
                  <tr key={post.id} className={`hover:bg-gray-50 transition-colors ${post.isRemoved ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-800 truncate">{post.title}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {post.isPinned && <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">📌 Pinned</span>}
                            {post.isLocked && <span className="text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">🔒 Locked</span>}
                            {post.flair && (
                              <span className="text-xs px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: post.flairColor }}>
                                {post.flair}
                              </span>
                            )}
                          </div>
                        </div>
                        {community && (
                          <Link
                            to={`/r/${community.name}/post/${post.id}`}
                            target="_blank"
                            className="shrink-0 text-gray-400 hover:text-blue-500"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {community && (
                        <span className="text-sm text-gray-700">{community.icon} r/{community.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {author && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden">
                            <img src={author.avatar} alt={author.username} className="w-full h-full" />
                          </div>
                          <span className="text-sm text-gray-700">{author.username}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {(post.upvotes - post.downvotes).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        post.isRemoved ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                      }`}>
                        {post.isRemoved ? "Removed" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => pinPost(post.id)}
                          title={post.isPinned ? "Unpin" : "Pin"}
                          className={`p-1.5 rounded-lg transition-colors ${post.isPinned ? "bg-green-100 text-green-600 hover:bg-green-200" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => lockPost(post.id)}
                          title={post.isLocked ? "Unlock" : "Lock"}
                          className={`p-1.5 rounded-lg transition-colors ${post.isLocked ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                        {!post.isRemoved ? (
                          <button
                            onClick={() => setShowRemoveModal(post.id)}
                            title="Remove"
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="p-1.5 text-gray-300">
                            <EyeOff className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} of {posts.length} posts
        </div>
      </div>

      {/* Remove Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-gray-900 mb-2">Remove Post</h3>
            <p className="text-sm text-gray-500 mb-4">
              Post: <em className="text-gray-700">{posts.find(p => p.id === showRemoveModal)?.title}</em>
            </p>
            <input
              type="text"
              value={removeReason}
              onChange={(e) => setRemoveReason(e.target.value)}
              placeholder="Reason for removal..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-4 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowRemoveModal(null); setRemoveReason(""); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
