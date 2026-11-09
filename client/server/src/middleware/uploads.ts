import multer from 'multer';
import crypto from 'crypto';
import { pool } from '../config/db';

// Only these types are allowed, and each maps to a file extension we choose
const ALLOWED: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5 MB each, 10 files max
  fileFilter: (_req, file, cb) => {
    if (ALLOWED[file.mimetype]) cb(null, true);
    else cb(new Error('Only JPG, PNG or WEBP images are allowed'));
  },
});

export async function saveUploadedFiles(files: Express.Multer.File[]): Promise<string[]> {
  const urls: string[] = [];
  try {
    for (const file of files) {
      const id = crypto.randomUUID();
      await pool.query(
        'INSERT INTO uploaded_images (id, content_type, data) VALUES ($1, $2, $3)',
        [id, file.mimetype, file.buffer]
      );
      file.filename = id;
      urls.push(`/uploads/${id}`);
    }
    return urls;
  } catch (error) {
    await removeUploadedFiles(urls);
    throw error;
  }
}

export async function removeUploadedFiles(urls: string[]): Promise<void> {
  const ids = urls
    .filter((url) => url.startsWith('/uploads/'))
    .map((url) => url.slice('/uploads/'.length))
    .filter((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
  if (ids.length) await pool.query('DELETE FROM uploaded_images WHERE id = ANY($1::uuid[])', [ids]);
}
