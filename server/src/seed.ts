import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/User';
import Community from './models/Community';
import Post from './models/Post';
import Comment from './models/Comment';
import Report from './models/Report';

// Assume you copy the data arrays from mockData.ts here or import them if you configure ts-node to resolve it
// For this seed to run independently, we'll redefine the mock arrays here to keep it self-contained
import { users, communities, posts, comments, reports } from '../../src/app/data/mockData';

dotenv.config();

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected.');

    // Clear existing data
    await User.deleteMany({});
    await Community.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Report.deleteMany({});

    console.log('Existing data cleared.');

    // ID mapping maps string IDs from mock to Mongo ObjectIDs
    const idMap = new Map<string, mongoose.Types.ObjectId>();

    // Seed Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    for (const u of users) {
      const _id = new mongoose.Types.ObjectId();
      idMap.set(u.id, _id);
      
      const newUser = new User({
        _id,
        username: u.username,
        email: u.email,
        passwordHash,
        avatar: u.avatar,
        karma: u.karma,
        postKarma: u.postKarma,
        commentKarma: u.commentKarma,
        role: u.role,
        isBanned: u.isBanned,
        bio: u.bio,
        createdAt: new Date(u.createdAt)
      });
      await newUser.save();
    }
    console.log('Users seeded.');

    // Seed Communities
    for (const c of communities) {
      const _id = new mongoose.Types.ObjectId();
      idMap.set(c.id, _id);

      const moderators = c.moderators.map(m => idMap.get(m)).filter(Boolean);

      const newCommunity = new Community({
        _id,
        name: c.name,
        description: c.description,
        icon: c.icon,
        banner: c.banner,
        members: c.members,
        onlineMembers: c.onlineMembers,
        moderators,
        rules: c.rules,
        createdAt: new Date(c.createdAt)
      });
      await newCommunity.save();
    }
    console.log('Communities seeded.');

    // Link users to communities
    for (const u of users) {
      if (u.joinedCommunities.length > 0) {
        const joinedDocs = u.joinedCommunities.map(cId => idMap.get(cId)).filter(Boolean);
        await User.findByIdAndUpdate(idMap.get(u.id), { joinedCommunities: joinedDocs });
      }
    }

    // Seed Posts
    for (const p of posts) {
      const _id = new mongoose.Types.ObjectId();
      idMap.set(p.id, _id);

      const newPost = new Post({
        _id,
        title: p.title,
        content: p.content,
        imageUrl: p.imageUrl,
        linkUrl: p.linkUrl,
        community: idMap.get(p.community),
        author: idMap.get(p.authorId),
        upvotes: p.upvotes,
        downvotes: p.downvotes,
        commentCount: p.commentCount,
        awards: p.awards,
        flair: p.flair,
        flairColor: p.flairColor,
        isPinned: p.isPinned,
        isRemoved: p.isRemoved,
        removedReason: p.removedReason,
        isLocked: p.isLocked,
        type: p.type,
        createdAt: new Date(p.createdAt)
      });
      await newPost.save();
    }
    console.log('Posts seeded.');

    // Seed Comments
    for (const c of comments) {
      const _id = new mongoose.Types.ObjectId();
      idMap.set(c.id, _id);

      const newComment = new Comment({
        _id,
        post: idMap.get(c.postId),
        parentComment: c.parentId ? idMap.get(c.parentId) : undefined,
        author: idMap.get(c.authorId),
        content: c.content,
        upvotes: c.upvotes,
        downvotes: c.downvotes,
        isRemoved: c.isRemoved,
        createdAt: new Date(c.createdAt)
      });
      await newComment.save();
      
      // Need to seed replies since they are nested in mockData
      if (c.replies && c.replies.length > 0) {
         // for simplicity, flat-map them or handle 1 level.
         // In mockData they are nested. Let's recursively process them.
         const processReplies = async (replies: any[], parentId: mongoose.Types.ObjectId) => {
             for (const rep of replies) {
                 const repId = new mongoose.Types.ObjectId();
                 idMap.set(rep.id, repId);
                 const nr = new Comment({
                    _id: repId,
                    post: idMap.get(rep.postId),
                    parentComment: parentId,
                    author: idMap.get(rep.authorId),
                    content: rep.content,
                    upvotes: rep.upvotes,
                    downvotes: rep.downvotes,
                    isRemoved: rep.isRemoved,
                    createdAt: new Date(rep.createdAt)
                 });
                 await nr.save();
                 if (rep.replies && rep.replies.length > 0) {
                     await processReplies(rep.replies, repId);
                 }
             }
         }
         await processReplies(c.replies, _id);
      }
    }
    console.log('Comments seeded.');

    // Seed Reports
    for (const r of reports) {
      const newReport = new Report({
        targetType: r.type,
        targetId: idMap.get(r.targetId) || new mongoose.Types.ObjectId(), // Fallback
        reportedBy: idMap.get(r.reportedBy),
        reason: r.reason,
        details: r.details,
        status: r.status,
        createdAt: new Date(r.createdAt)
      });
      await newReport.save();
    }
    console.log('Reports seeded.');

    console.log('Database seeding successfully completed!');
    process.exit(0);

  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
