// frontend/src/pages/Videos.jsx
import React, { useEffect, useMemo, useState } from "react";
import { apiGetVideos } from "../lib/api";

export default function Videos({ token, subject, topic, onBack, onSelectVideo }) {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await apiGetVideos(token);
      const list = Array.isArray(data) ? data : data.videos || [];
      setAll(list);
    } catch (e) {
      setErr(e?.message || "Xatolik");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) load();
  }, [token]);

  const items = useMemo(() => {
    return all.filter((v) => {
      const okSubject = subject?._id ? String(v.subject) === String(subject._id) : true;
      const okTopic = topic?._id ? String(v.topic) === String(topic._id) : true;
      return okSubject && okTopic;
    });
  }, [all, subject?._id, topic?._id]);

  return (
    <div style={{ padding: 14, background: "#0b1220", borderRadius: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>{topic?.title || "Videolar"}</h2>
          <div style={{ opacity: 0.7, fontSize: 12 }}>
            {subject?.name || ""} {subject?.name ? "—" : ""} videolar
          </div>
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
        {items.map((v) => (
          <button
            key={v._id}
            onClick={() => onSelectVideo?.(v)}
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
            <div style={{ fontWeight: 700 }}>{v.title}</div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>
              status: {v.status} — <code>{v._id}</code>
            </div>
          </button>
        ))}
      </div>

      {items.length === 0 && !loading ? (
        <div style={{ opacity: 0.7, marginTop: 10 }}>
          Bu topicda video yo‘q — bu ham normal. Keyin o‘qituvchi yuklaydi.
        </div>
      ) : null}
    </div>
  );
}