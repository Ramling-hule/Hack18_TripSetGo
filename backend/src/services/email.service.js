
const nodemailer = require('nodemailer')
const logger     = require('../utils/logger')

// ── SMTP Transport ──────────────────────────────────────────────────────────
// Use a real SMTP service in production (SendGrid, SES, Mailgun).
// For development, configure Ethereal (https://ethereal.email) or leave SMTP_USER
// unset to enter simulation mode (emails are logged but not sent).

const smtpPort = Number(process.env.SMTP_PORT) || 587

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.ethereal.email',
  port:   smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// ── Shared Brand Styles ─────────────────────────────────────────────────────
const BRAND_COLOR       = '#6366f1' // Indigo-500
const ACCENT_COLOR      = '#8b5cf6' // Violet-500
const BG_COLOR          = '#0f0f1a'
const CARD_BG           = '#1a1a2e'
const TEXT_COLOR        = '#e2e8f0'
const MUTED_COLOR       = '#94a3b8'
const CLIENT_URL        = process.env.CLIENT_URL || 'http://localhost:3000'

/**
 * Wraps any HTML fragment in the TripSetGo branded email shell.
 * @param {string} title  - Subject-level heading shown in the header
 * @param {string} body   - Inner HTML content (the card body)
 * @returns {string}      - Complete HTML email string
 */
const buildEmailShell = (title, body) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${BG_COLOR}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif; color: ${TEXT_COLOR}; }
    .wrapper { max-width: 600px; margin: 40px auto; background: ${CARD_BG}; border-radius: 16px; overflow: hidden; border: 1px solid rgba(99,102,241,0.2); }
    .header { background: linear-gradient(135deg, ${BRAND_COLOR}, ${ACCENT_COLOR}); padding: 32px 40px; text-align: center; }
    .header .logo { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .header .logo span { opacity: 0.85; }
    .content { padding: 36px 40px; }
    .content h2 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 12px; }
    .content p { font-size: 15px; line-height: 1.7; color: ${TEXT_COLOR}; margin-bottom: 16px; }
    .highlight-box { background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.3); border-radius: 12px; padding: 20px 24px; margin: 24px 0; }
    .highlight-box .label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND_COLOR}; margin-bottom: 6px; }
    .highlight-box .value { font-size: 18px; font-weight: 700; color: #fff; }
    .btn { display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR}, ${ACCENT_COLOR}); color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 15px; font-weight: 600; margin-top: 8px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
    .meta-item { background: rgba(255,255,255,0.04); border-radius: 10px; padding: 14px 16px; }
    .meta-item .k { font-size: 11px; color: ${MUTED_COLOR}; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
    .meta-item .v { font-size: 14px; font-weight: 600; color: #fff; }
    .footer { padding: 24px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); }
    .footer p { font-size: 12px; color: ${MUTED_COLOR}; line-height: 1.6; }
    .footer a { color: ${BRAND_COLOR}; text-decoration: none; }
    .star { color: #f59e0b; font-size: 20px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">✈ TripSet<span>Go</span></div>
    </div>
    <div class="content">
      ${body}
    </div>
    <div class="footer">
      <p>
        You received this email because you have an account on TripSetGo.<br/>
        <a href="${CLIENT_URL}/settings/notifications">Manage notification preferences</a> &nbsp;·&nbsp;
        <a href="${CLIENT_URL}">Visit TripSetGo</a>
      </p>
    </div>
  </div>
</body>
</html>
`

// ── Low-level transport ─────────────────────────────────────────────────────
const sendEmail = async (to, subject, html) => {
  if (!process.env.SMTP_USER) {
    logger.warn(`📧 [Email simulated] To: ${to} | Subject: ${subject}`)
    return true
  }
  try {
    await transporter.sendMail({
      from: `"TripSetGo" <${process.env.SMTP_FROM || 'noreply@tripsetgo.com'}>`,
      to, subject, html,
    })
    logger.info(`📧 Email sent → ${to} (${subject})`)
    return true
  } catch (err) {
    logger.error(`❌ Email error to ${to}: ${err.message}`)
    return false
  }
}

// ── Auth Emails ─────────────────────────────────────────────────────────────

exports.sendOTP = async (email, name, otp) => {
  const html = buildEmailShell('Verify your TripSetGo account', `
    <h2>Welcome to TripSetGo, ${name}! 🎉</h2>
    <p>Thanks for signing up. Use the verification code below to confirm your email address.</p>
    <div class="highlight-box" style="text-align:center;">
      <div class="label">Your Verification Code</div>
      <div class="value" style="font-size:40px;letter-spacing:12px;">${otp}</div>
    </div>
    <p style="color:${MUTED_COLOR};font-size:13px;">This code expires in <strong style="color:#fff">10 minutes</strong>. If you didn't create an account, you can safely ignore this email.</p>
  `)
  return sendEmail(email, 'Verify your TripSetGo account', html)
}

exports.sendPasswordResetOTP = async (email, name, otp) => {
  const html = buildEmailShell('Reset your TripSetGo password', `
    <h2>Password Reset Request 🔑</h2>
    <p>Hi <strong>${name}</strong>, we received a request to reset your password. Use the code below:</p>
    <div class="highlight-box" style="text-align:center;">
      <div class="label">Password Reset Code</div>
      <div class="value" style="font-size:40px;letter-spacing:12px;color:#f59e0b">${otp}</div>
    </div>
    <p style="color:${MUTED_COLOR};font-size:13px;">This code expires in <strong style="color:#fff">10 minutes</strong>. If you didn't request this, please ignore this email or <a href="${CLIENT_URL}/support" style="color:${BRAND_COLOR}">contact support</a>.</p>
  `)
  return sendEmail(email, 'Reset your TripSetGo password', html)
}

// ── Notification Service Emails ─────────────────────────────────────────────

/**
 * EVENT: trip_shared
 * Sent to all collaborators when a trip owner makes the trip public.
 *
 * @param {string} email        - Recipient email
 * @param {string} recipientName - Recipient display name
 * @param {object} opts
 * @param {string} opts.actorName   - Name of the user who shared the trip
 * @param {string} opts.destination - Trip destination
 * @param {string} opts.shareUrl   - Public URL to the trip
 * @param {Date}   opts.startDate
 * @param {Date}   opts.endDate
 */
exports.sendTripSharedEmail = async (email, recipientName, opts) => {
  const { actorName, destination, shareUrl, startDate, endDate } = opts
  const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  const end   = endDate   ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  const html = buildEmailShell(`Trip to ${destination} is now public!`, `
    <h2>✈️ A trip has been shared with you!</h2>
    <p>Hi <strong>${recipientName}</strong>, <strong>${actorName}</strong> just made their trip public. You're invited to explore it.</p>
    <div class="highlight-box">
      <div class="label">Destination</div>
      <div class="value">📍 ${destination}</div>
    </div>
    <div class="meta-grid">
      <div class="meta-item"><div class="k">Departure</div><div class="v">${start}</div></div>
      <div class="meta-item"><div class="k">Return</div><div class="v">${end}</div></div>
    </div>
    <p>View the full itinerary, save it, or clone it for your own adventures.</p>
    <a class="btn" href="${shareUrl}">View Trip →</a>
  `)
  return sendEmail(email, `✈️ ${actorName} shared a trip to ${destination}`, html)
}

/**
 * EVENT: new_review
 * Sent to the trip owner when someone reviews a place that appears in their itinerary.
 *
 * @param {string} email        - Recipient email
 * @param {string} recipientName
 * @param {object} opts
 * @param {string} opts.actorName    - Reviewer display name
 * @param {string} opts.placeName    - Name of the reviewed place
 * @param {string} opts.targetType   - Hotel | Restaurant | Attraction
 * @param {number} opts.rating       - 1–5
 * @param {string} opts.reviewTitle
 * @param {string} opts.tripDestination
 * @param {string} opts.tripId
 */
exports.sendNewReviewEmail = async (email, recipientName, opts) => {
  const { actorName, placeName, targetType, rating, reviewTitle, tripDestination, tripId } = opts
  const stars     = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))
  const tripUrl   = `${CLIENT_URL}/trips/${tripId}`
  const typeEmoji = targetType === 'Hotel' ? '🏨' : targetType === 'Restaurant' ? '🍽️' : '🎡'

  const html = buildEmailShell(`New review on a place in your trip`, `
    <h2>${typeEmoji} New Review on your Itinerary!</h2>
    <p>Hi <strong>${recipientName}</strong>, <strong>${actorName}</strong> just reviewed a place that's part of your trip to <strong>${tripDestination}</strong>.</p>
    <div class="highlight-box">
      <div class="label">${targetType}</div>
      <div class="value">${placeName}</div>
      <div style="margin-top:10px;">
        <span class="star">${stars}</span>
        <span style="color:${MUTED_COLOR};font-size:13px;margin-left:8px;">${rating} / 5</span>
      </div>
      ${reviewTitle ? `<div style="margin-top:10px;color:${TEXT_COLOR};font-style:italic;">"${reviewTitle}"</div>` : ''}
    </div>
    <a class="btn" href="${tripUrl}">View your trip →</a>
  `)
  return sendEmail(email, `⭐ New review: ${placeName} (${rating}/5)`, html)
}

/**
 * EVENT: itinerary_updated
 * Sent to all collaborators (except the editor) when the itinerary is modified.
 *
 * @param {string} email        - Recipient email
 * @param {string} recipientName
 * @param {object} opts
 * @param {string} opts.actorName     - Editor display name
 * @param {string} opts.destination   - Trip destination
 * @param {string} opts.changeDesc    - Human-readable change description, e.g. "Day 3 updated"
 * @param {string} opts.tripId
 */
exports.sendItineraryUpdatedEmail = async (email, recipientName, opts) => {
  const { actorName, destination, changeDesc, tripId } = opts
  const tripUrl = `${CLIENT_URL}/trips/${tripId}`

  const html = buildEmailShell(`Itinerary updated for your trip to ${destination}`, `
    <h2>🗓️ Itinerary Updated!</h2>
    <p>Hi <strong>${recipientName}</strong>, your collaborator <strong>${actorName}</strong> just made changes to the itinerary for your trip to <strong>${destination}</strong>.</p>
    <div class="highlight-box">
      <div class="label">What changed</div>
      <div class="value">${changeDesc}</div>
    </div>
    <p>Open the trip to review the latest itinerary and sync your plans.</p>
    <a class="btn" href="${tripUrl}">View itinerary →</a>
  `)
  return sendEmail(email, `🗓️ Itinerary updated — Trip to ${destination}`, html)
}
