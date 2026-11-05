import mongoose from 'mongoose';
import { fileSchema, str } from './shared.js';
const schema = new mongoose.Schema(
  {
    title: str(250, { required: [true, 'Title is required'] }),
    description: str(3000),
    year: str(20),
    category: str(100),
    image: fileSchema,
    certificate: fileSchema,
    published: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'achievements' }
);
export default mongoose.model('Achievement', schema);
