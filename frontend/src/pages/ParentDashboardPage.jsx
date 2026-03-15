import { useState } from "react";
import { getApiBase } from "../lib/api";

export default function ParentDashboardPage({ token, onLogout }) {
  const [apiBase] = useState(getApiBase());

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <h2>Parent Dashboard</h2>
          <div className="muted">API: {apiBase}</div>
        </div>
        <button className="ghost" onClick={onLogout}>Logout</button>
      </div>

      <div className="card">
        <div className="muted small">
          Hozircha parent dashboard “skelet”.
          Keyingi qadam: backend’dagi <b>parentRoutes.js</b> dagi endpointlar asosida:
          <ul>
            <li>Farzandlar ro‘yxati</li>
            <li>Tanlangan farzand progress’i (completed/lastPositionSec)</li>
          </ul>
        </div>

        <div className="muted small" style={{ marginTop: 10 }}>
          Token borligi uchun bu sahifa ochildi ✅
        </div>
        <div className="muted small">
          Token: <code>{token.slice(0, 20)}... </code>
        </div>
      </div>
    </div>
  );
}