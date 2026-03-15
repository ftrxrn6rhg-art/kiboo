import React, { useEffect, useMemo, useState } from "react";
import { adminListTeachers, adminApproveTeacher, adminRejectTeacher } from "../lib/api";

const ui = {
  bg: "#0A0B12",
  text: "rgba(255,255,255,0.94)",
  sub: "rgba(255,255,255,0.70)",
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
  red: "#FF3B30",
  yellow: "#FFD29A",
};

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

const Chip = ({ children, tone = "neutral" }) => {
  let bg = "rgba(255,255,255,0.06)";
  let bd = ui.border;
  let col = ui.text;
  if (tone === "ok") {
    bg = "rgba(34,197,94,0.18)";
    bd = "rgba(34,197,94,0.35)";
  }
  if (tone === "warn") {
    bg = "rgba(255,210,140,0.18)";
    bd = "rgba(255,210,140,0.35)";
  }
  if (tone === "red") {
    bg = "rgba(255,59,48,0.18)";
    bd = "rgba(255,59,48,0.35)";
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

function statusTone(status) {
  if (status === "approved") return "ok";
  if (status === "rejected") return "red";
  return "warn";
}

function statusLabel(status) {
  if (status === "approved") return "Tasdiqlangan";
  if (status === "rejected") return "Rad etilgan";
  return "Kutilmoqda";
}

export default function Admin() {
  const token = localStorage.getItem("ADMIN_TOKEN") || localStorage.getItem("token") || "";
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all"); // all | pending | approved | rejected

  const filtered = useMemo(() => {
    if (filter === "all") return list;
    return list.filter((t) => String(t?.teacherApprovalStatus || "pending") === filter);
  }, [list, filter]);

  async function load() {
    if (!token) return;
    try {
      setLoading(true);
      const res = await adminListTeachers(token);
      setList(res?.teachers || []);
    } catch (e) {
      setMessage("❌ " + (e?.message || "xato"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function approve(id) {
    try {
      await adminApproveTeacher(token, id);
      await load();
    } catch (e) {
      setMessage("❌ " + (e?.message || "xato"));
    }
  }

  async function reject(id) {
    try {
      await adminRejectTeacher(token, id);
      await load();
    } catch (e) {
      setMessage("❌ " + (e?.message || "xato"));
    }
  }

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", background: ui.bg, color: ui.text, fontFamily: ui.font, display: "grid", placeItems: "center" }}>
        <Card style={{ maxWidth: 520, width: "100%" }}>
          <div style={{ fontSize: 24, fontWeight: 1000 }}>Admin token yo‘q</div>
          <div style={{ color: ui.sub2, marginTop: 8 }}>Admin bo‘lib kiring va qayta urining.</div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: ui.bg, color: ui.text, fontFamily: ui.font }}>
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(1100px 700px at 18% 10%, rgba(138,180,255,0.16), transparent 60%),
            radial-gradient(1000px 650px at 85% 15%, rgba(255,184,107,0.14), transparent 55%),
            radial-gradient(900px 650px at 55% 92%, rgba(110,231,183,0.10), transparent 60%)
          `,
        }}
      />

      <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "28px 16px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }}>
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
            KIBOO Admin paneli
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Chip tone="neutral">{filtered.length} ta</Chip>
            <Btn variant="primary" onClick={load} disabled={loading}>
              {loading ? "..." : "Yangilash"}
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

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {["all", "pending", "approved", "rejected"].map((f) => (
            <Btn key={f} variant="ghost" onClick={() => setFilter(f)} style={{ opacity: filter === f ? 1 : 0.6 }}>
              {f === "all" ? "Barchasi" : statusLabel(f)}
            </Btn>
          ))}
        </div>

        <Card>
          <div style={{ display: "grid", gap: 12 }}>
            {filtered.length ? (
              filtered.map((t) => (
                <SubCard key={t._id} style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "grid", gap: 4 }}>
                      <div style={{ fontWeight: 1000 }}>{t.name}</div>
                      <div style={{ color: ui.sub2, fontSize: 12 }}>{t.email}</div>
                    </div>
                    <Chip tone={statusTone(t.teacherApprovalStatus)}>
                      {statusLabel(t.teacherApprovalStatus)}
                    </Chip>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Btn variant="primary" onClick={() => approve(t._id)}>
                      Tasdiqlash
                    </Btn>
                    <Btn variant="danger" onClick={() => reject(t._id)}>
                      Rad etish
                    </Btn>
                    <Chip tone="neutral">Sertifikat: {t?.certificates?.length || 0} ta</Chip>
                  </div>
                </SubCard>
              ))
            ) : (
              <div style={{ color: ui.sub2 }}>Hozircha o‘qituvchi yo‘q.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
