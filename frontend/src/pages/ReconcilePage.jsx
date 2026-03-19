import { useState } from "react";
import SourceForm from "../components/SourceForm";
import ReconcileResult from "../components/ReconcileResult";
import { API_BASE, API_KEY } from "../config";

export default function ReconcilePage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(payload) {
    setLoading(true);
    setError(null);
    setResult(null); // clear previous result

    try {
      const response = await fetch(`${API_BASE}/api/reconcile/medication`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify(payload),
      });

      // response.ok is true for 2xx status codes
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      // Catches both network errors and the thrown Error above
      setError(err.message);
    } finally {
      // Always runs
      setLoading(false);
    }
  }

  return (
    <div>
      <SourceForm onSubmit={handleSubmit} loading={loading} />

      {error && <div className="error-banner">Error: {error}</div>}

      {result && <ReconcileResult result={result} />}
    </div>
  );
}
