function scoreColor(score) {
  if (score >= 70) return "#22c55e";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

function severityColor(severity) {
  if (severity === "high") return "#ef4444";
  if (severity === "medium") return "#f59e0b";
  return "#3b82f6";
}

// Reusable mini bar for each dimension score
function ScoreBar({ label, score }) {
  const color = scoreColor(score);
  return (
    <div className="score-bar-row">
      <span className="score-bar-label">{label}</span>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="score-bar-value" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

export default function QualityScore({ result }) {
  if (!result) return null;

  const overallColor = scoreColor(result.overall_score);

  return (
    <div className="result-card">
      <h2>Data Quality Report</h2>

      {/* Overall score — large and prominent */}
      <div className="overall-score">
        <div
          className="score-circle"
          style={{ borderColor: overallColor, color: overallColor }}
        >
          {result.overall_score}
        </div>
        <div>
          <p className="label">Overall Quality Score</p>
          <p className="score-desc" style={{ color: overallColor }}>
            {result.overall_score >= 70
              ? "Good"
              : result.overall_score >= 40
                ? "Needs Review"
                : "Poor"}
          </p>
        </div>
      </div>

      {/* Dimension breakdown */}
      <div className="breakdown-section">
        <p className="label">Score Breakdown</p>
        {Object.entries(result.breakdown).map(([key, score]) => (
          <ScoreBar
            key={key}
            label={key.replace(/_/g, " ")} // "clinical_plausibility" → "clinical plausibility"
            score={score}
          />
        ))}
      </div>

      {/* Issues list */}
      {result.issues_detected && result.issues_detected.length > 0 && (
        <div className="issues-section">
          <p className="label">Issues Detected</p>
          {result.issues_detected.map((issue, i) => (
            <div key={i} className="issue-row">
              <span
                className="severity-badge"
                style={{ background: severityColor(issue.severity) }}
              >
                {issue.severity}
              </span>
              <div>
                <p className="issue-field">{issue.field}</p>
                <p className="issue-text">{issue.issue}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
