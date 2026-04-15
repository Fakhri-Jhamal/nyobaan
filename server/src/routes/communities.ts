import { Router, Request, Response } from 'express';
import Community from '../models/Community';
import { authenticate, AuthRequest } from '../middleware/auth';
import User from '../models/User';

const router = Router();

// Get all communities
router.get('/', async (req: Request, res: Response) => {
  try {
    const communities = await Community.find().populate('moderators', 'username avatar');
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching communities' });
  }
});

// Get single community by name
router.get('/:name', async (req: Request, res: Response) => {
  try {
    const community = await Community.findOne({ name: req.params.name }).populate('moderators', 'username avatar');
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    res.json(community);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching community' });
  }
});

// Create community (Protected)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;

    // Check for duplicate name explicitly for a clear error message
    if (name) {
      const existing = await Community.findOne({ name: name.toLowerCase() });
      if (existing) {
        return res.status(409).json({ message: `A community with the name "r/${name}" already exists.` });
      }
    }

    const newCommunity = new Community({
      ...req.body,
      name: name?.toLowerCase(),
      moderators: [req.userId]
    });
    const saved = await newCommunity.save();
    res.status(201).json(saved);
  } catch (error: any) {
    // Handle MongoDB duplicate key error (code 11000) as a fallback
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A community with that name already exists.' });
    }
    res.status(500).json({ message: 'Server Error creating community', error });
  }
});
// Join a community
router.post('/:id/join', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (!user.joinedCommunities.includes(req.params.id as any)) {
      user.joinedCommunities.push(req.params.id as any);
      await user.save();
      // Increment member count
      await Community.findByIdAndUpdate(req.params.id, { $inc: { members: 1 } });
    }
    res.json({ message: 'Joined community successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error joining community', error });
  }
});

// Leave a community
router.post('/:id/leave', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const wasMember = user.joinedCommunities.some(id => id.toString() === req.params.id);
    user.joinedCommunities = user.joinedCommunities.filter(id => id.toString() !== req.params.id);
    await user.save();
    if (wasMember) {
      await Community.findByIdAndUpdate(req.params.id, { $inc: { members: -1 } });
    }
    res.json({ message: 'Left community successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error leaving community', error });
  }
});

// Add a moderator (must be existing moderator or admin)
router.post('/:id/moderators', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const requestingUser = await User.findById(req.userId);
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found' });
    
    const isMod = community.moderators.some(m => m.toString() === req.userId);
    const isAdmin = requestingUser?.role === 'admin';
    if (!isMod && !isAdmin) return res.status(403).json({ message: 'Not a moderator of this community' });

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    
    if (!community.moderators.some(m => m.toString() === userId)) {
      community.moderators.push(userId as any);
      // Elevate user role to moderator if they are a regular user
      await User.findOneAndUpdate({ _id: userId, role: 'user' }, { role: 'moderator' });
      await community.save();
    }
    res.json({ message: 'Moderator added', community });
  } catch (error) {
    res.status(500).json({ message: 'Server Error adding moderator', error });
  }
});

// Remove a moderator (must be existing moderator or admin)
router.delete('/:id/moderators/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const requestingUser = await User.findById(req.userId);
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found' });

    const isMod = community.moderators.some(m => m.toString() === req.userId);
    const isAdmin = requestingUser?.role === 'admin';
    if (!isMod && !isAdmin) return res.status(403).json({ message: 'Not a moderator of this community' });

    community.moderators = community.moderators.filter(m => m.toString() !== req.params.userId);
    await community.save();
    res.json({ message: 'Moderator removed', community });
  } catch (error) {
    res.status(500).json({ message: 'Server Error removing moderator', error });
  }
});

// Update community rules
router.put('/:id/rules', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const requestingUser = await User.findById(req.userId);
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found' });

    const isMod = community.moderators.some(m => m.toString() === req.userId);
    const isAdmin = requestingUser?.role === 'admin';
    if (!isMod && !isAdmin) return res.status(403).json({ message: 'Not a moderator of this community' });

    community.rules = req.body.rules;
    await community.save();
    res.json({ message: 'Rules updated', community });
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating rules', error });
  }
});

// Delete a community (Admin only)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }

    const community = await Community.findByIdAndDelete(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.json({ message: 'Community deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting community', error });
  }
});

export default router;
