import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../lib/api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPassword() {
  const q = useQuery();
  const nav = useNavigate();
  const token = q.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    if (!token) return setMsg("Token topilmadi");
    if (!password || password.length < 6) return setMsg("Parol kamida 6 ta bo‘lsin");
    if (password !== confirm) return setMsg("Parollar mos emas");

    try {
      setLoading(true);
      await resetPassword(token, password);
      setMsg("✅ Parol yangilandi. Endi login qiling.");
    } catch (e) {
      setMsg("❌ " + (e?.message || "Xato"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white antialiased">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-5 py-10">
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="text-xs tracking-widest text-white/40">KIBOO</div>
          <h2 className="mt-2 text-3xl font-semibold">Parolni tiklash</h2>

          {msg ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/85">
              {msg}
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <div className="text-xs text-white/50">Yangi parol</div>
              <input
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/20"
                placeholder="Yangi parol"
              />
            </label>

            <label className="grid gap-2">
              <div className="text-xs text-white/50">Parolni qayta kiriting</div>
              <input
                value={confirm}
                type="password"
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/20"
                placeholder="Qayta kiriting"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-medium text-white/90 hover:bg-white/15 disabled:opacity-60"
            >
              {loading ? "..." : "Parolni yangilash"}
            </button>

            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-2xl border border-white/10 bg-white/0 px-4 py-2 text-white/80 hover:bg-white/10"
                onClick={() => nav("/login", { replace: true })}
              >
                Login sahifasiga o‘tish
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
