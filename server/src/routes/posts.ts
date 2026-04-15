import { Router, Request, Response } from 'express';
import Post from '../models/Post';
import { authenticate, AuthRequest } from '../middleware/auth';
import Vote from '../models/Vote';
import User from '../models/User';
import mongoose from 'mongoose';

const router = Router();

// Get all posts (with optional community filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { communityId } = req.query;
    const filter = communityId ? { community: communityId as string } : {};
    
    const posts = await Post.find(filter)
      .populate('author', 'username avatar role')
      .populate('community', 'name icon')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching posts' });
  }
});

// Get single post
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar role')
      .populate('community', 'name icon');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching post' });
  }
});

// Create post (Protected)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    
    if (user.role !== 'admin' && !user.joinedCommunities.some(c => c.toString() === req.body.community)) {
      return res.status(403).json({ message: 'You must join this community to post.' });
    }

    const newPost = new Post({
      ...req.body,
      author: req.userId
    });
    const saved = await newPost.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating post', error });
  }
});
// Vote on a post
router.post('/:id/vote', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { direction } = req.body;
    if (!['up', 'down'].includes(direction)) return res.status(400).json({ message: 'Invalid direction' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const value = direction === 'up' ? 1 : -1;
    const existingVote = await Vote.findOne({ user: req.userId, targetType: 'post', targetId: post._id });

    if (existingVote) {
      if (existingVote.value === value) {
        // User clicked the same vote button, toggle it off
        await Vote.deleteOne({ _id: existingVote._id });
        if (value === 1) { post.upvotes -= 1; await User.findByIdAndUpdate(post.author, { $inc: { karma: -1 } }); }
        else { post.downvotes -= 1; await User.findByIdAndUpdate(post.author, { $inc: { karma: 1 } }); }
      } else {
        // User changed their vote
        existingVote.value = value;
        await existingVote.save();
        if (value === 1) { post.upvotes += 1; post.downvotes -= 1; await User.findByIdAndUpdate(post.author, { $inc: { karma: 2 } }); }
        else { post.downvotes += 1; post.upvotes -= 1; await User.findByIdAndUpdate(post.author, { $inc: { karma: -2 } }); }
      }
    } else {
      // New vote
      await Vote.create({ user: req.userId, targetType: 'post', targetId: post._id, value });
      if (value === 1) { post.upvotes += 1; await User.findByIdAndUpdate(post.author, { $inc: { karma: 1 } }); }
      else { post.downvotes += 1; await User.findByIdAndUpdate(post.author, { $inc: { karma: -1 } }); }
    }
    
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server Error voting on post', error });
  }
});

// Moderation: Lock post
router.put('/:id/lock', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role === 'user') return res.status(403).json({ message: 'Forbidden' });
    
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    post.isLocked = !post.isLocked;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server Error locking post', error });
  }
});

// Moderation: Pin post
router.put('/:id/pin', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role === 'user') return res.status(403).json({ message: 'Forbidden' });
    
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    post.isPinned = !post.isPinned;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server Error pinning post', error });
  }
});

// Moderation: Remove post
router.put('/:id/remove', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    
    const { reason } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Check local community mod status
    const community = await mongoose.model('Community').findById(post.community) as any;
    const isLocalMod = community?.moderators.some((modId: any) => modId.toString() === req.userId);
    
    if (user.role === 'user' && !isLocalMod && post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    await Post.deleteOne({ _id: req.params.id });
    res.json({ message: 'Post permanently removed', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server Error removing post', error });
  }
});

export default router;
