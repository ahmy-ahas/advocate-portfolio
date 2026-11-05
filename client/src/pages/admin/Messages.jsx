import { useCallback, useEffect, useState } from 'react';
import { api, qs } from '../../lib/api.js';
import { useToast } from '../../context/Toast.jsx';
import { Empty, ErrorBox, Icon, Pagination, Spinner } from '../../components/ui.jsx';
import { formatDate } from '../../lib/utils.js';

export default function Messages() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [unread, setUnread] = useState(false);
  const [open, setOpen] = useState(null);
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => { setPage(1); }, [unread]);
  useEffect(() => {
    let live = true;
    api.get(`/admin/messages?${qs({ page, unread: unread ? 'true' : '' })}`)
      .then((data) => live && setState({ data, loading: false, error: null }))
      .catch((error) => live && setState({ data: null, loading: false, error }));
    return () => { live = false; };
  }, [page, unread, tick]);

  const setRead = async (m, read) => { try { await api.patch(`/admin/messages/${m._id}`, { read }); reload(); window.dispatchEvent(new Event('messages:changed')); } catch (e) { toast(e.message, 'error'); } };
  const toggle = (m) => { setOpen(open === m._id ? null : m._id); if (!m.read) setRead(m, true); };
  const del = async (m) => {
    if (!window.confirm('Delete this message?')) return;
    try { await api.del(`/admin/messages/${m._id}`); toast('Message deleted'); reload(); window.dispatchEvent(new Event('messages:changed')); } catch (e) { toast(e.message, 'error'); }
  };

  const { data, loading, error } = state;
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl">Messages</h2>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[#9C7A3C]" checked={unread} onChange={(e) => setUnread(e.target.checked)} />Unread only</label>
      </div>
      {loading && !data ? <Spinner /> : error ? <ErrorBox error={error} retry={reload} /> : !data.items.length ? <Empty title={unread ? 'No unread messages' : 'No messages yet'}>Messages sent from the website contact form appear here.</Empty> : (
        <>
          <ul className="space-y-3">
            {data.items.map((m) => (
              <li key={m._id} className={`card ${m.read ? '' : 'border-l-4 border-l-gold'}`}>
                <button className="flex w-full items-start justify-between gap-4 p-4 text-left" onClick={() => toggle(m)} aria-expanded={open === m._id}>
                  <span className="min-w-0">
                    <span className="block font-medium">{m.name}{!m.read && <span className="badge ml-2 bg-gold/15 text-gold">New</span>}</span>
                    <span className="block truncate text-sm text-muted">{m.subject || m.message}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">{formatDate(m.createdAt)}</span>
                </button>
                {open === m._id && (
                  <div className="border-t border-line p-4 text-sm">
                    {m.subject && <p className="mb-2 font-medium">{m.subject}</p>}
                    <p className="whitespace-pre-line">{m.message}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {m.phone && <a className="btn-outline btn-sm" href={`tel:${m.phone}`}><Icon name="phone" className="h-4 w-4" />{m.phone}</a>}
                      {m.email && <a className="btn-outline btn-sm" href={`mailto:${m.email}`}><Icon name="mail" className="h-4 w-4" />{m.email}</a>}
                      <button className="btn-outline btn-sm" onClick={() => setRead(m, false)}>Mark as unread</button>
                      <button className="btn-outline btn-sm hover:!bg-red-700" onClick={() => del(m)}><Icon name="trash" className="h-4 w-4" />Delete</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
