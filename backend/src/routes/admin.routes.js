// server/src/routes/admin.routes.js
const router = require('express').Router()
const adminCtrl = require('../controllers/admin.controller')
const { authenticate, authorize } = require('../middleware/auth.middleware')

// All routes require authentication and admin privileges
router.use(authenticate, authorize('admin'))

// Analytics
router.get('/analytics', adminCtrl.getAnalytics)

// User Management
router.get('/users', adminCtrl.getUsers)
router.put('/users/:id/status', adminCtrl.updateUserStatus)
router.put('/users/:id/role', adminCtrl.updateUserRole)
router.delete('/users/:id', adminCtrl.deleteUser)

// Review Management
router.get('/reviews', adminCtrl.getReviews)
router.delete('/reviews/:id', adminCtrl.deleteReview)

// Destination Management
router.get('/destinations', adminCtrl.getDestinations)
router.post('/destinations', adminCtrl.createDestination)
router.put('/destinations/:type/:id', adminCtrl.updateDestination)
router.delete('/destinations/:type/:id', adminCtrl.deleteDestination)

// Reports & Audit Logs
router.get('/reports', adminCtrl.getReports)
router.get('/export/users', adminCtrl.exportUsersCSV)

module.exports = router
