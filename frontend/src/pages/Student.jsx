// src/pages/Student.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getApiBase } from "../lib/api";

/**
 * ✅ KIBOO Student Page (xatosiz, minimal, ishlaydigan)
 * - Login (student) -> token localStorage
 * - Subjects + subscribe/buy (alias endpoints)
 * - Progress no-skipping: ensure + currentTopic
 * - Topics tree (5–11) + locked/unlocked UI
 * - Videos by topic + stream with ?token=
 * - Assignments: current topic tests + attempts list
 * - Profile: me + avatar upload + goal (localStorage)
 */

const API_BASE = getApiBase();

const LS_TOKEN = "STUDENT_TOKEN";
const LS_GOAL = "KIBOO_STUDENT_GOAL";

function s(x) {
  return (x ?? "").toString();
}

function getCount(val, fallbackList) {
  if (Number.isFinite(Number(val))) return Number(val);
  if (Array.isArray(fallbackList)) return fallbackList.length;
  return 0;
}

function teacherName(t) {
  if (!t) return "";
  if (typeof t === "string") return t;
  return t?.name || t?.fullName || t?.email || "";
}

function getTokenLS() {
  try {
    return localStorage.getItem(LS_TOKEN) || "";
  } catch {
    return "";
  }
}
function setTokenLS(t) {
  try {
    localStorage.setItem(LS_TOKEN, s(t));
  } catch {
    // ignore localStorage write errors
  }
}
function clearTokenLS() {
  try {
    localStorage.removeItem(LS_TOKEN);
  } catch {
    // ignore localStorage cleanup errors
  }
}

async function apiFetch(path, { token, method = "GET", body, headers, raw } = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const h = { ...(headers || {}) };

  let payload = undefined;
  if (raw instanceof FormData) {
    payload = raw;
  } else if (body !== undefined) {
    h["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  if (token) h.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { method, headers: h, body: payload });
  const txt = await res.text();

  let data = null;
  try {
    data = txt ? JSON.parse(txt) : null;
  } catch {
    data = { message: txt };
  }

  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

async function tryApiFetch(paths, opts) {
  const arr = Array.isArray(paths) ? paths : [paths];
  let lastErr = null;
  for (const p of arr) {
    try {
      return await apiFetch(p, opts);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Request failed");
}

// ================= UI THEME =================
const ui = {
  bg: "#0A0B12",
  text: "rgba(255,255,255,0.94)",
  sub: "rgba(255,255,255,0.70)",
  sub2: "rgba(255,255,255,0.55)",
  border: "rgba(255,255,255,0.14)",
  border2: "rgba(255,255,255,0.28)",
  card: "rgba(255,255,255,0.08)",
  card2: "rgba(255,255,255,0.04)",
  glow: "0 24px 80px rgba(0,0,0,0.55)",
  accent: "#8AB4FF",
  accent2: "#FFB86B",
  mint: "#6EE7B7",
  font:
    '-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","SF Pro",system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif',
};

function Card({ children }) {
  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${ui.card}, rgba(0,0,0,0.25))`,
        border: `1px solid ${ui.border}`,
        borderRadius: 22,
        padding: 18,
        boxShadow: ui.glow,
        backdropFilter: "blur(18px)",
      }}
    >
      {children}
    </div>
  );
}

function SubCard({ children }) {
  return (
    <div
      style={{
        background: ui.card2,
        border: `1px solid ${ui.border}`,
        borderRadius: 18,
        padding: 14,
      }}
    >
      {children}
    </div>
  );
}

function Chip({ children, tone = "default" }) {
  const bg =
    tone === "ok"
      ? "rgba(110, 231, 183, 0.16)"
      : tone === "warn"
      ? "rgba(255, 200, 120, 0.16)"
      : tone === "pink"
      ? "rgba(138, 180, 255, 0.18)"
      : tone === "neutral"
      ? "rgba(255,255,255,0.08)"
      : "rgba(255,255,255,0.08)";
  const bd =
    tone === "ok"
      ? "rgba(110, 231, 183, 0.30)"
      : tone === "warn"
      ? "rgba(255, 200, 120, 0.30)"
      : tone === "pink"
      ? "rgba(138, 180, 255, 0.35)"
      : tone === "neutral"
      ? "rgba(255,255,255,0.22)"
      : ui.border;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${bd}`,
        background: bg,
        color: ui.text,
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: 0.2,
      }}
    >
      {children}
    </span>
  );
}

function Btn({ children, onClick, disabled, variant = "ghost", type = "button" }) {
  const v =
    variant === "primary"
      ? {
          background: `linear-gradient(135deg, ${ui.accent}, ${ui.accent2})`,
          border: "none",
          color: "#0B0E16",
        }
      : {
          background: "rgba(255,255,255,0.08)",
          border: `1px solid ${ui.border2}`,
          color: ui.text,
        };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...v,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        borderRadius: 16,
        padding: "10px 14px",
        fontWeight: 950,
        letterSpacing: 0.2,
        userSelect: "none",
        boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
      }}
    >
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 16,
        outline: "none",
        border: `1px solid ${ui.border}`,
        background: "rgba(255,255,255,0.06)",
        color: ui.text,
      }}
    />
  );
}

function Textarea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 16,
        outline: "none",
        border: `1px solid ${ui.border}`,
        background: "rgba(255,255,255,0.06)",
        color: ui.text,
        resize: "vertical",
      }}
    />
  );
}

// ================= PAGE =================
export default function StudentPage() {
  // auth
  const [token, setToken] = useState(() => getTokenLS());
  const [email, setEmail] = useState("student@test.com");
  const [password, setPassword] = useState("123456");
  const [logging, setLogging] = useState(false);

  // ui state
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("course"); // course | videos | tests | profile

  // data
  const [subjects, setSubjects] = useState([]);
  const [subscription, setSubscription] = useState(null);

  // progress lock
  const [currentTopicId, setCurrentTopicId] = useState("");
  const [videoDoneTopics, setVideoDoneTopics] = useState([]);
  const [testDoneTopics, setTestDoneTopics] = useState([]);
  const [fullDoneTopics, setFullDoneTopics] = useState([]);
  const [unlockedTopicIds, setUnlockedTopicIds] = useState([]);

  // topics tree
  const [gradesTree, setGradesTree] = useState([]);
  const [openGrade, setOpenGrade] = useState(null);

  // active topic
  const [activeTopicId, setActiveTopicId] = useState("");
  const [activeTopicName, setActiveTopicName] = useState("");

  // loading
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);
  const [loadingTree, setLoadingTree] = useState(false);
  const [loadingTopic, setLoadingTopic] = useState(false);

  // topic content
  const [topicVideos, setTopicVideos] = useState([]);
  const [topicTests, setTopicTests] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [quizAttempt, setQuizAttempt] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  // attempts
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  const sortedVideos = useMemo(() => {
    return [...(topicVideos || [])].sort((a, b) => {
      const al = getCount(a?.likeCount, a?.likes);
      const bl = getCount(b?.likeCount, b?.likes);
      if (bl !== al) return bl - al;
      const at = new Date(a?.createdAt || 0).getTime();
      const bt = new Date(b?.createdAt || 0).getTime();
      return bt - at;
    });
  }, [topicVideos]);

  const sortedTests = useMemo(() => {
    return [...(topicTests || [])].sort((a, b) => {
      const al = getCount(a?.likeCount, a?.likes);
      const bl = getCount(b?.likeCount, b?.likes);
      if (bl !== al) return bl - al;
      const at = new Date(a?.createdAt || 0).getTime();
      const bt = new Date(b?.createdAt || 0).getTime();
      return bt - at;
    });
  }, [topicTests]);

  // profile
  const [me, setMe] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // goal
  const [goal, setGoal] = useState(() => {
    try {
      return localStorage.getItem(LS_GOAL) || "";
    } catch {
      return "";
    }
  });
  const [savingGoal, setSavingGoal] = useState(false);

  // player ref
  const videoRef = useRef(null);

  function destroyPlayer() {
    try {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute("src");
        videoRef.current.load?.();
      }
    } catch {
      // ignore player teardown errors
    }
  }

  // ===== VIDEO PROGRESS (save position + completed) =====
  const lastSavedAtRef = useRef(0);
  const lastSavedPosRef = useRef(0);
  const restoringPosRef = useRef(false);

  async function saveVideoPosition(videoId, sec) {
    if (!token || !videoId) return;
    try {
      await apiFetch("/api/progress/videos/" + encodeURIComponent(String(videoId)) + "/position", {
        token,
        method: "PATCH",
        body: { lastPositionSec: Math.max(0, Math.floor(Number(sec || 0))) },
      });
    } catch {
      // ignore silent progress sync errors
    }
  }

  async function markVideoCompleted(videoId) {
    if (!token || !videoId) return;
    try {
      await apiFetch("/api/progress/videos/" + encodeURIComponent(String(videoId)) + "/completed", {
        token,
        method: "POST",
      });
    } catch {
      // ignore silent complete sync errors
    }
  }

  function handleVideoTimeUpdate(e) {
    if (!token || !selectedVideoId) return;
    if (restoringPosRef.current) return;

    const el = e?.currentTarget;
    const sec = Number(el?.currentTime || 0);
    const now = Date.now();

    // har ~5s da bir saqlaymiz
    if (now - lastSavedAtRef.current < 5000) return;
    if (Math.abs(sec - lastSavedPosRef.current) < 3) return;

    lastSavedAtRef.current = now;
    lastSavedPosRef.current = sec;

    saveVideoPosition(selectedVideoId, sec).catch(() => {});
  }

  async function handleVideoEnded() {
    if (!token || !selectedVideoId) return;
    try {
      await markVideoCompleted(selectedVideoId);
      setMessage("✅ Video completed");
      await loadProgressCurrent();
      if (activeTopicId) await loadTopicContent(activeTopicId);
    } catch (e) {
      setMessage("❌ Video completed: " + (e?.message || "xato"));
    }
  }

  const subscribedSubjectId = useMemo(() => {
    const sid =
      subscription?.subject?._id ||
      subscription?.subject ||
      subscription?.subscription?.subject?._id ||
      subscription?.subscription?.subject ||
      "";
    return sid ? String(sid) : "";
  }, [subscription]);

  async function login() {
    try {
      setLogging(true);
      setMessage("");
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: { email: s(email), password: s(password) },
      });
      const t = res?.token || "";
      if (!t) throw new Error("Token kelmadi");
      setTokenLS(t);
      setToken(t);
      setMessage("✅ Login");
    } catch (e) {
      setMessage("❌ Login: " + (e?.message || "xato"));
    } finally {
      setLogging(false);
    }
  }

  function logout() {
    clearTokenLS();
    setToken("");
    setMessage("");
    setTab("course");

    setSubjects([]);
    setSubscription(null);

    setCurrentTopicId("");
    setUnlockedTopicIds([]);
    setGradesTree([]);
    setOpenGrade(null);

    setActiveTopicId("");
    setActiveTopicName("");

    setTopicVideos([]);
    setTopicTests([]);
    setSelectedVideoId("");

    setAttempts([]);
    setMe(null);
    setAvatarFile(null);
    setUploadingAvatar(false);

    destroyPlayer();
  }

  async function loadSubjects() {
    if (!token) return;
    try {
      setLoadingSubjects(true);
      const res = await tryApiFetch(["/api/subjects", "/api/subject"], { token });
      const list = res?.subjects ?? res?.items ?? res ?? [];
      setSubjects(Array.isArray(list) ? list : []);
    } catch (e) {
      setSubjects([]);
      setMessage("❌ Fanlar: " + (e?.message || "xato"));
    } finally {
      setLoadingSubjects(false);
    }
  }

  async function loadSubscription() {
    if (!token) return;
    try {
      setLoadingSub(true);
      const res = await tryApiFetch(["/api/subscriptions/me", "/api/subscription/me"], { token });
      setSubscription(res?.subscription ?? res ?? null);
    } catch {
      setSubscription(null);
    } finally {
      setLoadingSub(false);
    }
  }

  async function buySubject(subjectId, months = 1) {
    if (!token) return;
    try {
      setMessage("");
      await tryApiFetch(
        ["/api/subscriptions/buy", "/api/subscriptions/subscribe", "/api/subscriptions", "/api/subscription"],
        { token, method: "POST", body: { subjectId, months } }
      );
      await loadSubscription();
      setMessage("✅ Obuna aktiv (demo)");
    } catch (e) {
      setMessage("❌ Sotib olish: " + (e?.message || "xato"));
    }
  }

  async function ensureProgress() {
    if (!token) return;
    try {
      await apiFetch("/api/progress/ensure", { token, method: "POST" });
    } catch {
      // ignore
    }
  }

  async function loadProgressCurrent() {
    if (!token) return;
    try {
      const res = await tryApiFetch(["/api/progress/current", "/api/progress/plan"], { token });
      const cur =
        res?.progress?.currentTopic?._id ||
        res?.progress?.currentTopic ||
        res?.topic?._id ||
        res?.currentTopicId ||
        "";
      setCurrentTopicId(cur ? String(cur) : "");

      const p = res?.progress || null;
      setVideoDoneTopics(Array.isArray(p?.videoCompletedTopics) ? p.videoCompletedTopics.map(String) : []);
      setTestDoneTopics(Array.isArray(p?.testCompletedTopics) ? p.testCompletedTopics.map(String) : []);
      setFullDoneTopics(Array.isArray(p?.completedTopics) ? p.completedTopics.map(String) : []);
    } catch {
      setCurrentTopicId("");
    }
  }

  async function loadMe() {
    if (!token) return;
    try {
      const res = await tryApiFetch(["/api/users/me", "/api/auth/me", "/api/me"], { token });
      setMe(res?.user ?? res ?? null);
    } catch {
      setMe(null);
    }
  }

  async function uploadAvatar() {
    if (!token || !avatarFile) return;
    try {
      setUploadingAvatar(true);
      setMessage("");
      const fd = new FormData();
      fd.append("avatar", avatarFile);
      await apiFetch("/api/users/me/avatar", { token, method: "POST", raw: fd });
      setAvatarFile(null);
      await loadMe();
      setMessage("✅ Avatar yangilandi");
    } catch (e) {
      setMessage("❌ Avatar: " + (e?.message || "xato"));
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function saveGoal() {
    try {
      setSavingGoal(true);
      setMessage("");
      localStorage.setItem(LS_GOAL, s(goal));
      setMessage("✅ Maqsad saqlandi");
    } catch (e) {
      setMessage("❌ Maqsad: " + (e?.message || "xato"));
    } finally {
      setSavingGoal(false);
    }
  }

  async function loadAttempts() {
    if (!token) return;
    try {
      setLoadingAttempts(true);
      const res = await tryApiFetch(
        ["/api/assignments/student/attempts", "/api/assignments/student/attempts?limit=200"],
        { token }
      );
      const list = res?.attempts ?? res?.items ?? res ?? [];
      setAttempts(Array.isArray(list) ? list : []);
    } catch {
      setAttempts([]);
    } finally {
      setLoadingAttempts(false);
    }
  }

  async function buildGradesTree() {
    if (!token || !subscribedSubjectId) {
      setGradesTree([]);
      return;
    }

    try {
      setLoadingTree(true);

      const res = await tryApiFetch(
        [
          `/api/topics?subjectId=${encodeURIComponent(subscribedSubjectId)}`,
          `/api/topics/bySubject/${encodeURIComponent(subscribedSubjectId)}`,
        ],
        { token }
      );

      const topics = res?.topics ?? res?.items ?? res ?? [];
      const arr = Array.isArray(topics) ? topics : [];

      // grade/level bo‘yicha guruhlash + tartiblash (dynamic)
      const keys = Array.from(
        new Set(
          arr
            .map((t) => Number(t?.grade ?? t?.class ?? 0))
            .filter((n) => Number.isFinite(n))
        )
      ).sort((a, b) => a - b);

      const map = new Map();
      keys.forEach((k) => map.set(k, []));

      arr.forEach((t) => {
        const gr = Number(t?.grade ?? t?.class ?? 0);
        if (map.has(gr)) map.get(gr).push(t);
      });

      const tree = [];
      for (const k of keys) {
        const list = map.get(k) || [];
        list.sort((a, b) => {
          const ao = Number(a?.order ?? a?.index ?? 0);
          const bo = Number(b?.order ?? b?.index ?? 0);
          if (ao !== bo) return ao - bo;
          return s(a?.title || a?.name).localeCompare(s(b?.title || b?.name));
        });
        tree.push({ grade: k, topics: list });
      }

      setGradesTree(tree);
    } catch (e) {
      setGradesTree([]);
      setMessage("❌ Mavzular: " + (e?.message || "xato"));
    } finally {
      setLoadingTree(false);
    }
  }

  // stream url: video native <video> Authorization yubormaydi -> ?token= mode
  function streamUrlFor(video) {
    const t = token || "";
    return `${API_BASE}/api/videos/${encodeURIComponent(String(video?._id || ""))}/stream?token=${encodeURIComponent(t)}`;
  }

  async function loadTopicContent(topicId) {
    if (!token || !topicId) return;

    try {
      setLoadingTopic(true);
      setMessage("");

      // topic videos
      const vRes = await tryApiFetch(
        [`/api/videos?topicId=${encodeURIComponent(topicId)}`, `/api/videos/byTopic/${encodeURIComponent(topicId)}`],
        { token }
      );
      const vids = vRes?.videos ?? vRes?.items ?? vRes ?? [];
      const videoList = Array.isArray(vids) ? vids : [];
      setTopicVideos(videoList);

      // topic assignments/tests (backendda faqat current topic bo‘lishi mumkin)
      const aRes = await tryApiFetch(
        [
          `/api/assignments/student/topic/${encodeURIComponent(topicId)}`,
          `/api/assignments/student/current`,
          `/api/assignments/student`,
        ],
        { token }
      );
      const tests = aRes?.assignments ?? aRes?.items ?? aRes ?? [];
      setTopicTests(Array.isArray(tests) ? tests : []);
      if (!Array.isArray(tests) || !tests.length) {
        setMessage("ℹ️ Testlar hozircha faqat current mavzu uchun chiqishi mumkin (backend qoidasi).");
      }

      const sorted = [...videoList].sort((a, b) => {
        const al = getCount(a?.likeCount, a?.likes);
        const bl = getCount(b?.likeCount, b?.likes);
        if (bl !== al) return bl - al;
        const at = new Date(a?.createdAt || 0).getTime();
        const bt = new Date(b?.createdAt || 0).getTime();
        return bt - at;
      });
      const firstId = sorted?.[0]?._id ? String(sorted[0]._id) : "";
      if (firstId && (!selectedVideoId || !videoList.find((v) => String(v?._id) === String(selectedVideoId)))) {
        setSelectedVideoId(firstId);
      }
    } catch (e) {
      setTopicVideos([]);
      setTopicTests([]);
      setMessage("❌ Topic: " + (e?.message || "xato"));
    } finally {
      setLoadingTopic(false);
    }
  }

  async function toggleVideoReaction(videoId, mode) {
    if (!token || !videoId) return;
    try {
      const res = await apiFetch(`/api/videos/${encodeURIComponent(String(videoId))}/${mode}`, {
        token,
        method: "POST",
      });
      setTopicVideos((prev) =>
        (prev || []).map((v) =>
          String(v?._id) === String(videoId)
            ? {
                ...v,
                likeCount: getCount(res?.likes, v?.likes),
                dislikeCount: getCount(res?.dislikes, v?.dislikes),
                liked: res?.liked ?? v?.liked,
                disliked: res?.disliked ?? v?.disliked,
              }
            : v
        )
      );
    } catch (e) {
      setMessage("❌ Like: " + (e?.message || "xato"));
    }
  }

  async function toggleAssignmentReaction(assignmentId, mode) {
    if (!token || !assignmentId) return;
    try {
      const res = await apiFetch(`/api/assignments/${encodeURIComponent(String(assignmentId))}/${mode}`, {
        token,
        method: "POST",
      });
      setTopicTests((prev) =>
        (prev || []).map((a) =>
          String(a?._id) === String(assignmentId)
            ? {
                ...a,
                likeCount: getCount(res?.likes, a?.likes),
                dislikeCount: getCount(res?.dislikes, a?.dislikes),
                liked: res?.liked ?? a?.liked,
                disliked: res?.disliked ?? a?.disliked,
              }
            : a
        )
      );
    } catch (e) {
      setMessage("❌ Like: " + (e?.message || "xato"));
    }
  }

  async function startAttempt(assignmentId) {
  if (!token || !assignmentId) return;
  try {
    setMessage("");

    const res = await apiFetch(
      `/api/assignments/student/${encodeURIComponent(assignmentId)}/start`,
      {
        token,
        method: "POST",
      }
    );

    setQuizAttempt(res?.attempt || null);
    setQuizQuestions(Array.isArray(res?.questions) ? res.questions : []);
    setQuizAnswers({});

    await loadAttempts();
    setTab("tests");
    setMessage("✅ Attempt boshlandi");
  } catch (e) {
    setMessage("❌ Start: " + (e?.message || "xato"));
  }
}

  function calcCourseProgressPercent() {
    const all = (gradesTree || []).flatMap((g) => g.topics || []);
    if (!all.length) return 0;
    const idx = all.findIndex((t) => String(t?._id) === String(activeTopicId));
    if (idx < 0) return 0;
    return ((idx + 1) / all.length) * 100;
  }

  const totalTopicCount = (gradesTree || []).reduce((sum, g) => sum + Number(g?.topics?.length || 0), 0);
  const completedTopicCount = fullDoneTopics.length;
  const subjectProgressPercent = totalTopicCount ? Math.round((completedTopicCount / totalTopicCount) * 100) : 0;
  const continueTopic = useMemo(() => {
    const all = (gradesTree || []).flatMap((g) => (g?.topics || []).map((t) => ({ ...t, grade: g?.grade })));
    const current = all.find((t) => String(t?._id || "") === String(currentTopicId || ""));
    if (current) return current;
    const nextUnlocked = all.find((t) => unlockedTopicIds.includes(String(t?._id || "")));
    return nextUnlocked || all[0] || null;
  }, [gradesTree, currentTopicId, unlockedTopicIds]);
  const continueSubjectName =
    subjects.find((sbj) => String(sbj?._id || "") === String(subscribedSubjectId || ""))?.title ||
    subjects.find((sbj) => String(sbj?._id || "") === String(subscribedSubjectId || ""))?.name ||
    "Kurs";

  // ----------- UI helpers -----------
  const TopicBtn = ({ t, active }) => {
    const id = String(t?._id || "");
    const locked = unlockedTopicIds.length ? !unlockedTopicIds.includes(id) : false;

    return (
      <button
        onClick={() => {
          if (locked) {
            setMessage("🔒 Bu mavzu hali ochilmagan (ketma-ket).");
            return;
          }
          setActiveTopicId(id);
          setActiveTopicName(s(t?.title || t?.name || ""));
          setTab("videos");
        }}
        style={{
          width: "100%",
          textAlign: "left",
          borderRadius: 18,
          padding: "12px 14px",
          border: `1px solid ${active ? ui.border2 : ui.border}`,
          background: active
            ? "linear-gradient(135deg, rgba(138,180,255,0.20), rgba(255,184,107,0.12))"
            : "rgba(255,255,255,0.05)",
          color: ui.text,
          cursor: locked ? "not-allowed" : "pointer",
          opacity: locked ? 0.55 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ display: "grid", gap: 2 }}>
          <div style={{ fontWeight: 950, fontSize: 14 }}>
            {s(t?.title || t?.name || "Mavzu")}
            {locked ? " 🔒" : ""}
          </div>
          <div style={{ color: ui.sub2, fontSize: 12 }}>
            {t?.order != null ? `Mavzu #${t.order}` : "Mavzu"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {fullDoneTopics.includes(id) ? (
            <Chip tone="ok">Bajarildi</Chip>
          ) : (
            <>
              {videoDoneTopics.includes(id) ? <Chip tone="pink">Video ✅</Chip> : null}
              {testDoneTopics.includes(id) ? <Chip tone="ok">Test ✅</Chip> : null}
            </>
          )}
          <span style={{ opacity: 0.7 }}>{active ? "●" : "○"}</span>
        </div>
      </button>
    );
  };

  // ================= EFFECTS =================
  useEffect(() => {
    if (!token) return;
    (async () => {
      await loadSubjects();
      await loadSubscription();
      await loadMe();
      await loadAttempts();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (!subscribedSubjectId) return;

    (async () => {
      await ensureProgress();
      await loadProgressCurrent();
      await buildGradesTree();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, subscribedSubjectId]);

  useEffect(() => {
    const all = (gradesTree || []).flatMap((g) => g?.topics || []);
    const cur = String(currentTopicId || "");

    if (!all.length || !cur) {
      setUnlockedTopicIds([]);
      return;
    }

    const idx = all.findIndex((t) => String(t?._id || "") === cur);
    if (idx < 0) {
      setUnlockedTopicIds([]);
      return;
    }

    const unlocked = all.slice(0, idx + 1).map((t) => String(t?._id || ""));
    setUnlockedTopicIds(unlocked);

    if (!activeTopicId) {
      setActiveTopicId(cur);
      const found = all.find((t) => String(t?._id || "") === cur);
      setActiveTopicName(s(found?.title || found?.name || ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradesTree, currentTopicId]);

  useEffect(() => {
    if (!token || !activeTopicId) return;
    (async () => {
      await loadTopicContent(activeTopicId);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeTopicId]);

  useEffect(() => {
    if (!token) return;
    if (!selectedVideoId) return;

    (async () => {
      const v = (topicVideos || []).find((x) => String(x?._id) === String(selectedVideoId));
      if (!v) return;

      const url = streamUrlFor(v);

      try {
        if (videoRef.current) {
          videoRef.current.src = url;
          videoRef.current.load();

          apiFetch("/api/progress/videos/" + encodeURIComponent(String(selectedVideoId)), { token })
            .then((res) => {
              const lastSec = Number(res?.progress?.lastPositionSec || 0);
              if (lastSec > 0 && videoRef.current) {
                restoringPosRef.current = true;
                try {
                  videoRef.current.currentTime = lastSec;
                } catch {
                  // ignore seek restore errors
                }
                setTimeout(() => {
                  restoringPosRef.current = false;
                }, 1000);
              }
            })
            .catch(() => {});
        }
      } catch {
        // ignore stream restore errors
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, selectedVideoId, topicVideos]);

  // ================= RENDER =================
  return (
    <div style={{ minHeight: "100vh", background: ui.bg, color: ui.text, fontFamily: ui.font }}>
      <style>{`@keyframes kibooSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* soft background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(900px 520px at 18% 10%, rgba(138,180,255,0.16), transparent 60%),
            radial-gradient(900px 520px at 80% 14%, rgba(255,184,107,0.12), transparent 55%),
            radial-gradient(900px 700px at 55% 90%, rgba(110,231,183,0.10), transparent 55%)
          `,
        }}
      />

      <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "26px 18px 60px" }}>
        {/* top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 18,
            padding: "14px 16px",
            borderRadius: 20,
            border: `1px solid ${ui.border}`,
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                border: `1px solid ${ui.border2}`,
                background: "linear-gradient(135deg, rgba(138,180,255,0.25), rgba(255,184,107,0.18))",
                display: "grid",
                placeItems: "center",
                fontWeight: 1000,
              }}
            >
              K
            </div>
            <div style={{ display: "grid", lineHeight: 1.1 }}>
              <div style={{ fontWeight: 1000, fontSize: 18 }}>KIBOO</div>
              <div style={{ color: ui.sub2, fontSize: 12 }}>
                {me?.name ? `${me.name}` : "O‘quvchi"} {me?.email ? `• ${me.email}` : ""}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {message ? <Chip tone="warn">{message}</Chip> : null}
            {token ? (
              <Btn variant="ghost" onClick={logout}>
                Logout
              </Btn>
            ) : null}
          </div>
        </div>

        {/* auth */}
        {!token ? (
          <Card>
            <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
              <div style={{ fontSize: 22, fontWeight: 1000 }}>Login (Student)</div>
              <div style={{ color: ui.sub2, fontSize: 13 }}>Token avtomatik saqlanadi (localStorage).</div>

              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
              <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <Btn variant="primary" onClick={login} disabled={logging}>
                  {logging ? "..." : "Login"}
                </Btn>
                <Btn
                  variant="ghost"
                  onClick={() => {
                    setEmail("student@test.com");
                    setPassword("123456");
                  }}
                >
                  Demo ma’lumotlarni qo‘yish
                </Btn>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* tabs */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <Btn variant={tab === "course" ? "primary" : "ghost"} onClick={() => setTab("course")}>
                Kurs
              </Btn>
              <Btn variant={tab === "videos" ? "primary" : "ghost"} onClick={() => setTab("videos")}>
                Videolar
              </Btn>
              <Btn variant={tab === "tests" ? "primary" : "ghost"} onClick={() => setTab("tests")}>
                Testlar
              </Btn>
              <Btn variant={tab === "profile" ? "primary" : "ghost"} onClick={() => setTab("profile")}>
                Profil
              </Btn>

              <div style={{ flex: 1 }} />
            </div>

            <Card>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 14,
                  alignItems: "stretch",
                }}
              >
                <div
                  style={{
                    borderRadius: 20,
                    padding: 18,
                    background:
                      "linear-gradient(135deg, rgba(138,180,255,0.20), rgba(255,184,107,0.16), rgba(110,231,183,0.10))",
                    border: `1px solid ${ui.border2}`,
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <Chip tone="pink">Davom etish</Chip>
                    <Chip tone={subscribedSubjectId ? "ok" : "warn"}>
                      {subscribedSubjectId ? `${subjectProgressPercent}% tugallangan` : "Obuna kerak"}
                    </Chip>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 1000, lineHeight: 1.05 }}>
                    {continueSubjectName} {continueTopic?.grade ? `• ${continueTopic.grade}-sinf` : ""} •{" "}
                    {s(continueTopic?.title || continueTopic?.name || "Boshlash uchun fan tanlang")}
                  </div>
                  <div style={{ color: ui.sub, fontSize: 14 }}>
                    {subscribedSubjectId
                      ? "Platformaga kirgan zahoti qayerdan davom etishni ko‘rsatamiz."
                      : "Avval bitta fan obunasini faollashtiring, keyin tizim sizni to‘g‘ri mavzuga olib boradi."}
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <Btn
                      variant="primary"
                      disabled={!continueTopic || !subscribedSubjectId}
                      onClick={() => {
                        if (!continueTopic) return;
                        setActiveTopicId(String(continueTopic?._id || ""));
                        setActiveTopicName(s(continueTopic?.title || continueTopic?.name || ""));
                        setTab("videos");
                      }}
                    >
                      Davom etish
                    </Btn>
                    <Btn variant="ghost" onClick={() => setTab("course")}>
                      Kursni ko‘rish
                    </Btn>
                  </div>
                </div>

                <SubCard style={{ display: "grid", gap: 10, alignContent: "start" }}>
                  <div style={{ color: ui.sub2, fontSize: 12, fontWeight: 950 }}>PROGRESS</div>
                  <div style={{ fontSize: 30, fontWeight: 1000 }}>{subjectProgressPercent}%</div>
                  <div
                    style={{
                      height: 10,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${subjectProgressPercent}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${ui.accent}, ${ui.mint})`,
                      }}
                    />
                  </div>
                  <div style={{ color: ui.sub2, fontSize: 12 }}>
                    {completedTopicCount} / {totalTopicCount || 0} mavzu yakunlangan
                  </div>
                </SubCard>
              </div>
            </Card>

            {/* CONTENT */}
            {tab === "course" && (
              <Card>
                <div style={{ fontSize: 22, fontWeight: 1000, marginBottom: 12 }}>Kurs va Mavzular</div>

                <div style={{ display: "grid", gap: 10 }}>
                  <SubCard>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "grid", gap: 4 }}>
                        <div style={{ fontWeight: 1000 }}>Fanlar</div>
                        <div style={{ color: ui.sub2, fontSize: 12 }}>
                          {loadingSubjects ? "Yuklanmoqda..." : `${subjects.length} ta fan`}
                        </div>
                      </div>
                      {loadingSub ? <Chip tone="warn">Subscription...</Chip> : null}
                      {subscribedSubjectId ? <Chip tone="ok">Obuna: aktiv</Chip> : <Chip tone="warn">Obuna: yo‘q</Chip>}
                    </div>

                    <div style={{ height: 10 }} />

                    <div style={{ display: "grid", gap: 10 }}>
                      {(subjects || []).map((sbj) => {
                        const id = String(sbj?._id || "");
                        const isMine = id && id === String(subscribedSubjectId);
                        return (
                          <SubCard key={id || `${sbj?.name || "sbj"}_${Math.random()}`}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 12,
                                alignItems: "center",
                                flexWrap: "wrap",
                              }}
                            >
                              <div style={{ display: "grid", gap: 2 }}>
                                <div style={{ fontWeight: 950 }}>{s(sbj?.title || sbj?.name || "Fan")}</div>
                                <div style={{ color: ui.sub2, fontSize: 12 }}>{s(sbj?.subtitle || "")}</div>
                              </div>

                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                {isMine ? <Chip tone="ok">Faol</Chip> : <Chip tone="warn">Obuna kerak</Chip>}
                                {isMine ? null : (
                                  <Btn variant="primary" onClick={() => buySubject(id, 1)}>
                                    Sotib olish
                                  </Btn>
                                )}
                              </div>
                            </div>
                            <div style={{ height: 10 }} />
                            <div style={{ display: "grid", gap: 6 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: ui.sub2 }}>
                                <span>Progress</span>
                                <span>{isMine ? `${subjectProgressPercent}% tugallangan` : "Obuna faollashgach boshlanadi"}</span>
                              </div>
                              <div
                                style={{
                                  height: 8,
                                  borderRadius: 999,
                                  background: "rgba(255,255,255,0.08)",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${isMine ? subjectProgressPercent : 0}%`,
                                    height: "100%",
                                    background: `linear-gradient(90deg, ${ui.accent}, ${ui.accent2})`,
                                  }}
                                />
                              </div>
                            </div>
                          </SubCard>
                        );
                      })}
                    </div>
                  </SubCard>

                  <div style={{ height: 12 }} />

                  <div style={{ fontSize: 18, fontWeight: 1000, marginBottom: 10 }}>DARSLAR VA MAVZULAR</div>

                  {!subscribedSubjectId ? (
                    <div style={{ color: ui.sub2 }}>Avval fan sotib oling.</div>
                  ) : loadingTree ? (
                    <Chip tone="warn">Mavzular yuklanmoqda...</Chip>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {gradesTree.map((g) => (
                        <SubCard key={g.grade}>
                          <button
                            onClick={() => setOpenGrade(openGrade === g.grade ? null : g.grade)}
                            style={{
                              width: "100%",
                              background: "transparent",
                              border: "none",
                              color: ui.text,
                              fontWeight: 1000,
                              fontSize: 16,
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            {g.grade}-sinf
                            <span>{openGrade === g.grade ? "−" : "+"}</span>
                          </button>

                          {openGrade === g.grade ? (
                            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                              {(g.topics || []).length ? (
                                g.topics.map((t) => (
                                  <TopicBtn
                                    key={String(t?._id || Math.random())}
                                    t={t}
                                    active={String(activeTopicId) === String(t?._id)}
                                  />
                                ))
                              ) : (
                                <div style={{ color: ui.sub2 }}>Bu sinf uchun mavzular hali tayyor emas. Tez orada qo‘shiladi.</div>
                              )}
                            </div>
                          ) : null}
                        </SubCard>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {tab === "videos" && (
              <Card>
                <div style={{ fontSize: 22, fontWeight: 1000, marginBottom: 12 }}>VIDEOLAR</div>

                {!activeTopicId ? (
                  <div style={{ color: ui.sub2 }}>
                    Avval <b>Kurs</b> bo‘limidan mavzuni tanlang.
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div style={{ fontWeight: 1000 }}>{activeTopicName || "Tanlangan mavzu"}</div>
                      {loadingTopic ? <Chip tone="warn">Yuklanmoqda...</Chip> : <Chip tone="pink">{sortedVideos.length} ta</Chip>}
                    </div>

                    <SubCard>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                        <Chip tone="pink">Eng ko‘p layk olgan videolar tepada</Chip>
                        <Chip tone="neutral">{activeTopicName}</Chip>
                      </div>
                      <video
                        ref={videoRef}
                        controls
                        onTimeUpdate={handleVideoTimeUpdate}
                        onEnded={handleVideoEnded}
                        style={{
                          width: "100%",
                          borderRadius: 16,
                          border: `1px solid ${ui.border}`,
                          background: "black",
                          maxHeight: 520,
                        }}
                      />
                      <div style={{ height: 10 }} />

                      <div style={{ display: "grid", gap: 8 }}>
                        {(sortedVideos || []).length ? (
                          sortedVideos.map((v) => {
                            const vid = String(v?._id || "");
                            const active = vid && String(selectedVideoId) === vid;
                            const likeCount = getCount(v?.likeCount, v?.likes);
                            const dislikeCount = getCount(v?.dislikeCount, v?.dislikes);
                            return (
                              <div key={vid || Math.random()} style={{ display: "grid", gap: 10 }}>
                                <button
                                  onClick={() => {
                                    setSelectedVideoId(vid);
                                    setMessage("");
                                  }}
                                  style={{
                                    flex: 1,
                                    textAlign: "left",
                                    borderRadius: 14,
                                    padding: "12px 14px",
                                    border: `1px solid ${active ? ui.border2 : ui.border}`,
                                    background: active
                                      ? "linear-gradient(135deg, rgba(138,180,255,0.20), rgba(255,184,107,0.12))"
                                      : "rgba(255,255,255,0.05)",
                                    color: ui.text,
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 10,
                                  }}
                                >
                                  <div style={{ display: "grid", gap: 2 }}>
                                    <div style={{ fontWeight: 950 }}>{s(v?.title || v?.name || "Video")}</div>
                                    <div style={{ color: ui.sub2, fontSize: 12 }}>
                                      {teacherName(v?.teacher) ? `O‘qituvchi: ${teacherName(v?.teacher)}` : "O‘qituvchi: —"}
                                    </div>
                                  </div>
                                  <span style={{ opacity: 0.7 }}>{active ? "▶" : "►"}</span>
                                </button>

                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                  <Btn variant="ghost" onClick={() => toggleVideoReaction(vid, "like")} disabled={!vid}>
                                    👍 {likeCount}
                                  </Btn>
                                  <Btn variant="ghost" onClick={() => toggleVideoReaction(vid, "dislike")} disabled={!vid}>
                                    👎 {dislikeCount}
                                  </Btn>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ color: ui.sub2 }}>Bu mavzuga hali video yuklanmagan. Tez orada qo‘shiladi.</div>
                        )}
                      </div>
                    </SubCard>
                  </>
                )}
              </Card>
            )}

            {tab === "tests" && (
              <Card>
                <div style={{ fontSize: 22, fontWeight: 1000, marginBottom: 12 }}>TESTLAR</div>

                {!activeTopicId ? (
                  <div style={{ color: ui.sub2 }}>
                    Avval <b>Kurs</b> bo‘limidan mavzuni tanlang.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    <SubCard>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                        <Chip tone="pink">Eng ko‘p layk olgan testlar tepada</Chip>
                        <Chip tone="neutral">{activeTopicName}</Chip>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 1000 }}>{activeTopicName || "Tanlangan mavzu"}</div>
                        {loadingTopic ? <Chip tone="warn">Yuklanmoqda...</Chip> : <Chip tone="pink">{sortedTests.length} ta</Chip>}
                      </div>

                      <div style={{ height: 10 }} />

                      <div style={{ display: "grid", gap: 8 }}>
                        {(sortedTests || []).length ? (
                          sortedTests.map((a) => {
                            const aid = String(a?._id || "");
                            const likeCount = getCount(a?.likeCount, a?.likes);
                            const dislikeCount = getCount(a?.dislikeCount, a?.dislikes);
                            const canStart = videoDoneTopics.includes(String(activeTopicId));
                            return (
                            <SubCard key={String(a?._id || Math.random())}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                                <div style={{ display: "grid", gap: 2 }}>
                                  <div style={{ fontWeight: 950 }}>{s(a?.title || a?.name || "Assignment")}</div>
                                  <div style={{ color: ui.sub2, fontSize: 12 }}>
                                    {teacherName(a?.teacher) ? `O‘qituvchi: ${teacherName(a?.teacher)}` : "O‘qituvchi: —"}
                                  </div>
                                  {a?.fileUrl ? (
                                    <div style={{ color: ui.sub2, fontSize: 12 }}>
                                      Fayl: {a?.fileName || "topshiriq"}{" "}
                                      <a
                                        href={API_BASE + a.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: ui.accent }}
                                      >
                                        (yuklab olish)
                                      </a>
                                    </div>
                                  ) : null}
                                </div>

                                <Btn variant="primary" onClick={() => startAttempt(aid)} disabled={!canStart || !aid}>
                                  Boshlash
                                </Btn>
                              </div>
                              <div style={{ height: 8 }} />
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <Btn variant="ghost" onClick={() => toggleAssignmentReaction(aid, "like")} disabled={!aid}>
                                  👍 {likeCount}
                                </Btn>
                                <Btn variant="ghost" onClick={() => toggleAssignmentReaction(aid, "dislike")} disabled={!aid}>
                                  👎 {dislikeCount}
                                </Btn>
                                {!canStart ? (
                                  <Chip tone="warn">Avval video ko‘ring</Chip>
                                ) : null}
                              </div>
                            </SubCard>
                          );
                          })
                        ) : (
                          <div style={{ color: ui.sub2 }}>Bu mavzu uchun test hali joylanmagan. Tez orada qo‘shiladi.</div>
                        )}
                      </div>
                    </SubCard>
{quizAttempt && (quizQuestions || []).length ? (
  <SubCard>
    <div style={{ fontSize: 20, fontWeight: 1000 }}>Quiz</div>

    <div style={{ height: 10 }} />

    <div style={{ display: "grid", gap: 12 }}>
      {quizQuestions.map((q, i) => (
        <div
          key={String(q._id || i)}
          style={{
            border: `1px solid ${ui.border}`,
            borderRadius: 14,
            padding: "12px",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <div style={{ fontWeight: 900 }}>
            {i + 1}. {s(q?.question || q?.text || "Savol")}
          </div>

          <div style={{ height: 8 }} />

          {(q?.options || []).map((opt, optIndex) => (
            <label
              key={optIndex}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name={`q_${String(q._id)}`}
                checked={quizAnswers[String(q._id)] === optIndex}
                onChange={() =>
                  setQuizAnswers((prev) => ({
                    ...prev,
                    [String(q._id)]: optIndex,
                  }))
                }
              />
              <span>{s(opt)}</span>
            </label>
          ))}
        </div>
      ))}

      <Btn
        variant="primary"
        disabled={quizSubmitting}
        onClick={async () => {
          if (!quizAttempt?._id) return;

          try {
            setQuizSubmitting(true);

            const answers = quizQuestions.map((q) => ({
              questionId: String(q._id),
              selectedIndex:
                quizAnswers[String(q._id)] === undefined
                  ? -1
                  : quizAnswers[String(q._id)],
            }));

            const res = await apiFetch(
              `/api/assignments/student/attempts/${quizAttempt._id}/submit`,
              {
                token,
                method: "POST",
                body: { answers },
              }
            );

            setQuizAttempt(null);
            setQuizQuestions([]);
            setQuizAnswers({});

            await loadAttempts();
            await loadProgressCurrent();
            await buildGradesTree();

            const score = res?.attempt?.scorePercent ?? 0;

            setMessage(`✅ Test topshirildi: ${score}%`);
          } catch {
            setMessage("❌ Submit error");
          } finally {
            setQuizSubmitting(false);
          }
        }}
      >
        {quizSubmitting ? "..." : "Submit"}
      </Btn>
    </div>
  </SubCard>
) : null}
                    <SubCard>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 1000 }}>Attemptlar</div>
                        {loadingAttempts ? <Chip tone="warn">Yuklanmoqda...</Chip> : <Chip tone="ok">{attempts.length} ta</Chip>}
                      </div>

                      <div style={{ height: 10 }} />

                      <div style={{ display: "grid", gap: 8 }}>
                        {(attempts || []).length ? (
                          attempts.slice(0, 50).map((at) => (
                            <div
                              key={String(at?._id || Math.random())}
                              style={{
                                borderRadius: 14,
                                padding: "10px 12px",
                                border: `1px solid ${ui.border}`,
                                background: "rgba(255,255,255,0.05)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 10,
                                flexWrap: "wrap",
                              }}
                            >
                              <div style={{ display: "grid", gap: 2 }}>
                                <div style={{ fontWeight: 950 }}>{s(at?.assignmentTitle || at?.assignment?.title || "Attempt")}</div>
                                <div style={{ color: ui.sub2, fontSize: 12 }}>
                                  {at?.createdAt ? new Date(at.createdAt).toLocaleString() : ""}
                                </div>
                              </div>

                              <Chip tone="ok">{Math.round(Number(at?.scorePercent || 0))}%</Chip>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: ui.sub2 }}>Hali topshirilgan testlar yo‘q. Birinchi testni boshlab ko‘ring.</div>
                        )}
                      </div>
                    </SubCard>
                  </div>
                )}
              </Card>
            )}

            {tab === "profile" && (
              <Card>
                <div style={{ fontSize: 22, fontWeight: 1000, marginBottom: 12 }}>PROFIL</div>

                <div style={{ display: "grid", gap: 12 }}>
                  <SubCard>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <div
                        style={{
                          width: 140,
                          height: 140,
                          borderRadius: 28,
                          border: `1px solid ${ui.border2}`,
                          overflow: "hidden",
                          background: "rgba(255,255,255,0.06)",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        {me?.avatarUrl ? (
                          <img src={API_BASE + me.avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ fontWeight: 1000, opacity: 0.8 }}>👤</div>
                        )}
                      </div>

                      <div style={{ display: "grid", gap: 2 }}>
                        <div style={{ fontWeight: 1000 }}>{me?.name || "Student"}</div>
                        <div style={{ color: ui.sub2, fontSize: 12 }}>{me?.email || ""}</div>
                      </div>
                    </div>

                    <div style={{ height: 12 }} />

                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={{ color: ui.sub2, fontSize: 12, fontWeight: 950 }}>Rasm yuklash</div>
                      <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <Btn variant="primary" onClick={uploadAvatar} disabled={!avatarFile || uploadingAvatar}>
                          {uploadingAvatar ? "..." : "Upload"}
                        </Btn>
                        <Btn variant="ghost" onClick={() => setAvatarFile(null)}>
                          Tozalash
                        </Btn>
                      </div>
                    </div>
                  </SubCard>

                  <SubCard>
                    <div style={{ color: ui.sub2, fontSize: 12, fontWeight: 950, marginBottom: 8 }}>
                      Ota‑ona ulash kodi
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <Chip tone="neutral">{me?.parentCode || "—"}</Chip>
                      <Btn
                        variant="ghost"
                        onClick={() => {
                          if (!me?.parentCode) return;
                          navigator.clipboard?.writeText?.(me.parentCode);
                          setMessage("✅ Kod nusxalandi");
                        }}
                        disabled={!me?.parentCode}
                      >
                        Nusxalash
                      </Btn>
                    </div>
                  </SubCard>

                  <SubCard>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <div style={{ color: ui.sub2, fontSize: 12, fontWeight: 950 }}>NATIJALAR</div>
                      <Chip tone="ok">{Math.round(calcCourseProgressPercent())}%</Chip>
                    </div>
                    <div style={{ height: 8 }} />
                    <div style={{ color: ui.sub2, fontSize: 12 }}>
                      Sotib olingan fan bo‘yicha umumiy bajarilgan foiz.
                    </div>
                  </SubCard>

                  <SubCard>
                    <div style={{ color: ui.sub2, fontSize: 12, fontWeight: 950, marginBottom: 8 }}>MAQSAD</div>
                    <Textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Masalan: IELTS 7.0, Matematika 90+ ..." />
                    <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                      <Btn variant="primary" onClick={saveGoal} disabled={savingGoal}>
                        {savingGoal ? "..." : "Saqlash"}
                      </Btn>
                      <Btn
                        variant="ghost"
                        onClick={() => {
                          try {
                            setGoal(localStorage.getItem(LS_GOAL) || "");
                          } catch {
                            setGoal("");
                          }
                          setMessage("");
                        }}
                      >
                        Qaytarish
                      </Btn>
                    </div>
                  </SubCard>
                </div>
              </Card>
            )}

            <div style={{ color: ui.sub2, fontSize: 12, textAlign: "center", marginTop: 18 }}>
              © {new Date().getFullYear()} KIBOO
            </div>
          </>
        )}
      </div>
    </div>
  );
}
