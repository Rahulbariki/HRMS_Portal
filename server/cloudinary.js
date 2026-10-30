import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isConfigured = Boolean(
  process.env.CLOUDINARY_URL || 
  (
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_KEY.trim() !== '' && 
    process.env.CLOUDINARY_API_SECRET
  )
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

const uploadsRoot = path.resolve(__dirname, 'uploads');

const ALLOWED_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'
]);

const MIME_TO_EXTENSION = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/csv': 'csv',
  'text/plain': 'txt'
};

/**
 * Persists a file buffer locally on the server filesystem within server/uploads
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Upload options
 * @returns {Object} Standardized storage metadata
 */
export const saveBufferLocally = (buffer, options = {}) => {
  // Validate and sanitize folder to prevent directory traversal
  const sanitizedFolder = (options.folder || 'general')
    .replace(/^intelliattend\/?/, '')
    .replace(/[^a-zA-Z0-9_\-\/]/g, '')
    .replace(/\.\./g, '')
    .replace(/^\/+|\/+$/g, '') || 'general';

  const uploadDir = path.resolve(uploadsRoot, sanitizedFolder);
  if (!uploadDir.startsWith(uploadsRoot)) {
    throw new Error('Invalid folder destination outside uploads root');
  }

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Derive extension strictly from allowlist / MIME type mapping
  let ext = null;
  if (options.mimetype) {
    const normalizedMime = options.mimetype.toLowerCase().trim();
    ext = MIME_TO_EXTENSION[normalizedMime];
    if (!ext) {
      throw new Error(`Unsupported MIME type: ${options.mimetype}`);
    }
  } else if (options.format) {
    let fmt = options.format.toLowerCase().replace('.', '').trim();
    if (fmt === 'jpeg') fmt = 'jpg';
    if (!ALLOWED_EXTENSIONS.has(fmt)) {
      throw new Error(`Unsupported file format: ${options.format}`);
    }
    ext = fmt;
  } else {
    const candidate = path.extname(options.public_id || '').toLowerCase().replace('.', '');
    if (candidate && ALLOWED_EXTENSIONS.has(candidate === 'jpeg' ? 'jpg' : candidate)) {
      ext = candidate === 'jpeg' ? 'jpg' : candidate;
    } else {
      ext = 'png';
    }
  }

  // Sanitize publicId to prevent path traversal
  const rawBaseName = path.basename(options.public_id || `upload_${Date.now()}`).replace(/[^a-zA-Z0-9_\-]/g, '_');
  const baseName = rawBaseName || `upload_${Date.now()}`;
  const filename = baseName.endsWith(`.${ext}`) ? baseName : `${baseName}.${ext}`;
  const filePath = path.resolve(uploadDir, filename);

  if (!filePath.startsWith(uploadsRoot)) {
    throw new Error('Path traversal detected outside uploads root');
  }

  fs.writeFileSync(filePath, buffer);

  const publicUrl = `/api/uploads/${sanitizedFolder}/${filename}`;
  return {
    secure_url: publicUrl,
    url: publicUrl,
    public_id: baseName,
    format: ext,
    bytes: buffer.length,
    created_at: new Date().toISOString(),
    storage: 'local'
  };
};

/**
 * Upload a memory buffer to Cloudinary with reliable fallback to local storage
 * @param {Buffer} buffer - File buffer from multer
 * @param {Object} options - Cloudinary upload options (folder, resource_type, etc.)
 * @returns {Promise<Object>} Upload result object
 */
export const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isConfigured) {
      console.log('Cloudinary credentials not fully configured; saving upload locally to disk.');
      try {
        const localResult = saveBufferLocally(buffer, options);
        return resolve(localResult);
      } catch (saveErr) {
        return reject(saveErr);
      }
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'intelliattend/documents',
        resource_type: options.resource_type || 'auto',
        ...options
      },
      (error, result) => {
        if (error) {
          console.warn('Cloudinary upload stream encountered an issue; falling back to persistent local storage:', error.message || error);
          try {
            const localResult = saveBufferLocally(buffer, options);
            return resolve(localResult);
          } catch (localErr) {
            return reject(localErr);
          }
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete a file by public ID from Cloudinary or local disk
 * @param {string} publicId
 * @param {string} resourceType
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return { result: 'ok' };

  // Distinguish local storage paths from Cloudinary IDs before choosing a deletion path
  const isLocalPath = 
    typeof publicId === 'string' && (
      publicId.startsWith('/api/uploads/') ||
      publicId.startsWith('/uploads/') ||
      publicId.startsWith('uploads/') ||
      publicId.includes('server/uploads') ||
      publicId.includes('/uploads/') ||
      !isConfigured
    );

  if (isLocalPath) {
    try {
      const cleanPath = publicId
        .replace(/^https?:\/\/[^\/]+/, '')
        .replace(/^\/?api\/uploads\//, '')
        .replace(/^\/?uploads\//, '');
      const safeRel = path.normalize(cleanPath).replace(/^(\.\.[\/\\])+/, '');
      const localFilePath = path.resolve(uploadsRoot, safeRel);
      if (localFilePath.startsWith(uploadsRoot) && fs.existsSync(localFilePath) && fs.statSync(localFilePath).isFile()) {
        fs.unlinkSync(localFilePath);
        return { result: 'ok', storage: 'local' };
      }

      const safeBase = path.basename(publicId).replace(/[^a-zA-Z0-9_\-\.]/g, '');
      if (safeBase) {
        const localMatches = [
          path.resolve(uploadsRoot, 'avatars', safeBase),
          path.resolve(uploadsRoot, 'documents', safeBase),
          path.resolve(uploadsRoot, 'general', safeBase),
        ];
        for (const p of localMatches) {
          if (p.startsWith(uploadsRoot) && fs.existsSync(p) && fs.statSync(p).isFile()) {
            fs.unlinkSync(p);
            return { result: 'ok', storage: 'local' };
          }
        }
      }
    } catch (err) {
      console.warn('Local file cleanup note:', err.message);
    }
    return { result: 'ok', storage: 'local' };
  }

  // Cloudinary asset ID: execute remote destruction without reducing to local basename
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.warn('Cloudinary destroy error:', err.message);
    return { result: 'error', error: err.message };
  }
};

export default cloudinary;
