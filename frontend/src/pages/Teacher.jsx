import React, { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { getApiBase } from "../lib/api";

/* =========================================
   KIBOO — Teacher Panel (stable)
   Tabs: Videolar / Test-Topshiriq / Profil
   Backend routes (confirmed):
   - POST   /api/videos/upload      (form-data: video, title, topicId)
   - GET    /api/subjects
   - GET    /api/topics?subjectId=&grade=
   - GET    /api/teachers/me
   - PUT    /api/teachers/me
   - POST   /api/teachers/me/avatar (form-data: avatar)
   - POST   /api/assignments        (json: title, description, topicId, subjectId, grade, status)
   ========================================= */

const API_BASE = getApiBase();

function getToken() {
  return localStorage.getItem("TEACHER_TOKEN") || localStorage.getItem("token") || "";
}

async function apiFetch(path, { token, method = "GET", body, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data && data.message) ||
      (typeof data === "string" ? data : "") ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

async function tryApiFetch(paths, opts) {
  let lastErr = null;
  for (const p of paths) {
    try {
      return await apiFetch(p, opts);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Request failed");
}

function normalizeUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return `${API_BASE}/${url}`;
}

function fmtDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

export default function Teacher() {
  const [token] = useState(getToken());

  /* ---------------- UI (same design) ---------------- */
  const ui = useMemo(() => {
    return {
      bg: "#0A0B12",
      text: "rgba(255,255,255,0.94)",
      sub: "rgba(255,255,255,0.72)",
      sub2: "rgba(255,255,255,0.55)",
      border: "rgba(255,255,255,0.14)",
      border2: "rgba(255,255,255,0.28)",
      card: "rgba(255,255,255,0.08)",
      card2: "rgba(255,255,255,0.04)",
      shadow: "0 28px 90px rgba(0,0,0,0.55)",
      r: 24,
      r2: 18,
      font:
        '-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","SF Pro",system-ui,Segoe UI,Arial,sans-serif',
      accent: "#8AB4FF",
      accent2: "#FFB86B",
      mint: "#6EE7B7",
      red: "#FF3B30",
      green: "#22C55E",
      yellow: "#FFD29A",
      cocoa: "#442D1C",
      wine: "#743014",
      caramel: "#84592B",
      olive: "#9D9167",
      butter: "#E8D1A7",
    };
  }, []);

  const Card = ({ children, style }) => (
    <div
      style={{
        background: `linear-gradient(180deg, ${ui.card}, rgba(0,0,0,0.25))`,
        border: `1px solid ${ui.border}`,
        borderRadius: ui.r,
        boxShadow: ui.shadow,
        padding: 18,
        backdropFilter: "blur(18px)",
        ...style,
      }}
    >
      {children}
    </div>
  );

  const SubCard = ({ children, style }) => (
    <div
      style={{
        background: ui.card2,
        border: `1px solid ${ui.border}`,
        borderRadius: ui.r2,
        padding: 14,
        ...style,
      }}
    >
      {children}
    </div>
  );

  const Btn = ({ children, variant = "ghost", disabled, style, ...rest }) => {
    const base = {
      appearance: "none",
      border: "none",
      outline: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      padding: "10px 14px",
      borderRadius: 16,
      fontWeight: 950,
      fontSize: 13,
      color: ui.text,
      background: "rgba(255,255,255,0.10)",
      borderTop: "1px solid rgba(255,255,255,0.18)",
      borderLeft: "1px solid rgba(255,255,255,0.12)",
      borderRight: "1px solid rgba(0,0,0,0.25)",
      borderBottom: "1px solid rgba(0,0,0,0.35)",
      transition: "transform 120ms ease, filter 120ms ease, opacity 120ms ease",
      opacity: disabled ? 0.55 : 1,
      userSelect: "none",
      boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
    };

    const variants = {
      ghost: { background: "rgba(255,255,255,0.06)" },
      primary: {
        background: `linear-gradient(135deg, ${ui.accent} 0%, ${ui.accent2} 100%)`,
        color: "#0B0E16",
        filter: "saturate(1.05)",
      },
      cocoa: {
        background: `linear-gradient(135deg, ${ui.cocoa} 0%, ${ui.caramel} 60%, ${ui.butter} 140%)`,
        color: "rgba(255,255,255,0.92)",
      },
      good: {
        background: `linear-gradient(135deg, ${ui.green} 0%, ${ui.yellow} 140%)`,
        color: "#08120B",
      },
      danger: {
        background: `linear-gradient(135deg, ${ui.red} 0%, ${ui.accent2} 100%)`,
        color: "#140006",
      },
    };

    return (
      <button
        disabled={disabled}
        {...rest}
        style={{ ...base, ...(variants[variant] || variants.ghost), ...style }}
        onMouseDown={(e) => {
          if (disabled) return;
          e.currentTarget.style.transform = "translateY(1px)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "translateY(0px)";
        }}
      >
        {children}
      </button>
    );
  };

  const Input = (props) => (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 16,
        border: `1px solid ${ui.border}`,
        background: "rgba(255,255,255,0.06)",
        color: ui.text,
        outline: "none",
        fontSize: 13,
        ...props.style,
      }}
    />
  );

  const Textarea = (props) => (
    <textarea
      {...props}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 16,
        border: `1px solid ${ui.border}`,
        background: "rgba(255,255,255,0.06)",
        color: ui.text,
        outline: "none",
        fontSize: 13,
        minHeight: 92,
        resize: "vertical",
        ...props.style,
      }}
    />
  );

  const Select = (props) => (
    <select
      {...props}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 16,
        border: `1px solid ${ui.border}`,
        background: "rgba(255,255,255,0.06)",
        color: ui.text,
        outline: "none",
        fontSize: 13,
        ...props.style,
      }}
    />
  );

  const Divider = () => <div style={{ height: 1, background: ui.border, margin: "12px 0" }} />;

  const Chip = ({ children, tone = "neutral" }) => {
    const tones = {
      neutral: { bg: "rgba(255,255,255,0.08)", bd: ui.border, tx: ui.text },
      ok: { bg: "rgba(34,197,94,0.14)", bd: "rgba(34,197,94,0.30)", tx: "rgba(210,255,230,0.98)" },
      warn: { bg: "rgba(255,212,0,0.14)", bd: "rgba(255,212,0,0.32)", tx: "rgba(255,248,214,0.98)" },
      pink: { bg: "rgba(138,180,255,0.18)", bd: "rgba(138,180,255,0.35)", tx: "rgba(240,246,255,0.98)" },
      red: { bg: "rgba(255,59,94,0.14)", bd: "rgba(255,59,94,0.28)", tx: "rgba(255,220,230,0.98)" },
    };
    const t = tones[tone] || tones.neutral;
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 999,
          border: `1px solid ${t.bd}`,
          background: t.bg,
          color: t.tx,
          fontSize: 12,
          fontWeight: 950,
        }}
      >
        {children}
      </span>
    );
  };

  /* ---------------- state ---------------- */
  const [tab, setTab] = useState("videos"); // videos | tasks | profile
  const [message, setMessage] = useState("");

  // selection (videos + tasks)
  const [grade, setGrade] = useState(6);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [topics, setTopics] = useState([]);
  const [topicId, setTopicId] = useState("");

  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // VIDEOS
  const [videoTitle, setVideoTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [myVideos, setMyVideos] = useState([]);
  const [loadingMyVideos, setLoadingMyVideos] = useState(false);

  // Player (preview)
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  // TASKS (Assignments)
  const [testTitle, setTestTitle] = useState("");
  const [testDesc, setTestDesc] = useState("");
  const [taskType, setTaskType] = useState("test");
  const [taskFile, setTaskFile] = useState(null);
  const [formula, setFormula] = useState("");
  const [creatingTest, setCreatingTest] = useState(false);
  const [myTests, setMyTests] = useState([]);
  const [loadingMyTests, setLoadingMyTests] = useState(false);

  // PROFILE
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(false);

  // IMPORTANT: focus bug fix — inputs are controlled ONLY by these states
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [achievements, setAchievements] = useState("");

  const [savingMe, setSavingMe] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [teacherGoal, setTeacherGoal] = useState(() => {
    try {
      return localStorage.getItem("KIBOO_TEACHER_GOAL") || "";
    } catch {
      return "";
    }
  });
  const [savingGoal, setSavingGoal] = useState(false);

  // Certificates (PDF) — backend route may need to be added later
  const [certPdf, setCertPdf] = useState(null);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [certList, setCertList] = useState([]); // if backend returns

  const subjectLabel = (s) => s?.name || s?.title || "—";
  const topicLabel = (t) => t?.title || t?.name || "—";
  const topicNameFor = (item) => {
    const direct =
      item?.topic?.title ||
      item?.topic?.name ||
      item?.topicTitle ||
      item?.topicName;
    if (direct) return direct;
    const id = String(item?.topicId || item?.topic || "");
    const fromList = (topics || []).find((t) => String(t?._id) === id);
    return fromList?.title || fromList?.name || "—";
  };
  const approvalStatus = me?.teacherApprovalStatus || "pending";
  const canUpload = approvalStatus === "approved";
  const approvalLabel =
    approvalStatus === "approved"
      ? "Tasdiq: aktiv"
      : approvalStatus === "rejected"
      ? "Rad etildi"
      : "Tasdiq kutilmoqda";
  const hasVideoForTopic = useMemo(() => {
    const tid = String(topicId || "");
    return (myVideos || []).some((v) => String(v?.topic || v?.topicId || "") === tid);
  }, [myVideos, topicId]);
  const videoLikes = useMemo(() => {
    return (myVideos || []).reduce((sum, v) => sum + Number(v?.likeCount || v?.likes?.length || 0), 0);
  }, [myVideos]);
  const testLikes = useMemo(() => {
    return (myTests || []).reduce((sum, t) => sum + Number(t?.likeCount || t?.likes?.length || 0), 0);
  }, [myTests]);
  const totalViews = useMemo(() => {
    return (myVideos || []).reduce(
      (sum, v) => sum + Number(v?.viewCount || v?.views || v?.watchCount || 0),
      0
    );
  }, [myVideos]);
  const totalEarnings = useMemo(() => {
    return (myVideos || []).reduce(
      (sum, v) => sum + Number(v?.earnings || v?.income || 0),
      0
    );
  }, [myVideos]);
  const uploadSteps = [
    { key: "subject", label: "1-qadam", title: "Fan tanlash", done: !!subjectId },
    { key: "grade", label: "2-qadam", title: "Sinf tanlash", done: !!grade },
    { key: "topic", label: "3-qadam", title: "Mavzu tanlash", done: !!topicId },
    { key: "video", label: "4-qadam", title: "Video yuklash", done: !!videoFile },
  ];

  /* ---------------- load data ---------------- */
  async function loadSubjects() {
    if (!token) return;
    try {
      setLoadingSubjects(true);
      const res = await tryApiFetch(["/api/subjects"], { token });
      const list = res?.subjects ?? res?.items ?? res ?? [];
      const arr = Array.isArray(list) ? list : [];
      setSubjects(arr);
      if (!subjectId && arr[0]?._id) setSubjectId(String(arr[0]._id));
    } catch (e) {
      setSubjects([]);
      setMessage("❌ Fanlar: " + (e?.message || "xato"));
    } finally {
      setLoadingSubjects(false);
    }
  }

  const loadTopics = React.useCallback(async () => {
    if (!token || !subjectId) return;
    try {
      setLoadingTopics(true);
      setTopics([]);
      setTopicId("");
      const g = Number(grade) || 6;

      const res = await tryApiFetch(
        [
          `/api/topics?subjectId=${encodeURIComponent(subjectId)}&grade=${encodeURIComponent(g)}`,
          `/api/topics/bySubjectGrade?subjectId=${encodeURIComponent(subjectId)}&grade=${encodeURIComponent(g)}`,
          `/api/subjects/${encodeURIComponent(subjectId)}/topics?grade=${encodeURIComponent(g)}`,
        ],
        { token }
      );

      const list = res?.topics ?? res?.items ?? res ?? [];
      const arr = Array.isArray(list) ? list : [];
      setTopics(arr);
      if (arr[0]?._id) setTopicId(String(arr[0]._id));
    } catch (e) {
      setTopics([]);
      setMessage("❌ Mavzular: " + (e?.message || "xato"));
    } finally {
      setLoadingTopics(false);
    }
  }, [grade, subjectId, token]);

  async function loadMyVideos() {
    if (!token) return;
    try {
      setLoadingMyVideos(true);
      const res = await tryApiFetch(
        [
          "/api/teachers/videos",
          "/api/videos/mine",
          "/api/videos?mine=1",
          "/api/videos/my",
        ],
        { token }
      );
      const list = res?.videos ?? res?.items ?? res ?? [];
      setMyVideos(Array.isArray(list) ? list : []);
    } catch {
      setMyVideos([]);
      // videolar history bo'sh bo'lsa ham UI ishlasin
    } finally {
      setLoadingMyVideos(false);
    }
  }

  async function loadMyTests() {
    if (!token) return;
    try {
      setLoadingMyTests(true);
      const res = await tryApiFetch(
        ["/api/assignments/teacher"],
        { token }
      );
      const list = res?.assignments ?? res?.items ?? res ?? [];
      setMyTests(Array.isArray(list) ? list : []);
    } catch {
      setMyTests([]);
    } finally {
      setLoadingMyTests(false);
    }
  }

  async function deleteTestById(testId) {
    if (!token || !testId) return;
    const ok = window.confirm("Rostan ham testni o‘chirasizmi?");
    if (!ok) return;

    try {
      setMessage("");
      await apiFetch("/api/assignments/teacher/" + encodeURIComponent(String(testId)), {
        token,
        method: "DELETE",
      });
      setMessage("✅ Test o‘chirildi");
      await loadMyTests();
    } catch (e) {
      setMessage("❌ Delete: " + (e?.message || "xato"));
    }
  }

  // ✅ video rename
  async function renameVideo(videoId, currentTitle) {
    if (!token || !videoId) return;

    const nextTitle = window.prompt("Yangi video nomi:", String(currentTitle || ""));
    if (nextTitle == null) return;

    const trimmed = String(nextTitle).trim();
    if (!trimmed) return setMessage("❌ Video nomi bo‘sh bo‘lmasin");

    try {
      setMessage("");

      await apiFetch("/api/videos/" + encodeURIComponent(String(videoId)), {
        token,
        method: "PATCH",
        body: { title: trimmed },
      });

      await loadMyVideos();
      setMessage("✅ Video nomi yangilandi");
    } catch (e) {
      setMessage("❌ Edit: " + (e?.message || "xato"));
    }
  }

  // ✅ video delete
  async function deleteVideoById(videoId) {
    if (!token || !videoId) return;

    const ok = window.confirm("Rostan ham o‘chirasizmi?");
    if (!ok) return;

    try {
      setMessage("");

      await apiFetch("/api/videos/" + encodeURIComponent(String(videoId)), {
        token,
        method: "DELETE",
      });

      await loadMyVideos();
      setMessage("✅ Video o‘chirildi");
    } catch (e) {
      setMessage("❌ Delete: " + (e?.message || "xato"));
    }
  }

  async function loadMe() {
    if (!token) return;
    try {
      setLoadingMe(true);
      const res = await tryApiFetch(["/api/teachers/me"], { token });
      const u = res?.teacher ?? res?.user ?? res;
      setMe(u || null);

      // set once on load (fix "1 harf yozib qaytib kirish" bug)
      setName(u?.name || "");
      setBio(u?.bio || u?.about || "");
      setAchievements(u?.achievements || "");
      setCertList(Array.isArray(u?.certificates) ? u.certificates : []);
    } catch (e) {
      setMe(null);
      setMessage("❌ Profil: " + (e?.message || "xato"));
    } finally {
      setLoadingMe(false);
    }
  }

  /* ---------------- player helpers ---------------- */
  function destroyPlayer() {
    try {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    } catch {
      // ignore player destroy errors
    }
    try {
      if (videoRef.current) videoRef.current.pause();
    } catch {
      // ignore native player pause errors
    }
  }

  function pickHlsUrl(v) {
    const raw =
      v?.hlsMasterUrl ||
      v?.hlsUrl ||
      v?.hls?.masterUrl ||
      v?.hls?.url ||
      v?.playlistUrl ||
      v?.url ||
      v?.hlsPath ||
      "";
    return normalizeUrl(raw);
  }

  function openPlayer(url) {
    if (!url || !videoRef.current) return;
    destroyPlayer();

    const el = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(el);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        el.play().catch(() => {});
      });
      return;
    }

    el.src = url;
    el.play().catch(() => {});
  }

  /* ---------------- actions (WORKING) ---------------- */
  async function uploadVideo() {
    if (!token) return;
    if (!canUpload) return setMessage("❌ Avval sertifikat yuklang va tasdiqni kuting");
    if (!subjectId) return setMessage("❌ Fan tanlang");
    if (!topicId) return setMessage("❌ Mavzu tanlang");
    if (!videoFile) return setMessage("❌ Video tanlang");

    try {
      setUploadingVideo(true);
      setMessage("");

      const fd = new FormData();

      // ✅ BACKEND EXPECTS: upload.single("video")
      fd.append("video", videoFile);

      // ✅ controller expects: title, topicId
      fd.append("title", (videoTitle || "").trim() || "Video dars");
      fd.append("topicId", String(topicId));

      // (optional) extra fields – harmless
      fd.append("subjectId", String(subjectId));
      fd.append("grade", String(grade));

      await apiFetch("/api/videos/upload", { token, method: "POST", body: fd, isForm: true });

      setMessage("✅ Video yuklandi");
      setVideoTitle("");
      setVideoFile(null);
      await loadMyVideos();
    } catch (e) {
      setMessage("❌ Upload: " + (e?.message || "xato"));
    } finally {
      setUploadingVideo(false);
    }
  }

  async function createTest() {
    if (!token) return;
    if (!canUpload) return setMessage("❌ Avval sertifikat yuklang va tasdiqni kuting");
    if (!subjectId) return setMessage("❌ Fan tanlang");
    if (!topicId) return setMessage("❌ Mavzu tanlang");
    if (!testTitle.trim()) return setMessage("❌ Test nomini yozing");
    if (!hasVideoForTopic) return setMessage("❌ Avval shu mavzu bo‘yicha video yuklang");

    try {
      setCreatingTest(true);
      setMessage("");

      const extra = [
        taskType ? `Turi: ${taskType}` : "",
        formula ? `Formula (LaTeX): ${formula}` : "",
        taskFile ? `Fayl: ${taskFile.name}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      // ✅ student will fetch by topicId -> must be stored
      const payload = {
        title: testTitle.trim(),
        description: [String(testDesc || "").trim(), extra].filter(Boolean).join("\n"),
        subjectId: String(subjectId),
        topicId: String(topicId),
        topic: String(topicId), // fallback if backend uses "topic"
        grade: Number(grade) || 6,
        status: "published",
        type: taskType === "test" ? "quiz" : "file",
      };

      const res = await tryApiFetch(["/api/assignments/teacher"], { token, method: "POST", body: payload });

      const assignmentId = res?.assignment?._id || res?.assignmentId || "";
      if (assignmentId && taskFile) {
        const fd = new FormData();
        fd.append("file", taskFile);
        await apiFetch(`/api/assignments/teacher/${encodeURIComponent(String(assignmentId))}/file`, {
          token,
          method: "POST",
          body: fd,
          isForm: true,
        });
      }

      setMessage("✅ Test saqlandi");
      setTestTitle("");
      setTestDesc("");
      setTaskFile(null);
      setFormula("");
      await loadMyTests();
    } catch (e) {
      setMessage("❌ Test: " + (e?.message || "xato"));
    } finally {
      setCreatingTest(false);
    }
  }

  async function saveMe() {
    if (!token) return;
    try {
      setSavingMe(true);
      setMessage("");

      const payload = {
        name: (name || "").trim(),
        bio: bio || "",
        achievements: achievements || "",
      };

      // ✅ backend route is PUT /api/teachers/me
      await apiFetch("/api/teachers/me", { token, method: "PUT", body: payload });

      setMessage("✅ Profil saqlandi");
      await loadMe();
    } catch (e) {
      setMessage("❌ Save: " + (e?.message || "xato"));
    } finally {
      setSavingMe(false);
    }
  }

  async function saveTeacherGoal() {
    try {
      setSavingGoal(true);
      localStorage.setItem("KIBOO_TEACHER_GOAL", teacherGoal || "");
      setMessage("✅ Oliy maqsad saqlandi");
    } catch (e) {
      setMessage("❌ Maqsad: " + (e?.message || "xato"));
    } finally {
      setSavingGoal(false);
    }
  }

  async function uploadAvatar() {
    if (!token) return;
    if (!avatarFile) return setMessage("❌ Rasm tanlang");

    try {
      setUploadingAvatar(true);
      setMessage("");

      const fd = new FormData();

      // ✅ backend expects: upload.single("avatar")
      fd.append("avatar", avatarFile);

      await apiFetch("/api/teachers/me/avatar", { token, method: "POST", body: fd, isForm: true });

      setMessage("✅ Avatar yuklandi");
      setAvatarFile(null);
      await loadMe();
    } catch (e) {
      setMessage("❌ Avatar: " + (e?.message || "xato"));
    } finally {
      setUploadingAvatar(false);
    }
  }

  // Certificates PDF (if backend route exists)
  async function uploadCertificatePdf() {
    if (!token) return;
    if (!certPdf) return setMessage("❌ PDF tanlang");
    try {
      setUploadingCert(true);
      setMessage("");

      const fd = new FormData();
      fd.append("certificate", certPdf);
      fd.append("pdf", certPdf);
      fd.append("file", certPdf);

      // If your backend doesn't have this yet -> will show "route topilmadi"
      await tryApiFetch(
        ["/api/teachers/me/certificates", "/api/teachers/me/certificate", "/api/teachers/me/docs"],
        { token, method: "POST", body: fd, isForm: true }
      );

      setMessage("✅ Sertifikat yuklandi");
      setCertPdf(null);
      await loadMe();
    } catch (e) {
      setMessage("❌ Sertifikat: " + (e?.message || "route yo‘q"));
    } finally {
      setUploadingCert(false);
    }
  }

  // PART 1/3 shu yerda tugaydi — render + effects keyingi qismda.  /* ---------------- effects ---------------- */
  useEffect(() => {
    if (!token) return;
    (async () => {
      await loadSubjects();
      await loadMe();
      await loadMyVideos();
      await loadMyTests();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (!subjectId) return;
    loadTopics();
  }, [subjectId, grade, token]);

  useEffect(() => {
    return () => destroyPlayer();
  }, []);

  const topBtn = (active) => ({
    padding: "10px 16px",
    borderRadius: 999,
    fontWeight: 950,
    background: active
      ? "linear-gradient(135deg, rgba(138,180,255,0.25), rgba(255,184,107,0.18))"
      : "rgba(255,255,255,0.06)",
    border: `1px solid ${active ? "rgba(255,255,255,0.24)" : ui.border}`,
  });

  const SectionTitle = ({ children }) => (
    <div style={{ fontSize: 18, fontWeight: 1000, letterSpacing: -0.2 }}>{children}</div>
  );

  /* =========================
     Render
     ========================= */
  return (
    <div style={{ minHeight: "100vh", background: ui.bg, color: ui.text, fontFamily: ui.font }}>
      <style>{`@keyframes kibooSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(1100px 650px at 18% 10%, rgba(138,180,255,0.16), transparent 60%),
            radial-gradient(900px 600px at 85% 16%, rgba(255,184,107,0.12), transparent 55%),
            radial-gradient(1000px 700px at 55% 95%, rgba(110,231,183,0.10), transparent 60%),
            radial-gradient(900px 650px at 30% 85%, rgba(232,209,167,0.08), transparent 55%)
          `,
        }}
      />

      <div style={{ position: "relative", maxWidth: 1240, margin: "0 auto", padding: "28px 16px 70px" }}>
        {/* TOP BAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div
            style={{
              fontSize: 46,
              fontWeight: 1000,
              letterSpacing: -1.4,
              lineHeight: 0.95,
              background: `linear-gradient(90deg, ${ui.accent}, ${ui.accent2}, ${ui.mint})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow: "0 18px 60px rgba(0,0,0,0.35)",
            }}
          >
            KIBOO
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Btn style={topBtn(tab === "videos")} onClick={() => setTab("videos")}>
              Videolar
            </Btn>
            <Btn style={topBtn(tab === "tasks")} onClick={() => setTab("tasks")}>
              Test / Topshiriq
            </Btn>
            <Btn style={topBtn(tab === "profile")} onClick={() => setTab("profile")}>
              Profil
            </Btn>
          </div>
        </div>

        {message ? (
          <div style={{ marginBottom: 12 }}>
            <Card>
              <div style={{ fontSize: 13, color: ui.text }}>{message}</div>
            </Card>
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, alignItems: "start" }}>
          {/* LEFT */}
          <div style={{ display: "grid", gap: 14 }}>
            {/* VIDEOS TAB */}
            {tab === "videos" ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  <Card style={{ padding: 20 }}>
                    <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 8 }}>Ko‘rishlar</div>
                    <div style={{ fontSize: 34, fontWeight: 1000 }}>{totalViews.toLocaleString("ru-RU")}</div>
                  </Card>
                  <Card style={{ padding: 20 }}>
                    <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 8 }}>Layklar</div>
                    <div style={{ fontSize: 34, fontWeight: 1000 }}>{(videoLikes + testLikes).toLocaleString("ru-RU")}</div>
                  </Card>
                  <Card style={{ padding: 20 }}>
                    <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 8 }}>Daromad</div>
                    <div style={{ fontSize: 34, fontWeight: 1000 }}>{totalEarnings.toLocaleString("ru-RU")} so‘m</div>
                  </Card>
                </div>

                <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <SectionTitle>VIDEO YUKLASH</SectionTitle>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {loadingSubjects ? <Chip tone="warn">Fanlar yuklanmoqda...</Chip> : null}
                      <Chip tone="pink">Qadam-baqadam yuklash</Chip>
                    </div>
                  </div>

                  <Divider />

                  <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                      {uploadSteps.map((step) => (
                        <SubCard key={step.key} style={{ display: "grid", gap: 4 }}>
                          <div style={{ color: ui.sub2, fontSize: 11 }}>{step.label}</div>
                          <div style={{ fontWeight: 1000 }}>{step.title}</div>
                          <Chip tone={step.done ? "ok" : "neutral"}>{step.done ? "Tayyor" : "Kutilyapti"}</Chip>
                        </SubCard>
                      ))}
                    </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                      <div>
                        <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Fan</div>
                        <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                          {subjects.map((s) => (
                            <option key={s._id} value={s._id}>
                              {subjectLabel(s)}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div>
                        <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Sinf</div>
                        <Select value={grade} onChange={(e) => setGrade(Number(e.target.value) || 6)}>
                          {[5, 6, 7, 8, 9, 10, 11].map((g) => (
                            <option key={g} value={g}>
                              {g}-sinf
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    <div>
                      <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>
                        Mavzu {loadingTopics ? "(yuklanmoqda…)" : ""}
                      </div>
                      <Select value={topicId} onChange={(e) => setTopicId(e.target.value)} disabled={!topics.length}>
                        {topics.length ? (
                          topics.map((t) => (
                            <option key={t._id} value={t._id}>
                              {topicLabel(t)}
                            </option>
                          ))
                        ) : (
                          <option value="">Mavzu yo‘q</option>
                        )}
                      </Select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                      <div>
                        <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Video nomi</div>
                        <Input
                          value={videoTitle}
                          onChange={(e) => setVideoTitle(e.target.value)}
                          placeholder="Masalan: Isomov.A — Fizika 6-sinf — Mexanik harakat nima?"
                        />
                      </div>

                      <div>
                        <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Video fayl</div>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <Btn
                        variant="primary"
                        onClick={uploadVideo}
                        disabled={uploadingVideo || !videoFile || !canUpload}
                      >
                        {uploadingVideo ? "..." : "Video yuklash"}
                      </Btn>
                      {approvalStatus === "approved" ? (
                        <Chip tone="ok">{approvalLabel}</Chip>
                      ) : approvalStatus === "rejected" ? (
                        <Chip tone="red">{approvalLabel}</Chip>
                      ) : (
                        <Chip tone="warn">{approvalLabel}</Chip>
                      )}
                      {videoFile ? <Chip tone="neutral">{videoFile.name}</Chip> : null}
                    </div>
                    <div style={{ color: ui.sub2, fontSize: 12 }}>
                      Sertifikat yuklangandan keyin admin tasdiqlaydi va yuklash ochiladi.
                    </div>
                  </div>
                </Card>

                <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <SectionTitle>VIDEOLAR TARIXI</SectionTitle>
                    <Btn variant="ghost" onClick={loadMyVideos} disabled={loadingMyVideos}>
                      {loadingMyVideos ? "..." : "Yangilash"}
                    </Btn>
                  </div>

                  <Divider />

                  <div style={{ display: "grid", gap: 10 }}>
                    <video
                      ref={videoRef}
                      controls
                      style={{
                        width: "100%",
                        borderRadius: 16,
                        border: `1px solid ${ui.border}`,
                        background: "rgba(0,0,0,0.35)",
                      }}
                    />

                    {myVideos?.length ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                        {myVideos.map((v) => (
                          <SubCard
                            key={v._id}
                            style={{ display: "grid", gap: 12 }}
                          >
                            <div
                              style={{
                                aspectRatio: "16 / 9",
                                borderRadius: 16,
                                border: `1px solid ${ui.border}`,
                                background:
                                  "linear-gradient(135deg, rgba(138,180,255,0.18), rgba(255,184,107,0.12), rgba(0,0,0,0.24))",
                                display: "grid",
                                placeItems: "center",
                                fontWeight: 1000,
                              }}
                            >
                              Preview
                            </div>

                            <div style={{ display: "grid", gap: 6 }}>
                              <div style={{ fontWeight: 1000, fontSize: 16 }}>{v.title || "—"}</div>
                              <div style={{ color: ui.sub2, fontSize: 12 }}>
                                Mavzu: {topicNameFor(v)} • status: {String(v.status || "—")}
                              </div>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <Chip tone="neutral">Ko‘rishlar: {Number(v?.viewCount || v?.views || v?.watchCount || 0)}</Chip>
                                <Chip tone="pink">Layklar: {Number(v?.likeCount || v?.likes?.length || 0)}</Chip>
                                <Chip tone="ok">{v.createdAt ? fmtDate(v.createdAt) : "Yangi video"}</Chip>
                              </div>
                            </div>

                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <Btn variant="primary" onClick={() => openPlayer(pickHlsUrl(v))}>
                                Ko‘rish
                              </Btn>
                              <Btn variant="ghost" onClick={() => renameVideo(v?._id, v?.title)}>
                                Nomini o‘zgartirish
                              </Btn>
                              <Btn variant="ghost" onClick={() => deleteVideoById(v?._id)}>
                                O‘chirish
                              </Btn>
                            </div>
                          </SubCard>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: ui.sub2, fontSize: 12 }}>Siz hali video yuklamagansiz. Birinchi video shu yerda paydo bo‘ladi.</div>
                    )}
                  </div>
                </Card>
              </>
            ) : null}

            {/* TASKS TAB */}
            {tab === "tasks" ? (
              <>
                <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <SectionTitle>TEST / TOPSHIRIQ YARATISH</SectionTitle>
                    <Chip tone="pink">Fan → sinf → mavzu → test</Chip>
                  </div>

                  <Divider />

                  <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                      <div>
                        <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Fan</div>
                        <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                          {subjects.map((s) => (
                            <option key={s._id} value={s._id}>
                              {subjectLabel(s)}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div>
                        <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Sinf</div>
                        <Select value={grade} onChange={(e) => setGrade(Number(e.target.value) || 6)}>
                          {[5, 6, 7, 8, 9, 10, 11].map((g) => (
                            <option key={g} value={g}>
                              {g}-sinf
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    <div>
                      <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Mavzu</div>
                      <Select value={topicId} onChange={(e) => setTopicId(e.target.value)} disabled={!topics.length}>
                        {topics.length ? (
                          topics.map((t) => (
                            <option key={t._id} value={t._id}>
                              {topicLabel(t)}
                            </option>
                          ))
                        ) : (
                          <option value="">Mavzu yo‘q</option>
                        )}
                      </Select>
                    </div>

                    <div>
                      <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Test nomi</div>
                      <Input value={testTitle} onChange={(e) => setTestTitle(e.target.value)} placeholder="Masalan: 1-test" />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                      <div>
                        <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Turi</div>
                        <Select value={taskType} onChange={(e) => setTaskType(e.target.value)}>
                          <option value="test">Test</option>
                          <option value="assignment">Topshiriq</option>
                        </Select>
                      </div>
                      <div>
                        <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Fayl (PDF/Doc)</div>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setTaskFile(e.target.files?.[0] || null)} />
                        <div style={{ color: ui.sub2, fontSize: 11, marginTop: 6 }}>
                          Fayl testga biriktiriladi (PDF/DOC/DOCX).
                        </div>
                      </div>
                    </div>

                    <div>
                      <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Matematik formula (LaTeX)</div>
                      <Input
                        value={formula}
                        onChange={(e) => setFormula(e.target.value)}
                        placeholder="Masalan: \\int_0^1 x^2 dx"
                      />
                    </div>

                    <div>
                      <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Izoh</div>
                      <Textarea
                        value={testDesc}
                        onChange={(e) => setTestDesc(e.target.value)}
                        placeholder="Qisqacha izoh (ixtiyoriy)"
                      />
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <Btn
                        variant="primary"
                        onClick={createTest}
                        disabled={creatingTest || !topicId || !testTitle.trim() || !canUpload || !hasVideoForTopic}
                      >
                        {creatingTest ? "..." : "Saqlash"}
                      </Btn>
                      {!canUpload ? <Chip tone="warn">Sertifikat tasdiq kutilyapti</Chip> : null}
                      {!hasVideoForTopic ? <Chip tone="warn">Avval shu mavzuga video yuklang</Chip> : null}
                    </div>
                  </div>
                </Card>

                <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <SectionTitle>TEST / TOPSHIRIQ TARIXI</SectionTitle>
                    <Btn variant="ghost" onClick={loadMyTests} disabled={loadingMyTests}>
                      {loadingMyTests ? "..." : "Yangilash"}
                    </Btn>
                  </div>

                  <Divider />

                  {myTests?.length ? (
                    <div style={{ display: "grid", gap: 10 }}>
  {myTests.map((t) => (
  <SubCard key={t._id} style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ fontWeight: 1000 }}>{t.title || "—"}</div>
      <div style={{ color: ui.sub2, fontSize: 12 }}>
        Mavzu: {topicNameFor(t)} • status: {String(t.status || "—")} •{" "}
        {t.createdAt ? fmtDate(t.createdAt) : ""}
      </div>
    </div>

    <div style={{ display: "flex", gap: 8 }}>
     <Btn
  variant="ghost"
  onClick={async () => {
    const questionText = window.prompt("Savol matni:");
    if (!questionText) return;

    const a = window.prompt("A variant:");
    if (!a) return;
    const b = window.prompt("B variant:");
    if (!b) return;
    const c = window.prompt("C variant:");
    if (!c) return;
    const d = window.prompt("D variant:");
    if (!d) return;

    const correctAnswer = window.prompt("To‘g‘ri javob harfi (A/B/C/D):", "A");
    if (!correctAnswer) return;

    try {
      setMessage("");

      await apiFetch(
        "/api/assignments/teacher/" + encodeURIComponent(String(t._id)) + "/questions",
        {
          token,
          method: "POST",
          body: {
            question: String(questionText).trim(),
            options: [
              String(a).trim(),
              String(b).trim(),
              String(c).trim(),
              String(d).trim(),
            ],
            correctIndex:
              String(correctAnswer).toUpperCase() === "A"
                ? 0
                : String(correctAnswer).toUpperCase() === "B"
                ? 1
                : String(correctAnswer).toUpperCase() === "C"
                ? 2
                : 3,
          },
        }
      );

      setMessage("✅ Savol qo‘shildi");
      await loadMyTests();
    } catch (e) {
      setMessage("❌ Savol: " + (e?.message || "xato"));
    }
  }}
>
  Savol qo‘shish
</Btn>
  <Btn
  variant="primary"
  onClick={async () => {
    try {
      setMessage("");

      await apiFetch(
        "/api/assignments/teacher/" + encodeURIComponent(String(t._id)) + "/publish",
        {
          token,
          method: "PATCH",
        }
      );

      setMessage("✅ Test publish qilindi");
      await loadMyTests();
    } catch (e) {
      setMessage("❌ Publish: " + (e?.message || "xato"));
    }
  }}
>
  Publish
</Btn>
    <Btn variant="ghost" onClick={() => deleteTestById(t?._id)}>
      O‘chirish
    </Btn>
    </div>
  </SubCard>
))}
                    </div>
                  ) : (
                    <div style={{ color: ui.sub2, fontSize: 12 }}>Hozircha test yo‘q.</div>
                  )}
                </Card>

                
              </>
            ) : null}
          </div>

          {/* RIGHT — part 3 continues (Profil + sidebar) */}          {/* RIGHT */}
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            {/* PROFILE TAB */}
            {tab === "profile" ? (
              <>
                <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <SectionTitle>PROFIL</SectionTitle>
                    <Btn variant="ghost" onClick={loadMe} disabled={loadingMe}>
                      {loadingMe ? "..." : "Yangilash"}
                    </Btn>
                  </div>

                  <Divider />

                  <div style={{ display: "grid", gap: 12 }}>
                    <SubCard>
                      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12 }}>
                        <div
                          style={{
                            width: "100%",
                            aspectRatio: "1 / 1",
                            borderRadius: 18,
                            overflow: "hidden",
                            border: `1px solid ${ui.border}`,
                            background: "rgba(0,0,0,0.24)",
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          {me?.avatarUrl || me?.avatar ? (
                            <img
                              src={normalizeUrl(me.avatarUrl || me.avatar)}
                              alt="avatar"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div style={{ color: ui.sub }}>Avatar</div>
                          )}
                        </div>

                        <div style={{ display: "grid", gap: 10 }}>
                          <div>
                            <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Rasm</div>
                            <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                          </div>

                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <Btn variant="primary" onClick={uploadAvatar} disabled={!avatarFile || uploadingAvatar}>
                              {uploadingAvatar ? "..." : "Rasm yuklash"}
                            </Btn>
                            <Btn
                              variant="ghost"
                              onClick={() => {
                                setAvatarFile(null);
                                setMessage("");
                              }}
                            >
                              Tozalash
                            </Btn>
                          </div>

                          <div style={{ color: ui.sub2, fontSize: 12 }}>
                            O‘zingizga yoqqan mavzuni tanlang → video dars yuklang → test yarating → daromad oling.
                          </div>
                        </div>
                      </div>
                    </SubCard>

                    <SubCard>
                      <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Ism</div>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ism Familiya" />
                    </SubCard>

                    <SubCard>
                      <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Email</div>
                      <Input value={me?.email || ""} disabled placeholder="—" />
                    </SubCard>

                    <SubCard>
                      <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>O‘zim haqimda</div>
                      <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Qisqacha o‘zingiz haqida..." />
                    </SubCard>

                  <SubCard>
                    <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Yutuqlar (matn)</div>
                    <Textarea
                      value={achievements}
                      onChange={(e) => setAchievements(e.target.value)}
                      placeholder="Masalan: IELTS 8.0, Oliy matematika o‘qituvchisi..."
                    />
                  </SubCard>

                  <SubCard>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <div style={{ color: ui.sub2, fontSize: 12, fontWeight: 950 }}>SERTIFIKAT VA TASDIQ</div>
                      {approvalStatus === "approved" ? (
                        <Chip tone="ok">{approvalLabel}</Chip>
                      ) : approvalStatus === "rejected" ? (
                        <Chip tone="red">{approvalLabel}</Chip>
                      ) : (
                        <Chip tone="warn">{approvalLabel}</Chip>
                      )}
                    </div>
                    <div style={{ height: 8 }} />
                    <div style={{ color: ui.sub2, fontSize: 12 }}>
                      IELTS, diplom yoki fan sertifikatingizni yuklang. Admin tasdiqlagandan keyin video/test yuklash
                      ochiladi.
                    </div>
                    <div style={{ height: 10 }} />
                    <input type="file" accept="application/pdf" onChange={(e) => setCertPdf(e.target.files?.[0] || null)} />
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                      <Btn variant="primary" onClick={uploadCertificatePdf} disabled={!certPdf || uploadingCert}>
                        {uploadingCert ? "..." : "Sertifikat yuklash"}
                      </Btn>
                      {certList?.length ? <Chip tone="ok">{certList.length} ta</Chip> : <Chip tone="neutral">0 ta</Chip>}
                    </div>
                  </SubCard>

                  <SubCard>
                    <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Oliy maqsad</div>
                    <Textarea
                      value={teacherGoal}
                        onChange={(e) => setTeacherGoal(e.target.value)}
                        placeholder="O‘qituvchi sifatida oliy maqsadingiz..."
                      />
                      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                        <Btn variant="primary" onClick={saveTeacherGoal} disabled={savingGoal}>
                          {savingGoal ? "..." : "Maqsadni saqlash"}
                        </Btn>
                      </div>
                    </SubCard>

                    <SubCard>
                      <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 8 }}>Daromad va natijalar</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                        <SubCard>
                          <div style={{ color: ui.sub2, fontSize: 12 }}>Ko‘rishlar</div>
                          <div style={{ fontSize: 24, fontWeight: 1000 }}>{totalViews.toLocaleString("ru-RU")}</div>
                        </SubCard>
                        <SubCard>
                          <div style={{ color: ui.sub2, fontSize: 12 }}>Layklar</div>
                          <div style={{ fontSize: 24, fontWeight: 1000 }}>{(videoLikes + testLikes).toLocaleString("ru-RU")}</div>
                        </SubCard>
                        <SubCard>
                          <div style={{ color: ui.sub2, fontSize: 12 }}>Daromad</div>
                          <div style={{ fontSize: 24, fontWeight: 1000 }}>{totalEarnings.toLocaleString("ru-RU")} so‘m</div>
                        </SubCard>
                      </div>
                      <div style={{ height: 10 }} />
                      <Btn variant="primary" onClick={() => setMessage("ℹ️ Pul yechib olish demo rejimida.")}>
                        Pulni chiqarib olish
                      </Btn>
                    </SubCard>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <Btn variant="primary" onClick={saveMe} disabled={savingMe}>
                        {savingMe ? "..." : "Saqlash"}
                      </Btn>
                      {me?.updatedAt ? <Chip tone="neutral">updated: {fmtDate(me.updatedAt)}</Chip> : null}
                    </div>
                  </div>
                </Card>
              </>
            ) : null}

            {/* SIDEBAR: selection + quick status */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <SectionTitle>HOLAT</SectionTitle>
                <Chip tone="pink">{tab === "videos" ? "Videolar" : tab === "tasks" ? "Test/Topshiriq" : "Profil"}</Chip>
              </div>

              <Divider />

              <div style={{ display: "grid", gap: 10 }}>
                <SubCard>
                  <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 8 }}>Tanlov</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ color: ui.sub }}>Fan</span>
                      <b style={{ color: ui.text }}>{subjectId ? "✅" : "—"}</b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ color: ui.sub }}>Sinf</span>
                      <b style={{ color: ui.text }}>{grade || "—"}</b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ color: ui.sub }}>Mavzu</span>
                      <b style={{ color: ui.text }}>{topicId ? "✅" : "—"}</b>
                    </div>
                  </div>
                </SubCard>

                <SubCard>
                  <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 8 }}>Statistika</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ color: ui.sub }}>Videolar</span>
                      <b style={{ color: ui.text }}>{myVideos?.length || 0}</b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ color: ui.sub }}>Testlar</span>
                      <b style={{ color: ui.text }}>{myTests?.length || 0}</b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ color: ui.sub }}>Ko‘rishlar</span>
                      <b style={{ color: ui.text }}>{totalViews.toLocaleString("ru-RU")}</b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ color: ui.sub }}>Daromad</span>
                      <b style={{ color: ui.text }}>{totalEarnings.toLocaleString("ru-RU")} so‘m</b>
                    </div>
                  </div>
                </SubCard>

              </div>
            </Card>

            <div style={{ color: ui.sub2, fontSize: 12, textAlign: "center" }}>© {new Date().getFullYear()} KIBOO</div>
          </div>
        </div>
      </div>
    </div>
  );
}
