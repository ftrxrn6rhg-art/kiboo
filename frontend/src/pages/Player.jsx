// frontend/src/pages/Player.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Hls from "hls.js";
import { apiGetMyProgress, apiSendProgress, getApiBase } from "../lib/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getStudentToken() {
  return (
    localStorage.getItem("STUDENT_TOKEN") ||
    localStorage.getItem("token") || // StudentVideosPage shu keyga saqlayapti
    localStorage.getItem("authToken") ||
    ""
  );
}

function safeNumber(n, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

export default function Player() {
  const nav = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [video, setVideo] = useState(null);

  // progress/status
  const [progressLoading, setProgressLoading] = useState(false);
  const [lastSavedSec, setLastSavedSec] = useState(0);
  const [statusText, setStatusText] = useState("");

  const token = useMemo(() => getStudentToken(), []);
  const videoElRef = useRef(null);
  const hlsRef = useRef(null);

  // interval refs
  const saveTimerRef = useRef(null);
  const loadedInitialSeekRef = useRef(false);

  // Agar StudentVideosPage dan state bilan kelsa, shu yerdan olamiz
  const passedHlsUrl = location?.state?.hlsUrl || "";
  const passedTitle = location?.state?.title || "";

  const apiBase = useMemo(() => {
    try {
      return getApiBase?.() || API_BASE;
    } catch {
      return API_BASE;
    }
  }, []);

  async function loadVideo() {
    setErr("");
    setLoading(true);
    try {
      // Video detail: hlsUrl ni olish uchun (token bilan)
      const res = await fetch(`${apiBase}/api/videos/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Video detail error");
      setVideo(data);
    } catch (e) {
      setVideo(null);
      setErr(e.message || "Xato");
    } finally {
      setLoading(false);
    }
  }

  // 1) Video detail (yoki state orqali)
  useEffect(() => {
    if (!id) return;
    setStatusText("");
    setLastSavedSec(0);
    loadedInitialSeekRef.current = false;

    if (passedHlsUrl) {
      setVideo({ _id: id, title: passedTitle || "Video", hlsUrl: passedHlsUrl });
      return;
    }

    loadVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 2) HLS attach + token bilan playlist/segment
  useEffect(() => {
    const v = video;
    if (!v?.hlsUrl) return;

    const videoEl = videoElRef.current;
    if (!videoEl) return;

    // old hls destroy
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch {}
      hlsRef.current = null;
    }

    const hlsSrc = v.hlsUrl.startsWith("http") ? v.hlsUrl : `${apiBase}${v.hlsUrl}`;

    // Safari native HLS: (tokenli protected stream bo'lsa) bu usul ishlamaydi
    // Chunki <video src> bilan Authorization header yuborib bo'lmaydi.
    // Shuning uchun hamma joyda Hls.js ishlatamiz.
    if (!Hls.isSupported()) {
      setErr("Bu brauzer HLS ni qo‘llamaydi (Hls.js support yo‘q).");
      return;
    }

    const hls = new Hls({
      // ✅ tokenni playlist + segment requestlarga qo'shamiz
      xhrSetup: (xhr) => {
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      },
    });

    hlsRef.current = hls;

    hls.loadSource(hlsSrc);
    hls.attachMedia(videoEl);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setErr("");
    });

    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data?.fatal) {
        setErr("HLS xato: video o‘ynamadi (token/segment/playlist muammosi bo‘lishi mumkin).");
        try {
          hls.destroy();
        } catch {}
        hlsRef.current = null;
      }
    });

    return () => {
      try {
        hls.destroy();
      } catch {}
      hlsRef.current = null;
    };
  }, [video, token, apiBase]);

  // 3) Progress: load (resume) + auto-save
  useEffect(() => {
    if (!token || !id) return;
    const videoEl = videoElRef.current;
    if (!videoEl) return;

    setProgressLoading(true);
    setStatusText("Progress yuklanyapti...");

    let cancelled = false;

    async function loadProgressAndSeek() {
      try {
        const data = await apiGetMyProgress(token, id);
        const last = safeNumber(data?.lastPositionSec, 0);

        if (cancelled) return;

        setLastSavedSec(last);

        // initial seek faqat 1 marta
        loadedInitialSeekRef.current = false;

        // metadata tayyor bo'lganda seek qilamiz
        const onLoadedMeta = () => {
          if (loadedInitialSeekRef.current) return;

          // agar oxiriga yaqin bo'lsa, 0 dan boshlaymiz
          const dur = safeNumber(videoEl.duration, 0);
          const shouldRestart = dur > 0 && last >= Math.max(0, dur - 3);

          const target = shouldRestart ? 0 : last;
          if (target > 0) {
            try {
              videoEl.currentTime = target;
              setStatusText(`Davom ettirish: ${Math.floor(target)}s`);
            } catch {
              setStatusText("Davom ettirish xato bo‘ldi (seek).");
            }
          } else {
            setStatusText("Yangi ko‘rish");
          }

          loadedInitialSeekRef.current = true;
        };

        videoEl.addEventListener("loadedmetadata", onLoadedMeta);
        // agar metadata allaqachon bo'lsa:
        if (videoEl.readyState >= 1) onLoadedMeta();

        // cleanup listener keyin
        return () => videoEl.removeEventListener("loadedmetadata", onLoadedMeta);
      } catch (e) {
        if (cancelled) return;
        setStatusText("Progress topilmadi (yangi).");
      } finally {
        if (cancelled) return;
        setProgressLoading(false);
      }
    }

    let removeMetaListener = null;
    loadProgressAndSeek().then((cleanup) => {
      removeMetaListener = cleanup;
    });

    // autosave: har 7s saqlaymiz
    if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    saveTimerRef.current = setInterval(async () => {
      try {
        const t = safeNumber(videoEl.currentTime, 0);
        // 0 bo‘lsa ham saqlamasak ham bo‘ladi, lekin saqlaymiz
        await apiSendProgress(token, id, t);
        setLastSavedSec(t);

        const dur = safeNumber(videoEl.duration, 0);
        if (dur > 0 && t >= Math.max(0, dur - 3)) {
          setStatusText("✅ Ko‘rilgan");
        } else if (t > 0) {
          setStatusText("▶️ Davom etyapti");
        } else {
          setStatusText("Yangi ko‘rish");
        }
      } catch {
        // jim
      }
    }, 7000);

    return () => {
      cancelled = true;
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
      saveTimerRef.current = null;
      if (typeof removeMetaListener === "function") removeMetaListener();
    };
  }, [token, id]);

  // 4) Qo‘lda saqlash tugmasi
  async function saveNow() {
    const videoEl = videoElRef.current;
    if (!videoEl || !token || !id) return;

    try {
      const t = safeNumber(videoEl.currentTime, 0);
      await apiSendProgress(token, id, t);
      setLastSavedSec(t);
      setStatusText("✅ Saqlandi");
    } catch (e) {
      setErr(e?.message || "Saqlashda xato");
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 980, margin: "0 auto", color: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>KIBOO — Player</h2>
          <div style={{ opacity: 0.75, fontSize: 12 }}>
            videoId: <code>{id}</code>
          </div>
          <div style={{ opacity: 0.75, fontSize: 12 }}>
            Status:{" "}
            <span style={{ fontWeight: 700 }}>
              {statusText || (progressLoading ? "..." : "")}
            </span>
            {lastSavedSec ? (
              <span style={{ marginLeft: 8, opacity: 0.8 }}>
                (last: {Math.floor(lastSavedSec)}s)
              </span>
            ) : null}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button onClick={() => nav(-1)}>⬅️ Back</button>
          <button onClick={loadVideo} disabled={loading}>
            {loading ? "..." : "Reload"}
          </button>
          <button onClick={saveNow} disabled={!token}>
            Save now
          </button>
        </div>
      </div>

      <div style={{ marginTop: 10, opacity: 0.9 }}>
        {loading ? "Yuklanyapti..." : video?.title ? `🎬 ${video.title}` : ""}
      </div>

      {!token ? (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 12,
            border: "1px solid rgba(255,170,0,0.35)",
            background: "rgba(255,170,0,0.12)",
          }}
        >
          Token yo‘q. Student tokenni localStorage ga saqlang (key: <code>token</code> yoki{" "}
          <code>STUDENT_TOKEN</code>).
        </div>
      ) : null}

      {err ? (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 12,
            border: "1px solid rgba(255,70,70,0.35)",
            background: "rgba(255,70,70,0.12)",
            whiteSpace: "pre-wrap",
          }}
        >
          {err}
        </div>
      ) : null}

      <div
        style={{
          marginTop: 12,
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(0,0,0,0.35)",
        }}
      >
        <video ref={videoElRef} controls playsInline style={{ width: "100%", height: "auto", display: "block" }} />
      </div>

      <div style={{ marginTop: 10, opacity: 0.65, fontSize: 12 }}>
        API: <code>{apiBase}</code>
      </div>
      <div style={{ marginTop: 6, opacity: 0.65, fontSize: 12 }}>
        HLS: {video?.hlsUrl ? <code>{video.hlsUrl}</code> : "yo‘q"}
      </div>
      <div style={{ marginTop: 6, opacity: 0.65, fontSize: 12 }}>
        Eslatma: tokenli protected HLS uchun Player <b>Hls.js</b> orqali Authorization header yuboradi.
      </div>
    </div>
  );
}