import mongoose from 'mongoose';
import { slugPlugin, str } from './shared.js';
const schema = new mongoose.Schema(
  {
    title: str(150, { required: [true, 'Title is required'] }),
    icon: str(30, { default: 'scale' }),
    description: str(1000),
    items: [str(150)],
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'practiceAreas' }
);
schema.plugin(slugPlugin);
export default mongoose.model('PracticeArea', schema);
