const aiService = require("./aiService");
const cache = require("../utils/cache");

// Scores a medication source weighted on reliability and recency
function scoreSource(source) {
  reliabilityMap = {
    high: 1.0,
    medium: 0.6,
    low: 0.3,
  };
  reliability = reliabilityMap[source.reliability] || 0.0;

  date = source.last_updated || source.last_filled;
  daysSince = date
    ? (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
    : 365;
  recency = Math.max(0, 1 - daysSince / 365);

  return reliability * 0.65 + recency * 0.35;
}

// Main reconciliation function uses AI to resolve discrepancies between medication sources for a patient
async function reconcileMedication(patientContext, sources) {
  cacheKey = cache.getCacheKey({ patientContext, sources });
  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const scoredSources = sources.map((s) => ({ ...s, score: scoreSource(s) }));
  const res = await aiService.reconcileWithAI(patientContext, scoredSources);

  cache.set(cacheKey, res);
  return res;
}

module.exports = { reconcileMedication };
