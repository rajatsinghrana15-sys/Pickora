import React, { useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Link, useRouter } from "../router/Router.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import "./AuthPage.css";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { signIn, register } = useAuth();
  const { navigate, pathname } = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const returnTo = new URLSearchParams(pathname.split("?")[1] || "").get("returnTo");
  const switchHref = `${isRegister ? "/login" : "/register"}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;
  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = isRegister
        ? await register(form.name, form.email, form.password)
        : await signIn(form.email, form.password);
      const safeReturnTo = returnTo?.startsWith("/") && !returnTo.startsWith("//")
        ? returnTo
        : user.role === "admin" ? "/admin" : "/account";
      navigate(safeReturnTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="home-page-button">
          ← Landing page
        </Link>
        <div className="eyebrow">
          <LockKeyhole size={14} /> YOUR PICKORA ACCOUNT
        </div>
        <h1>{isRegister ? "Make yourself at home." : "Lovely to see you."}</h1>
        <p>
          {isRegister
            ? "Create an account to follow your orders and keep your details close."
            : "Sign in to see your orders and pick up where you left off."}
        </p>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <form className="form" onSubmit={submit}>
          {isRegister && (
            <label>
              Your name
              <input
                required
                minLength="2"
                maxLength="80"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
          )}
          <label>
            Email address
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength="8"
              maxLength="72"
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <button className="button dark full" disabled={busy}>
            {busy
              ? "Please wait…"
              : isRegister
                ? "Create my account"
                : "Sign in"}{" "}
            <ArrowRight size={16} />
          </button>
        </form>
        <div className="switch-auth">
          {isRegister ? "Already have an account?" : "New around here?"}{" "}
          <Link to={switchHref}>
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </div>
      </section>
    </main>
  );
}
