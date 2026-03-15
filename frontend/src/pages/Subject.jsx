// frontend/src/pages/Subjects.jsx
import React, { useEffect, useState } from "react";
import { apiGetSubjects } from "../lib/api";

export default function Subjects({ token, onSelectSubject }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await apiGetSubjects(token);
      const list = Array.isArray(data) ? data : data.subjects || [];
      setItems(list);
    } catch (e) {
      setErr(e?.message || "Xatolik");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) load();
  }, [token]);

  return (
    <div style={{ padding: 14, background: "#0b1220", borderRadius: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Fanlar</h2>
        <button onClick={load} disabled={loading} style={{ padding: "10px 12px" }}>
          {loading ? "Yuklanmoqda..." : "Yangilash"}
        </button>
      </div>

      {err ? <div style={{ color: "tomato", marginTop: 10 }}>{err}</div> : null}

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {items.map((s) => (
          <button
            key={s._id}
            onClick={() => onSelectSubject?.(s)}
            style={{
              textAlign: "left",
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "white",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 700 }}>{s.name}</div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>
              <code>{s._id}</code>
            </div>
          </button>
        ))}
      </div>

      {items.length === 0 && !loading ? (
        <div style={{ opacity: 0.7, marginTop: 10 }}>Hozircha fan yo‘q.</div>
      ) : null}
    </div>
  );
}