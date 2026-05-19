const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const socialLinksSchema = new mongoose.Schema({
  instagram: { type: String, default: '' },
  facebook:  { type: String, default: '' },
  twitter:   { type: String, default: '' },
  tiktok:    { type: String, default: '' },
  youtube:   { type: String, default: '' },
  linkedin:  { type: String, default: '' },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    fullName:     { type: String, required: true, trim: true },
    businessName: { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    userType:     { type: String, enum: ['Retailer', 'WholeSaler', 'Distributor'], required: true },
    role:         { type: String, enum: ['seller', 'admin'], default: 'seller' },

    tradeLicenseNo:     { type: String, default: '' },
    tradeLicenseExpiry: { type: Date },
    tradeLicenseUrl:    { type: String, default: '' },
    idPassportUrl:      { type: String, default: '' },
    storeAddress:       { type: String, default: '' },
    mapCoordinates: { lat: { type: Number }, lng: { type: Number } },
    city:               { type: String, default: '' },
    businessCategories: [{ type: String }],
    yearsInBusiness:    { type: Number, default: 0 },
    vatNumber:          { type: String, default: '' },

    logoUrl:         { type: String, default: '' },
    coverImageUrl:   { type: String, default: '' },
    aboutStore:      { type: String, default: '' },
    whatsappContact: { type: String, default: '' },
    telephoneNo:     { type: String, default: '' },
    socialLinks:     { type: socialLinksSchema, default: () => ({}) },

    isEmailVerified:  { type: Boolean, default: false },
    emailVerifyToken: { type: String, default: null },
    status: {
      type: String,
      enum: ['pending_email', 'pending_approval', 'active', 'rejected', 'suspended'],
      default: 'pending_email',
    },
    adminNotes:  { type: String, default: '' },
    approvedAt:  { type: Date },
    approvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    refreshTokens: [{ type: String }],
    lastActiveAt:  { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};
userSchema.statics.hashPassword = async function (plain) {
  return bcrypt.hash(plain, 12);
};
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash; delete obj.emailVerifyToken; delete obj.refreshTokens;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
