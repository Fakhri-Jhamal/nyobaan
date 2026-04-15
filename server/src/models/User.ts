import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  avatar: string;
  karma: number;
  postKarma: number;
  commentKarma: number;
  role: 'user' | 'moderator' | 'admin';
  isBanned: boolean;
  bio: string;
  banner: string;
  joinedCommunities: mongoose.Types.ObjectId[];
  savedPosts: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' },
    karma: { type: Number, default: 0 },
    postKarma: { type: Number, default: 0 },
    commentKarma: { type: Number, default: 0 },
    role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
    isBanned: { type: Boolean, default: false },
    bio: { type: String, default: '' },
    banner: { type: String, default: '' },
    joinedCommunities: [{ type: Schema.Types.ObjectId, ref: 'Community' }],
    savedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
