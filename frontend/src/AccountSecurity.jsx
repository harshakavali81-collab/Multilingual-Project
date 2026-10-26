import { useState } from "react";
import "./App.css";

export default function AccountSecurity({ user, apiRequest, onPasswordChanged }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [memberRole, setMemberRole] = useState("member");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const changePassword = async (event) => {
    event.preventDefault();
    setNotice(""); setBusy(true);
    try {
      await apiRequest("/auth/change-password", { method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }) });
      setCurrentPassword(""); setNewPassword("");
      await onPasswordChanged();
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  };
  const createAccount = async (event) => {
    event.preventDefault();
    setBusy(true); setNotice("");
    try {
      const created = await apiRequest("/admin/users", { method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: memberEmail, password: memberPassword, role: memberRole }) });
      setNotice("Created " + created.email + ". Share credentials privately.");
      setMemberEmail(""); setMemberPassword("");
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  };
  return <section className="panel account-panel" aria-label="Account settings">
    <div className="panel-heading"><span className="panel-icon violet">♙</span>
      <div><h2>Account and security</h2><p>Signed in as {user.email} · {user.role}</p></div></div>
    {notice && <p className="account-notice" role="status">{notice}</p>}
    <form className="account-form" onSubmit={changePassword}>
      <h3>Change password</h3>
      <label htmlFor="current-password">Current password</label>
      <input id="current-password" type="password" autoComplete="current-password"
        value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
      <label htmlFor="new-password">New password (at least 12 characters)</label>
      <input id="new-password" type="password" autoComplete="new-password" minLength={12}
        value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
      <button type="submit" className="secondary-button" disabled={busy}>Update password</button>
    </form>
    {user.role === "admin" && <form className="account-form" onSubmit={createAccount}>
      <h3>Create a user</h3><p>Members can only access their own documents and conversations.</p>
      <label htmlFor="member-email">New user email</label>
      <input id="member-email" type="email" autoComplete="off"
        value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} required />
      <label htmlFor="member-password">Temporary password (12+ characters)</label>
      <input id="member-password" type="password" minLength={12} autoComplete="new-password"
        value={memberPassword} onChange={(event) => setMemberPassword(event.target.value)} required />
      <label htmlFor="member-role">Role</label>
      <select id="member-role" value={memberRole} onChange={(event) => setMemberRole(event.target.value)}>
        <option value="member">Member</option><option value="admin">Administrator</option>
      </select>
      <button type="submit" className="secondary-button" disabled={busy}>Create account</button>
    </form>}
  </section>;
}
