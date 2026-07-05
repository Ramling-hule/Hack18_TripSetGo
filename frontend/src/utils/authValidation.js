// src/utils/authValidation.js
// Aurora Design System — Sync client-side authentication validation helpers.

export function validateEmail(email) {
  if (!email) return 'Email is required'
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email) ? null : 'Please enter a valid email address'
}

export function validatePassword(password) {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters long'
  return null;
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password'
  return password === confirmPassword ? null : 'Passwords do not match'
}
