import { useState } from "react";
import { useParams, Link } from "react-router";
import { Flame, TrendingUp, Zap, Star, Users, Calendar, Bell, Plus, Shield, UserPlus, UserMinus, Settings2, Trash2, Edit3 } from "lucide-react";
import { PostCard } from "../components/PostCard";
import { SkeletonCard } from "../components/SkeletonCard";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import api from "../services/api";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const SORT_OPTIONS = [
  { id: "hot", label: "Hot", icon: Flame },
  { id: "new", label: "New", icon: Zap },
  { id: "top", label: "Top", icon: TrendingUp },
  { id: "rising", label: "Rising", icon: Star },
];

export function CommunityPage() {
  const { communityName } = useParams<{ communityName: string }>();
  const { posts, users, communities, joinCommunity, leaveCommunity, fetchCommunities, isLoading } = useApp();
  const { user: currentUser } = useAuth();
  const [sort, setSort] = useState("hot");
  const [showModPanel, setShowModPanel] = useState(false);
  const [addModUsername, setAddModUsername] = useState("");
  const [modMessage, setModMessage] = useState("");
  const [newRuleTitle, setNewRuleTitle] = useState("");
  const [newRuleDesc, setNewRuleDesc] = useState("");

  const community = communities.find((c) => c.name === communityName);
  useDocumentTitle(community ? `r/${community.name}` : "Community Not Found");

  if (!community) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-24 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-gray-800 mb-2">Community not found</h1>
        <p className="text-gray-500 mb-4">r/{communityName} doesn't exist</p>
        <Link to="/" className="text-blue-500 hover:underline">Go back home</Link>
      </div>
    );
  }

  const communityId = community.id || (community as any)._id;
  const isAdmin = currentUser?.role === 'admin';
  const isJoined = currentUser?.joinedCommunities?.includes(communityId) || isAdmin || false;

  // di cek kalau mod
  const isModerator = currentUser && community.moderators.some(
    (modId: any) => {
      const modStr = typeof modId === 'object' ? (modId._id || modId.id || modId.username) : modId;
      return modStr === currentUser.id || modStr === (currentUser as any)._id || modStr === currentUser.username;
    }
  );
  const canModerate = isModerator || isAdmin;

  const communityPosts = posts.filter((p) => p.community === communityId && !p.isRemoved);
  const getAuthor = (authorId: string) => users.find((u) => u.id === authorId);
  const getCommunity = (cId: string) => communities.find((c) => c.id === cId);

  const sortedPosts = [...communityPosts].sort((a, b) => {
    switch (sort) {
      case "new": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "top": return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      case "rising": return b.commentCount - a.commentCount;
      default: {
        const aScore = a.upvotes * 0.7 + a.commentCount * 0.3;
        const bScore = b.upvotes * 0.7 + b.commentCount * 0.3;
        return bScore - aScore;
      }
    }
  });

  const pinnedPosts = sortedPosts.filter((p) => p.isPinned);
  const unpinnedPosts = sortedPosts.filter((p) => !p.isPinned);
  const displayPosts = [...pinnedPosts, ...unpinnedPosts];

  // cek objek pake id
  const moderators = community.moderators.map((modId: any) => {
    if (typeof modId === 'object' && modId.username) return modId;
    return users.find((u) => u.id === modId || u.id === modId?._id);
  }).filter(Boolean);

  const handleAddModerator = async () => {
    const targetUser = users.find(u => u.username === addModUsername);
    if (!targetUser) {
      setModMessage("User not found");
      return;
    }
    try {
      await api.post(`/communities/${communityId}/moderators`, { userId: targetUser.id });
      setModMessage(`✅ ${addModUsername} is now a moderator`);
      setAddModUsername("");
      fetchCommunities();
    } catch (e: any) {
      setModMessage(`❌ ${e?.response?.data?.message || 'Error adding moderator'}`);
    }
  };

  const handleRemoveModerator = async (modId: string) => {
    try {
      await api.delete(`/communities/${communityId}/moderators/${modId}`);
      setModMessage("✅ Moderator removed");
      fetchCommunities();
    } catch (e: any) {
      setModMessage(`❌ ${e?.response?.data?.message || 'Error removing moderator'}`);
    }
  };

  const handleAddRule = async () => {
    if (!newRuleTitle.trim()) return;
    try {
      const updatedRules = [...community.rules, { title: newRuleTitle, description: newRuleDesc }];
      await api.put(`/communities/${communityId}/rules`, { rules: updatedRules });
      setNewRuleTitle("");
      setNewRuleDesc("");
      fetchCommunities();
    } catch (e) { console.error('Error adding rule'); }
  };

  const handleRemoveRule = async (index: number) => {
    try {
      const updatedRules = community.rules.filter((_, i) => i !== index);
      await api.put(`/communities/${communityId}/rules`, { rules: updatedRules });
      fetchCommunities();
    } catch (e) { console.error('Error deleting rule'); }
  };

  return (
    <div>
      {/* Banner */}
      <div className="mt-14 h-36 bg-gradient-to-r from-orange-500 to-orange-300 relative overflow-hidden">
        {community.banner && (
          <img src={community.banner} alt="" className="w-full h-full object-cover absolute inset-0 opacity-40" />
        )}
      </div>

      {/* hulu na */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end gap-4 py-4 -mt-4">
            <div className="w-16 h-16 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center text-3xl shrink-0">
              {community.icon}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="text-gray-900">r/{community.name}</h1>
              <p className="text-sm text-gray-500 hidden sm:block">{community.description}</p>
            </div>
            <div className="flex gap-2 pb-1 shrink-0">
              <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Bell className="w-4 h-4" />
              </button>
              {canModerate && (
                <button
                  onClick={() => setShowModPanel(!showModPanel)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors border ${showModPanel ? 'bg-green-500 text-white border-green-500' : 'border-green-500 text-green-600 hover:bg-green-50'}`}
                >
                  <Settings2 className="w-4 h-4" /> Mod Panel
                </button>
              )}
              <Link
                to={`/submit?community=${community.name}`}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-4 h-4" /> Post
              </Link>
              {currentUser && (
                <button
                  onClick={() => isJoined ? leaveCommunity(communityId) : joinCommunity(communityId)}
                  className={`px-4 py-1.5 rounded-full text-sm transition-colors border ${
                    isJoined
                      ? "border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500"
                      : "border-orange-500 bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                >
                  {isJoined ? "Leave" : "Join"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mod tampilan */}
      {showModPanel && canModerate && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h2 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Moderator Panel — r/{community.name}
            </h2>
            <div className="flex flex-wrap gap-4">
              {/* nambah oderator */}
              <div className="bg-white rounded-lg p-4 border border-green-200 flex-1 min-w-64">
                <h3 className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-1">
                  <UserPlus className="w-4 h-4 text-green-500" /> Add Moderator
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={addModUsername}
                    onChange={(e) => setAddModUsername(e.target.value)}
                    placeholder="Enter username..."
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddModerator()}
                  />
                  <button
                    onClick={handleAddModerator}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {modMessage && (
                  <p className="text-xs mt-2 text-gray-600">{modMessage}</p>
                )}
              </div>

              {/* moderator yang ada */}
              <div className="bg-white rounded-lg p-4 border border-green-200 flex-1 min-w-64">
                <h3 className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-1">
                  <Shield className="w-4 h-4 text-green-500" /> Current Moderators
                </h3>
                <div className="space-y-2">
                  {moderators.map((mod: any) => {
                    const modId = mod?.id || mod?._id;
                    const isCurrentUser = modId === currentUser?.id;
                    return (
                      <div key={modId} className="flex items-center justify-between gap-2">
                        <Link to={`/u/${mod.username}`} className="text-sm text-blue-500 hover:underline flex items-center gap-2">
                          <img src={mod.avatar} alt={mod.username} className="w-5 h-5 rounded-full" />
                          u/{mod.username}
                        </Link>
                        {!isCurrentUser && (isAdmin || isModerator) && (
                          <button
                            onClick={() => handleRemoveModerator(modId)}
                            className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded flex items-center gap-1"
                          >
                            <UserMinus className="w-3 h-3" /> Remove
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* kjer ngedit*/}
              <div className="bg-white rounded-lg p-4 border border-green-200 flex-[2] min-w-80">
                <h3 className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-1">
                  <Edit3 className="w-4 h-4 text-green-500" /> Manage Rules
                </h3>
                <div className="space-y-2 mb-3">
                  {community.rules.map((rule: any, idx: number) => (
                    <div key={idx} className="flex items-start justify-between gap-2 p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{idx + 1}. {rule.title}</p>
                        {rule.description && <p className="text-xs text-gray-500 mt-0.5">{rule.description}</p>}
                      </div>
                      <button onClick={() => handleRemoveRule(idx)} className="text-red-500 hover:bg-red-100 p-1 rounded">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {community.rules.length === 0 && <p className="text-xs text-gray-400 italic">No rules defining this community yet.</p>}
                </div>
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                  <input
                    type="text"
                    value={newRuleTitle}
                    onChange={(e) => setNewRuleTitle(e.target.value)}
                    placeholder="Rule title..."
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400"
                  />
                  <textarea
                    value={newRuleDesc}
                    onChange={(e) => setNewRuleDesc(e.target.value)}
                    placeholder="Rule description (optional)"
                    rows={2}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400 resize-none"
                  ></textarea>
                  <button onClick={handleAddRule} disabled={!newRuleTitle.trim()} className="self-end px-4 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50">
                    Add Rule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* conten */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* bagian post */}
          <div className="flex-1 min-w-0">
            {/* bar na */}
            <div className="bg-white border border-gray-200 rounded-lg p-2 mb-4 flex gap-1">
              {SORT_OPTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSort(id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors ${
                    sort === id
                      ? "bg-gray-100 text-gray-900 font-semibold"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {isLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : displayPosts.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <h3 className="text-gray-800 mb-2">No posts yet</h3>
                  <p className="text-sm text-gray-500 mb-4">Be the first to post in r/{community.name}</p>
                  {isJoined ? (
                    <Link
                      to={`/submit?community=${community.name}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Create Post
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-500 rounded-full text-sm cursor-not-allowed"
                      title="You must join this community to post"
                    >
                      <Plus className="w-4 h-4" /> Join to Create Post
                    </button>
                  )}
                </div>
              ) : (
                displayPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    author={getAuthor(post.authorId)}
                    community={getCommunity(post.community)}
                    showCommunity={false}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:flex flex-col gap-4 w-72 shrink-0">
            {/* tentang */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-3">
                <h3 className="text-white text-sm">About r/{community.name}</h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">{community.description}</p>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span><strong>{community.members.toLocaleString()}</strong> members</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span><strong>{community.onlineMembers.toLocaleString()}</strong> online</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Created {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
                <div className="mt-4">
                  {isJoined ? (
                    <Link
                      to={`/submit?community=${community.name}`}
                      className="flex items-center justify-center w-full py-2 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors"
                    >
                      Create Post
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="flex items-center justify-center w-full py-2 bg-gray-200 text-gray-500 rounded-full text-sm cursor-not-allowed"
                      title="You must join this community to post"
                    >
                      Must join to post
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* didieukuudna aturan */}
            {community.rules.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-gray-800 text-sm mb-3">Community Rules</h3>
                <div className="flex flex-col gap-2">
                  {community.rules.map((rule: any, i: number) => (
                    <div key={i} className="text-sm">
                      <span className="text-orange-500 font-semibold">{i + 1}. </span>
                      <span className="text-gray-700">{rule.title}</span>
                      <p className="text-xs text-gray-500 mt-0.5 ml-4">{rule.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mod */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-gray-500" />
                <h3 className="text-gray-800 text-sm">Moderators</h3>
              </div>
              <div className="flex flex-col gap-2">
                {moderators.map((mod: any) => mod && (
                  <Link key={mod.id || mod._id} to={`/u/${mod.username}`} className="flex items-center gap-2 text-sm text-blue-500 hover:underline">
                    <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden">
                      <img src={mod.avatar} alt={mod.username} className="w-full h-full" />
                    </div>
                    u/{mod.username}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
