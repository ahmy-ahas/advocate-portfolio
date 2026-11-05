import { useState } from 'react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/Auth.jsx';
import { useToast } from '../../context/Toast.jsx';
import { Field } from '../../components/admin/Fields.jsx';

export default function Settings() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [acct, setAcct] = useState({ name: user?.name || '', email: user?.email || '', currentPassword: '' });
  const [busy, setBusy] = useState('');

  const changePw = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return toast('The new passwords do not match', 'error');
    setBusy('pw');
    try { await api.put('/auth/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword }); toast('Password changed'); setPw({ currentPassword: '', newPassword: '', confirm: '' }); }
    catch (err) { toast(err.message, 'error'); } finally { setBusy(''); }
  };
  const saveAcct = async (e) => {
    e.preventDefault();
    setBusy('acct');
    try { const r = await api.put('/auth/account', acct); setUser(r.user); setAcct((a) => ({ ...a, currentPassword: '' })); toast('Account updated'); }
    catch (err) { toast(err.message, 'error'); } finally { setBusy(''); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl">Settings</h2>
      <form onSubmit={saveAcct} className="card space-y-5 p-6">
        <h3 className="text-xl">Account</h3>
        <Field label="Name" htmlFor="a-name"><input id="a-name" className="input" value={acct.name} onChange={(e) => setAcct({ ...acct, name: e.target.value })} /></Field>
        <Field label="Login email" htmlFor="a-email"><input id="a-email" type="email" className="input" value={acct.email} onChange={(e) => setAcct({ ...acct, email: e.target.value })} required /></Field>
        <Field label="Current password" htmlFor="a-pw" help="Required to confirm changes."><input id="a-pw" type="password" className="input" autoComplete="current-password" value={acct.currentPassword} onChange={(e) => setAcct({ ...acct, currentPassword: e.target.value })} required /></Field>
        <button className="btn-dark" disabled={busy === 'acct'}>{busy === 'acct' ? 'Saving…' : 'Save account'}</button>
      </form>
      <form onSubmit={changePw} className="card space-y-5 p-6">
        <h3 className="text-xl">Change password</h3>
        <Field label="Current password" htmlFor="p-cur"><input id="p-cur" type="password" className="input" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required /></Field>
        <Field label="New password" htmlFor="p-new" help="At least 8 characters."><input id="p-new" type="password" className="input" autoComplete="new-password" minLength={8} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required /></Field>
        <Field label="Confirm new password" htmlFor="p-conf"><input id="p-conf" type="password" className="input" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required /></Field>
        <button className="btn-dark" disabled={busy === 'pw'}>{busy === 'pw' ? 'Saving…' : 'Change password'}</button>
      </form>
    </div>
  );
}
