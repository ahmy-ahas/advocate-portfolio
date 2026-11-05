import mongoose from 'mongoose';
import { str } from './shared.js';
const schema = new mongoose.Schema(
  {
    name: str(100, { required: true }),
    email: str(200),
    phone: str(40),
    subject: str(150),
    message: str(3000, { required: true }),
    read: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'messages' }
);
export default mongoose.model('Message', schema);
