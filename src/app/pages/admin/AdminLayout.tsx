import { Link, useLocation, Outlet, Navigate } from "react-router";
import {
  LayoutDashboard, Users, FileText, Flag, Settings,
  MessageSquare, BarChart2, Globe, ChevronRight, Shield,
  TrendingUp, AlertTriangle,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { path: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/posts", label: "Posts", icon: FileText },
  { path: "/admin/communities", label: "Communities", icon: Globe },
  { path: "/admin/reports", label: "Reports", icon: Flag, badge: true },
];

export function AdminLayout() {
  const location = useLocation();
  const { reports } = useApp();
  const { user: currentUser, isAuthenticated, isLoading } = useAuth();
  const pendingReports = reports.filter((r) => r.status === "pending").length;

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser?.role === "user") {
    // Prevent normal users from accessing admin routes
    return (
      <div className="min-h-screen pt-32 text-center">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-6">You must be an administrator or moderator to view this page.</p>
        <Link to="/" className="px-5 py-2.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 pt-14">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white fixed top-14 left-0 bottom-0 z-30 flex flex-col">
        {/* Admin Header */}
        <div className="px-4 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm text-white font-semibold">Admin Panel</div>
              <div className="text-xs text-gray-400">{currentUser?.username}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <div className="text-xs text-gray-500 px-2 mb-2 uppercase tracking-wider">Management</div>
          {NAV_ITEMS.map(({ path, label, icon: Icon, exact, badge }) => {
            const isActive = exact ? location.pathname === path : location.pathname.startsWith(path) && path !== "/admin";
            const isExactActive = location.pathname === path;

            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors ${
                  (exact ? isExactActive : isActive)
                    ? "bg-red-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {badge && pendingReports > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {pendingReports}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="text-xs text-gray-500 px-2 mb-2 mt-4 uppercase tracking-wider">More</div>
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>Back to Forum</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-700 text-xs text-gray-500">
          ForumHub Admin v2.0
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-56 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
