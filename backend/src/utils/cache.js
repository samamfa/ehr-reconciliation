const crypto = require("crypto");

const CACHE_TTL_MS = 60 * 60 * 1000;

// key: hash string; value:
const store = new Map();

// Converts any obj into hash string for use as cache key
function getCacheKey(data) {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

// Retrieves cached value; returns null if missing/expired
function get(key) {
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    store.delete(key);
    return null;
  }

  return entry.value;
}

// Stores value with current timestamp
function set(key, value) {
  store.set(key, { value, timestamp: Date.now() });
}

module.exports = { getCacheKey, get, set };
