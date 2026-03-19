import { useState } from "react";

// Default empty source object — reused when adding a new source
const emptySource = () => ({
  system: "",
  medication: "",
  last_updated: "",
  source_reliability: "high",
});

export default function SourceForm({ onSubmit, loading }) {
  const [patientAge, setPatientAge] = useState("");
  const [patientConditions, setPatientConditions] = useState("");
  const [sources, setSources] = useState([emptySource()]);

  function updateSource(index, field, value) {
    const updated = [...sources];
    updated[index] = { ...updated[index], [field]: value };
    setSources(updated);
  }

  function addSource() {
    setSources([...sources, emptySource()]);
  }

  function removeSource(index) {
    // Filter out the source at this index
    setSources(sources.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    // Basic validation — all sources need at least system and medication
    const valid = sources.every((s) => s.system.trim() && s.medication.trim());
    if (!valid) {
      alert("Each source needs a system name and medication.");
      return;
    }

    const payload = {
      patient_context: {
        age: patientAge ? Number(patientAge) : undefined,
        conditions: patientConditions
          ? patientConditions.split(",").map((s) => s.trim())
          : [],
      },
      sources,
    };

    onSubmit(payload); // passes data up to ReconcilePage
  }

  return (
    <div className="form-card">
      <h2>Patient Context</h2>
      <div className="field-row">
        <div className="field">
          <label>Age</label>
          <input
            type="number"
            value={patientAge}
            onChange={(e) => setPatientAge(e.target.value)}
            placeholder="67"
          />
        </div>
        <div className="field">
          <label>Conditions (comma-separated)</label>
          <input
            type="text"
            value={patientConditions}
            onChange={(e) => setPatientConditions(e.target.value)}
            placeholder="Type 2 Diabetes, Hypertension"
          />
        </div>
      </div>

      <h2 style={{ marginTop: "24px" }}>Medication Sources</h2>

      {sources.map((source, index) => (
        <div key={index} className="source-row">
          <div className="source-header">
            <span className="source-label">Source {index + 1}</span>
            {sources.length > 1 && (
              <button
                className="remove-btn"
                onClick={() => removeSource(index)}
              >
                Remove
              </button>
            )}
          </div>
          <div className="field-row">
            <div className="field">
              <label>System</label>
              <input
                type="text"
                value={source.system}
                onChange={(e) => updateSource(index, "system", e.target.value)}
                placeholder="Hospital EHR"
              />
            </div>
            <div className="field">
              <label>Medication</label>
              <input
                type="text"
                value={source.medication}
                onChange={(e) =>
                  updateSource(index, "medication", e.target.value)
                }
                placeholder="Metformin 500mg twice daily"
              />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Last Updated</label>
              <input
                type="date"
                value={source.last_updated}
                onChange={(e) =>
                  updateSource(index, "last_updated", e.target.value)
                }
              />
            </div>
            <div className="field">
              <label>Reliability</label>
              <select
                value={source.source_reliability}
                onChange={(e) =>
                  updateSource(index, "source_reliability", e.target.value)
                }
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      ))}

      <div className="form-actions">
        <button className="secondary-btn" onClick={addSource}>
          + Add Source
        </button>
        <button
          className="primary-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Reconciling..." : "Reconcile Medications"}
        </button>
      </div>
    </div>
  );
}
