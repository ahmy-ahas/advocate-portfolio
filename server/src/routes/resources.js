import { Router } from 'express';
import mongoose from 'mongoose';
import PracticeArea from '../models/PracticeArea.js';
import Case from '../models/Case.js';
import LandmarkJudgment from '../models/LandmarkJudgment.js';
import Achievement from '../models/Achievement.js';
import LegalUpdate from '../models/LegalUpdate.js';
import { asyncH, escapeRegex, httpError } from '../utils/helpers.js';

const dateSorts = (dir) => ({ year: dir, date: dir, createdAt: dir });

// One config per content type. Public + admin CRUD routes are generated from this.
export const resources = {
  'practice-areas': {
    Model: PracticeArea,
    search: ['title', 'description', 'items'],
    sorts: { order: { order: 1, createdAt: 1 }, newest: { createdAt: -1 }, title: { title: 1 } },
    defaultSort: 'order',
    reorder: true,
  },
  cases: {
    Model: Case,
    search: ['title', 'caseNumber', 'court', 'caseType', 'parties', 'description', 'tags'],
    filters: ['caseType', 'year', 'court', 'status', 'featured', 'tags'],
    numbers: ['year'],
    booleans: ['featured'],
    meta: ['year', 'court', 'caseType'],
    sorts: {
      newest: dateSorts(-1), oldest: dateSorts(1), featured: { featured: -1, ...dateSorts(-1) },
      court: { court: 1, year: -1 }, title: { title: 1 }, recent: { createdAt: -1 },
    },
    defaultSort: 'newest',
    listSelect: '-judgmentSummary',
  },
  'landmark-judgments': {
    Model: LandmarkJudgment,
    search: ['title', 'caseNumber', 'court', 'category', 'parties', 'summary', 'importantPoint', 'tags'],
    filters: ['year', 'court', 'category', 'tags'],
    numbers: ['year'],
    meta: ['year', 'court', 'category'],
    sorts: {
      newest: dateSorts(-1), oldest: dateSorts(1), court: { court: 1, year: -1 },
      category: { category: 1, year: -1 }, year: { year: -1, createdAt: -1 }, recent: { createdAt: -1 },
    },
    defaultSort: 'newest',
  },
  achievements: {
    Model: Achievement,
    search: ['title', 'description', 'category', 'year'],
    filters: ['category'],
    meta: ['category'],
    sorts: { newest: { year: -1, createdAt: -1 }, oldest: { year: 1, createdAt: 1 }, recent: { createdAt: -1 } },
    defaultSort: 'newest',
  },
  'legal-updates': {
    Model: LegalUpdate,
    search: ['title', 'excerpt', 'content', 'category', 'tags'],
    filters: ['category', 'tags'],
    meta: ['category'],
    sorts: { newest: { publishedAt: -1, createdAt: -1 }, oldest: { publishedAt: 1, createdAt: 1 }, recent: { createdAt: -1 } },
    defaultSort: 'newest',
    listSelect: '-content',
    bySlug: true,
    beforeWrite(body, existing) {
      if (body.published === true && !body.publishedAt && !existing?.publishedAt) body.publishedAt = new Date();
    },
  },
};

const PROTECTED = ['_id', '__v', 'createdAt', 'updatedAt', 'slug'];
const cleanBody = (b) => {
  const body = { ...(b || {}) };
  PROTECTED.forEach((k) => delete body[k]);
  return body;
};

function buildFilter(cfg, q, admin) {
  const f = {};
  if (!admin) f.published = true;
  else if (q.published === 'true' || q.published === 'false') f.published = q.published === 'true';
  for (const key of cfg.filters || []) {
    const raw = q[key === 'tags' ? 'tag' : key];
    if (raw === undefined || raw === '') continue;
    const v = String(raw);
    if (cfg.numbers?.includes(key)) {
      const n = Number(v);
      if (!Number.isNaN(n)) f[key] = n;
    } else if (cfg.booleans?.includes(key)) f[key] = v === 'true';
    else f[key] = v;
  }
  if (q.q && String(q.q).trim()) {
    const rx = new RegExp(escapeRegex(String(q.q).trim().slice(0, 100)), 'i');
    f.$or = cfg.search.map((field) => ({ [field]: rx }));
  }
  return f;
}

const listHandler = (cfg, admin) =>
  asyncH(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));
    const key = String(req.query.sort || '');
    const sort = Object.hasOwn(cfg.sorts, key) ? cfg.sorts[key] : cfg.sorts[cfg.defaultSort];
    const filter = buildFilter(cfg, req.query, admin);
    let query = cfg.Model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
    if (!admin && cfg.listSelect) query = query.select(cfg.listSelect);
    const [items, total] = await Promise.all([query.lean(), cfg.Model.countDocuments(filter)]);
    res.json({ items, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) });
  });

const metaHandler = (cfg) =>
  asyncH(async (_req, res) => {
    const out = {};
    for (const field of cfg.meta || []) {
      const vals = await cfg.Model.distinct(field, { published: true });
      out[field] = vals.filter((v) => v !== null && v !== '' && v !== undefined).sort((a, b) => (typeof a === 'number' ? b - a : String(a).localeCompare(b)));
    }
    res.json(out);
  });

const findOne = async (cfg, idOrSlug, admin) => {
  const filter = admin ? {} : { published: true };
  if (mongoose.isValidObjectId(idOrSlug)) filter._id = idOrSlug;
  else if (cfg.bySlug || cfg.Model.schema.path('slug')) filter.slug = String(idOrSlug);
  else return null;
  return cfg.Model.findOne(filter).lean();
};

export function publicRouter() {
  const r = Router();
  for (const [name, cfg] of Object.entries(resources)) {
    if (cfg.meta) r.get(`/${name}/meta`, metaHandler(cfg));
    r.get(`/${name}`, listHandler(cfg, false));
    r.get(`/${name}/:id`, asyncH(async (req, res) => {
      const doc = await findOne(cfg, req.params.id, false);
      if (!doc) throw httpError(404, 'Not found');
      res.json(doc);
    }));
  }
  return r;
}

export function adminResourceRouter() {
  const r = Router();
  for (const [name, cfg] of Object.entries(resources)) {
    r.get(`/${name}`, listHandler(cfg, true));

    if (cfg.reorder) {
      r.post(`/${name}/reorder`, asyncH(async (req, res) => {
        const ids = Array.isArray(req.body.ids) ? req.body.ids.filter((i) => mongoose.isValidObjectId(i)) : [];
        await Promise.all(ids.map((id, i) => cfg.Model.updateOne({ _id: id }, { order: i + 1 })));
        res.json({ ok: true });
      }));
    }

    r.get(`/${name}/:id`, asyncH(async (req, res) => {
      const doc = await findOne(cfg, req.params.id, true);
      if (!doc) throw httpError(404, 'Not found');
      res.json(doc);
    }));

    r.post(`/${name}`, asyncH(async (req, res) => {
      const body = cleanBody(req.body);
      cfg.beforeWrite?.(body, null);
      if (cfg.reorder && body.order == null) body.order = (await cfg.Model.countDocuments()) + 1;
      res.status(201).json(await cfg.Model.create(body));
    }));

    const update = asyncH(async (req, res) => {
      if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, 'Not found');
      const existing = await cfg.Model.findById(req.params.id).lean();
      if (!existing) throw httpError(404, 'Not found');
      const body = cleanBody(req.body);
      cfg.beforeWrite?.(body, existing);
      const doc = await cfg.Model.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
      res.json(doc);
    });
    r.put(`/${name}/:id`, update);
    r.patch(`/${name}/:id`, update);

    r.delete(`/${name}/:id`, asyncH(async (req, res) => {
      if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, 'Not found');
      const doc = await cfg.Model.findByIdAndDelete(req.params.id);
      if (!doc) throw httpError(404, 'Not found');
      res.json({ ok: true });
    }));
  }
  return r;
}
