import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ------------------ helpers ------------------ */
function getStoredToken() {
  return (
    localStorage.getItem("STUDENT_TOKEN") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
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
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}
function apiOrigin() {
  return API_BASE;
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
      (data && (data.message || data.error)) ||
      (typeof data === "string" ? data : `HTTP ${res.status} ${res.statusText}`);
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function initials(nameOrEmail) {
  const s = String(nameOrEmail || "").trim();
  if (!s) return "ST";
  const parts = s.split(/\s+/).slice(0, 2);
  const letters = parts.map((p) => p[0]).join("");
  return letters.toUpperCase();
}

function TopicStateBadge({ state }) {
  const s = String(state || "").toLowerCase();
  if (s === "current") return <Badge>Hozirgi</Badge>;
  if (s === "completed") return <Badge variant="secondary">Tugagan</Badge>;
  if (s === "locked") return <Badge variant="outline">Qulflangan</Badge>;
  return <Badge variant="outline">—</Badge>;
}

/* ------------------ page ------------------ */
export default function StudentVideosPage() {
  const nav = useNavigate();

  const [token, setToken] = useState(getStoredToken());
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(null);

  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef(null);

  const [current, setCurrent] = useState(null); // /api/progress/current response
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const [currentAssignments, setCurrentAssignments] = useState([]);

  const subject = current?.subscription?.subject || null;
  const currentGrade = Number(current?.progress?.currentGradeOrLevel || 0);
  const currentTopicId =
    current?.topic?._id ||
    current?.progress?.currentTopic?._id ||
    current?.progress?.currentTopic ||
    current?.topic ||
    null;

  const gradeLabel = useMemo(() => {
    if (!subject) return "";
    const slug = String(subject.slug || "");
    if (slug.includes("ingliz") || slug.includes("english")) return `Level ${currentGrade}`;
    return `${currentGrade}-sinf`;
  }, [subject, currentGrade]);

  const currentTopicTitle =
    current?.topic?.title ||
    current?.progress?.currentTopic?.title ||
    current?.progress?.currentTopic?.title ||
    "—";

  const hasToken = !!token;

  async function loadAll() {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // 1) Student profile (me)
      const me = await apiFetch("/api/users/me", { token });
      const user = me?.user || me || null;
      setProfile(user);

      // 2) Ensure progress (optional)
      try {
        await apiFetch("/api/progress/ensure", { token, method: "POST" });
      } catch {}

      // 3) Current content
      const cur = await apiFetch("/api/progress/current", { token });
      setCurrent(cur);

      // 3.5) Current topic assignments (published)
      try {
        const asg = await apiFetch("/api/assignments/student/current", { token });
        setCurrentAssignments(Array.isArray(asg?.assignments) ? asg.assignments : []);
      } catch {
        setCurrentAssignments([]);
      }

      // 4) Topics list for current grade/level
      const subjectId = cur?.subscription?.subject?._id;
      const grade = Number(cur?.progress?.currentGradeOrLevel || 0);

      if (subjectId && grade) {
        setLoadingTopics(true);
        const t = await apiFetch(`/api/topics?subjectId=${encodeURIComponent(String(subjectId))}&grade=${encodeURIComponent(String(grade))}`, { token });
        const list = Array.isArray(t?.topics) ? t.topics : Array.isArray(t) ? t : [];
        list.sort((a, b) => {
          const ao = Number(a.order || 0);
          const bo = Number(b.order || 0);
          if (ao !== bo) return ao - bo;
          return String(a.title || "").localeCompare(String(b.title || ""));
        });
        setTopics(list);
      } else {
        setTopics([]);
      }
    } catch (e) {
      setCurrent(null);
      setTopics([]);
      setMessage("❌ " + (e?.message || "xato"));
    } finally {
      setLoadingTopics(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) setStoredToken(token);
  }, [token]);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function logout() {
    clearStoredToken();
    setToken("");
    setProfile(null);
    setCurrent(null);
    setTopics([]);
    setCurrentAssignments([]);
    setMessage("✅ Logout");
    nav("/login");
  }

  async function uploadAvatar() {
    if (!token) return setMessage("❗ Token yo‘q");
    if (!avatarFile) return setMessage("❗ Rasm tanlang");
    try {
      setUploadingAvatar(true);
      setMessage("");

      const fd = new FormData();
      fd.append("avatar", avatarFile);

      // student avatar endpoint bo‘lishi mumkin (yoki umumiy)
      await apiFetch("/api/users/me/avatar", { token, method: "POST", body: fd, isForm: true });

      setMessage("✅ Avatar yuklandi");
      setAvatarFile(null);
      if (fileRef.current) fileRef.current.value = "";
      await loadAll();
    } catch (e) {
      setMessage("❌ Avatar: " + (e?.message || "xato"));
    } finally {
      setUploadingAvatar(false);
    }
  }

  // topics state: completed/current/locked (oddiy qoidada: currentdan keyingisi locked)
  const enrichedTopics = useMemo(() => {
    const curId = String(currentTopicId || "");
    let seenCurrent = false;

    return (topics || []).map((t) => {
      const id = String(t?._id || "");
      if (!curId) return { ...t, __state: "locked" };

      if (id === curId) {
        seenCurrent = true;
        return { ...t, __state: "current" };
      }

      // currentdan oldingilarni “completed” deb ko‘rsatamiz (backendda aniq completed list yo‘q)
      if (!seenCurrent) return { ...t, __state: "completed" };

      // currentdan keyin: locked
      return { ...t, __state: "locked" };
    });
  }, [topics, currentTopicId]);

  const videos = useMemo(() => {
    const arr = current?.videos;
    return Array.isArray(arr) ? arr : [];
  }, [current]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(900px 500px at 20% 10%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(700px 500px at 80% 20%, rgba(56,189,248,0.18), transparent 55%), radial-gradient(900px 600px at 50% 90%, rgba(168,85,247,0.15), transparent 60%), #060A16",
        padding: 18,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 14 }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                fontWeight: 900,
                letterSpacing: 1.5,
                padding: "10px 14px",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.92)",
                boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
              }}
            >
              KIBOO
            </div>
            <div style={{ color: "rgba(255,255,255,0.62)", fontWeight: 700 }}>
              Student • API: {apiOrigin()}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Badge variant={hasToken ? "secondary" : "outline"}>
              {hasToken ? "Token: bor" : "Token: yo‘q"}
            </Badge>
            <Button variant="secondary" onClick={loadAll} disabled={!hasToken || loading}>
              {loading ? "Yuklanmoqda..." : "Yangilash"}
            </Button>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Message */}
        {message ? (
          <Card>
            <CardContent style={{ paddingTop: 16 }}>
              <div style={{ fontWeight: 700, color: message.startsWith("✅") ? "#4ade80" : message.startsWith("❌") ? "#fb7185" : "rgba(255,255,255,0.92)" }}>
                {message}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Main */}
        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1.45fr", gap: 14 }}>
          {/* Left: profile + current */}
          <div style={{ display: "grid", gap: 14 }}>
            <Card>
              <CardHeader>
                <CardTitle>Profil</CardTitle>
              </CardHeader>
              <CardContent style={{ display: "grid", gap: 12 }}>
                {loading ? (
                  <div style={{ display: "grid", gap: 10 }}>
                    <Skeleton style={{ height: 64 }} />
                    <Skeleton style={{ height: 40 }} />
                    <Skeleton style={{ height: 40 }} />
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar>
                        <AvatarImage
                          src={profile?.avatarUrl ? `${API_BASE}${profile.avatarUrl}` : ""}
                          alt="avatar"
                        />
                        <AvatarFallback>{initials(profile?.name || profile?.email)}</AvatarFallback>
                      </Avatar>
                      <div style={{ display: "grid" }}>
                        <div style={{ fontWeight: 900, color: "rgba(255,255,255,0.92)" }}>
                          {profile?.name || "Student"}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.62)", fontWeight: 600, fontSize: 13 }}>
                          {profile?.email || "—"}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={{ display: "grid", gap: 6 }}>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)", fontWeight: 700 }}>
                          Avatar yuklash
                        </div>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                          style={{
                            color: "rgba(255,255,255,0.8)",
                            fontSize: 12,
                          }}
                        />
                        <Button onClick={uploadAvatar} disabled={!avatarFile || uploadingAvatar}>
                          {uploadingAvatar ? "Yuklanmoqda..." : "Yuklash"}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hozirgi kurs</CardTitle>
              </CardHeader>
              <CardContent style={{ display: "grid", gap: 10 }}>
                {!hasToken ? (
                  <div style={{ color: "rgba(255,255,255,0.62)" }}>
                    Token yo‘q. Login qiling.
                  </div>
                ) : loading ? (
                  <div style={{ display: "grid", gap: 10 }}>
                    <Skeleton style={{ height: 24 }} />
                    <Skeleton style={{ height: 24 }} />
                    <Skeleton style={{ height: 40 }} />
                  </div>
                ) : !subject ? (
                  <div style={{ color: "rgba(255,255,255,0.62)" }}>
                    Active subscription yo‘q (yoki /api/progress/current qaytarmayapti).
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <Badge>{subject?.name || "Fan"}</Badge>
                      <Badge variant="secondary">{gradeLabel}</Badge>
                    </div>
                    <div style={{ fontWeight: 900, color: "rgba(255,255,255,0.92)", lineHeight: 1.2 }}>
                      {currentTopicTitle}
                    </div>

                    <div style={{ display: "grid", gap: 8 }}>
                      <Card style={{ background: "rgba(255,255,255,0.06)" }}>
                        <CardContent style={{ paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                          <div style={{ display: "grid" }}>
                            <div style={{ fontWeight: 900, color: "rgba(255,255,255,0.92)" }}>📝 Mavzu testi</div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)", fontWeight: 700 }}>
                              {currentAssignments?.length ? "Topshiriq mavjud" : "Hozircha topshiriq yo‘q"}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Badge variant="secondary">{currentAssignments?.length || 0}</Badge>
                            <Button
                              disabled={!currentAssignments?.length}
                              onClick={() => nav("/assignments?autostart=1")}
                            >
                              Testga o‘tish
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: tabs (videos/topics) */}
          <div style={{ display: "grid", gap: 14 }}>
            <Card>
              <CardHeader>
                <CardTitle>Darslar va mavzular</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="videos">
                  <TabsList>
                    <TabsTrigger value="videos">Dars videosi</TabsTrigger>
                    <TabsTrigger value="topics">Mavzular</TabsTrigger>
                  </TabsList>

                  <TabsContent value="videos" style={{ marginTop: 14 }}>
                    {!hasToken ? (
                      <div style={{ color: "rgba(255,255,255,0.62)" }}>Token yo‘q.</div>
                    ) : loading ? (
                      <div style={{ display: "grid", gap: 10 }}>
                        <Skeleton style={{ height: 90 }} />
                        <Skeleton style={{ height: 90 }} />
                      </div>
                    ) : (
                      <>
                        {videos.length ? (
                          <div style={{ display: "grid", gap: 10 }}>
                            {videos.map((v) => {
                              const vid = String(v?._id || v?.id || "");
                              const title = v?.title || "Video";
                              const status = v?.status || "";
                              return (
                                <Card key={vid} style={{ background: "rgba(255,255,255,0.06)" }}>
                                  <CardContent style={{ paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                    <div style={{ display: "grid", gap: 4 }}>
                                      <div style={{ fontWeight: 900, color: "rgba(255,255,255,0.92)" }}>{title}</div>
                                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                        {status ? <Badge variant="secondary">{status}</Badge> : null}
                                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.62)", fontWeight: 700 }}>
                                          {subject?.name ? `${subject.name} • ${gradeLabel}` : gradeLabel}
                                        </span>
                                      </div>
                                    </div>
                                    <Button onClick={() => nav(`/video/${encodeURIComponent(vid)}`)} disabled={!vid}>
                                      Ko‘rish
                                    </Button>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ color: "rgba(255,255,255,0.62)", lineHeight: 1.4 }}>
                            Hozirgi mavzuga video ulanmagan.
                            <div style={{ marginTop: 6, fontSize: 12 }}>
                              (Teacher tomondan video topicga bog‘langandan keyin shu yerda chiqadi.)
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="topics" style={{ marginTop: 14 }}>
                    {!hasToken ? (
                      <div style={{ color: "rgba(255,255,255,0.62)" }}>Token yo‘q.</div>
                    ) : loadingTopics ? (
                      <div style={{ display: "grid", gap: 10 }}>
                        <Skeleton style={{ height: 54 }} />
                        <Skeleton style={{ height: 54 }} />
                        <Skeleton style={{ height: 54 }} />
                      </div>
                    ) : (
                      <>
                        {!enrichedTopics.length ? (
                          <div style={{ color: "rgba(255,255,255,0.62)" }}>
                            Mavzular topilmadi (subject/grade bo‘yicha).
                          </div>
                        ) : (
                          <div style={{ display: "grid", gap: 8, maxHeight: 520, overflow: "auto", paddingRight: 6 }}>
                            {enrichedTopics.map((t) => {
                              const id = String(t?._id || "");
                              const state = t?.__state || "locked";
                              const isCurrent = state === "current";
                              return (
                                <div
                                  key={id}
                                  style={{
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    background: isCurrent ? "rgba(99,102,241,0.18)" : "rgba(0,0,0,0.18)",
                                    borderRadius: 14,
                                    padding: "10px 12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 10,
                                  }}
                                >
                                  <div style={{ display: "grid", gap: 2 }}>
                                    <div style={{ fontWeight: 900, color: "rgba(255,255,255,0.92)" }}>
                                      {t?.title || "Mavzu"}
                                    </div>
                                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)", fontWeight: 700 }}>
                                      order: {t?.order ?? "—"}
                                    </div>
                                  </div>
                                  <TopicStateBadge state={state} />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Texnik holat</CardTitle>
              </CardHeader>
              <CardContent style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "grid", gap: 4 }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)", fontWeight: 800 }}>LastSeen</div>
                  <div style={{ color: "rgba(255,255,255,0.92)", fontWeight: 800 }}>
                    {fmtDate(current?.progress?.lastSeenAt)}
                  </div>
                </div>
                <Separator />
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)", lineHeight: 1.4 }}>
                  Eslatma: bu UI “Netflix/Apple-style” minimal, tezkor va toza. Keyingi bosqichda
                  “topic state” ni backenddan real completed list bilan yanada aniq qilamiz (hozircha currentdan oldingi mavzular “completed” deb ko‘rsatiladi).
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
