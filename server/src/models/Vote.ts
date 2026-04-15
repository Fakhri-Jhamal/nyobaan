import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
  user: mongoose.Types.ObjectId;
  targetType: 'post' | 'comment';
  targetId: mongoose.Types.ObjectId;
  value: 1 | -1;
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['post', 'comment'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    value: { type: Number, enum: [1, -1], required: true },
  },
  { timestamps: true }
);

// Ensure a user can only have one vote per target
VoteSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

export default mongoose.model<IVote>('Vote', VoteSchema);
