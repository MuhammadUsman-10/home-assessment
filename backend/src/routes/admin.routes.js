const express = require('express');
const router = express.Router();
const {
  listSellers, getSellerById, approveSeller, rejectSeller, suspendSeller, unsuspendSeller,
  getNotifications, markNotificationRead, markAllNotificationsRead,
} = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/authenticate');
const { requireAdmin } = require('../middleware/requireAdmin');

router.use(authenticate, requireAdmin);

router.get('/sellers', listSellers);
router.get('/sellers/:id', getSellerById);
router.patch('/sellers/:id/approve', approveSeller);
router.patch('/sellers/:id/reject', rejectSeller);
router.patch('/sellers/:id/suspend', suspendSeller);
router.patch('/sellers/:id/unsuspend', unsuspendSeller);
router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markAllNotificationsRead);
router.patch('/notifications/:id/read', markNotificationRead);

module.exports = router;
