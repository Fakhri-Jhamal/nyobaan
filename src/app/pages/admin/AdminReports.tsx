import { useState } from "react";
import {
  CheckCircle, XCircle, FileText, MessageSquare,
  User, Flag, AlertTriangle, Eye, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatDistanceToNow } from "date-fns";
import { Report } from "../../types";
import { Link } from "react-router";

type StatusFilter = "all" | "pending" | "resolved" | "dismissed";

function ReportBadge({ type }: { type: string }) {
  switch (type) {
    case "post":
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          <FileText className="w-3 h-3" /> Post
        </span>
      );
    case "comment":
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
          <MessageSquare className="w-3 h-3" /> Comment
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
          <User className="w-3 h-3" /> User
        </span>
      );
  }
}

function StatusBadge({ status }: { status: Report["status"] }) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
          <AlertTriangle className="w-3 h-3" /> Pending
        </span>
      );
    case "resolved":
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
          <CheckCircle className="w-3 h-3" /> Resolved
        </span>
      );
    case "dismissed":
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
          <XCircle className="w-3 h-3" /> Dismissed
        </span>
      );
  }
}

/** Shows the actual content of the reported item */
function TargetContentPreview({ report }: { report: any }) {
  const [expanded, setExpanded] = useState(false);

  // Comment report
  if (report.targetType === "comment" || report.type === "comment") {
    const content = report.targetContent;
    const author = report.targetAuthor;
    const isRemoved = report.targetIsRemoved;
    if (!content && !author) return null;
    return (
      <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MessageSquare className="w-3 h-3" />
            <span>Comment by</span>
            <span className="font-medium text-gray-700">u/{author || "unknown"}</span>
            {isRemoved && (
              <span className="ml-1 text-red-500 bg-red-50 px-1.5 rounded text-xs">removed</span>
            )}
          </div>
          {content && content.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-0.5"
            >
              {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> More</>}
            </button>
          )}
        </div>
        <p className={`px-3 py-2 text-sm text-gray-700 italic ${!expanded ? "line-clamp-3" : ""}`}>
          {content ? `"${content}"` : <span className="text-gray-400">[Content unavailable]</span>}
        </p>
      </div>
    );
  }

  // Post report
  if (report.targetType === "post" || report.type === "post") {
    const title = report.targetTitle;
    const content = report.targetContent;
    const author = report.targetAuthor;
    const isRemoved = report.targetIsRemoved;
    if (!title && !author) return null;
    return (
      <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-blue-100">
          <div className="flex items-center gap-1.5 text-xs text-blue-600">
            <FileText className="w-3 h-3" />
            <span>Post by</span>
            <span className="font-medium">u/{author || "unknown"}</span>
            {isRemoved && (
              <span className="ml-1 text-red-500 bg-red-50 px-1.5 rounded text-xs border border-red-200">removed</span>
            )}
          </div>
          {content && content.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-0.5"
            >
              {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> More</>}
            </button>
          )}
        </div>
        {title && <p className="px-3 pt-2 text-sm font-semibold text-gray-800 line-clamp-2">{title}</p>}
        {content && (
          <p className={`px-3 py-2 text-xs text-gray-600 ${!expanded ? "line-clamp-2" : ""}`}>
            {content}
          </p>
        )}
      </div>
    );
  }

  // User report
  if (report.targetType === "user" || report.type === "user") {
    const username = report.targetUsername;
    const isBanned = report.targetIsBanned;
    if (!username) return null;
    return (
      <div className="mt-2 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 flex items-center gap-2">
        <User className="w-4 h-4 text-purple-400" />
        <span className="text-sm text-gray-700">
          Profile:{" "}
          <Link to={`/u/${username}`} className="text-purple-600 font-medium hover:underline">
            u/{username}
          </Link>
        </span>
        {isBanned && (
          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">Banned</span>
        )}
      </div>
    );
  }

  return null;
}

export function AdminReports() {
  const { reports, resolveReport, dismissReport, removeComment, removePost, users, posts, comments } = useApp();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "post" | "comment" | "user">("all");

  const getReporterName = (reportedBy: any) => {
    // reportedBy may be a populated object or a plain ID
    if (reportedBy && typeof reportedBy === "object") return reportedBy.username || "Unknown";
    return users.find((u) => u.id === reportedBy)?.username || "Unknown";
  };

  // Fallback target info when backend enrichment is not available
  const getFallbackTargetInfo = (report: any) => {
    const type = report.type || report.targetType;
    if (type === "post") {
      const post = posts.find((p) => p.id === report.targetId);
      return post ? `"${post.title.slice(0, 60)}..."` : `Post #${report.targetId}`;
    }
    if (type === "user") {
      const user = users.find((u) => u.id === report.targetId);
      return user ? `u/${user.username}` : `User #${report.targetId}`;
    }
    const comment = comments.find((c) => c.id === report.targetId);
    return comment ? `"${comment.content?.slice(0, 60)}..."` : `Comment #${report.targetId}`;
  };

  const filtered = reports.filter((r: any) => {
    const type = r.type || r.targetType;
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchType = typeFilter === "all" || type === typeFilter;
    return matchStatus && matchType;
  });

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  const handleResolveAndRemove = async (report: any) => {
    const type = report.type || report.targetType;
    if (type === "comment") {
      const targetComment = comments.find(c => c.id === report.targetId);
      if (targetComment) await removeComment(report.targetId, targetComment.postId);
    } else if (type === "post") {
      await removePost(report.targetId, "Removed after report review");
    }
    resolveReport(report.id);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-gray-900 text-2xl font-bold">Reports Queue</h1>
        <p className="text-sm text-gray-500 mt-1">Review and action user-submitted reports</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Reports", value: reports.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pending", value: reports.filter(r => r.status === "pending").length, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Resolved", value: reports.filter(r => r.status === "resolved").length, color: "text-green-600", bg: "bg-green-50" },
          { label: "Dismissed", value: reports.filter(r => r.status === "dismissed").length, color: "text-gray-600", bg: "bg-gray-50" },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} rounded-xl p-4`}>
            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            <div className="text-sm text-gray-600 mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 flex items-center gap-2">
          <Flag className="w-4 h-4 text-yellow-600 shrink-0" />
          <p className="text-sm text-yellow-800">
            You have <strong>{pendingCount} pending reports</strong> awaiting review.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex gap-1">
          {(["all", "pending", "resolved", "dismissed"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                statusFilter === s ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {s === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          {(["all", "post", "comment", "user"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                typeFilter === t ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Report list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Flag className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No reports found</p>
          </div>
        ) : (
          filtered.map((report: any) => {
            const type = report.type || report.targetType;
            return (
              <div
                key={report.id}
                className={`bg-white border rounded-xl p-4 transition-all ${
                  report.status === "pending"
                    ? "border-yellow-200 bg-yellow-50/30 shadow-sm"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Badges + timestamp */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <ReportBadge type={type} />
                      <StatusBadge status={report.status} />
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Reason + target fallback */}
                    <div className="text-sm text-gray-800 mb-1">
                      <span className="text-orange-600 font-semibold">{report.reason}</span>
                      {" — "}
                      <span className="text-gray-500 text-xs">{getFallbackTargetInfo(report)}</span>
                    </div>

                    {/* Reporter details */}
                    {report.details && (
                      <p className="text-sm text-gray-500 mb-1 italic">"{report.details}"</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Reported by{" "}
                      <span className="text-gray-600 font-medium">
                        u/{getReporterName(report.reportedBy)}
                      </span>
                    </p>

                    {/* Enriched content preview from backend */}
                    <TargetContentPreview report={report} />
                  </div>

                  {/* Action buttons */}
                  {report.status === "pending" && (
                    <div className="flex flex-col gap-2 shrink-0">
                      {/* Resolve + Remove Content (for post/comment reports) */}
                      {(type === "post" || type === "comment") && (
                        <button
                          onClick={() => handleResolveAndRemove(report)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs hover:bg-red-100 transition-colors whitespace-nowrap"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove & Resolve
                        </button>
                      )}
                      <button
                        onClick={() => resolveReport(report.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs hover:bg-green-100 transition-colors whitespace-nowrap"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Resolve
                      </button>
                      <button
                        onClick={() => dismissReport(report.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-100 transition-colors whitespace-nowrap"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* View button for resolved/dismissed */}
                  {report.status !== "pending" && (type === "post") && (
                    <div className="shrink-0">
                      <a
                        href="#"
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
