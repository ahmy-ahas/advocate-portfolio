import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/Auth.jsx';
import { Spinner } from '../../components/ui.jsx';

export default function Login() {
  const { user, loading, login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (loading) return <Spinner />;
  if (user) return <Navigate to={loc.state?.from || '/admin/dashboard'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { await login(form.email, form.password); nav(loc.state?.from || '/admin/dashboard', { replace: true }); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 bg-white p-8">
        <div><h1 className="text-2xl">Admin sign in</h1><p className="mt-1 text-sm text-muted">Manage the website content.</p></div>
        {error && <p className="border border-red-300 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
        <div><label className="label" htmlFor="l-email">Email</label><input id="l-email" type="email" className="input" autoComplete="username" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className="label" htmlFor="l-pw">Password</label><input id="l-pw" type="password" className="input" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        <button className="btn-dark w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
