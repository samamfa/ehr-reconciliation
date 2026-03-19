const aiService = require("./aiService");
const cache = require("../utils/cache");

function checkTimeliness(record) {
  if (!record.last_updated) {
    return {
      score: 0,
      daysSince: null,
      issue: "No last_updated date provided",
    };
  }

  const daysSince =
    (Date.now() - new Date(record.last_updated)) / (1000 * 60 * 60 * 24);
  let score = 100;
  if (daysSince > 365) score = 10;
  else if (daysSince > 180) score = 40;
  else if (daysSince > 90) score = 70;

  return {
    score,
    daysSince: Math.floor(daysSince),
    issue: score < 100 ? `Data is ${Math.floor(daysSince)} days old` : null,
  };
}

function checkVitalSanity(record) {
  const flags = [];
  const vs = record.vital_signs;

  if (vs?.blood_pressure) {
    const [sys, dia] = vs.blood_pressure.split("/").map(Number);
    if (sys > 300)
      flags.push({
        field: "vital_signs.blood_pressure",
        value: vs.blood_pressure,
        reason: "systolic exceeds physiological maximum",
      });
    else if (sys < 50)
      flags.push({
        field: "vital_signs.blood_pressure",
        value: vs.blood_pressure,
        reason: "systolic below survivable minimum",
      });
    else if (dia > sys)
      flags.push({
        field: "vital_signs.blood_pressure",
        value: vs.blood_pressure,
        reason: "diastolic cannot exceed systolic",
      });
  }

  if (vs?.heart_rate) {
    if (vs.heart_rate > 300)
      flags.push({
        field: "vital_signs.heart_rate",
        value: vs.heart_rate,
        reason: "exceeds physiological maximum",
      });
    else if (vs.heart_rate < 10)
      flags.push({
        field: "vital_signs.heart_rate",
        value: vs.heart_rate,
        reason: "below survivable minimum",
      });
  }

  return flags;
}

async function validateRecord(record) {
  const cacheKey = cache.getCacheKey(record);
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const timeliness = checkTimeliness(record);
  const vitalFlags = checkVitalSanity(record);

  const result = await aiService.validateWithAI(record, timeliness, vitalFlags);

  cache.set(cacheKey, result);
  return result;
}

module.exports = { validateRecord };
