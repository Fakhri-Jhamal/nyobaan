import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import api from "../services/api";
import {
  Search, Plus, ChevronDown, Menu, X,
  Shield, Home, Bookmark, User as UserIcon,
  LogOut, Settings, LogIn, UserPlus, Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { communities } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchNotifs = async () => {
    if (isAuthenticated) {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (e) {
        // Abaikan error notifikasi
      }
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [isAuthenticated]);

  const filteredCommunities = communities.filter((c: any) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(false);
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">▲</span>
          </div>
          <span className="hidden sm:block text-gray-800 text-base font-semibold tracking-tight">
            forum<span className="text-orange-500">hub</span>
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              placeholder="Search ForumHub"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
          {showSearchResults && filteredCommunities.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
              {filteredCommunities.map((c: any) => (
                <Link
                  key={c.id || c._id}
                  to={`/r/${c.name}`}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm"
                  onClick={() => { setShowSearchResults(false); setSearchQuery(""); }}
                >
                  <span className="text-xl">{c.icon}</span>
                  <div>
                    <div className="text-gray-800">r/{c.name}</div>
                    <div className="text-gray-400 text-xs">{Number(c.members).toLocaleString()} members</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {isAuthenticated && user ? (
            <>
              <Link
                to="/submit"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </Link>

              {(user as any).role === "admin" && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full text-sm text-red-600 hover:bg-red-100 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
                  className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors relative text-gray-600"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.some(n => !n.isRead) && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-800">Notifications</span>
                      <button 
                        className="text-xs text-blue-500 hover:underline"
                        onClick={async () => {
                          try {
                            await api.put('/notifications/read-all');
                            fetchNotifs();
                          } catch(e) {}
                        }}
                      >Mark all as read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                      ) : (
                        notifications.map(n => (
                          <Link
                            key={n._id}
                            to={`/r/${n.community?.name}/post/${n.post?._id}`}
                            className={`block px-4 py-3 border-b last:border-0 border-gray-50 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                            onClick={async () => {
                              setShowNotifs(false);
                              if (!n.isRead) {
                                try {
                                  await api.put(`/notifications/${n._id}/read`);
                                  fetchNotifs();
                                } catch(e){}
                              }
                            }}
                          >
                            <div className="flex gap-3">
                              <img src={n.sourceUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.sourceUser?.username}`} className="w-8 h-8 rounded-full" />
                              <div>
                                <p className="text-xs text-gray-800">
                                  <strong>{n.sourceUser?.username}</strong> {n.type === 'reply_comment' ? 'replied to your comment' : 'replied to your post'} in <strong>r/{n.community?.name}</strong>
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2 py-1.5 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-orange-100 overflow-hidden flex items-center justify-center">
                    {(user as any).avatar ? (
                      <img src={(user as any).avatar} alt={(user as any).username} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <span className="hidden sm:block text-sm text-gray-700">{(user as any).username}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-semibold text-gray-800">{(user as any).username}</div>
                      <div className="text-xs text-gray-400">{(user as any).email}</div>
                    </div>
                    <div className="py-1">
                      <Link
                        to={`/u/${(user as any).username}`}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <UserIcon className="w-4 h-4 text-gray-400" /> Profile
                      </Link>
                      <Link
                        to="/saved"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Bookmark className="w-4 h-4 text-gray-400" /> Saved
                      </Link>
                      {(user as any).role === "admin" && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Shield className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}
                      <div className="border-t border-gray-100 my-1" />
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4 text-gray-400" /> Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-4 h-4" /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex sm:hidden items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                title="Log In"
              >
                <LogIn className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-orange-500 rounded-full text-sm text-white hover:bg-orange-600 transition-colors font-medium"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Up</span>
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            className="sm:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="sm:hidden border-t border-gray-200 bg-white py-2 px-4 flex flex-col gap-1">
          <Link to="/" className="flex items-center gap-3 py-2 text-sm text-gray-700" onClick={() => setShowMobileMenu(false)}>
            <Home className="w-4 h-4" /> Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/submit" className="flex items-center gap-3 py-2 text-sm text-gray-700" onClick={() => setShowMobileMenu(false)}>
                <Plus className="w-4 h-4" /> Create Post
              </Link>
              {(user as any)?.role === "admin" && (
                <Link to="/admin" className="flex items-center gap-3 py-2 text-sm text-red-600" onClick={() => setShowMobileMenu(false)}>
                  <Shield className="w-4 h-4" /> Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                className="flex items-center gap-3 py-2 text-sm text-red-600 w-full text-left"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-3 py-2 text-sm text-gray-700" onClick={() => setShowMobileMenu(false)}>
                <LogIn className="w-4 h-4" /> Log In
              </Link>
              <Link to="/register" className="flex items-center gap-3 py-2 text-sm text-orange-600" onClick={() => setShowMobileMenu(false)}>
                <UserPlus className="w-4 h-4" /> Sign Up
              </Link>
            </>
          )}
        </div>
      )}

      {/* Overlay to close menus */}
      {(showUserMenu || showMobileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowUserMenu(false); setShowMobileMenu(false); }}
        />
      )}
    </nav>
  );
}
