import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { asyncH, httpError } from '../utils/helpers.js';

const router = Router();
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
});

const check = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw httpError(400, errors.array()[0].msg);
};

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });

router.post(
  '/login',
  loginLimiter,
  body('email').isEmail().withMessage('Enter a valid email address').trim(),
  body('password').isString().isLength({ min: 1, max: 200 }).withMessage('Enter your password'),
  asyncH(async (req, res) => {
    check(req);
    const user = await User.findOne({ email: String(req.body.email).toLowerCase() });
    const ok = await bcrypt.compare(req.body.password, user ? user.passwordHash : DUMMY_HASH);
    if (!user || !ok) throw httpError(401, 'Incorrect email or password');
    res.json({ token: signToken(user), user: publicUser(user) });
  })
);

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

router.put(
  '/password',
  requireAuth,
  body('currentPassword').isString().notEmpty().withMessage('Enter your current password'),
  body('newPassword').isString().isLength({ min: 8, max: 100 }).withMessage('New password must be at least 8 characters'),
  asyncH(async (req, res) => {
    check(req);
    const user = await User.findById(req.user._id);
    if (!(await bcrypt.compare(req.body.currentPassword, user.passwordHash))) throw httpError(400, 'Current password is incorrect');
    user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    await user.save();
    res.json({ ok: true });
  })
);

router.put(
  '/account',
  requireAuth,
  body('email').isEmail().withMessage('Enter a valid email address').trim(),
  body('name').optional().trim().isLength({ max: 100 }),
  body('currentPassword').isString().notEmpty().withMessage('Enter your current password to confirm'),
  asyncH(async (req, res) => {
    check(req);
    const user = await User.findById(req.user._id);
    if (!(await bcrypt.compare(req.body.currentPassword, user.passwordHash))) throw httpError(400, 'Current password is incorrect');
    const email = String(req.body.email).toLowerCase();
    if (email !== user.email && (await User.exists({ email }))) throw httpError(409, 'That email is already in use');
    user.email = email;
    if (req.body.name !== undefined) user.name = req.body.name;
    await user.save();
    res.json({ user: publicUser(user) });
  })
);

export default router;
