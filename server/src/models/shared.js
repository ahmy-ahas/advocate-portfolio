import mongoose from 'mongoose';
import { slugify } from '../utils/helpers.js';

export const fileSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, maxlength: 2000 },
    publicId: { type: String, maxlength: 500 },
    resourceType: { type: String, maxlength: 20 },
    name: { type: String, maxlength: 300 },
    mimetype: { type: String, maxlength: 100 },
    size: Number,
  },
  { _id: false }
);

export const str = (max, extra = {}) => ({ type: String, trim: true, maxlength: max, ...extra });

// Generates a unique slug from `title` when a document is first created
export function slugPlugin(schema) {
  schema.add({ slug: { type: String, index: true } });
  schema.pre('validate', async function (next) {
    if (!this.isNew || this.slug) return next();
    const base = slugify(this.title) || 'item';
    let slug = base;
    let n = 1;
    while (await this.constructor.exists({ slug })) slug = `${base}-${++n}`;
    this.slug = slug;
    next();
  });
}
