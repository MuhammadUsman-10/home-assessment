const User = require('../models/User');
const AdminNotification = require('../models/AdminNotification');
const emailService = require('../services/email.service');

const listSellers = async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const filter = { role: 'seller' };
  if (status && status !== 'all') filter.status = status;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { businessName: { $regex: search, $options: 'i' } },
    ];
  }
  const total = await User.countDocuments(filter);
  const sellers = await User.find(filter)
    .select('-passwordHash -emailVerifyToken -refreshTokens')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ sellers, total, page: Number(page), pages: Math.ceil(total / limit) });
};

const getSellerById = async (req, res) => {
  const seller = await User.findOne({ _id: req.params.id, role: 'seller' })
    .select('-passwordHash -emailVerifyToken -refreshTokens');
  if (!seller) return res.status(404).json({ message: 'Seller not found' });
  res.json({ seller });
};

const approveSeller = async (req, res) => {
  const seller = await User.findOne({ _id: req.params.id, role: 'seller' });
  if (!seller) return res.status(404).json({ message: 'Seller not found' });
  seller.status = 'active';
  seller.approvedAt = new Date();
  seller.approvedBy = req.user._id;
  seller.adminNotes = req.body.notes || '';
  await seller.save();
  await emailService.sendApprovalEmail(seller.email, seller.fullName, `${process.env.FRONTEND_URL}/dashboard`);
  res.json({ message: 'Seller approved successfully', seller: seller.toSafeObject() });
};

const rejectSeller = async (req, res) => {
  const { reason } = req.body;
  const seller = await User.findOne({ _id: req.params.id, role: 'seller' });
  if (!seller) return res.status(404).json({ message: 'Seller not found' });
  seller.status = 'rejected';
  seller.adminNotes = reason || '';
  await seller.save();
  await emailService.sendRejectionEmail(seller.email, seller.fullName, reason, `${process.env.FRONTEND_URL}/support`);
  res.json({ message: 'Seller rejected', seller: seller.toSafeObject() });
};

const suspendSeller = async (req, res) => {
  const seller = await User.findOne({ _id: req.params.id, role: 'seller' });
  if (!seller) return res.status(404).json({ message: 'Seller not found' });
  seller.status = 'suspended';
  seller.adminNotes = req.body.reason || '';
  await seller.save();
  res.json({ message: 'Seller suspended', seller: seller.toSafeObject() });
};

const unsuspendSeller = async (req, res) => {
  const seller = await User.findOne({ _id: req.params.id, role: 'seller' });
  if (!seller) return res.status(404).json({ message: 'Seller not found' });
  if (seller.status !== 'suspended') return res.status(400).json({ message: 'Seller is not suspended' });
  seller.status = 'active';
  seller.adminNotes = '';
  await seller.save();
  await emailService.sendApprovalEmail(seller.email, seller.fullName, `${process.env.FRONTEND_URL}/dashboard`);
  res.json({ message: 'Seller unsuspended and restored to active', seller: seller.toSafeObject() });
};

const getNotifications = async (req, res) => {
  const notifications = await AdminNotification.find()
    .populate('sellerId', 'fullName email businessName')
    .sort({ createdAt: -1 })
    .limit(50);
  const unread = await AdminNotification.countDocuments({ isRead: false });
  res.json({ notifications, unread });
};

const markNotificationRead = async (req, res) => {
  await AdminNotification.findByIdAndUpdate(req.params.id, {
    isRead: true, $addToSet: { readBy: req.user._id },
  });
  res.json({ message: 'Notification marked as read' });
};

const markAllNotificationsRead = async (req, res) => {
  await AdminNotification.updateMany({ isRead: false }, {
    isRead: true, $addToSet: { readBy: req.user._id },
  });
  res.json({ message: 'All notifications marked as read' });
};

module.exports = {
  listSellers, getSellerById, approveSeller, rejectSeller,
  suspendSeller, unsuspendSeller, getNotifications, markNotificationRead, markAllNotificationsRead,
};
