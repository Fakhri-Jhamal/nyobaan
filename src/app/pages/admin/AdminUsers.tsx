import { useState } from "react";
import { Search, Ban, CheckCircle, Shield, ChevronDown, UserX, User } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router";

export function AdminUsers() {
  const { users, banUser, unbanUser } = useApp();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("karma");
  const [confirmBan, setConfirmBan] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" ||
      (statusFilter === "banned" && u.isBanned) ||
      (statusFilter === "active" && !u.isBanned);
    return matchSearch && matchRole && matchStatus;
  }).sort((a, b) => {
    if (sortBy === "karma") return b.karma - a.karma;
    if (sortBy === "username") return a.username.localeCompare(b.username);
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-gray-900 text-2xl">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage user accounts, roles, and permissions</p>
      </div>

      {/* cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users", value: users.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active", value: users.filter(u => !u.isBanned).length, color: "text-green-600", bg: "bg-green-50" },
          { label: "Banned", value: users.filter(u => u.isBanned).length, color: "text-red-600", bg: "bg-red-50" },
          { label: "Admins/Mods", value: users.filter(u => u.role !== "user").length, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} rounded-xl p-4`}>
            <div className={`text-2xl ${item.color}`}>{item.value}</div>
            <div className="text-sm text-gray-600 mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="user">User</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
        >
          <option value="karma">Sort by Karma</option>
          <option value="username">Sort by Username</option>
          <option value="newest">Sort by Newest</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Karma</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-gray-400">No users found</td>
                </tr>
              ) : filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden shrink-0">
                        <img src={user.avatar} alt={user.username} className="w-full h-full" />
                      </div>
                      <Link
                        to={`/u/${user.username}`}
                        target="_blank"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {user.username}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      user.role === "admin" ? "bg-red-100 text-red-700" :
                      user.role === "moderator" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.karma.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                      user.isBanned ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                    }`}>
                      {user.isBanned ? (
                        <><UserX className="w-3 h-3" /> Banned</>
                      ) : (
                        <><CheckCircle className="w-3 h-3" /> Active</>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.role !== "admin" && (
                      user.isBanned ? (
                        <button
                          onClick={() => unbanUser(user.id)}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-green-50 border border-green-200 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmBan(user.id)}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" /> Ban
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} of {users.length} users
        </div>
      </div>

      {/* buat ban */}
      {confirmBan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-gray-900">Ban User</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to ban <strong>{users.find(u => u.id === confirmBan)?.username}</strong>?
              They will not be able to post, comment, or vote.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmBan(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { banUser(confirmBan); setConfirmBan(null); }}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
