import { Router } from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import Profile from '../models/Profile.js';
import Message from '../models/Message.js';
import Media from '../models/Media.js';
import Case from '../models/Case.js';
import LandmarkJudgment from '../models/LandmarkJudgment.js';
import Achievement from '../models/Achievement.js';
import LegalUpdate from '../models/LegalUpdate.js';
import PracticeArea from '../models/PracticeArea.js';
import { requireAuth } from '../middleware/auth.js';
import { upload, matchesSignature } from '../middleware/upload.js';
import { storeFile, removeFile, storageMode } from '../services/storage.js';
import { asyncH, httpError } from '../utils/helpers.js';

/* ---------- public ---------- */
export const publicSite = Router();

publicSite.get('/profile', asyncH(async (_req, res) => {
  const profile = await Profile.findOne().lean();
  if (!profile) throw httpError(404, 'Profile has not been set up yet. Run the seed script.');
  res.json(profile);
}));

const messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many messages sent. Please try again later or call the office.' },
});

publicSite.post(
  '/messages',
  messageLimiter,
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Please enter your name'),
  body('email').optional({ values: 'falsy' }).trim().isEmail().withMessage('Enter a valid email address'),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 40 }).withMessage('Phone number is too long'),
  body('subject').optional({ values: 'falsy' }).trim().isLength({ max: 150 }).withMessage('Subject is too long'),
  body('message').trim().isLength({ min: 10, max: 3000 }).withMessage('Message must be between 10 and 3000 characters'),
  body().custom((v) => (v.email || v.phone ? true : Promise.reject(new Error('Provide an email address or phone number so the office can reply')))),
  asyncH(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw httpError(400, errors.array()[0].msg);
    if (req.body.website) return res.status(201).json({ ok: true }); // honeypot: bots fill this hidden field
    const { name, email, phone, subject, message } = req.body;
    await Message.create({ name, email, phone, subject, message });
    res.status(201).json({ ok: true });
  })
);

/* ---------- admin (requireAuth is applied by the caller) ---------- */
export const adminSite = Router();

adminSite.get('/stats', asyncH(async (_req, res) => {
  const count = (M, f = {}) => M.countDocuments(f);
  const [cases, casesPub, judgments, judgmentsPub, achievements, updates, areas, messages, unread, recent] = await Promise.all([
    count(Case), count(Case, { published: true }), count(LandmarkJudgment), count(LandmarkJudgment, { published: true }),
    count(Achievement), count(LegalUpdate), count(PracticeArea), count(Message), count(Message, { read: false }),
    Message.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  res.json({ cases, casesPub, judgments, judgmentsPub, achievements, updates, areas, messages, unread, recent, storageMode });
}));

adminSite.get('/profile', asyncH(async (_req, res) => res.json((await Profile.findOne().lean()) || {})));
adminSite.put('/profile', asyncH(async (req, res) => {
  const body = { ...req.body };
  ['_id', '__v', 'createdAt', 'updatedAt'].forEach((k) => delete body[k]);
  const existing = await Profile.findOne();
  const doc = existing
    ? await Profile.findByIdAndUpdate(existing._id, body, { new: true, runValidators: true })
    : await Profile.create(body);
  res.json(doc);
}));

/* messages */
adminSite.get('/messages', asyncH(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 15));
  const filter = req.query.unread === 'true' ? { read: false } : {};
  const [items, total] = await Promise.all([
    Message.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Message.countDocuments(filter),
  ]);
  res.json({ items, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) });
}));
adminSite.patch('/messages/:id', asyncH(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, 'Not found');
  const doc = await Message.findByIdAndUpdate(req.params.id, { read: !!req.body.read }, { new: true });
  if (!doc) throw httpError(404, 'Not found');
  res.json(doc);
}));
adminSite.delete('/messages/:id', asyncH(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, 'Not found');
  await Message.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

/* uploads + media library */
adminSite.post('/upload', (req, res, next) => upload.single('file')(req, res, next), asyncH(async (req, res) => {
  if (!req.file) throw httpError(400, 'No file received');
  if (!matchesSignature(req.file.buffer, req.file.mimetype)) throw httpError(400, 'The file content does not match its type');
  const stored = await storeFile(req.file, req);
  const media = await Media.create({
    ...stored,
    name: req.file.originalname.slice(0, 300),
    mimetype: req.file.mimetype,
    size: req.file.size,
    kind: req.file.mimetype.startsWith('image/') ? 'image' : 'document',
  });
  res.status(201).json(media);
}));

adminSite.get('/media', asyncH(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 24));
  const filter = ['image', 'document'].includes(req.query.kind) ? { kind: req.query.kind } : {};
  const [items, total] = await Promise.all([
    Media.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Media.countDocuments(filter),
  ]);
  res.json({ items, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) });
}));
adminSite.delete('/media/:id', asyncH(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, 'Not found');
  const media = await Media.findByIdAndDelete(req.params.id);
  if (!media) throw httpError(404, 'Not found');
  await removeFile(media);
  res.json({ ok: true });
}));

export { requireAuth };
