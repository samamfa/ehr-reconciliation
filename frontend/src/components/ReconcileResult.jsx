import { useState } from "react";

// Returns a CSS color based on confidence value
function confidenceColor(score) {
  if (score >= 0.8) return "#22c55e"; // green
  if (score >= 0.6) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

export default function ReconcileResult({ result }) {
  const [status, setStatus] = useState(null); // null | 'approved' | 'rejected'

  if (!result) return null;

  const color = confidenceColor(result.confidence_score);
  const pct = Math.round(result.confidence_score * 100);

  return (
    <div className="result-card">
      <div className="result-header">
        <h2>Reconciliation Result</h2>
        <span
          className={`safety-badge ${result.clinical_safety_check === "PASSED" ? "passed" : "review"}`}
        >
          {result.clinical_safety_check}
        </span>
      </div>

      {/* Reconciled medication */}
      <div className="reconciled-med">
        <p className="label">Reconciled Medication</p>
        <p className="med-name">{result.reconciled_medication}</p>
      </div>

      {/* Confidence score bar */}
      <div className="confidence-section">
        <div className="confidence-header">
          <span className="label">Confidence Score</span>
          <span className="confidence-pct" style={{ color }}>
            {pct}%
          </span>
        </div>
        <div className="confidence-track">
          <div
            className="confidence-fill"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="reasoning-section">
        <p className="label">Clinical Reasoning</p>
        <p className="reasoning-text">{result.reasoning}</p>
      </div>

      {/* Recommended Actions */}
      {result.recommended_actions && result.recommended_actions.length > 0 && (
        <div className="actions-section">
          <p className="label">Recommended Actions</p>
          <ul className="actions-list">
            {result.recommended_actions.map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Approve / Reject */}
      {status === null ? (
        <div className="decision-buttons">
          <button className="approve-btn" onClick={() => setStatus("approved")}>
            ✓ Approve Suggestion
          </button>
          <button className="reject-btn" onClick={() => setStatus("rejected")}>
            ✗ Reject Suggestion
          </button>
        </div>
      ) : (
        <div className={`decision-status ${status}`}>
          {status === "approved"
            ? "✓ Suggestion approved by clinician"
            : "✗ Suggestion rejected — manual review required"}
        </div>
      )}
    </div>
  );
}
