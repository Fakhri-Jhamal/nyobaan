export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  banner?: string;
  karma: number;
  postKarma: number;
  commentKarma: number;
  createdAt: string;
  role: "user" | "moderator" | "admin";
  isBanned: boolean;
  bio: string;
  joinedCommunities: string[];
  savedPosts?: string[];
}

export interface Community {
  id: string;
  name: string;
  description: string;
  icon: string;
  banner: string;
  members: number;
  onlineMembers: number;
  createdAt: string;
  moderators: string[];
  rules: { title: string; description: string }[];
}

export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  community: string;
  authorId: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  awards: string[];
  flair?: string;
  flairColor?: string;
  createdAt: string;
  isPinned: boolean;
  isRemoved: boolean;
  removedReason?: string;
  isLocked: boolean;
  isSpoiler?: boolean;
  type: "text" | "image" | "link";
  userVote?: "up" | "down" | null;
}

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  authorId: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  isRemoved: boolean;
  userVote?: "up" | "down" | null;
  replies?: Comment[];
}

export interface Report {
  id: string;
  type: "post" | "comment" | "user";
  targetId: string;
  reportedBy: string;
  reason: string;
  details: string;
  createdAt: string;
  status: "pending" | "resolved" | "dismissed";
}
