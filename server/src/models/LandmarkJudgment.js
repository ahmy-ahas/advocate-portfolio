import mongoose from 'mongoose';
import { fileSchema, str } from './shared.js';
const schema = new mongoose.Schema(
  {
    title: str(250, { required: [true, 'Case title is required'] }),
    caseNumber: str(120),
    court: str(200, { required: [true, 'Court is required'] }),
    date: Date,
    year: { type: Number, required: [true, 'Year is required'], min: 1900, max: 2100 },
    category: str(100),
    parties: str(500),
    summary: str(6000),
    importantPoint: str(3000),
    advocateRole: str(1000),
    pdf: fileSchema,
    relatedDocuments: [fileSchema],
    tags: [str(60)],
    published: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'landmarkJudgments' }
);
export default mongoose.model('LandmarkJudgment', schema);
