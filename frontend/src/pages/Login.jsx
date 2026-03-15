import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login, register, resendVerification, forgotPassword, apiMe } from "../lib/api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function clearAllTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("STUDENT_TOKEN");
  localStorage.removeItem("TEACHER_TOKEN");
  localStorage.removeItem("PARENT_TOKEN");
}

function getAnyToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("STUDENT_TOKEN") ||
    localStorage.getItem("TEACHER_TOKEN") ||
    localStorage.getItem("PARENT_TOKEN") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

export default function LoginPage() {
  const nav = useNavigate();
  const q = useQuery();

  // /login?next=/teacher (yoki /student /parent /assignments)
  const roleParam = q.get("role");
  const nextRaw = q.get("next") || "/";
  const defaultNext = roleParam ? `/${roleParam}` : "/";
  const nextPath = (nextRaw || defaultNext).startsWith("/") ? (nextRaw || defaultNext) : `/${nextRaw || defaultNext}`;

  const [email, setEmail] = useState("student@test.com");
  const [password, setPassword] = useState("123456");
  const [name, setName] = useState("");
  const [regRole, setRegRole] = useState(roleParam || "student");
  const [mode, setMode] = useState("login"); // login | register
  const [showForgot, setShowForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [sessionRole, setSessionRole] = useState("");
  const [sessionLoading, setSessionLoading] = useState(false);

  const token = getAnyToken();

  const roleMeta = useMemo(
    () => ({
      student: {
        label: "O‘quvchi",
        hint: "Video darslar va testlar",
        bg: "linear-gradient(135deg, rgba(138,180,255,0.25), rgba(110,231,183,0.18))",
        icon: "S",
      },
      teacher: {
        label: "O‘qituvchi",
        hint: "Dars yuklash va test yaratish",
        bg: "linear-gradient(135deg, rgba(255,184,107,0.25), rgba(255,122,24,0.2))",
        icon: "T",
      },
      parent: {
        label: "Ota‑ona",
        hint: "Farzand nazorati va natijalar",
        bg: "linear-gradient(135deg, rgba(110,231,183,0.22), rgba(56,189,248,0.18))",
        icon: "P",
      },
    }),
    []
  );

  const activeRole = roleParam || "student";
  const activeMeta = roleMeta[activeRole] || roleMeta.student;
  const roleOrder = ["student", "teacher", "parent"];

  const demoEmailByRole = {
    student: "student@test.com",
    teacher: "teacher@test.com",
    parent: "parent@test.com",
  };

  useEffect(() => {
    const r = String(roleParam || "student").toLowerCase();
    setRegRole(r);
    if (r === "teacher") {
      setEmail("teacher@test.com");
    } else if (r === "parent") {
      setEmail("parent@test.com");
    } else {
      setEmail("student@test.com");
    }
  }, [roleParam]);

  function setRoleToken(role, t) {
    if (!t) return;
    localStorage.setItem("token", t);
    if (role === "student") localStorage.setItem("STUDENT_TOKEN", t);
    if (role === "teacher") localStorage.setItem("TEACHER_TOKEN", t);
    if (role === "parent") localStorage.setItem("PARENT_TOKEN", t);
    if (role === "admin") localStorage.setItem("ADMIN_TOKEN", t);
  }

  useEffect(() => {
    const t = getAnyToken();
    if (!t) return;
    setSessionLoading(true);
    apiMe(t)
      .then((res) => {
        const u = res?.user || res;
        const role = u?.role;
        if (role) {
          setSessionRole(role);
          setRoleToken(role, t);
        }
      })
      .catch(() => {})
      .finally(() => setSessionLoading(false));
  }, []);

  function persistTokens(data) {
    if (!data?.token) return;
    const role = data?.user?.role;
    setRoleToken(role, data.token);
  }

  function selectRole(role) {
    const r = role || "student";
    const next = `/${r}`;
    nav(`/login?role=${encodeURIComponent(r)}&next=${encodeURIComponent(next)}`, { replace: true });
  }

  function goRole(role) {
    const r = role || activeRole || "student";
    if (sessionRole && sessionRole === r) {
      nav(`/${r}`, { replace: true });
      return;
    }
    selectRole(r);
  }

  async function doLogin(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const data = await login(email.trim(), password);
      if (!data?.token) throw new Error("Token kelmadi");

      persistTokens(data);

      // token validligini tekshiramiz (bloklamasdan)
      apiMe(data.token).catch(() => {});

      setMsg("✅ Login bo‘ldi");
      const role = data?.user?.role;
      const target = role ? `/${role}` : nextPath;
      nav(target, { replace: true });
    } catch (err) {
      const msgText = err?.message || "Xato";
      setMsg("Login xato: " + msgText);
    } finally {
      setLoading(false);
    }
  }

  async function doRegister(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const data = await register(name.trim(), email.trim(), password, regRole || "student");
      const verifyUrl = data?.verifyUrl;
      setMsg(
        verifyUrl
          ? `✅ Profil yaratildi. Emailga link yuborildi. (DEV) Link: ${verifyUrl}`
          : "✅ Profil yaratildi. Emailga tasdiqlash linki yuborildi."
      );
      setMode("login");
    } catch (err) {
      setMsg("Register xato: " + (err?.message || "Xato"));
    } finally {
      setLoading(false);
    }
  }

  const Card = ({ children, className = "" }) => (
    <div
      className={
        "relative w-full max-w-5xl rounded-[30px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl " +
        className
      }
    >
      <div className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-10 h-64 w-64 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  );

  const Btn = ({ className = "", variant = "ghost", ...props }) => {
    const base =
      "rounded-2xl border px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed";
    const variants = {
      ghost: "border-white/10 bg-white/10 text-white/90 hover:bg-white/15",
      glass: "border-white/15 bg-white/15 text-white/90 hover:bg-white/20",
      primary:
        "border-transparent bg-gradient-to-r from-sky-300 via-cyan-200 to-amber-200 text-slate-900 shadow-lg shadow-cyan-500/20",
      dark: "border-white/10 bg-black/30 text-white/85 hover:bg-black/40",
    };
    return <button className={`${base} ${variants[variant] || variants.ghost} ${className}`} {...props} />;
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-[#05060d] text-white antialiased"
      style={{
        fontFamily:
          '-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Helvetica Neue",system-ui,Segoe UI,Arial,sans-serif',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 700px at 10% 10%, rgba(138,180,255,0.18), transparent 60%), radial-gradient(900px 600px at 85% 10%, rgba(255,184,107,0.16), transparent 60%), radial-gradient(900px 700px at 50% 90%, rgba(110,231,183,0.12), transparent 60%)",
        }}
      />
      <div className="pointer-events-none absolute -top-48 right-[-120px] h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-[-100px] h-80 w-80 rounded-full bg-orange-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-5 py-14">
        <Card>
          <div className="p-6 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] tracking-[0.4em] text-white/40">KIBOO</div>
                    <h2 className="mt-3 text-4xl font-semibold tracking-tight">
                      <span className="bg-gradient-to-r from-white via-sky-200 to-amber-200 bg-clip-text text-transparent">
                        {activeMeta.label}
                      </span>
                    </h2>
                    <div className="mt-2 text-sm text-white/60">{activeMeta.hint}</div>
                  </div>

                  <Btn type="button" variant="dark" onClick={() => nav("/", { replace: true })}>
                    Home
                  </Btn>
                </div>

                <div className="mt-6 inline-flex flex-wrap gap-2 rounded-[22px] border border-white/10 bg-white/5 p-2">
                  {roleOrder.map((key) => {
                    const info = roleMeta[key];
                    const active = String(activeRole) === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => goRole(key)}
                        className={
                          "rounded-2xl border px-4 py-3 text-left transition " +
                          (active
                            ? "border-white/20 text-white"
                            : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white")
                        }
                        style={active ? { backgroundImage: info.bg } : undefined}
                      >
                        <div className="text-sm font-semibold">{info.label}</div>
                      </button>
                    );
                  })}
                </div>

                <div
                  className="mt-6 rounded-[26px] border border-white/10 p-5"
                  style={{ backgroundImage: activeMeta.bg }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/15 bg-white/10 text-lg font-bold text-white/90">
                      {activeMeta.icon}
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-white/95">{activeMeta.label}</div>
                      <div className="mt-1 text-sm text-white/70">{activeMeta.hint}</div>
                    </div>
                  </div>
                </div>

                {token ? (
                  <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-white/85">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      {sessionLoading
                        ? "Sessiya tekshirilmoqda..."
                        : sessionRole
                          ? `${roleMeta[sessionRole]?.label || sessionRole} paneli tayyor`
                          : "Sessiya topildi"}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Btn
                        type="button"
                        variant="primary"
                        onClick={() => nav(`/${sessionRole || activeRole}`, { replace: true })}
                      >
                        Panelga o‘tish
                      </Btn>
                      <Btn
                        type="button"
                        variant="glass"
                        onClick={() => {
                          clearAllTokens();
                          setMsg("✅ Tokenlar tozalandi");
                        }}
                      >
                        Chiqish
                      </Btn>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">

                {msg ? (
                  <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/85">
                    {msg}
                    {msg.includes("Email tasdiqlanmagan") ? (
                      <div className="mt-3">
                        <Btn
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await resendVerification(email.trim());
                              setMsg(res?.verifyUrl ? `✅ Link yuborildi: ${res.verifyUrl}` : "✅ Tasdiqlash linki yuborildi");
                            } catch {
                              setMsg("❌ Link yuborish xato");
                            }
                          }}
                        >
                          Tasdiqlash linkini yuborish
                        </Btn>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={
                      "rounded-full px-4 py-2 text-sm font-semibold transition " +
                      (mode === "login"
                        ? "bg-white/15 text-white"
                        : "text-white/70 hover:text-white")
                    }
                  >
                    Kirish
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className={
                      "rounded-full px-4 py-2 text-sm font-semibold transition " +
                      (mode === "register"
                        ? "bg-white/15 text-white"
                        : "text-white/70 hover:text-white")
                    }
                  >
                    Profil ochish
                  </button>
                </div>

                <form onSubmit={mode === "login" ? doLogin : doRegister} className="mt-4 grid gap-4">
                  {mode === "register" ? (
                    <label className="grid gap-2">
                      <div className="text-xs text-white/50">Ism Familiya</div>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/25 focus:ring-2 focus:ring-sky-300/30"
                        placeholder="Ism Familiya"
                      />
                    </label>
                  ) : null}

                  <label className="grid gap-2">
                    <div className="text-xs text-white/50">Email</div>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/25 focus:ring-2 focus:ring-sky-300/30"
                      placeholder="email"
                    />
                  </label>

                  <label className="grid gap-2">
                    <div className="text-xs text-white/50">Password</div>
                    <input
                      value={password}
                      type="password"
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/25 focus:ring-2 focus:ring-sky-300/30"
                      placeholder="password"
                    />
                  </label>

                  {mode === "register" ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
                      Rol: {activeMeta.label}
                    </div>
                  ) : null}

                  <Btn
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="mt-1 w-full py-3 text-base"
                  >
                    {loading ? "..." : mode === "login" ? "Kirish" : "Profil ochish"}
                  </Btn>

                  {mode === "login" ? (
                    <div className="mt-1 text-sm text-white/60">
                      <button
                        type="button"
                        className="underline decoration-white/30 underline-offset-4"
                        onClick={() => setShowForgot((v) => !v)}
                      >
                        Parolni unutdim
                      </button>
                    </div>
                  ) : null}

                  {mode === "login" && showForgot ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs text-white/50">Emailga parol tiklash linki yuboriladi</div>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <Btn
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await forgotPassword(email.trim());
                              setMsg(res?.resetUrl ? `✅ Link yuborildi: ${res.resetUrl}` : "✅ Parolni tiklash linki yuborildi");
                            } catch {
                              setMsg("❌ Link yuborish xato");
                            }
                          }}
                        >
                          Link yuborish
                        </Btn>
                        <Btn type="button" className="bg-white/0" onClick={() => setShowForgot(false)}>
                          Yopish
                        </Btn>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-2 flex flex-wrap gap-2">
                    <Btn
                      type="button"
                      className="bg-white/0"
                      onClick={() => nav("/", { replace: true })}
                    >
                      Home ga o‘tish
                    </Btn>

                    <Btn
                      type="button"
                      className="bg-white/0"
                      onClick={() => {
                        clearAllTokens();
                        setMsg("✅ Tokenlar tozalandi");
                      }}
                    >
                      Tokenni tozalash
                    </Btn>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs font-medium text-white/60">
                      Demo
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Btn
                        type="button"
                        onClick={() => {
                          setEmail(demoEmailByRole[activeRole] || "student@test.com");
                          setPassword("123456");
                        }}
                      >
                        {activeMeta.label}
                      </Btn>

                      <Btn
                        type="button"
                        className="bg-white/0"
                        onClick={() => {
                          clearAllTokens();
                          setMsg("✅ Tokenlar tozalandi");
                        }}
                      >
                        Tozalash
                      </Btn>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
