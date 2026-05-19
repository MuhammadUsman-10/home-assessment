const User = require('../models/User');
const AdminNotification = require('../models/AdminNotification');
const cloudinaryService = require('../services/cloudinary.service');

const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash -emailVerifyToken -refreshTokens');
  res.json({ user: user.toSafeObject() });
};

const updateMe = async (req, res) => {
  const allowed = [
    'fullName', 'mobileNumber', 'storeAddress', 'city', 'aboutStore',
    'whatsappContact', 'telephoneNo', 'socialLinks', 'businessCategories',
    'yearsInBusiness', 'vatNumber', 'mapCoordinates',
  ];
  const user = await User.findById(req.user._id);
  allowed.forEach((field) => { if (req.body[field] !== undefined) user[field] = req.body[field]; });
  await user.save();
  res.json({ message: 'Profile updated', user: user.toSafeObject() });
};

const uploadDocuments = async (req, res) => {
  const user = await User.findById(req.user._id);
  const files = req.files || {};

  const uploadFile = async (fileArray, folderKey, resourceType = 'image') => {
    if (!fileArray || !fileArray.length) return null;
    const { url } = await cloudinaryService.uploadFile(fileArray[0].buffer, folderKey, resourceType);
    return url;
  };
  const getResType = (fa) => fa?.[0]?.mimetype === 'application/pdf' ? 'raw' : 'image';

  if (files.tradeLicense) user.tradeLicenseUrl = await uploadFile(files.tradeLicense, 'trade-license', getResType(files.tradeLicense));
  if (files.idPassport)   user.idPassportUrl   = await uploadFile(files.idPassport,   'id-document',   getResType(files.idPassport));
  if (files.logo)         user.logoUrl         = await uploadFile(files.logo,         'logo',          'image');
  if (files.coverImage)   user.coverImageUrl   = await uploadFile(files.coverImage,   'cover',         'image');

  const textFields = [
    'tradeLicenseNo', 'tradeLicenseExpiry', 'storeAddress', 'mapCoordinates',
    'city', 'businessCategories', 'yearsInBusiness', 'vatNumber',
    'aboutStore', 'whatsappContact', 'telephoneNo', 'socialLinks',
  ];
  textFields.forEach((f) => {
    if (req.body[f] !== undefined) {
      try { user[f] = typeof req.body[f] === 'string' ? JSON.parse(req.body[f]) : req.body[f]; }
      catch { user[f] = req.body[f]; }
    }
  });
  await user.save();

  await AdminNotification.create({
    type: 'documents_uploaded', sellerId: user._id, sellerName: user.fullName,
    message: `${user.fullName} (${user.email}) has uploaded documents and completed their profile.`,
  });

  res.json({ message: 'Documents uploaded successfully', user: user.toSafeObject() });
};

module.exports = { getMe, updateMe, uploadDocuments };
