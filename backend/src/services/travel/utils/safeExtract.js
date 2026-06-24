// backend/src/services/travel/utils/safeExtract.js

function safeStr(v) {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

function safeFloat(v) {
  const n = parseFloat(v);
  return isFinite(n) ? n : null;
}

function safeInt(v) {
  const n = parseInt(v, 10);
  return isFinite(n) ? n : null;
}

function safeBool(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v.toLowerCase() === 'true';
  return !!v;
}

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

module.exports = {
  safeStr,
  safeFloat,
  safeInt,
  safeBool,
  safeArray
};
