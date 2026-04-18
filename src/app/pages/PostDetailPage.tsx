import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Lock, MessageSquare, LogIn } from "lucide-react";
import { PostCard } from "../components/PostCard";
import { CommentItem } from "../components/CommentItem";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function PostDetailPage() {
  const { communityName, postId } = useParams<{ communityName: string; postId: string }>();
  const { posts, users, communities, comments, addComment, fetchCommentsForPost, recordView } = useApp();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [commentContent, setCommentContent] = useState("");
  const [sortComments, setSortComments] = useState("top");

  // fresh comments kalau di refresh
  useEffect(() => {
    if (postId) {
      fetchCommentsForPost(postId);
      recordView(postId);
    }
  }, [postId]);

  const post = posts.find((p) => p.id === postId);
  const community = communities.find((c) => c.name === communityName);
  const author = post ? users.find((u) => u.id === post.authorId) : undefined;
  
  useDocumentTitle(post ? post.title : "Post Not Found");

  const postComments = comments.filter((c) => c.postId === postId && !c.parentId);

  if (!post || !community) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-24 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-gray-800 mb-2">Post not found</h2>
        <Link to="/" className="text-blue-500 hover:underline">Go back home</Link>
      </div>
    );
  }

  const sortedComments = [...postComments].sort((a, b) => {
    switch (sortComments) {
      case "new": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "old": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "controversial": return (b.downvotes) - (a.downvotes);
      default: return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    }
  });

  const handleSubmitComment = () => {
    if (commentContent.trim() && !post.isLocked) {
      addComment(post.id, null, commentContent.trim());
      setCommentContent("");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-20 pb-8">
      {/* balik button */}
      <Link
        to={`/r/${communityName}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to r/{communityName}
      </Link>

      <div className="flex gap-6">
        {/*  content didieu */}
        <div className="flex-1 min-w-0">
          {/* Post */}
          <PostCard
            post={post}
            author={author}
            community={community}
            showCommunity={true}
            isDetail={true}
          />

          {/* Comment */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
            {post.isLocked ? (
              <div className="flex items-center gap-2 py-3 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-4">
                <Lock className="w-4 h-4" />
                Comments are locked on this post.
              </div>
            ) : !isAuthenticated ? (
              <div className="flex items-center gap-2 py-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4">
                <LogIn className="w-4 h-4" />
                <Link to="/login" className="font-medium hover:underline">Log in</Link>
                <span>to leave a comment.</span>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-2">
                  Comment as <Link to={`/u/${currentUser?.username}`} className="text-blue-500 hover:underline">{currentUser?.username}</Link>
                </p>
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="What are your thoughts?"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500 min-h-[100px] transition-colors"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentContent.trim()}
                    className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Comment
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{post.commentCount} Comments</span>
              </div>
              <div className="flex gap-1">
                {["top", "new", "old", "controversial"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortComments(s)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      sortComments === s
                        ? "bg-gray-100 text-gray-800 font-semibold"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col divide-y divide-gray-100">
              {sortedComments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">💬</div>
                  <p className="text-sm text-gray-500">No comments yet. Be the first!</p>
                </div>
              ) : (
                sortedComments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} postId={post.id} />
                ))
              )}
            </div>
          </div>
        </div>

        {/*  sidebar di kanan */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-20">
            <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-3">
              <h3 className="text-white text-sm">About r/{communityName}</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">{community.description}</p>
              <div className="text-sm text-gray-700 mb-1">
                <strong>{community.members.toLocaleString()}</strong> <span className="text-gray-500">members</span>
              </div>
              <div className="text-sm text-gray-700 mb-4">
                <strong>{community.onlineMembers.toLocaleString()}</strong> <span className="text-gray-500">online</span>
              </div>
              <Link
                to={`/r/${communityName}`}
                className="flex items-center justify-center w-full py-2 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors"
              >
                View Community
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
