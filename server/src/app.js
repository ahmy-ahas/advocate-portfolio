import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { UPLOAD_DIR } from './services/storage.js';
import { sanitize } from './utils/helpers.js';
import { errorHandler, notFound } from './middleware/error.js';
import { requireAuth } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import { publicSite, adminSite } from './routes/site.js';
import { adminResourceRouter, publicRouter } from './routes/resources.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  const allowed = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
  app.use(cors({
    origin(origin, cb) {
      if (!origin || allowed.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));
  app.use(express.json({ limit: '1mb' }));
  app.use(sanitize);

  app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', index: false }));
  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api', publicSite);
  app.use('/api', publicRouter());
  app.use('/api/admin', requireAuth, adminSite, adminResourceRouter());

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
