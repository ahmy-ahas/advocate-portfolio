import multer from 'multer';
import path from 'path';
import { httpError } from '../utils/helpers.js';

export const ALLOWED = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, cb) {
    const exts = ALLOWED[file.mimetype];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!exts || !exts.includes(ext))
      return cb(httpError(400, 'Unsupported file type. Use JPG, PNG, WEBP, GIF, PDF, DOC or DOCX.'));
    cb(null, true);
  },
});

// Checks the real file signature so a renamed file cannot be uploaded as something else
export function matchesSignature(buf, mimetype) {
  const hex = (n) => buf.subarray(0, n).toString('hex');
  switch (mimetype) {
    case 'image/jpeg': return hex(3) === 'ffd8ff';
    case 'image/png': return hex(4) === '89504e47';
    case 'image/gif': return buf.subarray(0, 4).toString('ascii') === 'GIF8';
    case 'image/webp': return buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP';
    case 'application/pdf': return buf.subarray(0, 5).toString('ascii') === '%PDF-';
    case 'application/msword': return hex(4) === 'd0cf11e0';
    default: return hex(2) === '504b'; // docx (zip)
  }
}
