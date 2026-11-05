import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSite } from '../../context/Site.jsx';
import { Icon, Spinner, ErrorBox } from '../ui.jsx';
import { telLink, waLink } from '../../lib/utils.js';

const NAV = [
  ['/about', 'About'],
  ['/practice-areas', 'Practice Areas'],
  ['/cases', 'Important Cases'],
  ['/landmark-judgments', 'Judgments'],
  ['/achievements', 'Achievements'],
  ['/legal-updates', 'Legal Updates'],
];

function Header({ profile }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  const link = ({ isActive }) => `border-b pb-0.5 transition-colors ${isActive ? 'border-gold text-ink' : 'border-transparent hover:border-gold'}`;
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="container-x flex h-[72px] items-center justify-between">
        <Link to="/" className="font-serif text-lg leading-tight">
          {profile.name} <span className="block text-xs font-sans text-muted sm:inline sm:text-sm">{profile.title}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-[0.93rem] lg:flex" aria-label="Main">
          {NAV.map(([to, label]) => <NavLink key={to} to={to} className={link}>{label}</NavLink>)}
          <Link to="/contact" className="btn-dark btn-sm">Contact</Link>
        </nav>
        <button className="p-2 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          <Icon name={open ? 'close' : 'menu'} className="h-6 w-6" />
        </button>
      </div>
      {open && (
        <nav className="border-t border-line bg-paper lg:hidden" aria-label="Mobile">
          <div className="container-x flex flex-col py-2">
            <NavLink to="/" end className="border-b border-line py-3.5">Home</NavLink>
            {NAV.map(([to, label]) => <NavLink key={to} to={to} className="border-b border-line py-3.5">{label}</NavLink>)}
            <NavLink to="/contact" className="py-3.5 font-medium text-gold">Contact</NavLink>
          </div>
        </nav>
      )}
    </header>
  );
}

function Footer({ profile }) {
  const wa = waLink(profile.whatsapp || profile.phone);
  return (
    <footer className="bg-ink text-white/70">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-xl text-white">{profile.name}, <span className="text-gold-light">{profile.title}</span></p>
          {profile.headline && <p className="mt-3 max-w-xs text-sm">{profile.headline}</p>}
          {profile.social?.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-4 text-sm">
              {profile.social.filter((s) => s.url).map((s) => (
                <li key={s.platform + s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-white">{s.platform || 'Link'}</a></li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h4 className="mb-4 text-sm font-medium text-white">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-white" to="/practice-areas">Practice Areas</Link></li>
            <li><Link className="hover:text-white" to="/cases">Important Cases</Link></li>
            <li><Link className="hover:text-white" to="/landmark-judgments">Landmark Judgments</Link></li>
            <li><Link className="hover:text-white" to="/about">About</Link></li>
            <li><Link className="hover:text-white" to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-medium text-white">Contact</h4>
          <ul className="space-y-2 text-sm">
            {profile.phone && <li><a className="hover:text-white" href={telLink(profile.phone)}>{profile.phone}</a></li>}
            {profile.email && <li><a className="break-all hover:text-white" href={`mailto:${profile.email}`}>{profile.email}</a></li>}
            {wa && <li><a className="hover:text-white" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-medium text-white">Office</h4>
          <address className="space-y-2 text-sm not-italic">
            {profile.chamberNumber && <p>Chamber No. {profile.chamberNumber}{profile.chamberLocation ? `, ${profile.chamberLocation}` : ''}</p>}
            {profile.officeAddress && <p>{profile.officeAddress}</p>}
          </address>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
        © {new Date().getFullYear()} {profile.name}, {profile.title}. All rights reserved.
      </div>
    </footer>
  );
}

function MobileContactBar({ profile }) {
  const wa = waLink(profile.whatsapp || profile.phone);
  if (!profile.phone && !wa) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t border-white/10 bg-charcoal text-white md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {profile.phone && <a href={telLink(profile.phone)} className="flex items-center justify-center gap-2 py-3.5 text-sm font-medium"><Icon name="phone" className="h-4 w-4" />Call</a>}
      {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 border-l border-white/10 py-3.5 text-sm font-medium"><Icon name="whatsapp" className="h-4 w-4" />WhatsApp</a>}
    </div>
  );
}

export default function PublicLayout() {
  const { profile, loading, error, reload } = useSite();
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  if (loading) return <Spinner label="Loading" />;
  if (error || !profile) return <div className="container-x py-24"><ErrorBox error={error} retry={reload} /></div>;
  return (
    <>
      <Header profile={profile} />
      <main className="pb-14 md:pb-0"><Outlet /></main>
      <Footer profile={profile} />
      <MobileContactBar profile={profile} />
    </>
  );
}
