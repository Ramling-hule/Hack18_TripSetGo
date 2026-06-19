// server/src/routes/notification.routes.js
const router     = require('express').Router()
const notifCtrl  = require('../controllers/notification.controller')
const { authenticate } = require('../middleware/auth.middleware')

// All notification routes require authentication
router.use(authenticate)

// ── Read endpoints ────────────────────────────────────────────────────────────
// GET /api/v1/notifications              — paginated list (supports ?type=, ?unread=, ?page=, ?limit=)
// GET /api/v1/notifications/summary      — lightweight badge summary (unread count + 5 recent)
router.get('/',        notifCtrl.getNotifications)
router.get('/summary', notifCtrl.getSummary)

// ── Mark-read endpoints ───────────────────────────────────────────────────────
// PUT /api/v1/notifications/read-all     — mark ALL unread as read
// PUT /api/v1/notifications/:id/read     — mark single notification as read
router.put('/read-all',    notifCtrl.markAllRead)
router.put('/:id/read',    notifCtrl.markRead)

// ── Delete endpoints ──────────────────────────────────────────────────────────
// DELETE /api/v1/notifications           — clear ALL notifications for the user
// DELETE /api/v1/notifications/:id       — delete a single notification
router.delete('/',     notifCtrl.clearAll)
router.delete('/:id',  notifCtrl.deleteNotification)

module.exports = router
