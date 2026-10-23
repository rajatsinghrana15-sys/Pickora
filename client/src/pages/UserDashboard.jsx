import React, { useState } from "react";
import { Link, useRouter } from "../router/Router.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { api } from "../lib/api.js";
import "./UserDashboard.css";

export default function UserDashboard() {
  const { user, updateProfile, signOut } = useAuth();
  const { navigate } = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
  });

  function chooseAvatar(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Please choose a PNG, JPG, or WebP image.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("Image must be smaller than 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(String(reader.result || ""));
      setError("");
    };
    reader.onerror = () =>
      setError("Image could not be read. Please try another file.");
    reader.readAsDataURL(file);
  }

  async function save(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await updateProfile({ name, avatar });
      setMessage("Your profile has been updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const result = await api("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify(password),
      });
      setPassword({ currentPassword: "", newPassword: "" });
      setMessage(result.message || "Your password has been updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    signOut();
    navigate("/");
  }

  return (
    <main className="dashboard-page user-dashboard-page">
      <Link to="/" className="dashboard-home-link">
        ← Home page
      </Link>
      <div className="dashboard-heading">
        <div>
          <div className="eyebrow">YOUR PICKORA PROFILE</div>
          <h1>
            Hello, <em>{user?.name?.split(" ")[0]}.</em>
          </h1>
          <p>Update your account name and profile photo here.</p>
        </div>
        <button className="button outline" onClick={logout}>
          Sign out
        </button>
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="form-success" role="status">
          {message}
        </div>
      )}
      <section className="dashboard-panel profile-panel">
        <div className="panel-heading">
          <h2>Profile details</h2>
        </div>
        <p className="muted">
          Your sign-in email: <b>{user?.email}</b>
        </p>
        <div className="profile-photo-picker">
          {avatar ? (
            <img className="profile-photo-preview" src={avatar} alt="Profile" />
          ) : (
            <div className="profile-photo-fallback">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
          <div className="profile-photo-actions">
            <label className="button outline">
              Choose photo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={chooseAvatar}
                hidden
              />
            </label>
            {avatar && (
              <button
                type="button"
                className="text-button"
                onClick={() => setAvatar("")}
              >
                Remove photo
              </button>
            )}
            <small>PNG, JPG, or WebP. Maximum size: 1 MB.</small>
          </div>
        </div>
        <form className="form" onSubmit={save}>
          <label>
            Display name
            <input
              value={name}
              required
              minLength="2"
              maxLength="80"
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <button className="button dark" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>
      <section className="dashboard-panel profile-panel security-panel">
        <div className="panel-heading">
          <h2>Account security</h2>
        </div>
        <p className="muted">
          If an admin gave you a temporary password, sign in with it here and
          replace it with your own password.
        </p>
        <form className="form" onSubmit={changePassword}>
          <label>
            Current password
            <input
              type="password"
              required
              minLength="8"
              maxLength="72"
              autoComplete="current-password"
              value={password.currentPassword}
              onChange={(event) =>
                setPassword({
                  ...password,
                  currentPassword: event.target.value,
                })
              }
            />
          </label>
          <label>
            New password
            <input
              type="password"
              required
              minLength="12"
              maxLength="72"
              autoComplete="new-password"
              value={password.newPassword}
              onChange={(event) =>
                setPassword({ ...password, newPassword: event.target.value })
              }
            />
            <small>Use at least 12 characters.</small>
          </label>
          <button className="button dark" disabled={busy}>
            {busy ? "Updating…" : "Change password"}
          </button>
        </form>
      </section>
    </main>
  );
}
