import { Router, Response } from 'express';
import Notification from '../models/Notification';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all notifications for current user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('sourceUser', 'username avatar')
      .populate('post', 'title community')
      .populate('community', 'name icon');
      
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

// Mark one as read
router.put('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { isRead: true },
      { new: true }
    );
    res.json(notif);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

// Mark all as read
router.put('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany(
      { user: req.userId, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

export default router;
