import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";
import {
  User, Community, Post, Comment, Report,
} from "../types";

interface AppContextType {
  users: User[];
  communities: Community[];
  posts: Post[];
  comments: Comment[];
  reports: Report[];
  isLoading: boolean;
  // Actions
  fetchPosts: () => Promise<void>;
  fetchCommunities: () => Promise<void>;
  fetchCommentsForPost: (postId: string) => Promise<void>;
  votePost: (postId: string, direction: "up" | "down") => void;
  createPost: (post: any) => Promise<void>;
  removePost: (postId: string, reason: string) => void;
  pinPost: (postId: string) => void;
  lockPost: (postId: string) => void;
  voteComment: (commentId: string, direction: "up" | "down") => void;
  addComment: (postId: string, parentId: string | null, content: string) => void;
  removeComment: (commentId: string, postId: string) => void;
  banUser: (userId: string) => void;
  unbanUser: (userId: string) => void;
  resolveReport: (reportId: string) => void;
  dismissReport: (reportId: string) => void;
  reportPost: (postId: string, reason: string, details: string) => Promise<void>;
  reportComment: (commentId: string, reason: string, details: string) => Promise<void>;
  toggleSavePost: (postId: string) => Promise<void>;
  joinCommunity: (communityId: string) => Promise<void>;
  leaveCommunity: (communityId: string) => Promise<void>;
  createCommunity: (communityData: any) => Promise<void>;
  deleteCommunity: (communityId: string) => Promise<void>;
  viewedPostIds: string[];
  recordView: (postId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function mapMongoToMock(doc: any) {
  if (!doc) return doc;
  const mapped = { ...doc, id: doc._id || doc.id };
  // Normalize comment fields from backend
  if (mapped.post && !mapped.postId) {
    mapped.postId = typeof mapped.post === 'object' ? (mapped.post._id || mapped.post.id) : mapped.post;
  }
  if (mapped.parentComment !== undefined && mapped.parentId === undefined) {
    mapped.parentId = mapped.parentComment || null;
  }
  // Normalize authorId
  if (mapped.author && !mapped.authorId) {
    mapped.authorId = typeof mapped.author === 'object' ? (mapped.author._id || mapped.author.id) : mapped.author;
  }
  // Normalize community field for posts
  if (mapped.community && typeof mapped.community === 'object') {
    mapped.community = mapped.community._id || mapped.community.id;
  }
  return mapped;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: currentUser, checkAuth } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data.map(mapMongoToMock));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCommunities = async () => {
    try {
      const res = await api.get('/communities');
      setCommunities(res.data.map(mapMongoToMock));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.map(mapMongoToMock));
    } catch (e) { console.error(e); }
  };

  const fetchAllComments = async () => {
    try {
      const res = await api.get('/comments');
      setComments(res.data.map(mapMongoToMock));
    } catch (e) { console.error(e); }
  };

  const fetchCommentsForPost = useCallback(async (postId: string) => {
    try {
      const res = await api.get(`/comments/post/${postId}`);
      const newComments = res.data.map(mapMongoToMock);
      setComments((prev) => {
        const others = prev.filter(c => c.postId !== postId);
        return [...others, ...newComments];
      });
    } catch (e) { console.error(e); }
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports');
      setReports(res.data.map(mapMongoToMock));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    async function loadAll() {
      setIsLoading(true);
      await Promise.all([
        fetchPosts(),
        fetchCommunities(),
        fetchUsers(),
        fetchAllComments(),
        fetchReports(),
      ]);
      setIsLoading(false);
    }
    loadAll();
  }, []);

  const votePost = useCallback(async (postId: string, direction: "up" | "down") => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const prev_vote = p.userVote;
        if (prev_vote === direction) {
          return {
            ...p,
            upvotes: direction === "up" ? p.upvotes - 1 : p.upvotes,
            downvotes: direction === "down" ? p.downvotes - 1 : p.downvotes,
            userVote: undefined,
          };
        }
        return {
          ...p,
          upvotes: direction === "up" ? p.upvotes + 1 : prev_vote === "up" ? p.upvotes - 1 : p.upvotes,
          downvotes: direction === "down" ? p.downvotes + 1 : prev_vote === "down" ? p.downvotes - 1 : p.downvotes,
          userVote: direction,
        };
      })
    );
    try {
      await api.post(`/posts/${postId}/vote`, { direction });
    } catch (e) {
      console.error('Error voting on post', e);
      fetchPosts();
    }
  }, []);

  const createPost = useCallback(async (postData: any) => {
    try {
      const res = await api.post('/posts', postData);
      setPosts((prev) => [mapMongoToMock(res.data), ...prev]);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, []);

  const removePost = useCallback(async (postId: string, reason: string) => {
    try {
      await api.put(`/posts/${postId}/remove`, { reason });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (e) {
      console.error('Error removing post', e);
    }
  }, []);

  const pinPost = useCallback(async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => p.id === postId ? { ...p, isPinned: !p.isPinned } : p)
    );
    try {
      await api.put(`/posts/${postId}/pin`);
    } catch (e) { console.error('Error pinning post', e); }
  }, []);

  const lockPost = useCallback(async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => p.id === postId ? { ...p, isLocked: !p.isLocked } : p)
    );
    try {
      await api.put(`/posts/${postId}/lock`);
    } catch (e) { console.error('Error locking post', e); }
  }, []);

  const voteComment = useCallback(async (commentId: string, direction: "up" | "down") => {
    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c;
      const prev_vote = c.userVote;
      if (prev_vote === direction) {
        return {
          ...c,
          upvotes: direction === "up" ? c.upvotes - 1 : c.upvotes,
          downvotes: direction === "down" ? c.downvotes - 1 : c.downvotes,
          userVote: undefined,
        };
      }
      return {
        ...c,
        upvotes: direction === "up" ? c.upvotes + 1 : prev_vote === "up" ? c.upvotes - 1 : c.upvotes,
        downvotes: direction === "down" ? c.downvotes + 1 : prev_vote === "down" ? c.downvotes - 1 : c.downvotes,
        userVote: direction,
      };
    }));
    try {
      await api.post(`/comments/${commentId}/vote`, { direction });
    } catch (e) { console.error('Error voting on comment', e); }
  }, []);

  const createCommunity = useCallback(async (communityData: any) => {
    try {
      const res = await api.post('/communities', communityData);
      setCommunities((prev) => [...prev, mapMongoToMock(res.data)]);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, []);

  const deleteCommunity = useCallback(async (communityId: string) => {
    try {
      await api.delete(`/communities/${communityId}`);
      setCommunities((prev) => prev.filter(c => c.id !== communityId));
    } catch (e) {
      console.error('Error deleting community', e);
      throw e;
    }
  }, []);

  const addComment = useCallback(async (postId: string, parentId: string | null, content: string) => {
    try {
      const res = await api.post('/comments', { postId, parentComment: parentId, content });
      const newComment = mapMongoToMock(res.data);
      setComments(prev => [newComment, ...prev]);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p));

      // If the backend returned a populated author object, merge it into users state
      // so CommentItem can resolve username/avatar immediately without a separate fetch
      const authorObj = res.data?.author;
      if (authorObj && typeof authorObj === 'object' && authorObj._id) {
        const authorNormalized = {
          ...authorObj,
          id: authorObj._id || authorObj.id,
        };
        setUsers(prev => {
          const exists = prev.some(u => u.id === authorNormalized.id);
          return exists ? prev : [...prev, authorNormalized];
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const removeComment = useCallback(async (commentId: string, postId: string) => {
    try {
      const res = await api.delete(`/comments/${commentId}`);
      const deletedIds: string[] = res.data?.deletedIds || [commentId];

      setComments((prev) => prev.filter(c => !deletedIds.includes(c.id)));
      setPosts((prev) => prev.map(p => 
          p.id === postId ? { ...p, commentCount: Math.max(0, p.commentCount - deletedIds.length) } : p
      ));
    } catch (e) { console.error('Error removing comment', e); }
  }, []);

  const banUser = useCallback(async (userId: string) => {
    try {
      await api.put(`/users/${userId}/ban`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: true } : u));
    } catch (e) { console.error('Error banning user', e); }
  }, []);

  const unbanUser = useCallback(async (userId: string) => {
    try {
      await api.put(`/users/${userId}/unban`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: false } : u));
    } catch (e) { console.error('Error unbanning user', e); }
  }, []);

  const resolveReport = useCallback(async (reportId: string) => {
    try {
      await api.put(`/reports/${reportId}/resolve`);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' as const } : r));
    } catch (e) { console.error('Error resolving report', e); }
  }, []);

  const dismissReport = useCallback(async (reportId: string) => {
    try {
      await api.put(`/reports/${reportId}/dismiss`);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'dismissed' as const } : r));
    } catch (e) { console.error('Error dismissing report', e); }
  }, []);

  const joinCommunity = useCallback(async (communityId: string) => {
    try {
      await api.post(`/communities/${communityId}/join`);
      setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, members: c.members + 1 } : c));
      checkAuth();
    } catch (e) { console.error('Error joining community', e); }
  }, [checkAuth]);

  const leaveCommunity = useCallback(async (communityId: string) => {
    try {
      await api.post(`/communities/${communityId}/leave`);
      setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, members: Math.max(0, c.members - 1) } : c));
      checkAuth();
    } catch (e) { console.error('Error leaving community', e); }
  }, [checkAuth]);

  const reportPost = useCallback(async (postId: string, reason: string, details: string) => {
    try {
      const res = await api.post('/reports', { targetType: 'post', targetId: postId, reason, details });
      setReports((prev) => [mapMongoToMock(res.data), ...prev]);
    } catch (e) { console.error('Error reporting post', e); }
  }, []);

  const reportComment = useCallback(async (commentId: string, reason: string, details: string) => {
    try {
      const res = await api.post('/reports', { targetType: 'comment', targetId: commentId, reason, details });
      setReports((prev) => [mapMongoToMock(res.data), ...prev]);
    } catch (e) { console.error('Error reporting comment', e); throw e; }
  }, []);

  const toggleSavePost = useCallback(async (postId: string) => {
    if (!currentUser) return;
    const isSaved = currentUser.savedPosts?.includes(postId);
    try {
      if (isSaved) {
        await api.post(`/users/unsave/${postId}`);
      } else {
        await api.post(`/users/save/${postId}`);
      }
      checkAuth();
    } catch (e) { console.error('Error saving post', e); }
  }, [currentUser, checkAuth]);

  // ───── Post View History (localStorage, max 30) ─────
  const HISTORY_KEY = 'forum_view_history';
  const [viewedPostIds, setViewedPostIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch { return []; }
  });

  const recordView = useCallback((postId: string) => {
    setViewedPostIds(prev => {
      const filtered = prev.filter(id => id !== postId);
      const next = [postId, ...filtered].slice(0, 30);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      users, communities, posts, comments, reports, isLoading,
      fetchPosts, fetchCommunities, fetchCommentsForPost,
      votePost, createPost, removePost, pinPost, lockPost,
      voteComment, addComment, removeComment,
      banUser, unbanUser,
      resolveReport, dismissReport,
      joinCommunity, leaveCommunity, createCommunity, deleteCommunity,
      reportPost, reportComment, toggleSavePost,
      viewedPostIds, recordView,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
