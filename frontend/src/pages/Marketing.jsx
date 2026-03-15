import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Marketing() {
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const ui = useMemo(() => {
    // Instagram vibe: pink / purple / orange / yellow
    const bg = "#070812";
    const text = "rgba(255,255,255,0.92)";
    const sub = "rgba(255,255,255,0.70)";
    const sub2 = "rgba(255,255,255,0.55)";

    const border = "rgba(255,255,255,0.12)";
    const border2 = "rgba(255,255,255,0.18)";

    const card = "rgba(255,255,255,0.07)";
    const card2 = "rgba(255,255,255,0.05)";

    const pink = "#FF2DAA";
    const purple = "#7C3AED";
    const orange = "#FF7A18";
    const yellow = "#FFD029";

    return {
      bg,
      text,
      sub,
      sub2,
      border,
      border2,
      card,
      card2,
      pink,
      purple,
      orange,
      yellow,
      radius: 22,
      radius2: 18,
      shadow: "0 20px 70px rgba(0,0,0,0.55)",
      blur: "blur(14px)",
      font:
        '-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Segoe UI",Inter,system-ui,Arial,sans-serif',
      fancy:
        '"SF Pro Display",-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,system-ui,Arial,sans-serif',
      serif:
        'ui-serif, "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
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
        padding: 18,
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
      userSelect: "none",
      boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
    };

    const variants = {
      default: {},
      primary: {
        background: `linear-gradient(135deg, ${ui.pink} 0%, ${ui.purple} 45%, ${ui.orange} 80%, ${ui.yellow} 120%)`,
        color: "#120717",
        filter: "saturate(1.05)",
      },
      ghost: { background: "rgba(255,255,255,0.05)" },
    };

    return (
      <button
        disabled={disabled}
        {...rest}
        style={{ ...base, ...(variants[variant] || {}), ...style }}
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

  const Divider = () => (
    <div style={{ height: 1, background: ui.border, margin: "14px 0" }} />
  );

  const go = (path) => {
    // hammasi bitta tabda ochiladi ✅
    nav(path);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: ui.bg,
        color: ui.text,
        fontFamily: ui.font,
      }}
    >
      {/* Instagram-ish aurora background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(900px 700px at 20% 15%, rgba(255,45,170,0.16), transparent 60%), radial-gradient(900px 700px at 80% 25%, rgba(124,58,237,0.16), transparent 60%), radial-gradient(900px 700px at 55% 95%, rgba(255,122,24,0.12), transparent 60%), radial-gradient(900px 700px at 85% 85%, rgba(255,208,41,0.10), transparent 60%)",
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: 1120,
          margin: "0 auto",
          padding: "18px 16px 64px",
        }}
      >
        {/* TOP BAR (faqat chapda menu tugma, o'ngda hech narsa yo'q) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <Btn variant="ghost" onClick={() => setMenuOpen(true)}>
            ☰ Bo‘limlar
          </Btn>
        </div>

        {/* HERO */}
        <Card
          style={{
            padding: 22,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* subtle border glow */}
          <div
            style={{
              position: "absolute",
              inset: -2,
              background: `linear-gradient(135deg, rgba(255,45,170,0.18), rgba(124,58,237,0.12), rgba(255,122,24,0.12), rgba(255,208,41,0.10))`,
              filter: "blur(20px)",
              opacity: 0.9,
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            {/* KIBOO katta, o'rtada */}
            <div
              style={{
                textAlign: "center",
                fontFamily: ui.fancy,
                fontWeight: 980,
                letterSpacing: -3,
                lineHeight: 0.92,
                fontSize: "clamp(64px, 10vw, 140px)", // juda katta ✅
                marginTop: 10,
              }}
            >
              <span
                style={{
                  background: `linear-gradient(135deg, ${ui.pink} 0%, ${ui.purple} 45%, ${ui.orange} 78%, ${ui.yellow} 120%)`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                KIBOO
              </span>
            </div>

            <div
              style={{
                maxWidth: 920,
                margin: "18px auto 0",
                textAlign: "center",
                color: ui.sub,
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              Ota-ona • O‘qituvchi • O‘quvchi
            </div>

            <Divider />

            {/* Mission text (chiroyli shrift) */}
            <div
              style={{
                maxWidth: 980,
                margin: "0 auto",
                display: "grid",
                gap: 14,
              }}
            >
              <div
                style={{
                  fontFamily: ui.serif,
                  fontSize: "clamp(18px, 2.2vw, 26px)",
                  lineHeight: 1.45,
                  letterSpacing: -0.2,
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.94)" }}>
                  KIBOO ta’limni shunchaki video ko‘rishdan iborat bo‘lgan
                  jarayondan chiqarib, haqiqiy o‘rganishga aylantirish uchun
                  yaratilgan.
                </span>
              </div>

              <div
                style={{
                  color: ui.sub,
                  fontSize: 14,
                  lineHeight: 1.75,
                }}
              >
                Bugun ko‘p platformalarda o‘quvchi darsni ko‘radi, lekin:
                <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                  <div>— tushundimi yoki yo‘qmi aniq emas</div>
                  <div>— qayerda qiynalayotgani ko‘rinmaydi</div>
                  <div>— bilim qanchalik mustahkamlanganini bilish qiyin</div>
                </div>
              </div>

              <div
                style={{
                  color: ui.text,
                  fontWeight: 950,
                  fontSize: 15,
                }}
              >
                KIBOO shu muammoni hal qiladi.
              </div>

              <SubCard
                style={{
                  border: `1px solid ${ui.border2}`,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))",
                }}
              >
                <div
                  style={{
                    color: ui.sub,
                    fontSize: 14,
                    lineHeight: 1.75,
                  }}
                >
                  Bu yerda o‘rganish jarayoni tartib bilan quriladi:
                  <div
                    style={{
                      marginTop: 10,
                      fontFamily: ui.fancy,
                      fontWeight: 950,
                      letterSpacing: -0.4,
                      color: ui.text,
                      fontSize: 16,
                    }}
                  >
                    dars → topshiriq → test → natija
                  </div>
                </div>

                <Divider />

                <div style={{ display: "grid", gap: 10, color: ui.sub }}>
                  <div>
                    • o‘quvchi nimani bilayotganini va nimani bilmayotganini
                    tushunadi
                  </div>
                  <div>
                    • o‘qituvchi darsning qanday o‘zlashtirilayotganini ko‘ra oladi
                  </div>
                  <div>
                    • ota-ona farzandining o‘qishini taxmin bilan emas, real natija
                    bilan kuzatadi
                  </div>
                </div>

                <Divider />

                <div style={{ color: ui.sub, lineHeight: 1.75 }}>
                  KIBOO’ning maqsadi — ta’limni murakkablashtirish emas, uni
                  tushunarli, tekshiriladigan va ishonchli qilish.
                </div>
              </SubCard>

              {/* Faqat 3 ta role card qolsin (siz aytgandek) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                }}
              >
                <SubCard
                  style={{
                    border: "1px solid rgba(255,45,170,0.22)",
                    background:
                      "linear-gradient(180deg, rgba(255,45,170,0.09), rgba(255,255,255,0.04))",
                  }}
                >
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ fontWeight: 980, letterSpacing: -0.2 }}>
                      O‘quvchi
                    </div>
                    <div style={{ color: ui.sub2, fontSize: 12, lineHeight: 1.6 }}>
                      Darsni ko‘radi → topshiriq bajaradi → test → natija. Ketma-ket
                      progression.
                    </div>
                    <Btn variant="primary" onClick={() => go("/student")}>
                      Ochish
                    </Btn>
                  </div>
                </SubCard>

                <SubCard
                  style={{
                    border: "1px solid rgba(124,58,237,0.22)",
                    background:
                      "linear-gradient(180deg, rgba(124,58,237,0.09), rgba(255,255,255,0.04))",
                  }}
                >
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ fontWeight: 980, letterSpacing: -0.2 }}>
                      O‘qituvchi
                    </div>
                    <div style={{ color: ui.sub2, fontSize: 12, lineHeight: 1.6 }}>
                      Video dars + testlar. O‘zlashtirishni nazorat qiladi.
                    </div>
                    <Btn variant="primary" onClick={() => go("/teacher")}>
                      Ochish
                    </Btn>
                  </div>
                </SubCard>

                <SubCard
                  style={{
                    border: "1px solid rgba(255,122,24,0.22)",
                    background:
                      "linear-gradient(180deg, rgba(255,122,24,0.09), rgba(255,255,255,0.04))",
                  }}
                >
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ fontWeight: 980, letterSpacing: -0.2 }}>
                      Ota-ona
                    </div>
                    <div style={{ color: ui.sub2, fontSize: 12, lineHeight: 1.6 }}>
                      Farzand o‘qishini taxmin bilan emas, real natija bilan kuzatadi.
                    </div>
                    <Btn variant="primary" onClick={() => go("/parent")}>
                      Ochish
                    </Btn>
                  </div>
                </SubCard>
              </div>
            </div>
          </div>
        </Card>

        <div
          style={{
            marginTop: 14,
            textAlign: "center",
            color: ui.sub2,
            fontSize: 12,
          }}
        >
          © {new Date().getFullYear()} KIBOO
        </div>
      </div>

      {/* MENU OVERLAY */}
      {menuOpen ? (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            zIndex: 50,
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(520px, 100%)",
              borderRadius: 22,
              border: "1px solid rgba(255,255,255,0.16)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))",
              boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
              padding: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontFamily: ui.fancy,
                  fontSize: 16,
                  fontWeight: 950,
                  letterSpacing: -0.3,
                }}
              >
                Bo‘lim tanlang
              </div>

              <Btn variant="ghost" onClick={() => setMenuOpen(false)}>
                Yopish ✕
              </Btn>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <SubCard
                style={{
                  border: "1px solid rgba(255,45,170,0.22)",
                  background:
                    "linear-gradient(180deg, rgba(255,45,170,0.08), rgba(255,255,255,0.05))",
                }}
              >
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ fontWeight: 950 }}>O‘quvchi</div>
                  <div style={{ color: ui.sub, fontSize: 12, lineHeight: 1.6 }}>
                    Ketma-ket progression: dars → topshiriq → test → natija
                  </div>
                  <Btn
                    variant="primary"
                    onClick={() => {
                      setMenuOpen(false);
                      go("/student");
                    }}
                  >
                    O‘quvchi kabinetiga o‘tish
                  </Btn>
                </div>
              </SubCard>

              <SubCard
                style={{
                  border: "1px solid rgba(124,58,237,0.22)",
                  background:
                    "linear-gradient(180deg, rgba(124,58,237,0.08), rgba(255,255,255,0.05))",
                }}
              >
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ fontWeight: 950 }}>O‘qituvchi</div>
                  <div style={{ color: ui.sub, fontSize: 12, lineHeight: 1.6 }}>
                    Video dars + testlar, o‘zlashtirish nazorati
                  </div>
                  <Btn
                    variant="primary"
                    onClick={() => {
                      setMenuOpen(false);
                      go("/teacher");
                    }}
                  >
                    O‘qituvchi kabinetiga o‘tish
                  </Btn>
                </div>
              </SubCard>

              <SubCard
                style={{
                  border: "1px solid rgba(255,122,24,0.22)",
                  background:
                    "linear-gradient(180deg, rgba(255,122,24,0.08), rgba(255,255,255,0.05))",
                }}
              >
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ fontWeight: 950 }}>Ota-ona</div>
                  <div style={{ color: ui.sub, fontSize: 12, lineHeight: 1.6 }}>
                    Farzand natijalarini real ko‘rsatkichlar bilan kuzatish
                  </div>
                  <Btn
                    variant="primary"
                    onClick={() => {
                      setMenuOpen(false);
                      go("/parent");
                    }}
                  >
                    Ota-ona kabinetiga o‘tish
                  </Btn>
                </div>
              </SubCard>
            </div>

            <div style={{ marginTop: 12, color: ui.sub2, fontSize: 12 }}>
              Eslatma: hammasi <b>bitta tab</b> ichida ochiladi ✅
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}