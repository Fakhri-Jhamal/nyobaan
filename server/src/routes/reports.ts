import { Router, Request, Response } from 'express';
import Report from '../models/Report';
import Comment from '../models/Comment';
import Post from '../models/Post';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all reports with target content populated (Admin/Mod only)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Use role from JWT token (already verified by middleware) — no extra DB query needed
    if (!req.userRole || req.userRole === 'user') {
      return res.status(403).json({ message: 'Forbidden: Admin or Moderator access required' });
    }

    const reports = await Report.find()
      .populate('reportedBy', 'username avatar')
      .sort({ createdAt: -1 });

    // Enrich each report with the target's content so the admin dashboard can display it
    const enriched = await Promise.all(
      reports.map(async (report) => {
        const base = report.toObject() as any;

        if (report.targetType === 'comment') {
          try {
            const comment = await Comment.findById(report.targetId)
              .populate('author', 'username avatar');
            if (comment) {
              base.targetContent = comment.content;
              base.targetAuthor = (comment.author as any)?.username || 'unknown';
              base.targetIsRemoved = comment.isRemoved;
            }
          } catch { /* ignore */ }
        }

        if (report.targetType === 'post') {
          try {
            const post = await Post.findById(report.targetId)
              .populate('author', 'username');
            if (post) {
              base.targetTitle = post.title;
              base.targetContent = post.content?.slice(0, 200);
              base.targetAuthor = (post.author as any)?.username || 'unknown';
              base.targetIsRemoved = post.isRemoved;
            }
          } catch { /* ignore */ }
        }

        if (report.targetType === 'user') {
          try {
            const targetUser = await User.findById(report.targetId).select('username avatar isBanned');
            if (targetUser) {
              base.targetUsername = targetUser.username;
              base.targetIsBanned = targetUser.isBanned;
            }
          } catch { /* ignore */ }
        }

        return base;
      })
    );

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching reports' });
  }
});

// Create report (any authenticated user)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { targetType, targetId, reason, details } = req.body;

    // Prevent duplicate pending reports from same user on same target
    const existing = await Report.findOne({
      targetType,
      targetId,
      reportedBy: req.userId,
      status: 'pending',
    });
    if (existing) {
      return res.status(409).json({ message: 'You have already reported this content.' });
    }

    const newReport = new Report({
      targetType,
      targetId,
      reason,
      details: details || '',
      reportedBy: req.userId,
    });
    const saved = await newReport.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating report', error });
  }
});

// Resolve a report (Admin/Mod)
router.put('/:id/resolve', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userRole || req.userRole === 'user') return res.status(403).json({ message: 'Forbidden' });

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.status = 'resolved';
    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server Error resolving report', error });
  }
});

// Dismiss a report (Admin/Mod)
router.put('/:id/dismiss', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userRole || req.userRole === 'user') return res.status(403).json({ message: 'Forbidden' });

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.status = 'dismissed';
    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server Error dismissing report', error });
  }
});

export default router;
