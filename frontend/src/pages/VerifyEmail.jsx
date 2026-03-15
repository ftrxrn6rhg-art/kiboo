import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE } from "../lib/api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function VerifyEmail() {
  const q = useQuery();
  const nav = useNavigate();
  const token = q.get("token") || "";
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token topilmadi");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Xato");
        setStatus("ok");
        setMessage("✅ Email tasdiqlandi. Endi login qiling.");
      } catch (e) {
        setStatus("error");
        setMessage("❌ " + (e?.message || "Xato"));
      }
    })();
  }, [token]);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white antialiased">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-5 py-10">
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="text-xs tracking-widest text-white/40">KIBOO</div>
          <h2 className="mt-2 text-3xl font-semibold">Email tasdiqlash</h2>
          <div className="mt-4 text-white/80">{message || "..."}</div>

          <div className="mt-6 flex gap-2">
            <button
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-white/90 hover:bg-white/15"
              onClick={() => nav("/login", { replace: true })}
            >
              Login sahifasiga o‘tish
            </button>
            {status === "error" ? (
              <button
                className="rounded-xl border border-white/10 bg-white/0 px-4 py-2 text-white/70 hover:bg-white/10"
                onClick={() => window.location.reload()}
              >
                Qayta urinish
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
