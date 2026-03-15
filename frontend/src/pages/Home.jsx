import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const goStart = () => navigate("/login");
  const goRole = (role) => navigate(`/login?role=${encodeURIComponent(role)}&next=/${encodeURIComponent(role)}`);

  const problems = [
    {
      icon: "◎",
      title: "Qayerdan boshlash noma'lum",
      text: "Ko'p platformalarda darslar tartibsiz. O'quvchi birinchi qadamni o'zi topishga majbur bo'ladi.",
    },
    {
      icon: "◌",
      title: "Hammasi bir xil sifatda emas",
      text: "Har bir mavzuni bir xil darajada yaxshi tushuntirish qiyin. Eng kuchli tushuntirishlar ajralib turishi kerak.",
    },
    {
      icon: "◍",
      title: "Nazorat va natija ko'rinmaydi",
      text: "Ota-ona ham, o'qituvchi ham o'quvchi nimani ko'rganini va nimani o'zlashtirganini tez tushunishi kerak.",
    },
  ];

  const solutions = [
    "Har bir mavzuni eng yaxshi tushuntira oladigan o'qituvchi olib boradi.",
    "Bir mavzuda bir nechta video bo'lishi mumkin, eng foydali darslar yuqoriga chiqadi.",
    "O'quvchi video, test va progress orqali ketma-ket harakat qiladi.",
    "Ota-ona va o'qituvchi real statistikani bitta joyda ko'radi.",
  ];

  const teacherPoints = [
    "Bir video — minglab o'quvchi",
    "Bilimni butun mamlakatga ulashish",
    "Ko'rilgan sari daromad olish",
  ];

  const differentiators = [
    "Davom etish markazdagi UX",
    "Har bir mavzu uchun eng yaxshi tushuntirish",
    "Reytinglangan video kutubxona",
    "Student, teacher va parent uchun alohida panel",
    "Test va progress bilan mustahkamlash",
    "Oddiy, tushunarli va nazorat qilinadigan ta'lim oqimi",
  ];

  const trustStats = [
    { value: "12 500+", label: "video dars modeli" },
    { value: "300+", label: "jalb qilinadigan o'qituvchi" },
    { value: "5–11", label: "sinf oralig'i" },
    { value: "24/7", label: "nazorat va kirish" },
  ];

  const liveStats = [
    { value: "3 082", label: "bugun o'qiyotgan o'quvchi" },
    { value: "12 480", label: "bugun ko'rilgan video" },
    { value: "91%", label: "eng mashhur video reytingi" },
  ];

  const pricing = [
    {
      title: "Bir fan",
      price: "209 000 so'm",
      note: "Bitta fan bo'yicha barcha video darslar va testlar",
    },
    {
      title: "3 ta fan",
      price: "509 000 so'm",
      note: "Bir nechta yo'nalishda parallel o'qish uchun",
      featured: true,
    },
  ];

  return (
    <div className="kiboo-page">
      <div className="page-glow" aria-hidden="true" />

      <header className="hero-shell">
        <div className="topbar">
          <div className="brand">KIBOO</div>
          <div className="topbar-actions">
            <button className="btn btn-ghost" onClick={() => goRole("teacher")}>O'qituvchi uchun</button>
            <button className="btn btn-primary" onClick={goStart}>Hozir boshlash</button>
          </div>
        </div>

        <div className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">Eng yaxshi o'qituvchilar. Eng yaxshi tushuntirishlar. Bitta platforma.</div>
            <h1>O'zbekiston bo'yicha eng yaxshi o'qituvchilar tushuntirgan video darslar bitta platformada.</h1>
            <p className="hero-text">
              KIBOO o'quvchiga qayerdan boshlashni ko'rsatadi, o'qituvchiga auditoriya beradi, ota-onaga esa farzandining real natijasini ko'rsatadi.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-large" onClick={goStart}>Bir darsni bepul ko'rish</button>
              <button className="btn btn-secondary btn-large" onClick={() => goRole("parent")}>Ota-ona demo</button>
            </div>
            <p className="hero-note">Rol tanlash ro'yxatdan o'tish jarayonida amalga oshiriladi.</p>

            <div className="trust-grid">
              {trustStats.map((item) => (
                <div key={item.label} className="trust-card">
                  <div className="trust-value">{item.value}</div>
                  <div className="trust-label">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="device-frame">
              <div className="device-top">
                <span>Platforma preview</span>
                <span>30–40 soniya demo</span>
              </div>
              <div className="device-screen">
                <div className="play-orb">▶</div>
                <div className="screen-caption">Student panel, video darslar, testlar va ota-ona nazorati shu yerda ko'rsatiladi.</div>
              </div>
            </div>

            <div className="floating-card continue-card">
              <div className="floating-label">Student</div>
              <div className="floating-title">Matematika • 8-sinf • 6-mavzu</div>
              <div className="progress-track"><div className="progress-fill" /></div>
              <div className="floating-row"><span>Davom etish</span><strong>68%</strong></div>
            </div>

            <div className="floating-card stats-card">
              <div className="floating-label">Teacher</div>
              <div className="metric-row"><span>Ko'rishlar</span><strong>12 000</strong></div>
              <div className="metric-row"><span>Layklar</span><strong>350</strong></div>
              <div className="metric-row"><span>Daromad</span><strong>1 200 000 so'm</strong></div>
            </div>
          </div>
        </div>
      </header>

      <section className="section section-tight">
        <div className="section-head">
          <h2>Asosiy muammolar</h2>
          <p>Ta'lim mahsuloti kuchli bo'lishi uchun foydalanuvchi birinchi qarashda nimani hal qilishini tushunishi kerak.</p>
        </div>
        <div className="problem-grid">
          {problems.map((item) => (
            <article key={item.title} className="soft-card problem-card">
              <div className="problem-badge">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section muted-band">
        <div className="two-col">
          <div className="section-head left-head">
            <h2>KIBOO yechimi</h2>
            <p>Uzoq matn o'rniga asosiy fikrlar tez ko'z yugurtirish uchun qisqa va aniq ko'rsatiladi.</p>
          </div>
          <div className="soft-card list-card">
            {solutions.map((item) => (
              <div key={item} className="list-row">
                <span className="list-dot">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Platformaning real ko'rinishi</h2>
          <p>Landing sahifada mahsulotning o'zi ko'rinishi kerak. Bu ishonchni keskin oshiradi.</p>
        </div>
        <div className="showcase-grid">
          <div className="soft-card showcase-card">
            <div className="showcase-head">Student panel</div>
            <div className="showcase-window student-window">
              <div className="window-line large" />
              <div className="window-line medium" />
              <div className="window-progress"><div className="window-progress-fill sky" /></div>
              <div className="window-chip-row">
                <span>Davom etish</span>
                <span>Video</span>
                <span>Test</span>
              </div>
            </div>
          </div>
          <div className="soft-card showcase-card">
            <div className="showcase-head">Teacher panel</div>
            <div className="showcase-window teacher-window">
              <div className="mini-stats">
                <div><small>Ko'rishlar</small><strong>12K</strong></div>
                <div><small>Daromad</small><strong>1.2M</strong></div>
              </div>
              <div className="mini-grid">
                <div />
                <div />
                <div />
                <div />
              </div>
            </div>
          </div>
          <div className="soft-card showcase-card">
            <div className="showcase-head">Parent panel</div>
            <div className="showcase-window parent-window">
              <div className="bars">
                {[58, 82, 44, 67, 90, 52, 76].map((h, i) => (
                  <div key={i} className="bar" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="window-chip-row">
                <span>Bugun: 48 min</span>
                <span>Test: 86%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section muted-band">
        <div className="two-col teacher-block">
          <div className="section-head left-head">
            <h2>O'qituvchilar uchun imkoniyat</h2>
            <p>KIBOO kuchli o'qituvchini ko'proq o'quvchi bilan bog'laydi va foydali darsni yuqoriga olib chiqadi.</p>
          </div>
          <div className="teacher-grid">
            {teacherPoints.map((item) => (
              <div key={item} className="soft-card teacher-card">{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Nega KIBOO boshqalardan farq qiladi</h2>
          <p>Bu bo'lim soddaligicha qoladi, lekin hover paytida jonlanadi.</p>
        </div>
        <div className="diff-grid">
          {differentiators.map((item) => (
            <div key={item} className="soft-card diff-card">{item}</div>
          ))}
        </div>
      </section>

      <section className="section muted-band">
        <div className="section-head">
          <h2>Narx va ishonch</h2>
          <p>Obuna taklifi yonida mahsulot hajmini ko'rsatish foydalanuvchiga ko'proq ishonch beradi.</p>
        </div>
        <div className="pricing-grid">
          {pricing.map((item) => (
            <div key={item.title} className={`soft-card price-card${item.featured ? " featured" : ""}`}>
              <div className="price-title">{item.title}</div>
              <div className="price-value">{item.price}</div>
              <p>{item.note}</p>
            </div>
          ))}
        </div>
        <div className="live-grid trust-live-grid">
          {liveStats.map((item) => (
            <div key={item.label} className="soft-card live-card">
              <div className="live-value">{item.value}</div>
              <div className="live-label">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-shell">
        <div>
          <h2>Bepul ko'ring. Tushuning. Keyin davom eting.</h2>
          <p>KIBOO landing sahifasi endi sodda, premium va foydalanuvchiga darhol tushunarli bo'ladigan oqimda qurildi.</p>
        </div>
        <div className="cta-actions">
          <button className="btn btn-primary btn-large" onClick={goStart}>Bepul sinab ko'rish</button>
          <button className="btn btn-secondary btn-large" onClick={() => goRole("teacher")}>O'qituvchi bo'lish</button>
        </div>
      </section>

      <footer className="footer">2026 by Abdusalom_Isomov</footer>

      <style>{`
        .kiboo-page {
          min-height: 100vh;
          color: #f5f5f7;
          background: linear-gradient(180deg, #f5f7fb 0%, #edf1f7 18%, #0c1017 18.1%, #0a0d14 100%);
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", system-ui, sans-serif;
        }

        .page-glow {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(900px 480px at 50% 0%, rgba(120, 170, 255, 0.22), transparent 55%),
            radial-gradient(700px 400px at 85% 18%, rgba(255, 210, 170, 0.16), transparent 60%);
        }

        .hero-shell,
        .section,
        .cta-shell,
        .footer {
          position: relative;
          z-index: 1;
        }

        .hero-shell {
          padding: 28px 6vw 72px;
          color: #10131a;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 42px;
        }

        .brand {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.24em;
        }

        .topbar-actions,
        .hero-actions,
        .cta-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn {
          border: none;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 600;
          transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
        }

        .btn:hover { transform: translateY(-1px); }

        .btn-primary {
          background: #111827;
          color: #f8fafc;
          box-shadow: 0 14px 34px rgba(17, 24, 39, 0.16);
          padding: 11px 18px;
        }

        .btn-secondary,
        .btn-ghost {
          background: rgba(255,255,255,0.72);
          color: #10131a;
          border: 1px solid rgba(16,19,26,0.08);
          padding: 11px 18px;
          backdrop-filter: blur(20px);
        }

        .btn-large {
          padding: 14px 22px;
          font-size: 0.98rem;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.02fr) minmax(320px, 0.98fr);
          gap: 28px;
          align-items: center;
        }

        .hero-copy h1 {
          margin: 0;
          font-size: clamp(3rem, 6vw, 5.8rem);
          line-height: 0.94;
          letter-spacing: -0.06em;
          max-width: 10ch;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          padding: 8px 14px;
          border-radius: 999px;
          margin-bottom: 18px;
          background: rgba(255,255,255,0.66);
          border: 1px solid rgba(16,19,26,0.08);
          color: rgba(16,19,26,0.72);
          font-size: 0.82rem;
          font-weight: 600;
        }

        .hero-text,
        .hero-note,
        .section-head p,
        .problem-card p,
        .list-row,
        .price-card p,
        .live-label,
        .trust-label,
        .screen-caption {
          color: rgba(16,19,26,0.68);
          line-height: 1.72;
        }

        .hero-text {
          max-width: 620px;
          margin: 18px 0 0;
          font-size: 1.05rem;
        }

        .hero-note {
          margin: 12px 0 0;
          font-size: 0.92rem;
        }

        .trust-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-top: 26px;
        }

        .soft-card,
        .trust-card,
        .device-frame,
        .floating-card,
        .cta-shell {
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.55);
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
        }

        .trust-card {
          border-radius: 22px;
          padding: 16px;
        }

        .trust-value,
        .live-value {
          font-size: clamp(1.35rem, 2vw, 2rem);
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }

        .hero-visual {
          position: relative;
          min-height: 640px;
        }

        .device-frame {
          border-radius: 36px;
          padding: 18px;
        }

        .device-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: rgba(16,19,26,0.6);
          font-size: 0.85rem;
          margin-bottom: 14px;
        }

        .device-screen {
          min-height: 420px;
          border-radius: 28px;
          background: linear-gradient(180deg, #eef2f8 0%, #dfe8f4 100%);
          position: relative;
          display: grid;
          place-items: center;
          overflow: hidden;
        }

        .device-screen::before {
          content: "";
          position: absolute;
          inset: 18px;
          border-radius: 22px;
          border: 1px solid rgba(17,24,39,0.06);
          background: linear-gradient(180deg, rgba(255,255,255,0.58), rgba(255,255,255,0.2));
        }

        .play-orb {
          position: relative;
          z-index: 1;
          width: 88px;
          height: 88px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #111827;
          color: white;
          font-size: 1.6rem;
          box-shadow: 0 18px 40px rgba(17,24,39,0.18);
        }

        .screen-caption {
          position: absolute;
          left: 24px;
          right: 24px;
          bottom: 24px;
          z-index: 1;
          padding: 16px 18px;
          border-radius: 20px;
          background: rgba(255,255,255,0.74);
          border: 1px solid rgba(17,24,39,0.06);
        }

        .floating-card {
          position: absolute;
          border-radius: 26px;
          padding: 16px;
        }

        .continue-card {
          left: 18px;
          bottom: 18px;
          width: min(320px, calc(100% - 36px));
        }

        .stats-card {
          right: 18px;
          top: 220px;
          width: 240px;
        }

        .floating-label,
        .showcase-head {
          color: rgba(16,19,26,0.58);
          font-size: 0.82rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .floating-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #111827;
          line-height: 1.3;
          margin-bottom: 12px;
        }

        .progress-track,
        .window-progress {
          height: 10px;
          border-radius: 999px;
          background: rgba(17,24,39,0.08);
          overflow: hidden;
          margin-bottom: 10px;
        }

        .progress-fill,
        .window-progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #60a5fa, #34d399);
        }

        .progress-fill { width: 68%; }

        .floating-row,
        .metric-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          color: rgba(16,19,26,0.7);
          font-size: 0.92rem;
        }

        .metric-row + .metric-row {
          margin-top: 10px;
        }

        .section {
          padding: 88px 6vw;
          color: #f5f5f7;
        }

        .section-tight {
          padding-top: 72px;
        }

        .muted-band {
          background: rgba(255,255,255,0.02);
        }

        .section-head {
          max-width: 760px;
          margin-bottom: 28px;
        }

        .left-head {
          margin-bottom: 0;
        }

        .section-head h2,
        .cta-shell h2 {
          margin: 0 0 12px;
          font-size: clamp(2rem, 4vw, 3.4rem);
          letter-spacing: -0.05em;
          line-height: 1;
        }

        .section-head p,
        .problem-card p,
        .list-row,
        .price-card p,
        .live-label,
        .teacher-card,
        .diff-card {
          color: rgba(245,245,247,0.72);
        }

        .problem-grid,
        .showcase-grid,
        .diff-grid,
        .pricing-grid,
        .live-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .problem-card,
        .showcase-card,
        .teacher-card,
        .diff-card,
        .price-card,
        .live-card,
        .list-card {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.08);
          color: #f5f5f7;
          border-radius: 28px;
          padding: 24px;
        }

        .problem-badge {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,0.08);
          color: white;
          font-size: 1.1rem;
          margin-bottom: 16px;
        }

        .problem-card h3 {
          margin: 0 0 10px;
          font-size: 1.2rem;
        }

        .two-col {
          display: grid;
          grid-template-columns: minmax(260px, 0.82fr) minmax(320px, 1.18fr);
          gap: 24px;
          align-items: start;
        }

        .list-card {
          display: grid;
          gap: 12px;
        }

        .list-row {
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: 12px;
          align-items: start;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .list-row:last-child { border-bottom: none; }

        .list-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,0.08);
          color: white;
          font-size: 0.82rem;
        }

        .showcase-window {
          margin-top: 12px;
          min-height: 260px;
          border-radius: 22px;
          padding: 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
        }

        .window-line {
          border-radius: 16px;
          background: rgba(255,255,255,0.1);
        }

        .window-line.large {
          height: 62px;
          width: 100%;
          margin-bottom: 14px;
        }

        .window-line.medium {
          height: 16px;
          width: 68%;
          margin-bottom: 14px;
        }

        .window-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        .window-chip-row span,
        .window-chip-row strong {
          display: inline-flex;
          align-items: center;
          padding: 7px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          color: rgba(245,245,247,0.82);
          font-size: 0.82rem;
        }

        .mini-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 12px;
        }

        .mini-stats div,
        .mini-grid div {
          border-radius: 18px;
          background: rgba(255,255,255,0.08);
          padding: 14px;
        }

        .mini-stats small {
          display: block;
          color: rgba(245,245,247,0.62);
          margin-bottom: 4px;
        }

        .mini-stats strong {
          font-size: 1.3rem;
        }

        .mini-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .mini-grid div { min-height: 72px; }

        .bars {
          min-height: 184px;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
          align-items: end;
        }

        .bar {
          border-radius: 12px 12px 6px 6px;
          background: linear-gradient(180deg, rgba(255,255,255,0.86), rgba(96,165,250,0.6));
        }

        .teacher-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .teacher-card {
          display: flex;
          align-items: end;
          min-height: 150px;
          font-size: 1.08rem;
          line-height: 1.45;
        }

        .diff-card {
          min-height: 126px;
          display: flex;
          align-items: end;
          transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
        }

        .diff-card:hover {
          transform: translateY(-4px);
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.14);
        }

        .price-card.featured {
          background: rgba(255,255,255,0.09);
        }

        .price-title {
          color: rgba(245,245,247,0.62);
          margin-bottom: 8px;
        }

        .price-value {
          font-size: 2.2rem;
          line-height: 1;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .trust-live-grid {
          margin-top: 16px;
        }

        .live-card {
          text-align: left;
        }

        .cta-shell {
          margin: 18px 6vw 0;
          padding: 30px;
          border-radius: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          color: #10131a;
        }

        .cta-shell p {
          color: rgba(16,19,26,0.68);
          margin: 0;
          max-width: 620px;
          line-height: 1.72;
        }

        .footer {
          text-align: center;
          padding: 28px 6vw 42px;
          color: rgba(245,245,247,0.48);
          font-size: 0.92rem;
        }

        @media (max-width: 1080px) {
          .hero-grid,
          .two-col {
            grid-template-columns: 1fr;
          }

          .trust-grid,
          .teacher-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .hero-visual {
            min-height: 580px;
          }
        }

        @media (max-width: 720px) {
          .hero-shell,
          .section {
            padding-left: 20px;
            padding-right: 20px;
          }

          .topbar,
          .cta-shell {
            flex-direction: column;
            align-items: flex-start;
          }

          .trust-grid,
          .teacher-grid,
          .problem-grid,
          .showcase-grid,
          .diff-grid,
          .pricing-grid,
          .live-grid {
            grid-template-columns: 1fr;
          }

          .hero-copy h1 {
            max-width: none;
          }

          .hero-visual {
            min-height: auto;
          }

          .floating-card {
            position: static;
            width: auto;
            margin-top: 14px;
          }

          .device-screen {
            min-height: 300px;
          }
        }
      `}</style>
    </div>
  );
}
