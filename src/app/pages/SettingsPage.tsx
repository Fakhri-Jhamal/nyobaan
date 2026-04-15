import { useState, useRef } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Camera, CheckCircle, AlertCircle, Loader2, User, Image, FileText, ArrowLeft } from "lucide-react";

const AVATAR_PRESETS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zara",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Nova",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Kami",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Rex",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bolt",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Iris",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Echo",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Vex",
];

const BANNER_PRESETS = [
  { label: "Orange Gradient", value: "" }, // handled by CSS
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80",
  "https://images.unsplash.com/photo-1540553016722-983e048a0f13?w=1200&q=80",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80",
];

export function SettingsPage() {
  const { user: currentUser, updateProfile } = useAuth();

  const [bio, setBio] = useState((currentUser as any)?.bio || "");
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || "");
  const [banner, setBanner] = useState((currentUser as any)?.banner || "");
  const [bannerUrl, setBannerUrl] = useState((currentUser as any)?.banner || "");

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [activeTab, setActiveTab] = useState<"profile" | "avatar" | "banner">("profile");

  if (!currentUser) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-32 text-center">
        <p className="text-gray-500 mb-4">You must be logged in to access settings.</p>
        <Link to="/login" className="text-orange-500 hover:underline">Log In</Link>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await updateProfile({ bio, avatar, banner });
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const { default: api } = await import("../services/api");
      const res = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // The backend returns a public URL like /uploads/filename.jpg
      // So we need to prefix it with the API absolute URL or if API URL has /api we remove it
      // Actually res.data.url is just the relative path from the server origin
      const baseURL = api.defaults.baseURL?.replace('/api', '') || "http://localhost:5000";
      const fullUrl = `${baseURL}${res.data.url}`;

      if (type === "avatar") {
        setAvatar(fullUrl);
        setAvatarUrl(fullUrl);
      } else {
        setBanner(fullUrl);
        setBannerUrl(fullUrl);
      }
      setSuccessMsg("Image uploaded successfully! Click save to keep changes.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message || "Failed to upload image. Must be <5MB.");
      setTimeout(() => setErrorMsg(""), 5000);
    }
  };

  const hasChanges =
    bio !== ((currentUser as any)?.bio || "") ||
    avatar !== (currentUser?.avatar || "") ||
    banner !== ((currentUser as any)?.banner || "");

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20 pb-10">
      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/u/${currentUser.username}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Customize how others see you on ForumHub</p>
      </div>

      <div className="flex gap-6">
        {/* Left: Live preview */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">Preview</p>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Banner preview */}
              <div
                className="h-16 bg-gradient-to-r from-orange-400 via-orange-500 to-red-400"
                style={
                  banner
                    ? { backgroundImage: `url(${banner})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : undefined
                }
              />
              <div className="px-4 pb-4 -mt-6">
                <div className="w-12 h-12 rounded-full border-2 border-white shadow overflow-hidden bg-gray-100 mb-2">
                  <img
                    src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`;
                    }}
                  />
                </div>
                <p className="font-semibold text-sm text-gray-900">u/{currentUser.username}</p>
                {bio && <p className="text-xs text-gray-500 mt-1 line-clamp-3">{bio}</p>}
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <div>
                    <span className="block font-semibold text-gray-900 text-sm">{(currentUser.karma || 0).toLocaleString()}</span>
                    karma
                  </div>
                  <div>
                    <span className="block font-semibold text-gray-900 text-sm">{currentUser.joinedCommunities?.length || 0}</span>
                    communities
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Settings form */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
            {([
              { key: "profile", label: "Profile Info", icon: FileText },
              { key: "avatar", label: "Avatar", icon: User },
              { key: "banner", label: "Banner", icon: Image },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            {/* ── Profile Info Tab ── */}
            {activeTab === "profile" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Username</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.username}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Username cannot be changed.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Email</label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email || ""}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Bio <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={300}
                    rows={4}
                    placeholder="Tell the community about yourself..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-orange-400 transition-colors"
                  />
                  <div className="flex justify-end">
                    <span className="text-xs text-gray-400">{bio.length}/300</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Avatar Tab ── */}
            {activeTab === "avatar" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Upload New Avatar</label>
                  <p className="text-xs text-gray-500 mb-2">
                    Choose a local file to upload, or paste a URL below.
                  </p>
                  <div className="mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "avatar")}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-orange-50 file:text-orange-700
                        hover:file:bg-orange-100 transition-colors cursor-pointer"
                    />
                  </div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Avatar URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setAvatar(avatarUrl)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {avatar && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full border border-gray-200 overflow-hidden bg-gray-100">
                        <img
                          src={avatar}
                          alt="Current avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`;
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Current avatar</p>
                        <button
                          onClick={() => { setAvatar(""); setAvatarUrl(""); }}
                          className="text-xs text-red-500 hover:underline mt-0.5"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">Preset Avatars</p>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_PRESETS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setAvatar(url); setAvatarUrl(url); }}
                        className={`w-full aspect-square rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                          avatar === url ? "border-orange-500 shadow-md shadow-orange-200" : "border-gray-200"
                        }`}
                      >
                        <img src={url} alt={`Preset ${i + 1}`} className="w-full h-full" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Banner Tab ── */}
            {activeTab === "banner" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Upload New Banner</label>
                  <div className="mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "banner")}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-orange-50 file:text-orange-700
                        hover:file:bg-orange-100 transition-colors cursor-pointer"
                    />
                  </div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Banner Image URL</label>
                  <p className="text-xs text-gray-500 mb-2">
                    Paste a direct image URL (best ratio: 3:1, e.g. 1200×400px). Leave blank to use the default gradient.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      placeholder="https://example.com/banner.jpg"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setBanner(bannerUrl)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Live banner preview */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Banner Preview:</p>
                  <div
                    className="h-24 rounded-xl bg-gradient-to-r from-orange-400 via-orange-500 to-red-400 transition-all"
                    style={
                      banner
                        ? { backgroundImage: `url(${banner})`, backgroundSize: "cover", backgroundPosition: "center" }
                        : undefined
                    }
                  />
                </div>

                {/* Presets */}
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">Preset Banners</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => { setBanner(""); setBannerUrl(""); }}
                      className={`h-14 rounded-lg bg-gradient-to-r from-orange-400 via-orange-500 to-red-400 border-2 transition-all hover:scale-[1.02] ${
                        !banner ? "border-orange-500 shadow-md" : "border-transparent"
                      }`}
                    />
                    {BANNER_PRESETS.slice(1).map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setBanner(url as string); setBannerUrl(url as string); }}
                        className={`h-14 rounded-lg overflow-hidden border-2 transition-all hover:scale-[1.02] ${
                          banner === url ? "border-orange-500 shadow-md" : "border-transparent"
                        }`}
                      >
                        <img
                          src={url as string}
                          alt={`Banner ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {banner && (
                  <button
                    onClick={() => { setBanner(""); setBannerUrl(""); }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove banner (use default gradient)
                  </button>
                )}
              </div>
            )}

            {/* Messages */}
            {successMsg && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Save button */}
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
              {!hasChanges && (
                <p className="text-xs text-gray-400">Make a change to enable saving</p>
              )}
              <div className="ml-auto flex gap-2">
                {hasChanges && (
                  <button
                    type="button"
                    onClick={() => {
                      setBio((currentUser as any)?.bio || "");
                      setAvatar(currentUser?.avatar || "");
                      setAvatarUrl(currentUser?.avatar || "");
                      setBanner((currentUser as any)?.banner || "");
                      setBannerUrl((currentUser as any)?.banner || "");
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
