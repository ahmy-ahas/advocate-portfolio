import mongoose from 'mongoose';
import { fileSchema, str } from './shared.js';
const schema = new mongoose.Schema(
  {
    title: str(250, { required: [true, 'Case title is required'] }),
    caseNumber: str(120),
    court: str(200, { required: [true, 'Court is required'] }),
    caseType: str(100, { required: [true, 'Case type is required'] }),
    year: { type: Number, required: [true, 'Year is required'], min: 1900, max: 2100 },
    date: Date,
    parties: str(500),
    description: str(6000),
    advocateRole: str(1000),
    status: str(100),
    outcome: str(1500),
    judgmentSummary: str(6000),
    documents: [fileSchema],
    images: [fileSchema],
    tags: [str(60)],
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'cases' }
);
export default mongoose.model('Case', schema);
