import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 100, default: 'Administrator' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true, collection: 'users' }
);
export default mongoose.model('User', schema);
