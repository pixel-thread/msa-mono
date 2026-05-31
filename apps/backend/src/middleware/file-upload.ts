import multer from 'multer';
import { ForbiddenError } from '@src/shared/errors';

/**
 * Multer middleware for handling file uploads.
 *
 * Features:
 * - Stores uploaded files in memory
 * - Limits file size to 10 MB
 * - Allows PNG, JPEG, WEBP images and MP4 videos
 *
 * Usage:
 * ```ts
 * router.post(
 *   '/upload',
 *   upload.single('file'),
 *   controller
 * );
 * ```
 */
export const fileUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024, // 10 MB
  },

  fileFilter(_req, file, cb) {
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp', 'video/mp4'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new ForbiddenError('Invalid file type: must be PNG, JPEG, WEBP or MP4'));
    }

    cb(null, true);
  },
});
