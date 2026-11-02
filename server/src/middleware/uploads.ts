import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Only these types are allowed, and each maps to a file extension we choose
const ALLOWED: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, crypto.randomUUID() + ALLOWED[file.mimetype]),
});

export const uploadImages = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5 MB each, 10 files max
  fileFilter: (_req, file, cb) => {
    if (ALLOWED[file.mimetype]) cb(null, true);
    else cb(new Error('Only JPG, PNG or WEBP images are allowed'));
  },
});