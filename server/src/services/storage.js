import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

export const UPLOAD_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);
if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}
export const storageMode = useCloudinary ? 'cloudinary' : 'local';

const EXT = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif',
  'application/pdf': '.pdf', 'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

export async function storeFile(file, req) {
  if (useCloudinary) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'advocate-site', resource_type: 'auto' },
        (err, r) => (err ? reject(err) : resolve({ url: r.secure_url, publicId: r.public_id, resourceType: r.resource_type }))
      );
      stream.end(file.buffer);
    });
  }
  const name = crypto.randomBytes(16).toString('hex') + EXT[file.mimetype];
  await fs.promises.writeFile(path.join(UPLOAD_DIR, name), file.buffer);
  const base = (process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  return { url: `${base}/uploads/${name}`, publicId: name, resourceType: 'local' };
}

export async function removeFile({ publicId, resourceType }) {
  if (!publicId) return;
  try {
    if (resourceType === 'local') await fs.promises.unlink(path.join(UPLOAD_DIR, path.basename(publicId)));
    else if (useCloudinary) await cloudinary.uploader.destroy(publicId, { resource_type: resourceType || 'image' });
  } catch (e) {
    console.warn('Could not remove file', publicId, e.message);
  }
}
