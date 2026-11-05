import { Link } from 'react-router-dom';
import { isSafeUrl } from '../lib/utils.js';

const PATHS = {
  shield: 'M12 3l8 3v6c0 4.5-3.2 8.3-8 9-4.8-.7-8-4.5-8-9V6l8-3z',
  users: 'M16 11a3 3 0 100-6 3 3 0 000 6zM8 12a3 3 0 100-6 3 3 0 000 6zM2 20v-1a5 5 0 015-5h2a5 5 0 015 5v1M15 14.2a5 5 0 017 4.8v1',
  briefcase: 'M3 8h18v11H3zM8 8V5h8v3M3 13h18',
  scale: 'M12 3v18M6 21h12M5 7h14M5 7l-3 7a3.5 3.5 0 006 0L5 7zM19 7l-3 7a3.5 3.5 0 006 0l-3-7z',
  document: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  book: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 19a2 2 0 012-2h13',
  building: 'M4 21V6l8-3 8 3v15M4 21h16M9 9h2M13 9h2M9 13h2M13 13h2M10 21v-4h4v4',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z',
  mail: 'M3 5h18v14H3zM3 7l9 6 9-6',
  whatsapp: 'M3 21l1.6-4.6A8.5 8.5 0 1112 20.5a8.4 8.4 0 01-4-1L3 21zM9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 01-1.8-1.8l.8-1-1-2L9 9.5z',
  map: 'M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12zM12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  search: 'M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5-5',
  plus: 'M12 5v14M5 12h14',
  edit: 'M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
  up: 'M6 15l6-6 6 6',
  down: 'M6 9l6 6 6-6',
  check: 'M5 12l5 5L20 7',
  upload: 'M12 16V4M7 9l5-5 5 5M4 20h16',
  external: 'M14 4h6v6M20 4L10 14M18 14v6H4V6h6',
  download: 'M12 4v12M7 11l5 5 5-5M4 20h16',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
  inbox: 'M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5',
  image: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M9 9.5a1 1 0 100-2 1 1 0 000 2z',
  settings: 'M4 7h10M18 7h2M4 17h2M10 17h10M16 4v6M8 14v6',
  logout: 'M10 4H4v16h6M15 8l4 4-4 4M19 12H9',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  grid: 'M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z',
  trophy: 'M7 4h10v5a5 5 0 01-10 0zM7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3M12 14v4M8 21h8',
  news: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',
};
export const ICON_NAMES = ['scale', 'shield', 'users', 'briefcase', 'document', 'book', 'building'];

export function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={PATHS[name] || PATHS.scale} />
    </svg>
  );
}

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-gold" />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function ErrorBox({ error, retry }) {
  return (
    <div className="mx-auto max-w-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800" role="alert">
      <p>{error?.message || 'Something went wrong.'}</p>
      {retry && <button onClick={retry} className="btn-dark btn-sm mt-4">Try again</button>}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="border border-dashed border-line bg-white/60 px-6 py-14 text-center">
      <p className="font-serif text-lg text-ink">{title}</p>
      {children && <p className="mx-auto mt-2 max-w-md text-sm text-muted">{children}</p>}
    </div>
  );
}

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = [];
  for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button className="btn-outline btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - nums[i - 1] > 1 && <span className="text-muted">…</span>}
          <button onClick={() => onChange(n)} aria-current={n === page ? 'page' : undefined}
            className={`btn btn-sm min-w-9 ${n === page ? 'bg-charcoal text-white' : 'border border-line bg-white'}`}>{n}</button>
        </span>
      ))}
      <button className="btn-outline btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
    </nav>
  );
}

export function SectionHead({ title, intro, children, light }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h2 className={`text-3xl sm:text-[2.1rem] ${light ? 'text-white' : ''}`}>{title}</h2>
        {intro && <p className={`mt-3 ${light ? 'text-white/70' : 'text-muted'}`}>{intro}</p>}
      </div>
      {children}
    </div>
  );
}

export function PageHero({ title, intro }) {
  return (
    <header className="bg-charcoal py-14 text-white sm:py-20">
      <div className="container-x">
        <h1 className="text-4xl sm:text-5xl">{title}</h1>
        <div className="my-5 h-0.5 w-14 bg-gold" />
        {intro && <p className="max-w-2xl text-lg text-white/75">{intro}</p>}
      </div>
    </header>
  );
}

export function TextLink({ to, href, children, className = '' }) {
  const cls = `inline-flex items-center gap-1 border-b border-gold pb-0.5 text-[0.93rem] text-gold hover:text-ink ${className}`;
  if (href) return <a href={isSafeUrl(href) ? href : '#'} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>;
  return <Link to={to} className={cls}>{children}</Link>;
}

// Renders plain text safely: blank line = new paragraph, "## " = sub-heading, "- " lines = bullet list
export function Prose({ text = '', className = '' }) {
  const blocks = String(text).split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={`space-y-4 leading-relaxed ${className}`}>
      {blocks.map((b, i) => {
        if (b.startsWith('## ')) return <h3 key={i} className="pt-2 text-xl text-ink">{b.slice(3)}</h3>;
        const lines = b.split('\n');
        if (lines.every((l) => l.startsWith('- ')))
          return <ul key={i} className="list-disc space-y-1 pl-5">{lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>;
        return <p key={i} className="whitespace-pre-line">{b}</p>;
      })}
    </div>
  );
}

export function Tags({ tags = [] }) {
  if (!tags.length) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((t) => <li key={t} className="badge border border-line bg-paper text-muted">{t}</li>)}
    </ul>
  );
}

export function FileLink({ file, label }) {
  if (!file?.url) return null;
  return (
    <a href={isSafeUrl(file.url) ? file.url : '#'} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 border border-line bg-white px-4 py-3 text-sm hover:border-gold">
      <Icon name="document" className="h-5 w-5 shrink-0 text-gold" />
      <span className="min-w-0 flex-1 truncate">{label || file.name || 'Document'}</span>
      <Icon name="external" className="h-4 w-4 shrink-0 text-muted" />
    </a>
  );
}
