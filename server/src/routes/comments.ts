import { Router, Request, Response } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';
import { authenticate, AuthRequest } from '../middleware/auth';
import Vote from '../models/Vote';
import User from '../models/User';
import Notification from '../models/Notification';

const router = Router();

// Get all comments (For admin dashboards mostly)
router.get('/', async (req: Request, res: Response) => {
  try {
    const allComments = await Comment.find().sort({ createdAt: -1 });
    res.json(allComments);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching all comments' });
  }
});

// Get comments for a post
router.get('/post/:postId', async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username avatar role')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching comments' });
  }
});

// Create comment (Protected)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { postId, content, parentComment } = req.body;
    
    const newComment = new Comment({
      post: postId,
      content,
      parentComment,
      author: req.userId
    });
    
    const saved = await newComment.save();
    
    // Increment post comment count
    const post = await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
    
    // Trigger notification
    if (post) {
      if (parentComment) {
        // Reply to a comment
        const parentDoc = await Comment.findById(parentComment);
        if (parentDoc && parentDoc.author.toString() !== req.userId!.toString()) {
          await Notification.create({
            user: parentDoc.author,
            type: 'reply_comment',
            sourceUser: req.userId,
            post: post._id,
            comment: saved._id,
            community: post.community,
          });
        }
      } else {
        // Top-level reply to post
        if (post.author.toString() !== req.userId!.toString()) {
          await Notification.create({
            user: post.author,
            type: 'reply_post',
            sourceUser: req.userId,
            post: post._id,
            comment: saved._id,
            community: post.community,
          });
        }
      }
    }
    
    // Return fully populated comment so frontend can render it immediately
    const populated = await Comment.findById(saved._id).populate('author', 'username avatar role');
    
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating comment', error });
  }
});
// Vote on a comment
router.post('/:id/vote', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { direction } = req.body;
    if (!['up', 'down'].includes(direction)) return res.status(400).json({ message: 'Invalid direction' });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const value = direction === 'up' ? 1 : -1;
    const existingVote = await Vote.findOne({ user: req.userId, targetType: 'comment', targetId: comment._id });

    if (existingVote) {
      if (existingVote.value === value) {
        await Vote.deleteOne({ _id: existingVote._id });
        if (value === 1) { comment.upvotes -= 1; await User.findByIdAndUpdate(comment.author, { $inc: { karma: -1 } }); }
        else { comment.downvotes -= 1; await User.findByIdAndUpdate(comment.author, { $inc: { karma: 1 } }); }
      } else {
        existingVote.value = value;
        await existingVote.save();
        if (value === 1) { comment.upvotes += 1; comment.downvotes -= 1; await User.findByIdAndUpdate(comment.author, { $inc: { karma: 2 } }); }
        else { comment.downvotes += 1; comment.upvotes -= 1; await User.findByIdAndUpdate(comment.author, { $inc: { karma: -2 } }); }
      }
    } else {
      await Vote.create({ user: req.userId, targetType: 'comment', targetId: comment._id, value });
      if (value === 1) { comment.upvotes += 1; await User.findByIdAndUpdate(comment.author, { $inc: { karma: 1 } }); }
      else { comment.downvotes += 1; await User.findByIdAndUpdate(comment.author, { $inc: { karma: -1 } }); }
    }
    
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error voting on comment', error });
  }
});

// Remove a comment
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Allow author or moderator to delete
    const user = await User.findById(req.userId);
    if (comment.author.toString() !== req.userId && (!user || user.role === 'user')) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // Recursively find all descendants
    let descendants: any[] = [];
    async function findDescendants(parentId: any) {
      const children = await Comment.find({ parentComment: parentId });
      for (const child of children) {
        descendants.push(child._id);
        await findDescendants(child._id);
      }
    }
    await findDescendants(comment._id);

    // Hard delete the comment and all its descendants
    const idsToDelete = [comment._id, ...descendants];
    await Comment.deleteMany({ _id: { $in: idsToDelete } });
    
    // Decrement post comment count
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -idsToDelete.length } });
    
    res.json({ message: 'Comment and replies removed', deletedIds: idsToDelete });
  } catch (error) {
    res.status(500).json({ message: 'Server Error removing comment', error });
  }
});

export default router;
