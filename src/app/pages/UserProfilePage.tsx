import { useParams, Link } from "react-router";
import { Calendar, Award, TrendingUp, MessageSquare, FileText, Pencil } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { PostCard } from "../components/PostCard";

export function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { users, posts, communities } = useApp();
  const { user: currentUser } = useAuth();

  const user = users.find((u) => u.username === username);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-24 text-center">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-gray-800 mb-2">User not found</h2>
        <Link to="/" className="text-blue-500 hover:underline">Go back home</Link>
      </div>
    );
  }

  const userPosts = posts.filter((p) => p.authorId === user.id && !p.isRemoved);
  const getCommunity = (communityId: string) => communities.find((c) => c.id === communityId);

  return (
    <div className="pt-14">
      {/* Banner */}
      <div
        className="h-28 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500"
        style={
          (user as any).banner
            ? { backgroundImage: `url(${(user as any).banner})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* kiri  sidebar - Profile */}
          <div className="w-72 shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-6 -mt-16">
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 mx-auto mb-3">
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <h2 className="text-center text-gray-900">{user.username}</h2>
                {currentUser?.username === user.username && (
                  <Link
                    to="/settings"
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit Profile"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
              {user.isBanned && (
                <span className="block text-center text-xs text-red-600 bg-red-50 border border-red-200 rounded-full px-3 py-1 mb-2">
                  Account Suspended
                </span>
              )}
              {user.role !== "user" && (
                <span className={`block text-center text-xs rounded-full px-3 py-1 mb-2 ${
                  user.role === "admin"
                    ? "text-red-600 bg-red-50 border border-red-200"
                    : "text-green-600 bg-green-50 border border-green-200"
                }`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              )}
              {user.bio && (
                <p className="text-sm text-gray-600 text-center mb-4">{user.bio}</p>
              )}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Karma</span>
                  <span className="text-gray-800 font-semibold">{user.karma.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Post karma</span>
                  <span className="text-gray-800">{user.postKarma.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> Comment karma</span>
                  <span className="text-gray-800">{user.commentKarma.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined</span>
                  <span className="text-gray-800">{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main content  di Posts */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-gray-800 text-base">Posts by u/{user.username}</h2>
              <span className="text-sm text-gray-400">({userPosts.length})</span>
            </div>
            {userPosts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-gray-500 text-sm">No posts yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {userPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    author={user}
                    community={getCommunity(post.community)}
                    showCommunity={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
