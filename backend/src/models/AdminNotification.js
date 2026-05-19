const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['new_registration', 'documents_uploaded', 'seller_query'], required: true },
    sellerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerName: { type: String, required: true },
    message:    { type: String, required: true },
    isRead:     { type: Boolean, default: false },
    readBy:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminNotification', adminNotificationSchema);
