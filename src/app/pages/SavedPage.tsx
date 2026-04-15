import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { PostCard } from "../components/PostCard";
import { Link } from "react-router";

export function SavedPage() {
  const { posts, users, communities } = useApp();
  const { user: currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-24 text-center">
        <h2 className="text-gray-800 mb-2">Please login to see your saved posts</h2>
        <Link to="/login" className="text-blue-500 hover:underline">Log In</Link>
      </div>
    );
  }

  const savedPosts = posts.filter(p => currentUser.savedPosts?.includes(p.id));

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20 pb-8">
      <h1 className="text-2xl text-gray-900 mb-6">Saved Posts</h1>
      
      <div className="flex flex-col gap-4">
        {savedPosts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500">
            You haven't saved any posts yet.
          </div>
        ) : (
          savedPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              author={users.find(u => u.id === post.authorId)}
              community={communities.find(c => c.id === post.community)}
              showCommunity={true}
            />
          ))
        )}
      </div>
    </div>
  );
}
