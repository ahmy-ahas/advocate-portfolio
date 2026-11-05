import { Link } from 'react-router-dom';
import { useFetch } from '../../lib/hooks.js';
import { ErrorBox, Icon, Spinner } from '../../components/ui.jsx';
import { formatDate } from '../../lib/utils.js';
import { useAuth } from '../../context/Auth.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: s, loading, error } = useFetch('/admin/stats');
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} />;
  const tiles = [
    ['Important cases', `${s.casesPub} published`, `${s.cases} total`, '/admin/cases', 'briefcase'],
    ['Landmark judgments', `${s.judgmentsPub} published`, `${s.judgments} total`, '/admin/landmark-judgments', 'scale'],
    ['Achievements', s.achievements, 'entries', '/admin/achievements', 'trophy'],
    ['Legal updates', s.updates, 'articles', '/admin/legal-updates', 'news'],
    ['Practice areas', s.areas, 'areas', '/admin/practice-areas', 'shield'],
    ['Messages', `${s.unread} unread`, `${s.messages} total`, '/admin/messages', 'inbox'],
  ];
  return (
    <div className="space-y-8">
      <div><h2 className="text-2xl">Welcome{user?.name ? `, ${user.name}` : ''}</h2><p className="text-muted">Everything you change here appears on the public website straight away.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map(([label, big, small, to, icon]) => (
          <Link key={label} to={to} className="card flex items-center gap-4 p-5 hover:border-gold">
            <span className="rounded-sm bg-paper p-3 text-gold"><Icon name={icon} className="h-6 w-6" /></span>
            <span><span className="block text-sm text-muted">{label}</span><span className="block font-serif text-2xl">{big}</span><span className="block text-xs text-muted">{small}</span></span>
          </Link>
        ))}
      </div>
      <div className="card p-5">
        <h3 className="mb-3 text-lg">Quick actions</h3>
        <div className="flex flex-wrap gap-2">
          <Link className="btn-dark btn-sm" to="/admin/cases?new=1"><Icon name="plus" className="h-4 w-4" />Add case</Link>
          <Link className="btn-dark btn-sm" to="/admin/landmark-judgments?new=1"><Icon name="plus" className="h-4 w-4" />Add judgment</Link>
          <Link className="btn-dark btn-sm" to="/admin/achievements?new=1"><Icon name="plus" className="h-4 w-4" />Add achievement</Link>
          <Link className="btn-dark btn-sm" to="/admin/legal-updates?new=1"><Icon name="plus" className="h-4 w-4" />Write article</Link>
          <Link className="btn-outline btn-sm" to="/admin/profile">Edit profile</Link>
        </div>
      </div>
      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between"><h3 className="text-lg">Recent messages</h3><Link to="/admin/messages" className="text-sm text-gold underline">View all</Link></div>
        {!s.recent.length ? <p className="text-sm text-muted">No messages yet.</p> : (
          <ul className="divide-y divide-line">
            {s.recent.map((m) => (
              <li key={m._id} className="py-3 text-sm"><span className="font-medium">{m.name}</span>{!m.read && <span className="badge ml-2 bg-gold/15 text-gold">New</span>}<span className="ml-2 text-muted">{formatDate(m.createdAt)}</span><p className="mt-1 line-clamp-1 text-muted">{m.message}</p></li>
            ))}
          </ul>
        )}
      </div>
      {s.storageMode === 'local' && (
        <p className="border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">Files are currently stored on the server’s own disk. On most hosting services this disk is erased on each deploy. Add your Cloudinary keys to the server settings so uploads are kept permanently.</p>
      )}
    </div>
  );
}
