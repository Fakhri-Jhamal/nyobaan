import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunity extends Document {
  name: string;
  description: string;
  icon: string;
  banner: string;
  members: number;
  onlineMembers: number;
  moderators: mongoose.Types.ObjectId[];
  rules: { title: string; description: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const CommunitySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String, default: '🌐' },
    banner: { type: String, default: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=1200&q=80' },
    members: { type: Number, default: 0 },
    onlineMembers: { type: Number, default: 0 },
    moderators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    rules: [{ title: String, description: String }],
  },
  { timestamps: true }
);

export default mongoose.model<ICommunity>('Community', CommunitySchema);
