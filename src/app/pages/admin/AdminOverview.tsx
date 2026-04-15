import { Users, FileText, MessageSquare, Flag, TrendingUp, ArrowUp, Shield, AlertTriangle } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, change, positive, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className={`flex items-center gap-1 text-xs ${positive ? "text-green-600" : "text-red-500"}`}>
        <ArrowUp className={`w-3 h-3 ${positive ? "" : "rotate-180"}`} />
        <span>{change} from last month</span>
      </div>
    </div>
  );
}

export function AdminOverview() {
  const { users, posts, comments, reports, communities } = useApp();
  const { user: currentUser } = useAuth();

  const pendingReports = reports.filter((r) => r.status === "pending");
  const activeUsers = users.filter((u) => !u.isBanned);
  const totalComments = comments.length;

  const topRealCommunities = [...communities].map(c => ({
    ...c,
    postCount: posts.filter(p => p.community === c.id).length
  })).sort((a, b) => b.postCount - a.postCount).slice(0, 5);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 text-2xl">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {currentUser?.username}. Here's what's happening.</p>
      </div>

      {/* Alert for pending reports */}
      {pendingReports.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-yellow-800">
              <strong>{pendingReports.length} pending reports</strong> require your attention.
            </p>
          </div>
          <Link
            to="/admin/reports"
            className="text-sm text-yellow-700 border border-yellow-300 px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            Review
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Users"
          value={activeUsers.length.toLocaleString()}
          change="+12.5%"
          positive={true}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Posts"
          value={posts.length.toLocaleString()}
          change="+8.2%"
          positive={true}
          icon={FileText}
          color="bg-orange-500"
        />
        <StatCard
          title="Comments"
          value={totalComments.toLocaleString()}
          change="+15.3%"
          positive={true}
          icon={MessageSquare}
          color="bg-green-500"
        />
        <StatCard
          title="Pending Reports"
          value={pendingReports.length.toString()}
          change="-3.1%"
          positive={true}
          icon={Flag}
          color="bg-red-500"
        />
      </div>

      {/* Top Communities */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <h3 className="text-gray-800 mb-4">Top Communities by Posts</h3>
        {topRealCommunities.length === 0 ? (
          <p className="text-sm text-gray-500">No communities yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {topRealCommunities.map((community, i) => (
              <div key={community.id} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-6 text-right">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">r/{community.name}</span>
                    <span className="text-xs text-gray-500">{community.postCount.toLocaleString()} posts</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all"
                      style={{
                        width: `${topRealCommunities[0].postCount === 0 ? 0 : (community.postCount / topRealCommunities[0].postCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800">Recent Users</h3>
            <Link to="/admin/users" className="text-xs text-blue-500 hover:underline">View all</Link>
          </div>
          <div className="flex flex-col gap-3">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                  <img src={user.avatar} alt={user.username} className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-800 truncate">{user.username}</div>
                  <div className="text-xs text-gray-400">{user.karma.toLocaleString()} karma</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  user.isBanned ? "bg-red-100 text-red-600" :
                  user.role === "admin" ? "bg-red-50 text-red-600" :
                  user.role === "moderator" ? "bg-green-50 text-green-600" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {user.isBanned ? "Banned" : user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800">Recent Reports</h3>
            <Link to="/admin/reports" className="text-xs text-blue-500 hover:underline">View all</Link>
          </div>
          <div className="flex flex-col gap-3">
            {reports.slice(0, 5).map((report) => (
              <div key={report.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  report.type === "post" ? "bg-blue-100" :
                  report.type === "comment" ? "bg-green-100" : "bg-purple-100"
                }`}>
                  {report.type === "post" ? <FileText className="w-4 h-4 text-blue-600" /> :
                   report.type === "comment" ? <MessageSquare className="w-4 h-4 text-green-600" /> :
                   <Users className="w-4 h-4 text-purple-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-800 truncate">{report.reason}</div>
                  <div className="text-xs text-gray-400">Reported {report.type}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                  report.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                  report.status === "resolved" ? "bg-green-100 text-green-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {report.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}