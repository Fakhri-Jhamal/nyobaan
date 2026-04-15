import { useState } from "react";
import { useSearchParams } from "react-router";
import { Flame, TrendingUp, Zap, Star } from "lucide-react";
import { PostCard } from "../components/PostCard";
import { Sidebar } from "../components/Sidebar";
import { HistorySidebar } from "../components/HistorySidebar";
import { SkeletonCard } from "../components/SkeletonCard";
import { useApp } from "../context/AppContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const SORT_OPTIONS = [
  { id: "hot", label: "Hot", icon: Flame },
  { id: "new", label: "New", icon: Zap },
  { id: "top", label: "Top", icon: TrendingUp },
  { id: "rising", label: "Rising", icon: Star },
];

export function HomePage() {
  const { posts, users, communities, isLoading } = useApp();
  const [sort, setSort] = useState("hot");
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  
  useDocumentTitle(searchQuery ? `Search: ${searchQuery}` : "Home");

  let filteredPosts = posts.filter((p) => !p.isRemoved);

  if (searchQuery) {
    filteredPosts = filteredPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.content || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sort) {
      case "new":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "top":
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      case "rising":
        return b.commentCount - a.commentCount;
      case "hot":
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

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
      <div className="flex gap-4">
        {/* Left History Sidebar */}
        <HistorySidebar />

        {/* Main Feed */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
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

          {searchQuery && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              Showing results for: <strong>"{searchQuery}"</strong> — {displayPosts.length} posts found
            </div>
          )}

          {/* Posts */}
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : displayPosts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-gray-800 mb-1">No posts found</h3>
                <p className="text-sm text-gray-500">
                  {searchQuery ? `No posts match "${searchQuery}"` : "Be the first to post something!"}
                </p>
              </div>
            ) : (
              displayPosts.map((post: any) => {
                // Resolve author: prefer from users state (has full data), fallback to populated object
                const author = users.find(u => u.id === post.authorId) 
                  || (post.author && typeof post.author === 'object' ? { ...post.author, id: post.author._id || post.author.id } : undefined);
                // Resolve community: prefer from communities state
                const community = communities.find(c => c.id === post.community)
                  || (post.communityData && typeof post.communityData === 'object' ? { ...post.communityData, id: post.communityData._id } : undefined);
                return (
                  <PostCard
                    key={post.id}
                    post={post}
                    author={author as any}
                    community={community as any}
                    showCommunity={true}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-72 shrink-0">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
