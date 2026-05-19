const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const FOLDER_MAP = {
  'trade-license': 'abcelectronics/trade-licenses',
  'id-document':   'abcelectronics/id-documents',
  'logo':          'abcelectronics/logos',
  'cover':         'abcelectronics/covers',
};

const cloudinaryService = {
  uploadFile(buffer, folderKey, resourceType = 'image') {
    const folder = FOLDER_MAP[folderKey] || `abcelectronics/${folderKey}`;
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
          transformation: resourceType === 'image'
            ? [{ quality: 'auto', fetch_format: 'auto' }]
            : undefined,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });
  },
  async deleteFile(publicId) {
    return cloudinary.uploader.destroy(publicId);
  },
};

module.exports = cloudinaryService;
