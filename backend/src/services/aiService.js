const AI_ENABLED = process.env.AI_ENABLED === "true";

// ─── Reconciliation ────────────────────────────────────────────────────────────

async function reconcileWithAI(patientContext, scoredSources) {
  if (!AI_ENABLED) {
    const top = scoredSources.reduce((a, b) => (a.score > b.score ? a : b));
    return {
      reconciled_medication: top.medication,
      confidence_score: parseFloat(Math.min(0.99, top.score).toFixed(2)),
      reasoning: `Based on reliability and recency scoring, ${top.medication} from ${top.system} is the most likely accurate record.`,
      recommended_actions: scoredSources
        .filter((s) => s.system !== top.system)
        .map((s) => `Verify ${s.system} reflects the reconciled medication`),
      clinical_safety_check: "PASSED",
    };
  }
  return callReconcileLLM(patientContext, scoredSources);
}

async function callReconcileLLM(patientContext, scoredSources) {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = client.getGenerativeModel({ model: "gemini-flash-latest" });
  const prompt = `You are a clinical pharmacist reviewing conflicting medication records from multiple healthcare systems.

Each source has a pre-computed "score" field (0-1) that combines source reliability (weighted 60%) and recency (weighted 40%). Higher scores indicate more trustworthy, up-to-date sources. Factor this into your assessment alongside clinical judgment.

Patient context:
${JSON.stringify(patientContext, null, 2)}

Medication sources:
${JSON.stringify(scoredSources, null, 2)}

Important considerations:
- Sources may describe the same medication using different names, brand names, abbreviations, or formulations. Treat semantically equivalent medications as the same drug.
- Factor in patient context (age, conditions, recent labs) when assessing clinical appropriateness. For example, declining kidney function affects appropriate Metformin dosing.
- A higher score does not automatically mean correct — use it as one input alongside clinical reasoning.

Based on all available information, determine the most clinically accurate medication and explain your reasoning.

Respond ONLY with valid JSON, no markdown, no preamble, no extra text:
{
  "reconciled_medication": "the full medication name and dose you believe is correct",
  "confidence_score": a number between 0.0 and 0.99 reflecting your confidence,
  "reasoning": "2-3 sentences explaining why this medication and dose is most likely correct, referencing specific sources and clinical factors",
  "recommended_actions": ["specific action for any system whose record should be updated or verified"],
  "clinical_safety_check": "PASSED if the reconciled medication appears safe given patient context, REVIEW_REQUIRED if there are concerns"
}`;

  const response = await model.generateContent(prompt);
  const text = response.response
    .text()
    .replace(/```json\n?|```/g, "")
    .trim(); // Gemini sometimes wraps JSON output in markdown code fences
  return JSON.parse(text);
}

// ─── Validation ────────────────────────────────────────────────────────────────

async function validateWithAI(record, timeliness, vitalFlags) {
  if (!AI_ENABLED) {
    const issues = [];

    if (timeliness.issue) {
      issues.push({
        field: "last_updated",
        issue: timeliness.issue,
        severity: timeliness.score < 40 ? "high" : "medium",
      });
    }

    vitalFlags.forEach((flag) => {
      issues.push({
        field: flag.field,
        issue: `${flag.value} is physiologically implausible: ${flag.reason}`,
        severity: "high",
      });
    });

    return {
      overall_score: Math.max(10, timeliness.score - vitalFlags.length * 5),
      breakdown: {
        completeness: 70,
        accuracy: 70,
        timeliness: timeliness.score,
        clinical_plausibility: vitalFlags.length > 0 ? 30 : 90,
      },
      issues_detected: issues,
    };
  }
  return callValidateLLM(record, timeliness, vitalFlags);
}

async function callValidateLLM(record, timeliness, vitalFlags) {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = client.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `You are a clinical data quality analyst reviewing a patient health record.

Patient record:
${JSON.stringify(record, null, 2)}

Pre-computed timeliness assessment (objective date math):
${JSON.stringify(timeliness, null, 2)}
The timeliness score uses these tiers: <90 days=100, 90-180 days=70, 180-365 days=40, >365 days=10.

Physiologically impossible values flagged by automated checks (these are not clinical judgments — they are mathematical impossibilities):
${vitalFlags.length > 0 ? JSON.stringify(vitalFlags, null, 2) : "None detected"}

Your task: produce a comprehensive data quality report. You must:
- Incorporate the pre-computed timeliness result and any vital flags as confirmed issues
- Assess completeness (are all clinically important fields present and meaningful?)
- Assess accuracy (do the medications, conditions, and vitals make clinical sense together? any drug-disease mismatches or missing context?)
- Identify any additional issues not covered by the automated checks
- Assign severity (high/medium/low) to each issue based on clinical risk

Respond ONLY with valid JSON, no markdown, no preamble, no extra text:
{
  "overall_score": a number 0-100 reflecting overall data quality,
  "breakdown": {
    "completeness": 0-100,
    "accuracy": 0-100,
    "timeliness": ${timeliness.score},
    "clinical_plausibility": 0-100
  },
  "issues_detected": [
    {
      "field": "dot.notation.field.name",
      "issue": "clear description of what is wrong",
      "severity": "high, medium, or low"
    }
  ]
}`;

  const response = await model.generateContent(prompt);
  const text = response.response
    .text()
    .replace(/```json\n?|```/g, "")
    .trim(); // Gemini sometimes wraps JSON output in markdown code fences
  return JSON.parse(text);
}

module.exports = { reconcileWithAI, validateWithAI };
