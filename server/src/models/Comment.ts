import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  post: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  upvotes: number;
  downvotes: number;
  isRemoved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    isRemoved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IComment>('Comment', CommentSchema);
