// server/src/routes/copilot.routes.js
const router = require('express').Router()
const rateLimit = require('express-rate-limit')
const ctrl   = require('../controllers/copilot.controller')
const lgCtrl = require('../controllers/copilot.langgraph.controller') // Phase 4
const { authenticate } = require('../middleware/auth.middleware')

// Each chat turn is an AI call — cap to deter abuse / runaway cost.
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 120,
  message: { success: false, message: 'Too many copilot requests. Please slow down and try again later.' },
})

router.use(authenticate)

// ── Original Gemini-direct SSE endpoint (kept for backward-compat / gradual rollout)
router.post('/chat', chatLimiter, ctrl.streamChat)

// ── Phase 4: LangGraph + MongoDB-checkpointed SSE endpoint
// Swap the frontend to use /chat/lg when you're ready for production.
router.post('/chat/lg', chatLimiter, lgCtrl.streamChatLG)

// ── Read / manage conversations (shared between both routes)
router.get('/conversations', ctrl.listConversations)
router.get('/conversations/:id/messages', ctrl.getMessages)
router.delete('/conversations/:id', ctrl.deleteConversation)

module.exports = router

