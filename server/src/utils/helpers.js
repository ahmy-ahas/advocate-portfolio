export const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const slugify = (s = '') =>
  s.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Removes Mongo operator keys ($...) and dotted keys from user input (NoSQL injection guard)
const strip = (o) => {
  if (Array.isArray(o)) return o.forEach(strip);
  if (o && typeof o === 'object') {
    for (const k of Object.keys(o)) {
      if (k.startsWith('$') || k.includes('.')) delete o[k];
      else strip(o[k]);
    }
  }
};
export const sanitize = (req, _res, next) => {
  strip(req.body);
  strip(req.query);
  strip(req.params);
  next();
};

export const httpError = (status, message) => Object.assign(new Error(message), { status });
