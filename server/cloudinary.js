import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isConfigured = Boolean(
  process.env.CLOUDINARY_URL || 
  (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'intelliattend',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'MtfG3zfPRtlL88MfDXkKM1ys4yY',
  secure: true
});

/**
 * Upload a memory buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer
 * @param {Object} options - Cloudinary upload options (folder, resource_type, etc.)
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isConfigured && !process.env.CLOUDINARY_API_KEY) {
      // Graceful local simulation if API Key is not yet provided
      console.warn('Cloudinary API Key not fully populated; returning simulated Cloudinary secure URL');
      const filename = options.public_id || `doc_${Date.now()}`;
      return resolve({
        secure_url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'intelliattend'}/raw/upload/v1/${filename}`,
        public_id: filename,
        format: options.format || 'pdf',
        bytes: buffer.length,
        created_at: new Date().toISOString(),
        isMock: true
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'intelliattend/documents',
        resource_type: options.resource_type || 'auto',
        ...options
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary stream upload error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete a file by public ID from Cloudinary
 * @param {string} publicId
 * @param {string} resourceType
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!isConfigured) return { result: 'ok', mock: true };
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

export default cloudinary;
