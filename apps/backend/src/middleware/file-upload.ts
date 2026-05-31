import multer, { FileFilterCallback } from 'multer';
import { ForbiddenError } from '@src/shared/errors';
import type { Request } from 'express';
import { MAX_IMAGE_SIZE, BLOCK_FILE_EXT } from '@src/shared/constants';

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
    fileSize: MAX_IMAGE_SIZE, // 10 MB
  },

  fileFilter(_req, file, cb) {
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp', 'video/mp4'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new ForbiddenError('Invalid file type: must be PNG, JPEG, WEBP or MP4'));
    }

    if (!file.originalname) {
      return cb(new ForbiddenError('File name is missing'));
    }

    const blockedExtensions = BLOCK_FILE_EXT;

    const lowerName = file.originalname.toLowerCase();

    if (blockedExtensions.some((ext) => lowerName.endsWith(ext))) {
      return cb(new ForbiddenError('Suspicious file detected'));
    }

    cb(null, true);
  },
});

type UploadOptions = {
  maxFileSizeMB?: number;
  allowedMimeTypes?: string[];
};

const DEFAULT_ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'video/mp4'];

/**
 * Create reusable multer upload middleware.
 *
 * Features:
 * - Memory storage
 * - Configurable file size limit
 * - Configurable MIME type validation
 * - Strong reusable validation
 * - Centralized configuration
 *
 * Example:
 * ```ts
 * export const imageUpload = createUploadMiddleware({
 *   maxFileSizeMB: 5,
 *   allowedMimeTypes: ['image/png', 'image/jpeg'],
 * });
 *
 * router.post(
 *   '/upload',
 *   imageUpload.single('file'),
 *   controller
 * );
 * ```
 */
export function createUploadMiddleware(options: UploadOptions = {}) {
  const { maxFileSizeMB = 5, allowedMimeTypes = DEFAULT_ALLOWED_MIME_TYPES } = options;

  return multer({
    storage: multer.memoryStorage(),

    limits: {
      fileSize: maxFileSizeMB * 1024 * 1024,
      files: 1,
      fieldSize: 2 * 1024 * 1024,
    },

    fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
      // Validate filename
      if (!file.originalname) {
        return cb(new ForbiddenError('File name is missing'));
      }

      // Validate mimetype
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(
          new ForbiddenError(`Invalid file type: allowed types are ${allowedMimeTypes.join(', ')}`),
        );
      }

      // Block suspicious filenames
      const blockedExtensions = BLOCK_FILE_EXT;

      const lowerName = file.originalname.toLowerCase();

      if (blockedExtensions.some((ext) => lowerName.endsWith(ext))) {
        return cb(new ForbiddenError('Suspicious file detected'));
      }

      cb(null, true);
    },
  });
}
