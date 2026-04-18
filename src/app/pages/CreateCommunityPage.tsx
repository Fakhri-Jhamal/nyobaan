import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, CheckCircle, Loader2, Lock } from "lucide-react";

const EMOJI_OPTIONS = ["🌐", "💻", "🎮", "🎨", "📚", "🔬", "🎵", "🏀", "🍕", "📷", "🚀", "💡", "🌿", "🐾", "🎬"];

export function CreateCommunityPage() {
  const { createCommunity } = useApp();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🌐");
  const [banner, setBanner] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Validsai
  const nameTrimmed = name.trim();
  const descTrimmed = description.trim();
  const nameError =
    nameTrimmed.length > 0 && nameTrimmed.length < 3
      ? "Name must be at least 3 characters"
      : nameTrimmed.length > 21
      ? "Name cannot exceed 21 characters"
      : "";
  const descError =
    descTrimmed.length > 0 && descTrimmed.length < 10
      ? `Description needs at least 10 characters (${descTrimmed.length}/10)`
      : "";

  const canSubmit =
    nameTrimmed.length >= 3 &&
    nameTrimmed.length <= 21 &&
    descTrimmed.length >= 10 &&
    !isLoading;

  // tidak login? langsung lock
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-32 text-center">
        <div className="bg-white border border-gray-200 rounded-lg p-10">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-gray-800 mb-2">Login Required</h2>
          <p className="text-sm text-gray-500 mb-6">
            You need to be logged in to create a community.
          </p>
          <Link
            to="/login"
            className="px-6 py-2.5 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    // handler busuk
    const sanitizedName = nameTrimmed.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    try {
      await createCommunity({
        name: sanitizedName,
        description: descTrimmed,
        icon,
        banner: banner.trim() || undefined,
      });
      setSuccessMsg(`r/${sanitizedName} created! Redirecting...`);
      setTimeout(() => navigate(`/r/${sanitizedName}`), 1200);
    } catch (e: any) {
      const serverMsg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to create community.";
      setErrorMsg(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-20 pb-8">
      <div className="mb-6">
        <h1 className="text-gray-900 text-2xl font-bold">Create a Community</h1>
        <p className="text-sm text-gray-500 mt-1">
          Build your own corner of ForumHub.
        </p>
        <div className="h-px bg-gray-200 mt-3" />
      </div>

      <div className="flex gap-5">
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-lg p-5">

            {/* Error Banner */}
            {errorMsg && (
              <div className="flex items-start gap-3 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/*  Banner nu benner */}
            {successMsg && (
              <div className="flex items-start gap-3 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* buat nama */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Community Name <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Letters and numbers only. Cannot be changed after creation.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 font-semibold text-sm">
                  r/
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value.replace(/[^a-zA-Z0-9]/g, ""));
                    setErrorMsg("");
                  }}
                  maxLength={21}
                  placeholder="mycommunity"
                  className={`w-full pl-8 pr-14 py-2 border rounded-lg text-sm focus:outline-none transition-colors ${
                    nameError
                      ? "border-red-400 focus:border-red-500 bg-red-50"
                      : nameTrimmed.length >= 3
                      ? "border-green-400 focus:border-green-500"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-400">
                  {nameTrimmed.length}/21
                </span>
              </div>
              {nameError && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {nameError}
                </p>
              )}
              {!nameError && nameTrimmed.length >= 3 && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> r/{nameTrimmed.toLowerCase()} looks good!
                </p>
              )}
            </div>

            {/* deskripso */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Help new members understand your community. Minimum 10 characters.
              </p>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrorMsg("");
                }}
                maxLength={500}
                rows={3}
                placeholder="What is your community about?"
                className={`w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none transition-colors ${
                  descError
                    ? "border-red-400 focus:border-red-500 bg-red-50"
                    : descTrimmed.length >= 10
                    ? "border-green-400 focus:border-green-500"
                    : "border-gray-200 focus:border-blue-500"
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {descError ? (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {descError}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {descTrimmed.length}/500
                </span>
              </div>
            </div>

            {/* Icon */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Community Icon
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Pick an emoji or type your own
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`w-9 h-9 text-lg flex items-center justify-center rounded-lg border-2 transition-all ${
                      icon === emoji
                        ? "border-orange-500 bg-orange-50 scale-110"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Custom:</span>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  maxLength={2}
                  className="w-16 px-3 py-1.5 text-center border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <span className="text-2xl">{icon}</span>
              </div>
            </div>

            {/* URL buat banner */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Banner Image URL{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                placeholder="https://example.com/banner.jpg"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              {banner && (
                <div className="mt-2 rounded-lg overflow-hidden h-20 bg-gray-100">
                  <img
                    src={banner}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1547658719-da2b51169166?w=1200&q=80";
                    }}
                  />
                </div>
              )}
            </div>

            {/* proces */}
            <div className="flex justify-end gap-3">
              <Link
                to="/"
                className="px-5 py-2.5 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Community"
                )}
              </button>
            </div>

            {/* ketika di cancel */}
            {!canSubmit && !isLoading && (
              <p className="text-xs text-gray-400 text-right mt-2">
                {nameTrimmed.length < 3
                  ? "⚠ Name must be at least 3 characters"
                  : descTrimmed.length < 10
                  ? "⚠ Description must be at least 10 characters"
                  : ""}
              </p>
            )}
          </div>
        </div>

        {/* sidebar kalau salah */}
        <div className="hidden md:block w-64 shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-20">
            <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-3">
              <h3 className="text-white text-sm font-semibold">Creating a community</h3>
            </div>
            <div className="p-4">
              <ul className="text-xs text-gray-600 space-y-3">
                <li className="flex gap-2">
                  <span className="text-orange-500 mt-0.5">▲</span>
                  <span>
                    <strong>Community names</strong> are lowercase, letters and numbers only, and up to 21 characters.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500 mt-0.5">▲</span>
                  <span>
                    <strong>Names cannot be changed</strong> after creation.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500 mt-0.5">▲</span>
                  <span>
                    You become the <strong>first moderator</strong> of your community.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500 mt-0.5">▲</span>
                  <span>
                    You can add <strong>rules and more moderators</strong> once the community is created.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
