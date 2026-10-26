import { useState } from "react";
import "./App.css";

export default function AuthLogin({ signIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const login = async (event) => {
    event.preventDefault();
    setBusy(true); setError("");
    try { await signIn({ email, password }); setPassword(""); }
    catch (failure) { setError(failure.message || "Sign in failed."); }
    finally { setBusy(false); }
  };
  return <main className="app-shell auth-shell">
    <section className="panel auth-card" aria-labelledby="login-title">
      <span className="auth-symbol" aria-hidden="true">भ</span>
      <p className="eyebrow">PRIVATE KNOWLEDGE WORKSPACE</p>
      <h1 id="login-title">Sign in to Bhasha</h1>
      <p className="auth-subtitle">Your files, questions and analytics belong to your account.</p>
      {error && <p role="alert" className="auth-error">{error}</p>}
      <form className="auth-form" onSubmit={login}>
        <label htmlFor="login-email">Email</label>
        <input id="login-email" type="email" autoComplete="username" value={email}
          onChange={(event) => setEmail(event.target.value)} required />
        <label htmlFor="login-password">Password</label>
        <input id="login-password" type="password" autoComplete="current-password"
          value={password} onChange={(event) => setPassword(event.target.value)} required />
        <button className="primary-button" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      <p className="auth-hint">An administrator creates new accounts. Use your administrator credentials for first login.</p>
    </section>
  </main>;
}
