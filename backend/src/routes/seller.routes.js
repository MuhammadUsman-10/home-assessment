const express = require('express');
const router = express.Router();
const { getMe, updateMe, uploadDocuments } = require('../controllers/seller.controller');
const { authenticate } = require('../middleware/authenticate');
const { upload } = require('../middleware/multerCloudinary');
const { uploadLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);
router.get('/me', getMe);
router.patch('/me', updateMe);
router.post(
  '/upload-documents',
  uploadLimiter,
  upload.fields([
    { name: 'tradeLicense', maxCount: 1 },
    { name: 'idPassport',   maxCount: 1 },
    { name: 'logo',         maxCount: 1 },
    { name: 'coverImage',   maxCount: 1 },
  ]),
  uploadDocuments
);

module.exports = router;
