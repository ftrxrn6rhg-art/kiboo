import React, { useEffect, useMemo, useState } from "react";
import { getApiBase } from "../lib/api";

const API_BASE = getApiBase();

/* =========================
   Utils (token + fetch)
   ========================= */
function getStoredToken() {
  return (
    localStorage.getItem("PARENT_TOKEN") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    ""
  );
}
function clearStoredToken() {
  localStorage.removeItem("PARENT_TOKEN");
}
function normalizeUrl(u) {
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return `${API_BASE}${u}`;
  return `${API_BASE}/${u}`;
}
function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
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

/* =========================
   Parent Page
   ========================= */
export default function Parent() {
  const [token, setToken] = useState(getStoredToken());
  const isAuthed = !!token;

  const [message, setMessage] = useState("");

  /* -------------------------
     BRAND / PALETTE (sen yuborgan rasm)
     ------------------------- */
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
      shadow: "0 24px 80px rgba(0,0,0,0.55)",
      radius: 22,
      radius2: 18,
      font:
        '-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","SF Pro",system-ui,Arial,sans-serif',

      accent: "#8AB4FF",
      accent2: "#FFB86B",
      mint: "#6EE7B7",
      yellow: "#FFD29A",
      green: "#22C55E",
      red: "#FF3B30",
    };
  }, []);

  /* -------------------------
     Small UI components
     ------------------------- */
  const Card = ({ children, style }) => (
    <div
      style={{
        background: `linear-gradient(180deg, ${ui.card}, rgba(0,0,0,0.25))`,
        border: `1px solid ${ui.border}`,
        borderRadius: ui.radius,
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
        borderRadius: ui.radius2,
        padding: 14,
        ...style,
      }}
    >
      {children}
    </div>
  );

  const Divider = () => (
    <div style={{ height: 1, background: ui.border, margin: "12px 0" }} />
  );

  const Btn = ({ children, variant = "ghost", style, ...props }) => {
    let bg = "rgba(255,255,255,0.06)";
    let bd = ui.border;
    let col = ui.text;

    if (variant === "primary") {
      bg = `linear-gradient(135deg, ${ui.accent}, ${ui.accent2})`;
      bd = "transparent";
      col = "#0B0E16";
    } else if (variant === "danger") {
      bg = `linear-gradient(90deg, ${ui.red}, ${ui.accent2})`;
      bd = "transparent";
      col = "rgba(255,255,255,0.95)";
    } else if (variant === "good") {
      bg = `linear-gradient(90deg, ${ui.green}, ${ui.yellow})`;
      bd = "transparent";
      col = "#0b0d16";
    }

    return (
      <button
        type="button"
        style={{
          border: `1px solid ${bd}`,
          background: bg,
          color: col,
          padding: "10px 16px",
          borderRadius: 16,
          fontWeight: 900,
          cursor: "pointer",
          boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
          ...style,
        }}
        {...props}
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

  const Chip = ({ children, tone = "neutral" }) => {
    let bg = "rgba(255,255,255,0.06)";
    let bd = ui.border;
    let col = ui.text;

    if (tone === "pink") {
      bg = "rgba(138,180,255,0.18)";
      bd = "rgba(138,180,255,0.35)";
    }
    if (tone === "butter") {
      bg = "rgba(255,184,107,0.18)";
      bd = "rgba(255,184,107,0.35)";
      col = "rgba(255,255,255,0.92)";
    }
    if (tone === "ok") {
      bg = "rgba(34,197,94,0.18)";
      bd = "rgba(34,197,94,0.35)";
    }
    if (tone === "warn") {
      bg = "rgba(255,212,0,0.16)";
      bd = "rgba(255,212,0,0.35)";
      col = "rgba(255,255,255,0.92)";
    }

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 999,
          border: `1px solid ${bd}`,
          background: bg,
          color: col,
          fontSize: 12,
          fontWeight: 900,
        }}
      >
        {children}
      </span>
    );
  };

  const Stat = ({ title, value }) => (
    <SubCard>
      <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 16, fontWeight: 1000 }}>{value ?? "—"}</div>
    </SubCard>
  );

  /* -------------------------
     Data state
     ------------------------- */
  const [parent, setParent] = useState(null);
  const [loadingParent, setLoadingParent] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [linkCode, setLinkCode] = useState("");
  const [linking, setLinking] = useState(false);

  const [children, setChildren] = useState([]);
  const [activeChildId, setActiveChildId] = useState("");
  const [child, setChild] = useState(null);
  const [childSubscription, setChildSubscription] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [buySubjectId, setBuySubjectId] = useState("");
  const [buyMonths, setBuyMonths] = useState(1);
  const [buying, setBuying] = useState(false);

  // stats + results
  const [stats, setStats] = useState({
    subject: "—",
    currentTopic: "—",
    avgScore: 0,
    lastLogin: null,
    completed: 0,
    inProgress: 0,
    totalWatchMinutes: 0,
    weeklyMinutes: 0,
    weeklyUniqueVideos: 0,
    weeklyCompletedCount: 0,
    videoDoneCount: 0,
    testDoneCount: 0,
    fullDoneCount: 0,
    weeklyDailyMinutes: [],
  });
  const [results, setResults] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);

  /* -------------------------
     Auth actions
     ------------------------- */
  function logout() {
    clearStoredToken();
    setToken("");
    setMessage("");
    window.location.href = "/login?role=parent";
  }

  /* -------------------------
     API loaders
     ------------------------- */
  async function loadParent() {
    if (!token) return;
    try {
      setLoadingParent(true);
      const me = await tryApiFetch(
        ["/api/parents/me", "/api/parents/profile", "/api/users/me"],
        { token }
      );

      // normalize
      const p = me?.parent || me?.user || me;
      setParent(p || null);

      // children may be inside me
      const kids = me?.children || me?.kids || p?.children || [];
      if (Array.isArray(kids)) {
        setChildren(kids);
        const firstId = String(
          kids[0]?.studentId || kids[0]?._id || kids[0]?.id || kids[0]?.student || ""
        );
        if (!activeChildId && firstId) setActiveChildId(firstId);
      }
    } catch (e) {
      setMessage("❌ Parent: " + (e?.message || "xato"));
    } finally {
      setLoadingParent(false);
    }
  }

  async function loadChildren() {
    if (!token) return;
    try {
      const kidsRes = await tryApiFetch(
        ["/api/parents/children", "/api/parents/me/children", "/api/parents/me"],
        { token }
      );

      const kids = kidsRes?.children || kidsRes?.kids || kidsRes?.items || kidsRes;
      const arr = Array.isArray(kids) ? kids : [];
      setChildren(arr);

      const firstId = String(
        arr[0]?.studentId || arr[0]?._id || arr[0]?.id || arr[0]?.student || ""
      );
      if ((!activeChildId || !arr.some((x) => String(x?.studentId || x?._id || x?.id || x?.student || "") === String(activeChildId))) && firstId) {
        setActiveChildId(firstId);
      }
    } catch {
      // quiet
    }
  }

  async function loadSubjects() {
    try {
      const res = await tryApiFetch(["/api/subjects", "/api/subject"], { token });
      const list = res?.subjects ?? res?.items ?? res ?? [];
      const arr = Array.isArray(list) ? list : [];
      setSubjects(arr);

      if (!buySubjectId && arr[0]?._id) {
        setBuySubjectId(String(arr[0]._id));
      }
    } catch {
      // quiet
    }
  }

  async function loadChildBundle(childId) {
    if (!token || !childId) return;

    try {
      setLoadingStats(true);
      setMessage("");
      setChildSubscription(null);
      // child basic (parent uchun: children listdan olamiz)
      const c = (children || []).find((x) => String(x?.studentId || x?._id || x?.id || "") === String(childId)) || null;
      setChild(c);


      // subject/subscription (fallbacks)
      const subRes = await tryApiFetch(
        [
          `/api/parents/children/${encodeURIComponent(childId)}/subscription`,
          `/api/subscriptions/byStudent/${encodeURIComponent(childId)}`,
          `/api/subscriptions?studentId=${encodeURIComponent(childId)}`,
        ],
        { token }
      ).catch(() => null);

      const sub = subRes?.subscription || subRes;
      setChildSubscription(sub || null);
      const subjectTitle =
        sub?.subject?.name || sub?.subject?.title || sub?.subjectName || "—";
      const subjectId =
        sub?.subject?._id || sub?.subject || sub?.subjectId || "";
      if (!buySubjectId && subjectId) {
        setBuySubjectId(String(subjectId));
      }

          // progress/stats (fallbacks)
      const stRes = await tryApiFetch(
        [
          `/api/parents/children/${encodeURIComponent(childId)}/overview`,
          `/api/parents/children/${encodeURIComponent(childId)}/stats`,
          `/api/parents/stats?studentId=${encodeURIComponent(childId)}`,
          `/api/progress/summary?studentId=${encodeURIComponent(childId)}`,
        ],
        { token }
      ).catch(() => null);
     

     // results/attempts (fallbacks)
const resRes = await tryApiFetch(
  [
    `/api/parents/children/${encodeURIComponent(childId)}/attempts`,
    `/api/attempts?studentId=${encodeURIComponent(childId)}`,
    `/api/assignments/attempts?studentId=${encodeURIComponent(childId)}`,
  ],
  { token }
).catch(() => null);
      const attempts =
        resRes?.attempts ||
        resRes?.items ||
        resRes?.results ||
        (Array.isArray(resRes) ? resRes : []);

      const last = stRes?.lastQuizResult || stRes?.lastAttempt || attempts?.[0] || null;

      // compute avgScore quickly
      let avg = 0;
      if (Array.isArray(attempts) && attempts.length) {
        const sum = attempts.reduce((acc, a) => acc + Number(a?.scorePercent || a?.score || 0), 0);
        avg = Math.round(sum / attempts.length);
      } else if (last?.scorePercent != null) {
        avg = Number(last.scorePercent) || 0;
      }

      const overview = stRes || {};

      setStats({
        subject: subjectTitle || "—",
        currentTopic: overview?.progress?.currentTopic?.title || overview?.currentTopicTitle || overview?.currentTopic || "—",
        avgScore: overview?.lastQuizResult?.scorePercent ?? overview?.avgScorePercent ?? avg ?? 0,
        lastLogin: overview?.lastActivityAt || overview?.progress?.lastSeenAt || overview?.lastLogin || overview?.lastSeen || c?.lastLogin || c?.lastSeenAt || null,
        completed: overview?.progress?.fullDoneCount ?? overview?.weekly?.completedCount ?? overview?.completedCount ?? overview?.completed ?? 0,
        inProgress: overview?.weekly?.inProgressCount ?? overview?.inProgressCount ?? overview?.inProgress ?? 0,
        totalWatchMinutes: overview?.progress?.totalWatchMinutes ?? 0,
        weeklyMinutes: overview?.weekly?.totalMinutes ?? 0,
        weeklyUniqueVideos: overview?.weekly?.uniqueVideos ?? 0,
        weeklyCompletedCount: overview?.weekly?.completedCount ?? 0,
        videoDoneCount: overview?.progress?.videoDoneCount ?? 0,
        testDoneCount: overview?.progress?.testDoneCount ?? 0,
        fullDoneCount: overview?.progress?.fullDoneCount ?? 0,
        weeklyDailyMinutes:
          overview?.weekly?.dailyMinutes ||
          overview?.weekly?.days ||
          overview?.weeklyMinutesByDay ||
          [],
      });

      const cleaned = Array.isArray(attempts)
        ? attempts.map((a) => ({
            _id: a?._id || `${a?.assignmentId || ""}_${a?.submittedAt || ""}`,
            title: a?.title || a?.assignmentTitle || a?.assignment?.title || "Test",
            scorePercent: a?.scorePercent ?? a?.score ?? 0,
            submittedAt: a?.submittedAt || a?.createdAt || null,
          }))
        : [];

      setResults(cleaned);

      // attach subject title to child (for UI)
      setChild((prev) => (prev ? { ...prev, subjectTitle } : prev));
    } catch (e) {
      setMessage("❌ Statistika: " + (e?.message || "xato"));
      setStats((s) => ({ ...s }));
      setResults([]);
    } finally {
      setLoadingStats(false);
    }
  }

  async function uploadAvatar() {
    if (!token || !avatarFile) return;
    try {
      setUploadingAvatar(true);
      setMessage("");

      const fd = new FormData();
      fd.append("avatar", avatarFile);

      // backend fallback endpoints
      await tryApiFetch(
        ["/api/parents/me/avatar", "/api/users/me/avatar"],
        { token, method: "POST", body: fd, isForm: true }
      );

      setAvatarFile(null);
      await loadParent();
      setMessage("✅ Avatar yangilandi");
    } catch (e) {
      setMessage("❌ Avatar: " + (e?.message || "xato"));
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function linkChildByCode() {
    if (!token || !linkCode.trim()) return;
    try {
      setLinking(true);
      setMessage("");
      const res = await apiFetch("/api/parents/link", {
        token,
        method: "POST",
        body: { parentCode: linkCode.trim().toUpperCase() },
      });
      const linkedId = String(
        res?.student?._id || res?.student?.studentId || res?.link?.student || ""
      );
      setLinkCode("");
      await loadChildren();
      if (linkedId) setActiveChildId(linkedId);
      setMessage("✅ Farzand ulanildi");
    } catch (e) {
      setMessage("❌ Ulanish: " + (e?.message || "xato"));
    } finally {
      setLinking(false);
    }
  }

  async function unlinkChild(childId) {
    if (!token || !childId) return;
    try {
      setMessage("");
      await apiFetch(`/api/parents/children/${encodeURIComponent(String(childId))}/unlink`, {
        token,
        method: "DELETE",
      });
      const nextChildren = (children || []).filter(
        (x) => String(x?.studentId || x?._id || x?.id || x?.student || "") !== String(childId)
      );
      setChildren(nextChildren);
      if (String(activeChildId) === String(childId)) {
        const nextId = String(
          nextChildren[0]?.studentId || nextChildren[0]?._id || nextChildren[0]?.id || nextChildren[0]?.student || ""
        );
        setActiveChildId(nextId);
        if (!nextId) {
          setChild(null);
          setChildSubscription(null);
          setResults([]);
        }
      }
      setMessage("✅ Farzand o‘chirildi");
    } catch (e) {
      setMessage("❌ O‘chirish: " + (e?.message || "xato"));
    }
  }

  async function buySubscription() {
    if (!token || !activeChildId) return;
    if (!buySubjectId) {
      setMessage("❌ Fan tanlang");
      return;
    }
    try {
      setBuying(true);
      setMessage("");
      const res = await apiFetch(`/api/parents/children/${encodeURIComponent(String(activeChildId))}/subscribe`, {
        token,
        method: "POST",
        body: { subjectId: buySubjectId, months: buyMonths },
      });
      setMessage(res?.message || "✅ Obuna yaratildi");
      await loadChildBundle(activeChildId);
    } catch (e) {
      setMessage("❌ Obuna: " + (e?.message || "xato"));
    } finally {
      setBuying(false);
    }
  }

  async function loadAll() {
    await loadParent();
    await loadChildren();
    await loadSubjects();
    if (activeChildId) await loadChildBundle(activeChildId);
  }

  /* -------------------------
     Effects
     ------------------------- */
  useEffect(() => {
    if (!token) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (!activeChildId) return;
    loadChildBundle(activeChildId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChildId]);

  /* =========================
     PART 1 END — PART 2 will continue (Render/UI)
     ========================= */

  /* =========================
     Render
     ========================= */
  if (!isAuthed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: ui.bg,
          color: ui.text,
          fontFamily: ui.font,
          display: "grid",
          placeItems: "center",
          padding: 24,
        }}
      >
        <Card style={{ maxWidth: 520, width: "100%" }}>
          <div style={{ fontSize: 28, fontWeight: 1000, marginBottom: 10 }}>KIBOO</div>
          <div style={{ color: ui.sub, marginBottom: 14 }}>
            Parent token yo‘q. Login qiling.
          </div>
          <Btn variant="primary" onClick={() => (window.location.href = "/login?role=parent")}>
            Login
          </Btn>
        </Card>
      </div>
    );
  }

  const parentName = parent?.name || parent?.fullName || "—";
  const parentEmail = parent?.email || "—";
  const parentAvatar = parent?.avatarUrl || parent?.avatar || "";

  const childName = child?.name || child?.fullName || "—";
  const childGrade = child?.grade || child?.currentGrade || "—";
  const childSubject = child?.subjectTitle || childSubscription?.subject?.name || stats.subject || "—";
  const avgDailyHours = stats.weeklyMinutes ? (Number(stats.weeklyMinutes || 0) / 60 / 7) : 0;
  const avgDailyTopics = stats.weeklyCompletedCount ? Number(stats.weeklyCompletedCount || 0) / 7 : 0;
  const chartLabels = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
  const weeklyChart = chartLabels.map((label, index) => {
    const raw = Array.isArray(stats.weeklyDailyMinutes) ? stats.weeklyDailyMinutes[index] : null;
    const value =
      typeof raw === "number"
        ? raw
        : Number(raw?.minutes || raw?.value || raw?.totalMinutes || 0);
    return { label, value };
  });
  const weeklyChartMax = Math.max(...weeklyChart.map((item) => Number(item.value || 0)), 1);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: ui.bg,
        color: ui.text,
        fontFamily: ui.font,
      }}
    >
      {/* soft aura */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(1100px 700px at 18% 10%, rgba(138,180,255,0.16), transparent 60%),
            radial-gradient(1000px 650px at 85% 15%, rgba(255,184,107,0.14), transparent 55%),
            radial-gradient(900px 650px at 55% 92%, rgba(110,231,183,0.10), transparent 60%),
            radial-gradient(900px 650px at 30% 85%, rgba(255,210,140,0.10), transparent 60%)
          `,
        }}
      />

      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto", padding: "28px 16px 60px" }}>
        {/* hero */}
        <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
          <div
            style={{
              fontSize: 34,
              fontWeight: 1000,
              letterSpacing: -0.8,
              background: `linear-gradient(120deg, ${ui.accent}, ${ui.accent2})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Ota‑ona paneli
          </div>
          <div style={{ color: ui.sub2, fontSize: 14 }}>
            Farzandingizning o‘qish natijalari va faolligi real vaqtda ko‘rinadi.
          </div>
        </div>
        {/* TOP BAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 1000,
              letterSpacing: -1.6,
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

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
            <Chip tone="butter">Ota-ona panel</Chip>
            <Btn variant="primary" onClick={loadAll} disabled={loadingParent || loadingStats}>
              {loadingParent || loadingStats ? "..." : "Yangilash"}
            </Btn>
            <Btn variant="danger" onClick={logout}>
              Logout
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 14,
            alignItems: "start",
          }}
        >
          {/* LEFT */}
          <div style={{ display: "grid", gap: 14 }}>
            {/* Parent profile */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 1000 }}>OTA-ONA PROFILI</div>
                <Chip tone="pink">{loadingParent ? "Yuklanmoqda..." : "Tayyor"}</Chip>
              </div>

              <Divider />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                <SubCard>
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
                      marginBottom: 10,
                    }}
                  >
                    {parentAvatar ? (
                      <img
                        src={normalizeUrl(parentAvatar)}
                        alt="avatar"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ color: ui.sub }}>Avatar</div>
                    )}
                  </div>

                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ color: ui.sub2, fontSize: 12, fontWeight: 950 }}>Rasm yuklash</div>
                    <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <Btn variant="primary" onClick={uploadAvatar} disabled={!avatarFile || uploadingAvatar}>
                        {uploadingAvatar ? "..." : "Yuklash"}
                      </Btn>
                      <Btn
                        onClick={() => {
                          setAvatarFile(null);
                          setMessage("");
                        }}
                      >
                        Tozalash
                      </Btn>
                    </div>
                  </div>
                </SubCard>

                <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
                  <SubCard>
                    <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Ism</div>
                    <Input value={parentName} disabled />
                  </SubCard>
                  <SubCard>
                    <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Email</div>
                    <Input value={parentEmail} disabled />
                  </SubCard>
                  <SubCard>
                    <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Farzand uchun obuna</div>
                    <div style={{ display: "grid", gap: 10 }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <Chip tone="butter">Fan: {childSubject}</Chip>
                        {childSubscription?.status === "active" ? (
                          <Chip tone="ok">Faol</Chip>
                        ) : (
                          <Chip tone="warn">Faol emas</Chip>
                        )}
                        {childSubscription?.endDate ? (
                          <Chip tone="neutral">Muddati: {fmtDate(childSubscription.endDate)}</Chip>
                        ) : null}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
                        <Select value={buySubjectId} onChange={(e) => setBuySubjectId(e.target.value)}>
                          {subjects?.length ? (
                            subjects.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.name || s.title || "Fan"}
                              </option>
                            ))
                          ) : (
                            <option value="">Fan topilmadi</option>
                          )}
                        </Select>
                        <Select value={buyMonths} onChange={(e) => setBuyMonths(Number(e.target.value || 1))}>
                          <option value={1}>1 oy</option>
                          <option value={3}>3 oy</option>
                          <option value={12}>12 oy</option>
                        </Select>
                      </div>

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                        <Btn variant="primary" onClick={buySubscription} disabled={buying || !buySubjectId || !activeChildId}>
                          {buying ? "..." : "Obuna sotib olish"}
                        </Btn>
                      </div>
                    </div>
                  </SubCard>
                  <SubCard>
                    <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Farzandni ulash (kod)</div>
                    <Input
                      value={linkCode}
                      onChange={(e) => setLinkCode(e.target.value)}
                      placeholder="Masalan: KIBOO-1234"
                    />
                    <div style={{ height: 8 }} />
                    <Btn variant="primary" onClick={linkChildByCode} disabled={!linkCode.trim() || linking}>
                      {linking ? "..." : "Ulash"}
                    </Btn>
                  </SubCard>
                </div>
              </div>
            </Card>

            {/* Children */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 1000 }}>FARZANDLAR</div>
                <Chip tone="neutral">{children?.length || 0} ta</Chip>
              </div>

              <Divider />

              {children?.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {children.map((c) => {
                    const cid = String(c?._id || c?.id || c?.studentId || c?.student || c?.childId || c?.child || "");
                    const active = cid && cid === String(activeChildId);
                    const label = c?.name || c?.fullName || cid.slice(0, 6);

                    return (
                      <div
                        key={cid}
                        style={{
                          width: "100%",
                          background: active ? "rgba(232,209,167,0.12)" : "rgba(0,0,0,0.18)",
                          border: `1px solid ${active ? ui.border2 : ui.border}`,
                          borderRadius: 16,
                          padding: "12px 12px",
                          color: ui.text,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveChildId(cid)}
                          style={{
                            flex: 1,
                            textAlign: "left",
                            background: "transparent",
                            border: "none",
                            color: ui.text,
                            cursor: "pointer",
                            padding: 0,
                            display: "grid",
                            gap: 4,
                          }}
                        >
                          <div style={{ fontWeight: 1000 }}>{label}</div>
                          <div style={{ color: ui.sub2, fontSize: 12 }}>
                            {active ? "Tanlandi" : "Ochish"}
                          </div>
                        </button>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          {active ? <Chip tone="butter">Faol</Chip> : <Chip tone="pink">Tanlash</Chip>}
                          <Btn
                            variant="danger"
                            onClick={() => unlinkChild(cid)}
                            style={{ padding: "8px 12px", borderRadius: 12 }}
                          >
                            O‘chirish
                          </Btn>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ color: ui.sub2, fontSize: 13 }}>
                  Farzand topilmadi (backendda link bo‘lmagan bo‘lishi mumkin).
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT */}
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            {/* Child overview */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 1000 }}>BOLA HOLATI</div>
                {loadingStats ? <Chip tone="warn">Yuklanmoqda...</Chip> : <Chip tone="ok">Tayyor</Chip>}
              </div>

              <Divider />

              <div style={{ display: "grid", gap: 12 }}>
                <SubCard style={{ display: "grid", gap: 6 }}>
                  <div style={{ fontSize: 16, fontWeight: 1000 }}>{childName}</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Chip tone="pink">Sinf: {childGrade}</Chip>
                    <Chip tone="butter">Fan: {childSubject}</Chip>
                  </div>
                </SubCard>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                  <SubCard>
                    <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Bugun o‘qigan vaqt</div>
                    <div style={{ fontSize: 26, fontWeight: 1000 }}>
                      {weeklyChart[weeklyChart.length - 1]?.value || 0} min
                    </div>
                  </SubCard>
                  <SubCard>
                    <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Haftalik o‘qish</div>
                    <div style={{ fontSize: 26, fontWeight: 1000 }}>{Number(stats.weeklyMinutes || 0)} min</div>
                  </SubCard>
                  <SubCard>
                    <div style={{ color: ui.sub2, fontSize: 12, marginBottom: 6 }}>Oxirgi test natijasi</div>
                    <div style={{ fontSize: 26, fontWeight: 1000 }}>{Number(stats.avgScore || 0)}%</div>
                  </SubCard>
                </div>

                <SubCard>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 1000 }}>Haftalik o‘qish dinamikasi</div>
                      <div style={{ color: ui.sub2, fontSize: 12 }}>Farzandingiz haftaning qaysi kunlari faol bo‘lganini ko‘ring.</div>
                    </div>
                    <Chip tone="butter">7 kun</Chip>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 10, alignItems: "end", minHeight: 160 }}>
                    {weeklyChart.map((item) => (
                      <div key={item.label} style={{ display: "grid", gap: 8, justifyItems: "center" }}>
                        <div style={{ color: ui.sub2, fontSize: 11 }}>{item.value} min</div>
                        <div
                          style={{
                            width: "100%",
                            maxWidth: 42,
                            height: `${Math.max(18, (Number(item.value || 0) / weeklyChartMax) * 110)}px`,
                            borderRadius: 14,
                            background: `linear-gradient(180deg, ${ui.accent}, ${ui.accent2})`,
                            boxShadow: "0 12px 24px rgba(0,0,0,0.22)",
                          }}
                        />
                        <div style={{ color: ui.sub2, fontSize: 11 }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </SubCard>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                  <Stat title="Qaysi mavzugacha keldi" value={stats.currentTopic || "—"} />
                  <Stat title="Oxirgi kirish" value={fmtDate(stats.lastLogin)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                  <Stat title="Bajarilgan / Jarayonda" value={`${Number(stats.completed || 0)} / ${Number(stats.inProgress || 0)}`} />
                  <Stat title="Ko‘rilgan videolar" value={Number(stats.weeklyUniqueVideos || 0)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                  <Stat title="Kuniga o‘rtacha soat" value={avgDailyHours ? `${avgDailyHours.toFixed(1)} soat` : "—"} />
                  <Stat title="Kuniga o‘rtacha mavzu" value={avgDailyTopics ? `${avgDailyTopics.toFixed(1)} ta` : "—"} />
                </div>

              </div>
            </Card>

            {/* Results */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 1000 }}>BARCHA NATIJALAR</div>
                <Chip tone="neutral">{results?.length || 0} ta</Chip>
              </div>

              <Divider />

              {results?.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {results.slice(0, 20).map((r) => (
                    <SubCard
                      key={r._id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div style={{ display: "grid", gap: 6 }}>
                        <div style={{ fontWeight: 1000 }}>{r.title}</div>
                        <div style={{ color: ui.sub2, fontSize: 12 }}>
                          {fmtDate(r.submittedAt)}
                        </div>
                      </div>

                      <Chip tone={Number(r.scorePercent) >= 80 ? "ok" : Number(r.scorePercent) >= 50 ? "warn" : "pink"}>
                        {Number(r.scorePercent)}%
                      </Chip>
                    </SubCard>
                  ))}
                </div>
              ) : (
                <div style={{ color: ui.sub2, fontSize: 13 }}>
                  Hali test natijalari ko‘rinmayapti. Farzandingiz test ishlagach shu yerda paydo bo‘ladi.
                </div>
              )}
            </Card>
          </div>
        </div>

        <div style={{ color: ui.sub2, fontSize: 12, textAlign: "center", marginTop: 18 }}>
          © {new Date().getFullYear()} KIBOO
        </div>
      </div>
    </div>
  );
}
