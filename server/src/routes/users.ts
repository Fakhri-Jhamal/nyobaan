import { Router, Request, Response } from 'express';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all users
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching users' });
  }
});

// Update own profile (bio, avatar, banner)
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { bio, avatar, banner } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if ((user as any).banner !== undefined || banner !== undefined) {
      (user as any).banner = banner || '';
    }

    await user.save();
    const updated = await User.findById(req.userId).select('-passwordHash');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error });
  }
});

// Save a post
router.post('/save/:postId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (!user.savedPosts.includes(req.params.postId as any)) {
      user.savedPosts.push(req.params.postId as any);
      await user.save();
    }
    res.json({ message: 'Post saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error saving post' });
  }
});

// Unsave a post
router.post('/unsave/:postId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.savedPosts = user.savedPosts.filter(id => id.toString() !== req.params.postId);
    await user.save();
    res.json({ message: 'Post unsaved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error unsaving post' });
  }
});

// Ban a user (Admin only)
router.put('/:id/ban', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const adminUser = await User.findById(req.userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    const userToBan = await User.findById(req.params.id);
    if (!userToBan) return res.status(404).json({ message: 'User not found' });
    
    userToBan.isBanned = true;
    await userToBan.save();
    
    res.json({ message: 'User banned successfully', user: userToBan });
  } catch (error) {
    res.status(500).json({ message: 'Server Error banning user', error });
  }
});

// Unban a user (Admin only)
router.put('/:id/unban', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const adminUser = await User.findById(req.userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    const userToUnban = await User.findById(req.params.id);
    if (!userToUnban) return res.status(404).json({ message: 'User not found' });
    
    userToUnban.isBanned = false;
    await userToUnban.save();
    
    res.json({ message: 'User unbanned successfully', user: userToUnban });
  } catch (error) {
    res.status(500).json({ message: 'Server Error unbanning user', error });
  }
});

export default router;
