// frontend/src/pages/Topics.jsx
import React, { useEffect, useState } from "react";
import { apiGetTopics } from "../lib/api";

export default function Topics({ token, subject, grade, onBack, onSelectTopic }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    if (!subject?._id) return;
    setErr("");
    setLoading(true);
    try {
      const data = await apiGetTopics(token, subject._id, grade);
      const list = Array.isArray(data) ? data : data.topics || [];
      setItems(list);
    } catch (e) {
      setErr(e?.message || "Xatolik");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token && subject?._id) load();
  }, [token, subject?._id, grade]);

  return (
    <div style={{ padding: 14, background: "#0b1220", borderRadius: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>{subject?.name} — {grade}-sinf</h2>
          <div style={{ opacity: 0.7, fontSize: 12 }}>Topiclar ro‘yxati</div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} style={{ padding: "10px 12px" }}>⬅ Orqaga</button>
          <button onClick={load} disabled={loading} style={{ padding: "10px 12px" }}>
            {loading ? "..." : "Yangilash"}
          </button>
        </div>
      </div>

      {err ? <div style={{ color: "tomato", marginTop: 10 }}>{err}</div> : null}

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {items.map((t) => (
          <button
            key={t._id}
            onClick={() => onSelectTopic?.(t)}
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
            <div style={{ fontWeight: 700 }}>{t.title}</div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>
              order: {t.order} — <code>{t._id}</code>
            </div>
          </button>
        ))}
      </div>

      {items.length === 0 && !loading ? (
        <div style={{ opacity: 0.7, marginTop: 10 }}>
          Bu sinfda topic yo‘q — bu normal. Keyin o‘qituvchi to‘ldiradi.
        </div>
      ) : null}
    </div>
  );
}