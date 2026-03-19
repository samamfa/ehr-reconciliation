const { reconcileMedication } = require("../services/reconcileService");
const { validateRecord } = require("../services/validateService");
const request = require("supertest");

jest.mock("../services/aiService", () => ({
  reconcileWithAI: jest.fn().mockResolvedValue({
    reconciled_medication: "Metformin 500mg twice daily",
    confidence_score: 0.88,
    reasoning: "Mock reasoning.",
    recommended_actions: ["Mock action"],
    clinical_safety_check: "PASSED",
  }),
  validateWithAI: jest.fn().mockResolvedValue({
    overall_score: 62,
    breakdown: {
      completeness: 60,
      accuracy: 70,
      timeliness: 70,
      clinical_plausibility: 40,
    },
    issues_detected: [
      {
        field: "vital_signs.blood_pressure",
        issue: "Blood pressure 340/180 is physiologically implausible",
        severity: "high",
      },
      {
        field: "allergies",
        issue: "No allergies documented",
        severity: "medium",
      },
    ],
  }),
}));

describe("reconcileService", () => {
  it("returns the AI result with required fields", async () => {
    const result = await reconcileMedication({}, [
      {
        system: "A",
        medication: "Metformin 500mg twice daily",
        last_updated: "2025-01-20",
        source_reliability: "high",
      },
      {
        system: "B",
        medication: "Metformin 1000mg twice daily",
        last_updated: "2024-01-01",
        source_reliability: "high",
      },
    ]);
    expect(result.reconciled_medication).toBe("Metformin 500mg twice daily");
    expect(result.confidence_score).toBe(0.88);
  });

  it("handles a single source", async () => {
    const result = await reconcileMedication({}, [
      {
        system: "A",
        medication: "Lisinopril 10mg",
        last_updated: "2025-01-01",
        source_reliability: "high",
      },
    ]);
    expect(result.reconciled_medication).toBeDefined();
    expect(result.confidence_score).toBeGreaterThan(0);
  });
});

describe("validateService", () => {
  it("flags implausible blood pressure as high severity", async () => {
    const result = await validateRecord({
      vital_signs: { blood_pressure: "340/180", heart_rate: 72 },
      last_updated: "2025-01-01",
    });
    const bpIssue = result.issues_detected.find(
      (i) => i.field === "vital_signs.blood_pressure",
    );
    expect(bpIssue).toBeDefined();
    expect(bpIssue.severity).toBe("high");
  });

  it("returns a valid quality report", async () => {
    const result = await validateRecord({
      demographics: { name: "Test" },
      last_updated: "2025-01-01",
    });
    expect(result.overall_score).toBeGreaterThan(0);
    expect(result.issues_detected).toBeDefined();
  });
});

describe("auth middleware", () => {
  process.env.API_KEY = "testkey";
  const app = require("../app");

  it("rejects wrong API key with 401", async () => {
    const res = await request(app)
      .post("/api/reconcile/medication")
      .set("X-API-Key", "wrongkey")
      .send({});
    expect(res.status).toBe(401);
  });
});
