import { useState } from "react";
import QualityScore from "../components/QualityScore";
import { API_BASE, API_KEY } from "../config";

// Pre-filled with the John Doe example from the assessment PDF
const EXAMPLE = JSON.stringify(
  {
    demographics: { name: "John Doe", dob: "1955-03-15", gender: "M" },
    medications: ["Metformin 500mg", "Lisinopril 10mg"],
    allergies: [],
    conditions: ["Type 2 Diabetes"],
    vital_signs: { blood_pressure: "340/180", heart_rate: 72 },
    last_updated: "2024-06-15",
  },
  null,
  2,
);

export default function ValidatePage() {
  const [inputJson, setInputJson] = useState(EXAMPLE);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    setError(null);
    setResult(null);

    // Try to parse the JSON before sending
    let parsed;
    try {
      parsed = JSON.parse(inputJson);
    } catch {
      setError(
        "Invalid JSON — check your input for missing brackets or commas.",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/validate/data-quality`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify(parsed),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="form-card">
        <h2>Patient Record</h2>
        <p className="hint">
          Paste a patient record as JSON to analyze its data quality.
        </p>
        <textarea
          className="json-input"
          value={inputJson}
          onChange={(e) => setInputJson(e.target.value)}
          rows={18}
          spellCheck={false}
        />
        <div className="form-actions">
          <button
            className="primary-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Validating..." : "Validate Record"}
          </button>
        </div>
      </div>

      {error && <div className="error-banner">Error: {error}</div>}
      {result && <QualityScore result={result} />}
    </div>
  );
}
