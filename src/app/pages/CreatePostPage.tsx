import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { FileText, Link as LinkIcon, Image as ImageIcon, ChevronDown, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

const POST_TYPES = [
  { id: "text", label: "Post", icon: FileText },
  { id: "image", label: "Images & Video", icon: ImageIcon },
] as const;

export function CreatePostPage() {
  const { communities, createPost } = useApp();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultCommunity = searchParams.get("community") || "";
  const [postType, setPostType] = useState<"text" | "image" | "link">("text");
  const [selectedCommunity, setSelectedCommunity] = useState(defaultCommunity);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [flair, setFlair] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [searchCommunity, setSearchCommunity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const community = communities.find((c) => c.name === selectedCommunity);
  const isAdmin = currentUser?.role === 'admin';
  const isJoined = community && (isAdmin || currentUser?.joinedCommunities?.includes(community.id));
  
  const filteredCommunities = communities.filter((c) =>
    c.name.toLowerCase().includes(searchCommunity.toLowerCase()) &&
    (isAdmin || currentUser?.joinedCommunities?.includes(c.id))
  );

  const canSubmit = title.trim().length > 0 && selectedCommunity.length > 0 && isJoined;

  const handleSubmit = async () => {
    if (!canSubmit || !community || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createPost({
        title: title.trim(),
        content: content.trim(),
        type: postType,
        linkUrl: postType === "link" ? linkUrl : undefined,
        imageUrl: postType === "image" ? imageUrl : undefined,
        community: community.id,
        authorId: currentUser?.id,
        flair: flair || undefined,
        isSpoiler,
      });

      navigate(`/r/${selectedCommunity}`);
    } catch (e) {
      console.error("Failed to post", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-20 pb-8">
      <div className="mb-4">
        <h1 className="text-gray-900">Create a Post</h1>
        <div className="h-px bg-gray-200 mt-2" />
      </div>

      <div className="flex gap-5">
        {/* didieu */}
        <div className="flex-1 min-w-0">
          {/* milih komunitu */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 relative">
            <button
              onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
              className="flex items-center gap-2 w-full text-sm"
            >
              {community ? (
                <>
                  <span className="text-lg">{community.icon}</span>
                  <span className="text-gray-800">r/{community.name}</span>
                  {!isJoined && <span className="ml-2 text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-medium">Must Join First</span>}
                </>
              ) : (
                <span className="text-gray-400">Choose a joined community</span>
              )}
              <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
            </button>

            {showCommunityDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                <div className="p-2">
                  <input
                    type="text"
                    value={searchCommunity}
                    onChange={(e) => setSearchCommunity(e.target.value)}
                    placeholder="Search communities..."
                    className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="max-h-48 overflow-y-auto">
                  {filteredCommunities.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      You haven't joined any communities matching this search.
                    </div>
                  ) : (
                    filteredCommunities.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCommunity(c.name);
                          setShowCommunityDropdown(false);
                          setSearchCommunity("");
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 text-sm text-left"
                      >
                        <span className="text-xl">{c.icon}</span>
                        <div>
                          <div className="text-gray-800">r/{c.name}</div>
                          <div className="text-xs text-gray-400">
                            {c.members.toLocaleString()} members
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Post */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
            <div className="flex border-b border-gray-200">
              {POST_TYPES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setPostType(id)}
                  className={`flex items-center gap-2 flex-1 px-4 py-3 text-sm border-b-2 transition-colors ${
                    postType === id
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="p-4">
              {/* judul bebad*/}
              <div className="mb-3 relative">
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 300))}
                  placeholder="Title"
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500"
                />
                <span className="absolute bottom-2.5 right-3 text-xs text-gray-400">
                  {title.length}/300
                </span>
              </div>

              {/* penjaldan kecil  */}
              <div className="mb-3">
                <input
                  type="text"
                  value={flair}
                  onChange={(e) => setFlair(e.target.value)}
                  placeholder="Add flair (optional)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* didieu ker ngomongka */}
              {postType === "text" && (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Text (optional)"
                  rows={6}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500"
                />
              )}

              {postType === "link" && (
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Url"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              )}

              {postType === "image" && (
                <div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Image URL"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 mb-2"
                  />

                  {imageUrl && (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full max-h-64 object-cover"
                      />
                      <button
                        onClick={() => setImageUrl("")}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 mt-1">
                    Enter a direct image URL
                  </div>
                </div>
              )}

              {/* pilih sini */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setIsSpoiler(!isSpoiler)}
                  className={`px-3 py-1.5 rounded-full text-xs border ${
                    isSpoiler
                      ? "bg-gray-800 border-gray-800 text-white"
                      : "border-gray-300 text-gray-600 hover:border-gray-500"
                  }`}
                >
                  Spoiler
                </button>
              </div>
            </div>
          </div>

          {/* jadina */}
          <div className="flex justify-end gap-3">
            <Link
              to="/"
              className="px-5 py-2.5 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="px-5 py-2.5 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 disabled:opacity-40"
            >
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>

      {showCommunityDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowCommunityDropdown(false)}
        />
      )}
    </div>
  );
}