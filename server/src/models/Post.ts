import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  community: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  awards: string[];
  flair?: string;
  flairColor?: string;
  isPinned: boolean;
  isRemoved: boolean;
  removedReason?: string;
  isLocked: boolean;
  isSpoiler: boolean;
  type: 'text' | 'image' | 'link';
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
    linkUrl: { type: String },
    community: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    awards: [{ type: String }],
    flair: { type: String },
    flairColor: { type: String },
    isPinned: { type: Boolean, default: false },
    isRemoved: { type: Boolean, default: false },
    removedReason: { type: String },
    isLocked: { type: Boolean, default: false },
    isSpoiler: { type: Boolean, default: false },
    type: { type: String, enum: ['text', 'image', 'link'], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPost>('Post', PostSchema);
