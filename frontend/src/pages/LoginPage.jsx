import { useState } from "react";
import { getApiBase, loginStudent } from "../lib/api";

export default function LoginPage({ onLoggedIn }) {
  const [apiBase] = useState(getApiBase());

  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleLogin() {
    setErr("");
    setLoading(true);
    try {
      const data = await loginStudent(email, password);
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
      <h2>Student Login</h2>
      <div className="muted">API: {apiBase}</div>

      <div className="card">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Kiryapti..." : "Login"}
        </button>
        {err ? <div className="error">{err}</div> : null}
      </div>
    </div>
  );
}