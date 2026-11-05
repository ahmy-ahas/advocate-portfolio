import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/Auth.jsx';
import { api } from '../../lib/api.js';
import { Icon, Spinner } from '../ui.jsx';

const NAV = [
  ['/admin/dashboard', 'Dashboard', 'grid'], ['/admin/profile', 'Profile', 'user'], ['/admin/practice-areas', 'Practice Areas', 'shield'],
  ['/admin/cases', 'Important Cases', 'briefcase'], ['/admin/landmark-judgments', 'Landmark Judgments', 'scale'], ['/admin/achievements', 'Achievements', 'trophy'],
  ['/admin/legal-updates', 'Legal Updates', 'news'], ['/admin/media', 'Media', 'image'], ['/admin/messages', 'Messages', 'inbox'], ['/admin/settings', 'Settings', 'settings'],
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => { document.title = 'Admin | Website management'; }, []);
  useEffect(() => {
    if (!user) return undefined;
    const load = () => api.get('/admin/messages?unread=true&limit=1').then((r) => setUnread(r.total)).catch(() => {});
    load();
    window.addEventListener('messages:changed', load);
    return () => window.removeEventListener('messages:changed', load);
  }, [user, pathname]);

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/admin/login" state={{ from: pathname }} replace />;

  return (
    <div className="min-h-screen lg:flex">
      <aside className={`${open ? 'block' : 'hidden'} fixed inset-0 z-40 overflow-y-auto bg-charcoal text-white lg:static lg:block lg:w-64 lg:shrink-0`}>
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/admin/dashboard" className="font-serif text-lg">Website admin</Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><Icon name="close" className="h-6 w-6" /></button>
        </div>
        <nav className="px-3 pb-6" aria-label="Admin">
          {NAV.map(([to, label, icon]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-sm px-3 py-2.5 text-[0.95rem] ${isActive ? 'bg-white/10 text-gold-light' : 'text-white/75 hover:bg-white/5'}`}>
              <Icon name={icon} className="h-5 w-5" />{label}
              {label === 'Messages' && unread > 0 && <span className="ml-auto rounded-full bg-gold px-2 text-xs font-medium text-charcoal">{unread}</span>}
            </NavLink>
          ))}
          <a href="/" target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center gap-3 px-3 py-2.5 text-[0.95rem] text-white/75 hover:bg-white/5"><Icon name="external" className="h-5 w-5" />View website</a>
          <button onClick={logout} className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-[0.95rem] text-white/75 hover:bg-white/5"><Icon name="logout" className="h-5 w-5" />Logout</button>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper px-4 py-3 lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu"><Icon name="menu" className="h-6 w-6" /></button>
          <span className="font-serif">Website admin</span><span className="w-6" />
        </div>
        <main className="mx-auto max-w-6xl p-4 sm:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
