import fs from 'fs/promises';
import path from 'path';
import { UPLOAD_DIR } from '../middleware/uploads';

// Deletes uploaded photos from disk. Errors are ignored: a missing file is not a problem.
export async function removeUploadedFiles(urls: string[]) {
  await Promise.all(
    urls
      .filter((url) => url.startsWith('/uploads/'))
      // basename keeps only the file name, so a path like "../../app.ts" can never escape the folder
      .map((url) => fs.unlink(path.join(UPLOAD_DIR, path.basename(url))).catch(() => {}))
  );
}