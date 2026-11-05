import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: String,
    resourceType: String,
    name: String,
    mimetype: String,
    size: Number,
    kind: { type: String, enum: ['image', 'document'], default: 'document' },
  },
  { timestamps: true, collection: 'media' }
);
export default mongoose.model('Media', schema);
