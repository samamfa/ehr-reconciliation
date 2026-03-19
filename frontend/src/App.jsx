import { useState } from "react";
import ReconcilePage from "./pages/ReconcilePage";
import ValidatePage from "./pages/ValidatePage";
import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("reconcile");

  return (
    <div className="app">
      <header className="header">
        <h1>EHR Reconciliation Engine</h1>
        <nav className="nav">
          <button
            className={
              activePage === "reconcile" ? "nav-btn active" : "nav-btn"
            }
            onClick={() => setActivePage("reconcile")}
          >
            Medication Reconciliation
          </button>
          <button
            className={activePage === "validate" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActivePage("validate")}
          >
            Data Quality Validation
          </button>
        </nav>
      </header>

      <main className="main">
        {activePage === "reconcile" && <ReconcilePage />}
        {activePage === "validate" && <ValidatePage />}
      </main>
    </div>
  );
}
