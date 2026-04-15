import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowUp, ArrowDown, MessageSquare, Share2, Bookmark,
  MoreHorizontal, Pin, Lock, Shield, ExternalLink, Trash2,
  AlertTriangle, Flag, BookmarkCheck, Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Post, User, Community } from "../types";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: Post;
  author: User | undefined;
  community: Community | undefined;
  showCommunity?: boolean;
  isDetail?: boolean;
}

function formatVotes(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

const awardEmoji: Record<string, string> = {
  platinum: "🏆",
  gold: "🥇",
  silver: "🥈",
  helpful: "👍",
};

export function PostCard({ post, author, community, showCommunity = true, isDetail = false }: PostCardProps) {
  const { votePost, removePost, pinPost, lockPost, toggleSavePost, reportPost } = useApp();
  const { user: currentUser } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [removeReason, setRemoveReason] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);

  const score = post.upvotes - post.downvotes;
  
  const isGlobalMod = currentUser?.role === "admin" || currentUser?.role === "moderator";
  const isLocalMod = community?.moderators?.some(
    (modId: any) => {
      const idStr = typeof modId === 'object' ? (modId._id || modId.id || modId.username) : modId;
      return idStr === currentUser?.id || idStr === (currentUser as any)?._id || idStr === currentUser?.username;
    }
  );
  const canModerate = isGlobalMod || isLocalMod;
  
  const isSaved = currentUser?.savedPosts?.includes(post.id) || false;

  const handleVote = (direction: "up" | "down") => {
    votePost(post.id, direction);
  };

  const handleRemove = () => {
    removePost(post.id, removeReason || "Violated community rules");
    setShowRemoveModal(false);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/r/${community?.name}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Fallback
      prompt("Copy post link:", url);
    }
  };

  const handleReport = async () => {
    if (reportReason.trim()) {
      await reportPost(post.id, reportReason, reportDetails || reportReason);
      setShowReportModal(false);
      setReportReason("");
      setReportDetails("");
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-colors ${post.isPinned ? "border-l-4 border-l-green-500" : ""} ${post.isRemoved ? "opacity-60" : ""}`}>
      <div className="flex">
        {/* Vote Column */}
        <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-l-lg min-w-[40px]">
          <button
            onClick={() => handleVote("up")}
            className={`p-1 rounded hover:bg-orange-100 transition-colors ${post.userVote === "up" ? "text-orange-500" : "text-gray-400 hover:text-orange-500"}`}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <span className={`text-xs font-semibold ${post.userVote === "up" ? "text-orange-500" : post.userVote === "down" ? "text-blue-500" : "text-gray-700"}`}>
            {formatVotes(score)}
          </span>
          <button
            onClick={() => handleVote("down")}
            className={`p-1 rounded hover:bg-blue-100 transition-colors ${post.userVote === "down" ? "text-blue-500" : "text-gray-400 hover:text-blue-500"}`}
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 min-w-0">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 mb-1.5">
            {post.isPinned && (
              <span className="flex items-center gap-0.5 text-green-600">
                <Pin className="w-3 h-3" /> Pinned
              </span>
            )}
            {post.isLocked && (
              <span className="flex items-center gap-0.5 text-yellow-600">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
            {post.isRemoved && (
              <span className="flex items-center gap-0.5 text-red-600">
                <Trash2 className="w-3 h-3" /> Removed
              </span>
            )}
            {showCommunity && community && (
              <Link to={`/r/${community.name}`} className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                {community.icon} r/{community.name}
              </Link>
            )}
            {showCommunity && community && <span>•</span>}
            <span>Posted by</span>
            {author && (
              <Link to={`/u/${author.username}`} className="hover:text-blue-600 transition-colors">
                u/{author.username}
              </Link>
            )}
            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            {post.flair && (
              <span
                className="px-2 py-0.5 rounded-full text-white text-xs"
                style={{ backgroundColor: post.flairColor || "#0079d3" }}
              >
                {post.flair}
              </span>
            )}
          </div>

          {/* Title */}
          {isDetail ? (
            <h1 className="text-gray-900 mb-2">{post.title}</h1>
          ) : (
            <Link to={`/r/${community?.name}/post/${post.id}`}>
              <h3 className="text-gray-900 hover:text-blue-600 transition-colors cursor-pointer mb-2 leading-snug">
                {post.title}
              </h3>
            </Link>
          )}

          {/* Awards */}
          {post.awards.length > 0 && (
            <div className="flex gap-1 mb-2">
              {post.awards.map((award, i) => (
                <span key={i} title={award} className="text-sm">{awardEmoji[award] || "🏅"}</span>
              ))}
            </div>
          )}

          {/* Content Wrapper */}
          <div 
            className={post.isSpoiler && !spoilerRevealed ? 'relative cursor-pointer min-h-[100px] mb-2 rounded-lg overflow-hidden bg-gray-100' : ''}
            onClick={(e) => {
              if (post.isSpoiler && !spoilerRevealed) {
                e.preventDefault();
                setSpoilerRevealed(true);
              }
            }}
          >
            {post.isSpoiler && !spoilerRevealed && (
               <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-200/30">
                 <span className="bg-gray-800 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-md">
                   Spoiler • Click to reveal
                 </span>
               </div>
            )}
            <div className={post.isSpoiler && !spoilerRevealed ? 'blur-xl opacity-30 select-none pointer-events-none max-h-[100px] overflow-hidden' : ''}>
              {/* Image */}
              {post.type === "image" && post.imageUrl && !isDetail && (
                <Link to={`/r/${community?.name}/post/${post.id}`}>
                  <div className="rounded-lg overflow-hidden mb-2 max-h-64 bg-gray-100">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                </Link>
              )}
              {post.type === "image" && post.imageUrl && isDetail && (
                <div className="rounded-lg overflow-hidden mb-3 bg-gray-100">
                  <img src={post.imageUrl} alt={post.title} className="w-full object-contain max-h-[600px]" />
                </div>
              )}

              {/* Text content preview */}
              {post.type === "text" && post.content && !isDetail && (
                <div className="text-sm text-gray-600 line-clamp-3 mb-2 overflow-hidden prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                </div>
              )}
              {post.type === "text" && post.content && isDetail && (
                <div className="text-sm text-gray-800 mb-3 whitespace-pre-wrap leading-relaxed prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>


          {/* Actions */}
          <div className="flex items-center gap-1 flex-wrap">
            <Link
              to={`/r/${community?.name}/post/${post.id}`}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded text-gray-500 text-xs hover:bg-gray-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              {post.commentCount.toLocaleString()} Comments
            </Link>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded text-gray-500 text-xs hover:bg-gray-100 transition-colors"
            >
              {shareCopied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
              {shareCopied ? "Copied!" : "Share"}
            </button>

            {/* Save button */}
            {currentUser && (
              <button
                onClick={() => toggleSavePost(post.id)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs hover:bg-gray-100 transition-colors ${isSaved ? "text-orange-500" : "text-gray-500"}`}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {isSaved ? "Saved" : "Save"}
              </button>
            )}

            {/* Report button */}
            {currentUser && !canModerate && (
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded text-gray-500 text-xs hover:bg-gray-100 transition-colors"
              >
                <Flag className="w-4 h-4" />
                Report
              </button>
            )}

            {/* Admin/Mod actions */}
            {canModerate && (
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded text-gray-500 text-xs hover:bg-gray-100 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-red-500" />
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 bottom-full mb-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                    {!post.isRemoved && (
                      <button
                        onClick={() => { setShowRemoveModal(true); setShowMenu(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Post
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remove Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-gray-900">Remove Post</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for removing this post:</p>
            <input
              type="text"
              value={removeReason}
              onChange={(e) => setRemoveReason(e.target.value)}
              placeholder="e.g., Spam, Violates rules..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-4 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Remove Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Flag className="w-5 h-5 text-orange-500" />
              <h3 className="text-gray-900">Report Post</h3>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Select a reason...</option>
                <option value="Spam">Spam</option>
                <option value="Harassment">Harassment or bullying</option>
                <option value="Misinformation">Misinformation</option>
                <option value="Hate speech">Hate speech</option>
                <option value="Copyright violation">Copyright violation</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional details (optional)</label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Describe the issue..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason}
                className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-40 transition-colors"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {showMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />
      )}
    </div>
  );
}
