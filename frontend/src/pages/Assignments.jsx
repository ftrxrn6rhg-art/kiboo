import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ---------------- utils ---------------- */
function getStoredToken() {
  return (
    localStorage.getItem("STUDENT_TOKEN") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("TEACHER_TOKEN") || // fallback (dev)
    ""
  );
}

function setStoredToken(t) {
  if (t) localStorage.setItem("STUDENT_TOKEN", t);
}

function clearStoredToken() {
  localStorage.removeItem("STUDENT_TOKEN");
}

function fmtDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
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

function normalizeUrl(u) {
  if (!u) return "";
  if (String(u).startsWith("http")) return String(u);
  return `${API_BASE}${String(u)}`;
}

/* ---------------- component ---------------- */
export default function Assignments() {
  /* ---------------- auth ---------------- */
  const [token, setToken] = useState(getStoredToken());
  const isAuthed = !!token;

  /* ---------------- ui message ---------------- */
  const [message, setMessage] = useState("");

  /* ---------------- profile ---------------- */
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  /* ---------------- curriculum selection ---------------- */
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedGrade, setSelectedGrade] = useState(null); // number | null
  const [selectedTopicId, setSelectedTopicId] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // English: 1..5 (level)
  const [englishLevel, setEnglishLevel] = useState(1);

  /* ---------------- assignments flow ---------------- */
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const [active, setActive] = useState(null);
  // active = { assignmentId, attemptId, assignment, startedAt }

  const [answers, setAnswers] = useState({}); // { [questionIndex]: optionIndex }
  const [submitting, setSubmitting] = useState(false);

  const [result, setResult] = useState(null); // { score, total, correctCount, ... }

  /* ---------------- UI tokens ---------------- */
  const ui = useMemo(() => {
    const bg = "#070A12";
    const card = "rgba(255,255,255,0.06)";
    const card2 = "rgba(255,255,255,0.045)";
    const border = "rgba(255,255,255,0.10)";
    const border2 = "rgba(255,255,255,0.16)";
    const text = "rgba(255,255,255,0.92)";
    const sub = "rgba(255,255,255,0.66)";
    const sub2 = "rgba(255,255,255,0.52)";

    const calm1 = "#8BE9FD"; // cyan
    const calm2 = "#A78BFA"; // violet
    const calm3 = "#34D399"; // green

    return {
      bg,
      card,
      card2,
      border,
      border2,
      text,
      sub,
      sub2,
      calm1,
      calm2,
      calm3,
      radius: 22,
      radius2: 16,
      shadow: "0 18px 50px rgba(0,0,0,0.55)",
      blur: "blur(14px)",
      font:
        '-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Segoe UI",Inter,system-ui,Arial,sans-serif',
    };
  }, []);

  const Card = ({ children, style }) => (
    <div
      style={{
        background: ui.card,
        border: `1px solid ${ui.border}`,
        borderRadius: ui.radius,
        boxShadow: ui.shadow,
        backdropFilter: ui.blur,
        WebkitBackdropFilter: ui.blur,
        padding: 16,
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

  const Divider = () => <div style={{ height: 1, background: ui.border, margin: "12px 0" }} />;

  const Btn = ({ children, variant = "default", disabled, style, ...rest }) => {
    const base = {
      appearance: "none",
      border: "none",
      outline: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      padding: "10px 12px",
      borderRadius: 14,
      fontWeight: 900,
      fontSize: 13,
      color: ui.text,
      background: "rgba(255,255,255,0.08)",
      borderTop: "1px solid rgba(255,255,255,0.10)",
      borderLeft: "1px solid rgba(255,255,255,0.08)",
      borderRight: "1px solid rgba(0,0,0,0.25)",
      borderBottom: "1px solid rgba(0,0,0,0.35)",
      transition: "transform 120ms ease, filter 120ms ease, opacity 120ms ease",
      opacity: disabled ? 0.55 : 1,
      filter: disabled ? "saturate(0.7)" : "none",
      userSelect: "none",
      boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
      ...style,
    };

    const variants = {
      default: {},
      primary: {
        background: `linear-gradient(135deg, ${ui.calm1} 0%, ${ui.calm2} 55%, ${ui.calm3} 115%)`,
        color: "#07111a",
        filter: "saturate(1.05)",
      },
      ghost: { background: "rgba(255,255,255,0.05)" },
      danger: { background: "rgba(251,113,133,0.18)", color: ui.text },
    };

    return (
      <button
        disabled={disabled}
        {...rest}
        style={{ ...base, ...(variants[variant] || {}) }}
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

  const Select = (props) => (
    <select
      {...props}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 14,
        border: `1px solid ${ui.border}`,
        background: "rgba(0,0,0,0.22)",
        color: ui.text,
        outline: "none",
        fontSize: 13,
        ...props.style,
      }}
    />
  );

  const Chip = ({ children, tone = "neutral" }) => {
    const tones = {
      neutral: { bg: "rgba(255,255,255,0.08)", bd: ui.border2, tx: ui.text },
      ok: { bg: "rgba(52,211,153,0.14)", bd: "rgba(52,211,153,0.30)", tx: "rgba(209,255,238,0.98)" },
      warn: { bg: "rgba(251,191,36,0.14)", bd: "rgba(251,191,36,0.30)", tx: "rgba(255,242,206,0.98)" },
      bad: { bg: "rgba(251,113,133,0.14)", bd: "rgba(251,113,133,0.30)", tx: "rgba(255,224,231,0.98)" },
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
          fontWeight: 900,
        }}
      >
        {children}
      </span>
    );
  };

  const subjectLabel = (s) => s?.name || s?.title || "—";

  const selectedSubject = useMemo(
    () => subjects.find((x) => String(x?._id) === String(selectedSubjectId)),
    [subjects, selectedSubjectId]
  );

  const isEnglishSubject = useMemo(() => {
    const slug = String(selectedSubject?.slug || "").toLowerCase();
    const nm = String(selectedSubject?.name || selectedSubject?.title || "").toLowerCase();
    return slug.includes("ingliz") || nm.includes("ingliz");
  }, [selectedSubject]);

  /* ---------------- actions ---------------- */
  const logout = () => {
    clearStoredToken();
    setToken("");
    setProfile(null);
    setSubjects([]);
    setTopics([]);
    setAssignments([]);
    setSelectedSubjectId("");
    setSelectedGrade(null);
    setSelectedTopicId("");
    setActive(null);
    setAnswers({});
    setResult(null);
    setMessage("✅ Logout bo‘ldi");
  };

  async function loadProfile() {
    if (!token) return;
    try {
      setLoadingProfile(true);
      setMessage("");
      const me = await tryApiFetch(
        ["/api/users/me", "/api/users/me", "/api/profile"],
        { token }
      );
      const user = me?.user || me || null;
      setProfile(user);

      // agar backend profilida grade bo‘lsa: default tanlaymiz
      const g = Number(user?.grade);
      if (!Number.isNaN(g) && g >= 1 && g <= 11) {
        setSelectedGrade((prev) => (prev == null ? g : prev));
      }
    } catch (e) {
      setProfile(null);
      setMessage("❌ Profil: " + (e?.message || "xato"));
    } finally {
      setLoadingProfile(false);
    }
  }

  async function uploadStudentAvatar() {
    if (!token) return setMessage("❗ Token yo‘q");
    if (!avatarFile) return setMessage("❗ Rasm tanlang");
    try {
      setUploadingAvatar(true);
      setMessage("");

      const fd = new FormData();
      // backend: form-data: avatar=<file>
      fd.append("avatar", avatarFile);

      await tryApiFetch(
        ["/api/users/me/avatar", "/api/users/me/avatar", "/api/profile/avatar"],
        { token, method: "POST", body: fd, isForm: true }
      );

      setAvatarFile(null);
      setMessage("✅ Avatar yuklandi");
      await loadProfile();
    } catch (e) {
      setMessage("❌ Avatar: " + (e?.message || "xato"));
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function loadSubjects(gradeForSubjects) {
    if (!token) return;
    const g = Number(gradeForSubjects ?? selectedGrade ?? profile?.grade ?? 6) || 6;

    try {
      setLoadingSubjects(true);
      setMessage("");
      const res = await apiFetch(`/api/subjects?grade=${encodeURIComponent(String(g))}`, { token });
      const list = res?.subjects ?? res?.items ?? res ?? [];
      setSubjects(Array.isArray(list) ? list : []);
    } catch (e) {
      setSubjects([]);
      setMessage("❌ Fanlar: " + (e?.message || "xato"));
    } finally {
      setLoadingSubjects(false);
    }
  }

  async function loadTopics({ subjectId, grade }) {
    if (!token) return;
    if (!subjectId) return;

    // English bo‘lsa: grade o‘rniga level (1..5) yuboramiz
    const gradeForTopics = isEnglishSubject ? Number(englishLevel) : Number(grade);

    try {
      setLoadingTopics(true);
      setMessage("");
      const res = await apiFetch(
        `/api/topics?subjectId=${encodeURIComponent(String(subjectId))}&grade=${encodeURIComponent(String(gradeForTopics))}`,
        { token }
      );
      const list = res?.topics ?? res?.items ?? res ?? [];
      const arr = Array.isArray(list) ? list : [];
      // order bo‘yicha tartib (backend order bo‘lsa)
      arr.sort((a, b) => (Number(a?.order) || 0) - (Number(b?.order) || 0));
      setTopics(arr);
    } catch (e) {
      setTopics([]);
      setMessage("❌ Mavzular: " + (e?.message || "xato"));
    } finally {
      setLoadingTopics(false);
    }
  }

  async function loadStudentAssignments() {
    if (!token) return;

    try {
      setLoadingAssignments(true);
      setMessage("");

      // backend MVP: /api/assignments/student
      const data = await apiFetch("/api/assignments/student/current", { token });

      const list = data?.assignments ?? data?.items ?? data ?? [];
      const arr = Array.isArray(list) ? list : [];

      // topic tanlangan bo‘lsa — shu topic bo‘yicha filtr
      const filtered = selectedTopicId
        ? arr.filter((a) => String(a?.topicId || a?.topic?._id || a?.topic) === String(selectedTopicId))
        : arr;

      // createdAt bo‘yicha tartib + (bo‘lsa) order
      filtered.sort((a, b) => {
        const ao = Number(a?.order) || 0;
        const bo = Number(b?.order) || 0;
        if (ao !== bo) return ao - bo;
        return new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime();
      });

      setAssignments(filtered);


      //* ✅ autostart (agar ?autostart=1 bo‘lsa) */
      try {
        const params = new URLSearchParams(location.search);
        if (params.get("autostart") === "1") {
          const firstId = filtered?.[0]?._id;
          if (firstId) {
            // agar active bo‘lmasa — start
            setTimeout(() => {
              startAssignment(firstId);
            }, 0);
          }
        }
      } catch {}
    } catch (e) {
      setAssignments([]);
      setMessage("❌ Topshiriqlar: " + (e?.message || "xato"));
    } finally {
      setLoadingAssignments(false);
    }
  }

  async function startAssignment(assignmentId) {
    if (!token) return;
    if (!assignmentId) return;

    try {
      setMessage("");
      setResult(null);
      setAnswers({});
      const data = await apiFetch(`/api/assignments/student/${assignmentId}/start`, { token, method: "POST" });

      // MVP: { attemptId, assignment }
      const attemptId = data?.attemptId || data?.attempt?._id || "";
      const assignment = data?.assignment || data?.item || null;

      setActive({
        assignmentId,
        attemptId,
        assignment,
        startedAt: new Date().toISOString(),
      });
    } catch (e) {
      setMessage("❌ Start: " + (e?.message || "xato"));
    }
  }

  async function submitAttempt() {
    if (!token) return;
    if (!active?.attemptId) return;

    try {
      setSubmitting(true);
      setMessage("");

      // answers array ko‘rinishida yuboramiz
      const answerArr = [];
      const qs = active?.assignment?.questions || [];

      for (let i = 0; i < qs.length; i++) {
        const picked = answers[i];
        answerArr.push({ questionId: qs[i]?._id, selectedIndex: typeof picked === "number" ? picked : -1 });
      }

      const data = await apiFetch(`/api/assignments/student/attempts/${active.attemptId}/submit`, {
        token,
        method: "POST",
        body: { answers: answerArr },
      });

      setResult(data?.result || data || null);
      setMessage("✅ Yuborildi");
      try {
        const params = new URLSearchParams(location.search);
        if (params.get("autostart") === "1") {
          nav("/student");
          return;
        }
      } catch {}

      await loadStudentAssignments();
    } catch (e) {
      setMessage("❌ Submit: " + (e?.message || "xato"));
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------------- effects ---------------- */
  useEffect(() => {
    if (!token) return;
    (async () => {
      await loadProfile();
      // grade default bo‘lsa ham fanlarni yuklaymiz
      await loadSubjects(selectedGrade ?? 6);
      await loadStudentAssignments();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Subject tanlansa: grade bosqichi ochiladi, keyin topics
  useEffect(() => {
    if (!token) return;

    // reset chain
    setTopics([]);
    setSelectedTopicId("");
    setAssignments([]);
    setActive(null);
    setAnswers({});
    setResult(null);

    if (!selectedSubjectId) return;
    // grade hali tanlanmagan bo‘lsa: profile.grade yoki 6
    const g = Number(selectedGrade ?? profile?.grade ?? 6) || 6;
    setSelectedGrade(g);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubjectId]);

  // grade/englishLevel o‘zgarsa: topics reload
  useEffect(() => {
    if (!token) return;
    if (!selectedSubjectId) return;
    if (!selectedGrade) return;

    (async () => {
      await loadTopics({ subjectId: selectedSubjectId, grade: selectedGrade });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGrade, selectedSubjectId, englishLevel, token, isEnglishSubject]);

  // topic o‘zgarsa: assignments reload (studentga tegishli)
  useEffect(() => {
    if (!token) return;
    (async () => {
      await loadStudentAssignments();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopicId, token]);

  /* ---------------- render helpers ---------------- */
  const bigBrand = (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          fontSize: 34,
          fontWeight: 1000,
          letterSpacing: -1.2,
          background: `linear-gradient(135deg, ${ui.calm1} 0%, ${ui.calm2} 55%, ${ui.calm3} 115%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          lineHeight: 1,
        }}
      >
        KIBOO
      </div>
      <Chip tone="neutral">Topshiriqlar</Chip>
    </div>
  );

  const activeAssignment = active?.assignment || null;
  const activeQuestions = activeAssignment?.questions || [];

  return (
    <div style={{ minHeight: "100vh", background: ui.bg, color: ui.text, fontFamily: ui.font }}>
      {/* calm aurora bg */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(1200px 800px at 18% 10%, rgba(139,233,253,0.14), transparent 60%), radial-gradient(900px 700px at 82% 18%, rgba(167,139,250,0.14), transparent 55%), radial-gradient(900px 700px at 50% 92%, rgba(52,211,153,0.08), transparent 55%)",
        }}
      />

      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto", padding: "22px 16px 60px" }}>
        {/* TOP */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
          {bigBrand}

          {isAuthed ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={loadStudentAssignments} disabled={loadingAssignments}>
                {loadingAssignments ? "..." : "Yangilash"}
              </Btn>
              <Btn variant="danger" onClick={logout}>
                Logout
              </Btn>
            </div>
          ) : (
            <Chip tone="warn">Guest</Chip>
          )}
        </div>

        {message ? (
          <div style={{ marginBottom: 12 }}>
            <Card>
              <div style={{ fontSize: 13 }}>{message}</div>
            </Card>
          </div>
        ) : null}

        {!isAuthed ? (
          <Card style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ fontSize: 16, fontWeight: 950, marginBottom: 10 }}>Token topilmadi</div>
            <div style={{ color: ui.sub2, fontSize: 13, lineHeight: 1.55 }}>
              Hozir bu sahifa <b>STUDENT_TOKEN</b> bilan ishlaydi. Login orqali token tushsa avtomatik bo‘ladi.
              Vaqtincha dev uchun tokenni localStorage ga qo‘yishingiz mumkin:
              <div style={{ marginTop: 10 }}>
                <code style={{ color: ui.text }}>
                  localStorage.setItem("STUDENT_TOKEN","YOUR_TOKEN")
                </code>
              </div>
            </div>
          </Card>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 14 }}>
            {/* LEFT: profile + steps */}
            <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
              {/* PROFILE */}
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 16, fontWeight: 950 }}>Mening profilim</div>
                  <Btn variant="ghost" onClick={loadProfile} disabled={loadingProfile}>
                    {loadingProfile ? "..." : "Yangilash"}
                  </Btn>
                </div>

                <Divider />

                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12 }}>
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 18,
                      overflow: "hidden",
                      border: `1px solid ${ui.border}`,
                      background: "rgba(0,0,0,0.25)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {profile?.avatarUrl ? (
                      <img
                        src={normalizeUrl(profile.avatarUrl)}
                        alt="avatar"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ color: ui.sub, fontWeight: 900 }}>Avatar</div>
                    )}
                  </div>

                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ fontWeight: 950, fontSize: 14 }}>
                      {profile?.name || profile?.fullName || "Student"}
                    </div>
                    <div style={{ color: ui.sub2, fontSize: 12 }}>{profile?.email || "—"}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Chip tone="neutral">grade: {profile?.grade ?? selectedGrade ?? "—"}</Chip>
                      {profile?.updatedAt ? <Chip tone="neutral">updated: {fmtDate(profile.updatedAt)}</Chip> : null}
                    </div>
                  </div>
                </div>

                <Divider />

                <SubCard>
                  <div style={{ fontWeight: 950, marginBottom: 8 }}>Avatar yuklash</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <Btn variant="primary" onClick={uploadStudentAvatar} disabled={!avatarFile || uploadingAvatar}>
                        {uploadingAvatar ? "..." : "Upload"}
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
                      Backend: <code style={{ color: ui.text }}>/api/users/me/avatar</code>
                    </div>
                  </div>
                </SubCard>
              </Card>

              {/* STEP-BY-STEP SELECTOR */}
              <Card>
                <div style={{ fontSize: 16, fontWeight: 950 }}>Topshiriqlar yo‘li</div>
                <div style={{ color: ui.sub2, fontSize: 12, marginTop: 6 }}>
                  Tartib: <b>Fan → Sinf/Level → Mavzu → Topshiriq</b>
                </div>

                <Divider />

                <div style={{ display: "grid", gap: 12 }}>
                  {/* SUBJECT */}
                  <SubCard>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <div style={{ fontWeight: 950 }}>1) Fan</div>
                      <Btn variant="ghost" onClick={() => loadSubjects(selectedGrade ?? profile?.grade ?? 6)} disabled={loadingSubjects}>
                        {loadingSubjects ? "..." : "Fanlarni yangilash"}
                      </Btn>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <Select
                        value={selectedSubjectId}
                        onChange={(e) => {
                          setSelectedSubjectId(e.target.value);
                          setMessage("");
                        }}
                      >
                        <option value="">Fan tanlang</option>
                        {subjects.map((s) => (
                          <option key={s._id} value={s._id}>
                            {subjectLabel(s)}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div style={{ color: ui.sub2, fontSize: 12, marginTop: 8 }}>
                      Fanlar soni: <b>{subjects?.length || 0}</b>
                    </div>
                  </SubCard>

                  {/* GRADE / LEVEL */}
                  {selectedSubjectId ? (
                    <SubCard>
                      <div style={{ fontWeight: 950, marginBottom: 8 }}>2) {isEnglishSubject ? "Level (1–5)" : "Sinf (5–11)"}</div>

                      {isEnglishSubject ? (
                        <>
                          <Select
                            value={englishLevel}
                            onChange={(e) => {
                              setEnglishLevel(Number(e.target.value) || 1);
                              setSelectedTopicId("");
                            }}
                          >
                            {[1, 2, 3, 4, 5].map((lv) => (
                              <option key={lv} value={lv}>
                                Level {lv}
                              </option>
                            ))}
                          </Select>
                          <div style={{ color: ui.sub2, fontSize: 12, marginTop: 8 }}>
                            Bu level backendga <code style={{ color: ui.text }}>grade</code> sifatida yuboriladi.
                          </div>
                        </>
                      ) : (
                        <>
                          <Select
                            value={selectedGrade ?? 6}
                            onChange={(e) => {
                              const g = Number(e.target.value) || 6;
                              setSelectedGrade(g);
                              setSelectedTopicId("");
                            }}
                          >
                            {[5, 6, 7, 8, 9, 10, 11].map((g) => (
                              <option key={g} value={g}>
                                {g}-sinf
                              </option>
                            ))}
                          </Select>
                          <div style={{ color: ui.sub2, fontSize: 12, marginTop: 8 }}>
                            Mavzular shu sinf bo‘yicha chiqadi.
                          </div>
                        </>
                      )}
                    </SubCard>
                  ) : null}

                  {/* TOPIC */}
                  {selectedSubjectId ? (
                    <SubCard>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                        <div style={{ fontWeight: 950 }}>3) Mavzu</div>
                        <Btn
                          variant="ghost"
                          onClick={() =>
                            loadTopics({
                              subjectId: selectedSubjectId,
                              grade: selectedGrade ?? profile?.grade ?? 6,
                            })
                          }
                          disabled={loadingTopics}
                          style={{ padding: "8px 10px", borderRadius: 12 }}
                        >
                          {loadingTopics ? "..." : "Mavzularni yuklash"}
                        </Btn>
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <Select
                          value={selectedTopicId}
                          onChange={(e) => {
                            setSelectedTopicId(e.target.value);
                            setActive(null);
                            setAnswers({});
                            setResult(null);
                          }}
                          disabled={!topics?.length}
                        >
                          <option value="">{topics?.length ? "Mavzu tanlang" : "Avval mavzularni yuklang"}</option>
                          {topics.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.title || t.name || "—"}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div style={{ color: ui.sub2, fontSize: 12, marginTop: 8 }}>
                        Mavzular soni: <b>{topics?.length || 0}</b>
                      </div>
                    </SubCard>
                  ) : null}
                </div>
              </Card>
            </div>

            {/* RIGHT: assignments + runner */}
            <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 16, fontWeight: 950 }}>Topshiriqlar</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {selectedTopicId ? <Chip tone="ok">Topic tanlandi</Chip> : <Chip tone="warn">Topic tanlanmagan</Chip>}
                    <Btn variant="ghost" onClick={loadStudentAssignments} disabled={loadingAssignments}>
                      {loadingAssignments ? "..." : "Refresh"}
                    </Btn>
                  </div>
                </div>

                <Divider />

                {/* If active attempt: render runner, else list */}
                {active ? (
                  <div style={{ display: "grid", gap: 12 }}>
                    <SubCard>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                        <div style={{ display: "grid", gap: 6 }}>
                          <div style={{ fontWeight: 950, fontSize: 14 }}>{activeAssignment?.title || "Topshiriq"}</div>
                          <div style={{ color: ui.sub2, fontSize: 12 }}>
                            Savollar: <b>{activeQuestions?.length || 0}</b>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <Btn
                            variant="ghost"
                            onClick={() => {
                              setActive(null);
                              setAnswers({});
                              setResult(null);
                              setMessage("");
                            }}
                          >
                            Orqaga
                          </Btn>
                          <Btn variant="primary" onClick={submitAttempt} disabled={submitting || !activeQuestions?.length}>
                            {submitting ? "..." : "Yuborish"}
                          </Btn>
                        </div>
                      </div>
                    </SubCard>

                    {/* Questions */}
                    <div style={{ display: "grid", gap: 10 }}>
                      {activeQuestions.map((q, qi) => {
                        const opts = q?.options || [];
                        const picked = answers[qi];

                        return (
                          <SubCard key={qi}>
                            <div style={{ fontWeight: 950, marginBottom: 8 }}>
                              {qi + 1}. {q?.text || "Savol"}
                            </div>

                            <div style={{ display: "grid", gap: 8 }}>
                              {opts.map((op, oi) => {
                                const isOn = picked === oi;
                                return (
                                  <label
                                    key={oi}
                                    style={{
                                      display: "flex",
                                      gap: 10,
                                      alignItems: "flex-start",
                                      padding: "10px 12px",
                                      borderRadius: 14,
                                      border: `1px solid ${isOn ? ui.border2 : ui.border}`,
                                      background: isOn ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.18)",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <input
                                      type="radio"
                                      name={`q_${qi}`}
                                      checked={picked === oi}
                                      onChange={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                                      style={{ marginTop: 3 }}
                                    />
                                    <div style={{ color: ui.text, fontSize: 13, lineHeight: 1.45 }}>{String(op || "")}</div>
                                  </label>
                                );
                              })}
                            </div>
                          </SubCard>
                        );
                      })}
                    </div>

                    {/* Result */}
                    {result ? (
                      <Card
                        style={{
                          border: `1px solid ${ui.border2}`,
                          background: "rgba(255,255,255,0.07)",
                        }}
                      >
                        <div style={{ fontSize: 16, fontWeight: 1000, marginBottom: 6 }}>Natija</div>
                        <div style={{ color: ui.sub, fontSize: 13, lineHeight: 1.6 }}>
                          score: <b>{result?.score ?? result?.percent ?? "—"}</b> <br />
                          correct: <b>{result?.correctCount ?? "—"}</b> / <b>{result?.total ?? result?.totalCount ?? activeQuestions.length}</b>
                        </div>
                      </Card>
                    ) : null}
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {!assignments?.length ? (
                      <div style={{ color: ui.sub2, fontSize: 13 }}>
                        Hozircha topshiriqlar yo‘q.
                        <div style={{ marginTop: 6 }}>
                          ✅ Avval <b>Fan → Sinf/Level → Mavzu</b> tanlang, keyin bu yerda testlar chiqadi.
                        </div>
                      </div>
                    ) : (
                      assignments.map((a) => (
                        <SubCard key={a._id} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                          <div style={{ display: "grid", gap: 6 }}>
                            <div style={{ fontWeight: 950 }}>{a.title || "Topshiriq"}</div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                              <Chip tone="neutral">{a.status || "—"}</Chip>
                              <span style={{ color: ui.sub2, fontSize: 12 }}>
                                q: {a.questionsCount ?? a.questions?.length ?? "—"}
                              </span>
                              {a.createdAt ? <span style={{ color: ui.sub2, fontSize: 12 }}>created: {fmtDate(a.createdAt)}</span> : null}
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <Btn variant="primary" onClick={() => startAssignment(a._id)}>
                              Boshlash
                            </Btn>
                          </div>
                        </SubCard>
                      ))
                    )}
                  </div>
                )}
              </Card>

              <div style={{ color: ui.sub2, fontSize: 12, textAlign: "center", marginTop: 6 }}>
                © {new Date().getFullYear()} KIBOO
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}