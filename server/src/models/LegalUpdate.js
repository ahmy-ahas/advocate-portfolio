import mongoose from 'mongoose';
import { fileSchema, slugPlugin, str } from './shared.js';
const schema = new mongoose.Schema(
  {
    title: str(250, { required: [true, 'Title is required'] }),
    excerpt: str(500),
    content: str(40000, { required: [true, 'Content is required'] }),
    featuredImage: fileSchema,
    category: str(100),
    tags: [str(60)],
    publishedAt: Date,
    published: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'legalUpdates' }
);
schema.plugin(slugPlugin);
export default mongoose.model('LegalUpdate', schema);
