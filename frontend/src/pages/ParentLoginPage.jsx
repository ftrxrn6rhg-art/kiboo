import { useState } from "react";
import { getApiBase, loginParent } from "../lib/api";

export default function ParentLoginPage({ onLoggedIn }) {
  const [apiBase] = useState(getApiBase());

  const [email, setEmail] = useState("parent2@test.com");
  const [password, setPassword] = useState("123456");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleLogin() {
    setErr("");
    setLoading(true);
    try {
      const data = await loginParent(email, password);
      const token = data?.token || "";
      if (!token) throw new Error("Token kelmadi");
      onLoggedIn(token);
    } catch (e) {
      setErr(e.message || "Login error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h2>Parent Login</h2>
      <div className="muted">API: {apiBase}</div>

      <div className="card">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Kiryapti..." : "Login"}
        </button>
        {err ? <div className="error">{err}</div> : null}

        <div className="muted small" style={{ marginTop: 10 }}>
          Eslatma: Parent login endpoint sizda boshqacha bo‘lishi mumkin.
          Agar “Email yoki parol xato” chiqsa, parentRoutes.js dagi haqiqiy login route’ni ulaymiz.
        </div>
      </div>
    </div>
  );
}