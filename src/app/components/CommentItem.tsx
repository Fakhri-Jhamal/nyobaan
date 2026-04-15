import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowUp, ArrowDown, MessageSquare, Trash2,
  ChevronDown, ChevronUp, Flag, X, Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Comment, User } from "../types";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  depth?: number;
}

const REPORT_REASONS = [
  "Spam",
  "Harassment or bullying",
  "Hate speech",
  "Misinformation",
  "Threatening violence",
  "Inappropriate content",
  "Other",
];

function findUser(users: User[], id: string) {
  return users.find((u) => u.id === id);
}

function formatVotes(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function CommentItem({ comment, postId, depth = 0 }: CommentItemProps) {
  const { voteComment, addComment, removeComment, reportComment, users, comments: allComments } = useApp();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportDetails, setReportDetails] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [reportError, setReportError] = useState("");

  const author = findUser(users, comment.authorId);
  const score = comment.upvotes - comment.downvotes;
  const isModerator = currentUser?.role === "admin" || currentUser?.role === "moderator";
  const isOwner = currentUser && comment.authorId === currentUser.id;
  const maxDepth = 6;

  // Find child replies from flat global state (works with API data)
  const replies: Comment[] = (() => {
    const fromState = allComments.filter(
      (c) => c.parentId === comment.id && c.postId === postId
    );
    if (fromState.length > 0) return fromState;
    return (comment.replies as Comment[] | undefined) ?? [];
  })();

  const handleReply = () => {
    if (replyContent.trim()) {
      addComment(postId, comment.id, replyContent.trim());
      setReplyContent("");
      setShowReply(false);
    }
  };

  const handleReport = async () => {
    setReportLoading(true);
    setReportError("");
    try {
      await reportComment(comment.id, reportReason, reportDetails.trim());
      setReportDone(true);
    } catch (e: any) {
      setReportError(e?.response?.data?.message || "Failed to submit report.");
    } finally {
      setReportLoading(false);
    }
  };

  const closeModal = () => {
    setShowReportModal(false);
    setReportDone(false);
    setReportError("");
    setReportDetails("");
    setReportReason(REPORT_REASONS[0]);
  };

  if (comment.isRemoved && depth === 0) {
    return (
      <div className="text-sm text-gray-400 italic py-2 px-3 border-l-2 border-gray-200">
        [removed]
      </div>
    );
  }

  return (
    <>
      <div className={`${depth > 0 ? "ml-4 pl-4 border-l-2 border-gray-200 hover:border-blue-300 transition-colors" : ""}`}>
        <div className="py-2">
          {/* Author row */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            >
              {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
            {author ? (
              <Link
                to={`/u/${author.username}`}
                className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors"
              >
                u/{author.username}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-gray-400">[deleted]</span>
            )}
            {author?.role === "admin" && (
              <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-medium">Admin</span>
            )}
            {author?.role === "moderator" && (
              <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-600 rounded font-medium">Mod</span>
            )}
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {replies.length > 0 && collapsed && (
              <span className="text-xs text-gray-400 ml-1">
                ({replies.length} {replies.length === 1 ? "reply" : "replies"} hidden)
              </span>
            )}
          </div>

          {!collapsed && (
            <>
              {/* Content */}
              <div className="text-sm text-gray-700 mb-2 ml-5 leading-relaxed whitespace-pre-wrap prose-sm max-w-none">
                {comment.isRemoved ? <em className="text-gray-400">[removed]</em> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.content}</ReactMarkdown>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 ml-5 flex-wrap">
                {/* Vote buttons */}
                <button
                  onClick={() => voteComment(comment.id, "up")}
                  className={`p-1.5 rounded hover:bg-orange-50 transition-colors ${
                    comment.userVote === "up" ? "text-orange-500" : "text-gray-400 hover:text-orange-500"
                  }`}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <span className={`text-xs font-semibold px-1 ${
                  comment.userVote === "up" ? "text-orange-500"
                  : comment.userVote === "down" ? "text-blue-500"
                  : "text-gray-600"
                }`}>
                  {formatVotes(score)}
                </span>
                <button
                  onClick={() => voteComment(comment.id, "down")}
                  className={`p-1.5 rounded hover:bg-blue-50 transition-colors ${
                    comment.userVote === "down" ? "text-blue-500" : "text-gray-400 hover:text-blue-500"
                  }`}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Reply button */}
                {depth < maxDepth && isAuthenticated && (
                  <button
                    onClick={() => setShowReply(!showReply)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded transition-colors ml-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Reply
                  </button>
                )}

                {/* Report button — for authenticated non-owner users */}
                {isAuthenticated && !isOwner && !comment.isRemoved && (
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors ml-1"
                  >
                    <Flag className="w-3.5 h-3.5" /> Report
                  </button>
                )}

                {/* Remove — admin/moderator can remove any comment */}
                {isModerator && !comment.isRemoved && (
                  <button
                    onClick={() => removeComment(comment.id, postId)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded transition-colors ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}

                {/* Delete — owner can delete their own comment */}
                {!isModerator && isOwner && !comment.isRemoved && (
                  <button
                    onClick={() => removeComment(comment.id, postId)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-red-400 hover:bg-red-50 rounded transition-colors ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>

              {/* Reply textarea */}
              {showReply && (
                <div className="ml-5 mt-2">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500 min-h-[80px] transition-colors"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-1.5">
                    <button
                      onClick={() => { setShowReply(false); setReplyContent(""); }}
                      className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReply}
                      disabled={!replyContent.trim()}
                      className="px-3 py-1.5 text-xs bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}

              {/* Nested replies */}
              {replies.length > 0 && (
                <div className="mt-2">
                  {replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      postId={postId}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-orange-500" />
                <h2 className="text-base font-semibold text-gray-800">Report Comment</h2>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportDone ? (
              /* Success state */
              <div className="px-5 py-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-semibold text-gray-800 mb-1">Report submitted</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Thank you. Our team will review this comment.
                </p>
                <button
                  onClick={closeModal}
                  className="px-5 py-2 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Form state */
              <div className="px-5 py-4">
                {/* Comment preview */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Comment by u/{author?.username || "unknown"}:</p>
                  <p className="text-sm text-gray-700 line-clamp-3 italic">
                    "{comment.content}"
                  </p>
                </div>

                {/* Reason */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col gap-1.5">
                    {REPORT_REASONS.map((r) => (
                      <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="radio"
                          name="report-reason"
                          value={r}
                          checked={reportReason === r}
                          onChange={() => setReportReason(r)}
                          className="accent-orange-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                          {r}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Additional details <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide more context about this report..."
                    maxLength={500}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-orange-400 transition-colors"
                  />
                </div>

                {/* Error */}
                {reportError && (
                  <p className="text-xs text-red-500 mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {reportError}
                  </p>
                )}

                {/* Buttons */}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={reportLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {reportLoading ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...</>
                    ) : (
                      <><Flag className="w-3.5 h-3.5" /> Submit Report</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
