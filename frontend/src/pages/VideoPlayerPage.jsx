// frontend/src/pages/VideoPlayerPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Hls from "hls.js";

function apiOrigin() {
  // Vite env bo‘lsa ishlatadi, bo‘lmasa localhost
  return import.meta?.env?.VITE_API_URL || "http://localhost:3000";
}

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("STUDENT_TOKEN") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

export default function VideoPlayerPage() {
  const nav = useNavigate();
  const { id } = useParams();

  const token = useMemo(() => getToken(), []);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [err, setErr] = useState("");
  const [meta, setMeta] = useState(null); // video detail

  const streamUrl = useMemo(() => {
    if (!id) return "";
    if (!token) return `${apiOrigin()}/api/videos/${id}/stream`; // token bo‘lmasa ham ko‘rsatadi (ammo backend block qilishi mumkin)
    return `${apiOrigin()}/api/videos/${id}/stream?token=${encodeURIComponent(token)}`;
  }, [id, token]);

  const canNativeHls = useMemo(() => {
    const v = document.createElement("video");
    return v.canPlayType("application/vnd.apple.mpegurl") !== "";
  }, []);

  // 1) Video detail (title chiqarish uchun)
  useEffect(() => {
    let alive = true;

    async function loadMeta() {
      setMeta(null);
      if (!id) return;

      try {
        const res = await fetch(`${apiOrigin()}/api/videos/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Video detail error");

        if (!alive) return;
        setMeta(data?.video || data || null);
      } catch (e) {
        if (!alive) return;
        // meta bo‘lmasa ham player ishlashi kerak
        setMeta(null);
      }
    }

    loadMeta();
    return () => {
      alive = false;
    };
  }, [id, token]);

  // 2) Player init (Hls.js yoki native)
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !id) return;

    setErr("");
    setStatus("loading");

    // cleanup old
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch {}
      hlsRef.current = null;
    }

    // token yo‘q bo‘lsa ham url bor, lekin backend protect bo‘lsa error chiqadi
    const playlistUrl = streamUrl;

    function onLoaded() {
      setStatus("ready");
    }
    function onError() {
      setStatus("error");
      setErr("Video yuklashda xato. Token yoki stream URL tekshiring.");
    }

    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("canplay", onLoaded);
    v.addEventListener("error", onError);

    // Native HLS (Safari/iOS)
    if (canNativeHls) {
      v.src = playlistUrl;
      v.load();
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hlsRef.current = hls;
      hls.attachMedia(v);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        try {
          hls.loadSource(playlistUrl);
        } catch (e) {
          setStatus("error");
          setErr("HLS loadSource error: " + (e?.message || String(e)));
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data) return;

        // fatal bo‘lsa qayta tiklash
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            try {
              hls.startLoad();
            } catch {}
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            try {
              hls.recoverMediaError();
            } catch {}
          } else {
            setStatus("error");
            setErr("HLS fatal error: " + (data?.details || "unknown"));
            try {
              hls.destroy();
            } catch {}
            hlsRef.current = null;
          }
        }
      });
    } else {
      // very old browser fallback
      v.src = playlistUrl;
      v.load();
    }

    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("canplay", onLoaded);
      v.removeEventListener("error", onError);

      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch {}
        hlsRef.current = null;
      }
    };
  }, [id, streamUrl, canNativeHls]);

  // 3) Progress: har 5 sekundda PATCH /api/progress/videos/:id/position
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !id || !token) return;

    let lastSent = 0;
    let timer = null;

    async function sendPosition(posSec) {
      try {
        await fetch(`${apiOrigin()}/api/progress/videos/${id}/position`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ lastPositionSec: Number(posSec || 0) }),
        });
      } catch {
        // ignore
      }
    }

    function tick() {
      const now = Date.now();
      if (now - lastSent < 5000) return;
      lastSent = now;
      sendPosition(v.currentTime || 0);
    }

    timer = setInterval(tick, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [id, token]);

  // 4) Video tugasa: POST /api/progress/videos/:id/completed
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    let sent = false;

    async function markCompleted() {
      if (!token || !id) return;
      try {
        await fetch(`${apiOrigin()}/api/progress/videos/${id}/completed`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {}
    }

    function onEnded() {
      if (sent) return;
      sent = true;
      markCompleted();
    }

    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("ended", onEnded);
    };
  }, [id, token]);


  // UI
  const ui = useMemo(
    () => ({
      bg:
        "radial-gradient(1200px 700px at 20% 0%, rgba(137,77,255,0.35), transparent 60%), radial-gradient(900px 600px at 90% 10%, rgba(89,168,255,0.25), transparent 55%), #060912",
      card: "rgba(255,255,255,0.06)",
      card2: "rgba(255,255,255,0.08)",
      border: "rgba(255,255,255,0.10)",
      text: "rgba(255,255,255,0.92)",
      muted: "rgba(255,255,255,0.60)",
      soft: "rgba(255,255,255,0.04)",
    }),
    []
  );

  const title =
    meta?.title || meta?.name || `Video: ${String(id || "").slice(0, 8)}...`;

  return (
    <div style={{ minHeight: "100vh", background: ui.bg, color: ui.text }}>
      {/* Top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(16px)",
          background: "rgba(6,9,18,0.70)",
          borderBottom: `1px solid ${ui.border}`,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 12, letterSpacing: 3, color: ui.muted }}>
              KIBOO • VIDEO PLAYER
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>
              {title}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={() => nav("/student", { replace: true })}
              style={{
                padding: "10px 12px",
                borderRadius: 14,
                border: `1px solid ${ui.border}`,
                background: ui.card,
                color: ui.text,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ← Student
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px" }}>
        {/* Player card */}
        <div
          style={{
            border: `1px solid ${ui.border}`,
            background: ui.card,
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              padding: 14,
              borderBottom: `1px solid ${ui.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div
                style={{
                  height: 10,
                  width: 10,
                  borderRadius: 999,
                  background:
                    status === "ready"
                      ? "rgba(65,209,125,0.9)"
                      : status === "loading"
                      ? "rgba(255,214,102,0.9)"
                      : status === "error"
                      ? "rgba(255,90,90,0.9)"
                      : "rgba(255,255,255,0.3)",
                }}
              />
              <div style={{ fontSize: 13, color: ui.muted }}>
                {status === "loading"
                  ? "Yuklanmoqda…"
                  : status === "ready"
                  ? "Tayyor ✅"
                  : status === "error"
                  ? "Xato ❌"
                  : "…"}
              </div>
            </div>

            <div style={{ fontSize: 12, color: ui.muted }}>
              Stream: <span style={{ color: ui.text, fontWeight: 700 }}>query-token</span>
            </div>
          </div>

          <div style={{ background: "#000" }}>
            <video
              ref={videoRef}
              controls
              playsInline
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                background: "#000",
              }}
            />
          </div>
        </div>

        {/* Error */}
        {err ? (
          <div
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 18,
              border: `1px solid rgba(255,90,90,0.35)`,
              background: "rgba(255,90,90,0.10)",
              color: "rgba(255,255,255,0.90)",
            }}
          >
            <div style={{ fontWeight: 900 }}>Xato</div>
            <div style={{ marginTop: 6, color: ui.muted, fontSize: 13 }}>{err}</div>
            <div style={{ marginTop: 10, fontSize: 12, color: ui.muted }}>
              Tekshiruv: <code>{streamUrl}</code>
            </div>
          </div>
        ) : null}

        {/* Info panel */}
        <div
          style={{
            marginTop: 14,
            border: `1px solid ${ui.border}`,
            background: ui.soft,
            borderRadius: 18,
            padding: 14,
          }}
        >
          <div style={{ fontWeight: 900 }}>Debug (foydali)</div>
          <div style={{ marginTop: 8, color: ui.muted, fontSize: 13, lineHeight: 1.5 }}>
            <div>
              • Token:{" "}
              <span style={{ color: ui.text, fontWeight: 800 }}>
                {token ? "bor ✅" : "yo‘q ❌"}
              </span>
            </div>
            <div>
              • Native HLS:{" "}
              <span style={{ color: ui.text, fontWeight: 800 }}>
                {canNativeHls ? "ha" : "yo‘q (Hls.js)"}
              </span>
            </div>
            <div style={{ marginTop: 6 }}>
              • Playlist URL: <code>{streamUrl}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}