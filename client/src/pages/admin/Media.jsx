import { useCallback, useEffect, useRef, useState } from 'react';
import { api, qs } from '../../lib/api.js';
import { useToast } from '../../context/Toast.jsx';
import { Empty, ErrorBox, Icon, Pagination, Spinner } from '../../components/ui.jsx';

export default function Media() {
  const toast = useToast();
  const ref = useRef();
  const [kind, setKind] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => { setPage(1); }, [kind]);
  useEffect(() => {
    let live = true;
    api.get(`/admin/media?${qs({ kind, page, limit: 24 })}`)
      .then((data) => live && setState({ data, loading: false, error: null }))
      .catch((error) => live && setState({ data: null, loading: false, error }));
    return () => { live = false; };
  }, [kind, page, tick]);

  const upload = async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    setBusy(true);
    for (const f of files) { try { await api.upload(f); } catch (err) { toast(`${f.name}: ${err.message}`, 'error'); } }
    setBusy(false);
    reload();
  };
  const del = async (m) => {
    if (!window.confirm(`Delete "${m.name}"? If it is used on a page, it will stop displaying there.`)) return;
    try { await api.del(`/admin/media/${m._id}`); toast('File deleted'); reload(); } catch (e) { toast(e.message, 'error'); }
  };
  const copy = async (m) => { try { await navigator.clipboard.writeText(m.url); toast('Link copied'); } catch { toast(m.url); } };

  const { data, loading, error } = state;
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl">Media</h2>
        <div className="flex gap-2">
          <select className="input !w-auto" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Filter"><option value="">All files</option><option value="image">Images</option><option value="document">Documents</option></select>
          <input ref={ref} type="file" multiple hidden accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx" onChange={upload} />
          <button className="btn-dark" disabled={busy} onClick={() => ref.current.click()}><Icon name="upload" className="h-4 w-4" />{busy ? 'Uploading…' : 'Upload files'}</button>
        </div>
      </div>
      {loading && !data ? <Spinner /> : error ? <ErrorBox error={error} retry={reload} /> : !data.items.length ? <Empty title="No files yet">Files you upload to cases, judgments and articles appear here.</Empty> : (
        <>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {data.items.map((m) => (
              <li key={m._id} className="card p-2">
                {m.kind === 'image' ? <img src={m.url} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center bg-paper"><Icon name="document" className="h-10 w-10 text-gold" /></div>}
                <p className="mt-2 truncate px-1 text-sm" title={m.name}>{m.name}</p>
                <p className="px-1 text-xs text-muted">{(m.size / 1024 / 1024).toFixed(2)} MB</p>
                <div className="mt-2 flex gap-1">
                  <button className="btn-outline btn-sm flex-1" onClick={() => copy(m)}>Copy link</button>
                  <a className="btn-outline btn-sm !px-2" href={m.url} target="_blank" rel="noopener noreferrer" aria-label="Open"><Icon name="external" className="h-4 w-4" /></a>
                  <button className="btn-outline btn-sm !px-2 hover:!bg-red-700" onClick={() => del(m)} aria-label="Delete"><Icon name="trash" className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
