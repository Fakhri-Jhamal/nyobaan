import { useState } from "react";
import { Link } from "react-router";
import { History, Clock, ChevronRight, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

export function HistorySidebar() {
  const { viewedPostIds, communities, posts } = useApp();
  const { isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Resolve viewed posts from history IDs (most recent first)
  const viewedPosts = (viewedPostIds || [])
    .map(id => posts.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, 15) as typeof posts;

  if (!isAuthenticated) return null;

  return (
    <div className={`hidden xl:flex flex-col transition-all duration-300 ${collapsed ? "w-12" : "w-56"} shrink-0`}>
      <div className="sticky top-20 bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className={`flex items-center ${collapsed ? "justify-center px-3 py-3" : "justify-between px-4 py-3"} border-b border-gray-100`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-sm font-semibold text-gray-800">History</span>
              {viewedPosts.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full leading-none">
                  {viewedPosts.length}
                </span>
              )}
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title={collapsed ? "Expand history" : "Collapse history"}
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? "" : "rotate-180"}`} />
          </button>
        </div>

        {/* Content */}
        {!collapsed && (
          <>
            {viewedPosts.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Clock className="w-7 h-7 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  Posts you view will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {viewedPosts.map((post) => {
                  const communityId = post.community && typeof post.community === 'object' 
                    ? ((post.community as any)._id || (post.community as any).id) 
                    : post.community;
                  const community = communities.find(c => c.id === communityId) || (post as any).communityData;
                  return (
                    <Link
                      key={post.id}
                      to={`/r/${community?.name}/post/${post.id}`}
                      className="flex items-start gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors group"
                    >
                      {/* Community icon */}
                      <span className="text-sm shrink-0 mt-0.5 leading-none">
                        {community?.icon || "📄"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </p>
                        {community && (
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                            r/{community.name}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Collapsed: show only icons stacked */}
        {collapsed && viewedPosts.length > 0 && (
          <div className="flex flex-col items-center gap-1 py-2">
            {viewedPosts.slice(0, 6).map((post) => {
              const communityId = post.community && typeof post.community === 'object' 
                ? ((post.community as any)._id || (post.community as any).id) 
                : post.community;
              const community = communities.find(c => c.id === communityId) || (post as any).communityData;
              return (
                <Link
                  key={post.id}
                  to={`/r/${community?.name}/post/${post.id}`}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  title={post.title}
                >
                  {community?.icon || "📄"}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
