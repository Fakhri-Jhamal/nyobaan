import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId; // Who receives it
  type: 'reply_post' | 'reply_comment' | 'community_join';
  sourceUser: mongoose.Types.ObjectId; // Who triggered it
  post?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  community?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['reply_post', 'reply_comment', 'community_join'], required: true },
    sourceUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    community: { type: Schema.Types.ObjectId, ref: 'Community' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
