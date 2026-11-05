import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, qs } from '../../lib/api.js';
import { useToast } from '../../context/Toast.jsx';
import { useDebounced } from '../../lib/hooks.js';
import { Empty, ErrorBox, Icon, Pagination, Spinner } from '../ui.jsx';
import { FieldRow } from './Fields.jsx';

const isEmpty = (v) => v === '' || v === undefined;

const initialValues = (fields, doc) => {
  const v = {};
  fields.forEach((f) => {
    const raw = doc?.[f.key];
    if (f.type === 'date') v[f.key] = raw ? String(raw).slice(0, 10) : '';
    else if (['tags', 'lines', 'images', 'files'].includes(f.type)) v[f.key] = Array.isArray(raw) ? raw : [];
    else if (f.type === 'checkbox') v[f.key] = raw ?? f.default ?? false;
    else if (['image', 'file', 'pdf'].includes(f.type)) v[f.key] = raw || null;
    else v[f.key] = raw ?? f.default ?? '';
  });
  return v;
};

const toPayload = (fields, values) => {
  const out = {};
  fields.forEach((f) => {
    let v = values[f.key];
    if (['tags', 'lines'].includes(f.type)) v = (v || []).map((s) => String(s).trim()).filter(Boolean);
    if (['number', 'date'].includes(f.type) && isEmpty(v)) v = null;
    if (f.type === 'number' && v !== null) v = Number(v);
    out[f.key] = v;
  });
  return out;
};

function ResourceForm({ title, endpoint, fields, doc, onDone, onCancel }) {
  const toast = useToast();
  const [values, setValues] = useState(() => initialValues(fields, doc));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    setError('');
    for (const f of fields) {
      const v = values[f.key];
      if (f.required && (isEmpty(v) || (Array.isArray(v) && !v.length))) { setError(`${f.label} is required`); window.scrollTo({ top: 0 }); return; }
    }
    setSaving(true);
    try {
      const payload = toPayload(fields, values);
      if (doc) await api.put(`/admin/${endpoint}/${doc._id}`, payload);
      else await api.post(`/admin/${endpoint}`, payload);
      toast(doc ? 'Changes saved' : 'Created successfully');
      onDone();
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0 });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl">{doc ? 'Edit' : 'Add'} {title}</h2>
        <button type="button" className="btn-outline btn-sm" onClick={onCancel}>Cancel</button>
      </div>
      {error && <p className="border border-red-300 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
      <div className="card grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
        {fields.map((f) => (
          <div key={f.key} className={f.half ? '' : 'sm:col-span-2'}>
            <FieldRow field={f} value={values[f.key]} onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))} />
          </div>
        ))}
      </div>
      <div className="sticky bottom-0 -mx-1 flex gap-3 border-t border-line bg-paper/95 px-1 py-4 backdrop-blur">
        <button className="btn-dark" disabled={saving}>{saving ? 'Saving…' : doc ? 'Save changes' : 'Create'}</button>
        <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function ResourceManager({ title, plural, endpoint, columns, fields, sorts = [], reorder = false, featureToggle = false, publicPath }) {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const dq = useDebounced(q);
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState(sorts[0]?.value || '');
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [editing, setEditing] = useState(params.get('new') ? 'new' : null);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => { if (params.get('new')) setParams({}, { replace: true }); /* eslint-disable-next-line */ }, []);
  useEffect(() => { setPage(1); }, [dq, status, sort]);

  useEffect(() => {
    let live = true;
    setState((s) => ({ ...s, loading: true }));
    api.get(`/admin/${endpoint}?${qs({ q: dq, published: status, sort, page, limit: reorder ? 100 : 10 })}`)
      .then((data) => live && setState({ data, loading: false, error: null }))
      .catch((error) => live && setState({ data: null, loading: false, error }));
    return () => { live = false; };
  }, [endpoint, dq, status, sort, page, reorder, tick]);

  const patch = async (item, body, msg) => {
    try { await api.patch(`/admin/${endpoint}/${item._id}`, body); toast(msg); reload(); } catch (e) { toast(e.message, 'error'); }
  };
  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try { await api.del(`/admin/${endpoint}/${item._id}`); toast('Deleted'); reload(); } catch (e) { toast(e.message, 'error'); }
  };
  const move = async (i, d) => {
    const items = [...state.data.items];
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    [items[i], items[j]] = [items[j], items[i]];
    setState((s) => ({ ...s, data: { ...s.data, items } }));
    try { await api.post(`/admin/${endpoint}/reorder`, { ids: items.map((x) => x._id) }); } catch (e) { toast(e.message, 'error'); reload(); }
  };

  if (editing) {
    return <ResourceForm title={title} endpoint={endpoint} fields={fields} doc={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onDone={() => { setEditing(null); reload(); }} />;
  }

  const { data, loading, error } = state;
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl">{plural}</h2>
        <button className="btn-dark" onClick={() => setEditing('new')}><Icon name="plus" className="h-4 w-4" />Add {title}</button>
      </div>

      {!reorder && (
        <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className="input pl-9" type="search" placeholder={`Search ${plural.toLowerCase()}`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
          </div>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="">All statuses</option><option value="true">Published</option><option value="false">Unpublished</option>
          </select>
          {sorts.length > 0 && <select className="input" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">{sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>}
        </div>
      )}

      {loading && !data ? <Spinner /> : error ? <ErrorBox error={error} retry={reload} /> : !data.items.length ? (
        <Empty title={q || status ? 'Nothing matches your search' : `No ${plural.toLowerCase()} yet`}>
          {q || status ? 'Try a different search or filter.' : `Select “Add ${title}” to create the first one.`}
        </Empty>
      ) : (
        <>
          <div className="overflow-x-auto border border-line bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line bg-paper text-muted">
                <tr>
                  {columns.map((c) => <th key={c.label} className="px-4 py-3 font-medium">{c.label}</th>)}
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className={loading ? 'opacity-50' : ''}>
                {data.items.map((it, i) => (
                  <tr key={it._id} className="border-b border-line last:border-0">
                    {columns.map((c, ci) => (
                      <td key={c.label} className={`px-4 py-3 ${ci === 0 ? 'max-w-xs font-medium' : 'text-muted'}`}>
                        {ci === 0 && it.featured && <Icon name="star" className="mr-1 inline h-4 w-4 text-gold" />}
                        {c.render ? c.render(it) : it[c.key] ?? '—'}
                      </td>
                    ))}
                    <td className="px-4 py-3"><span className={`badge ${it.published ? 'bg-green-100 text-green-800' : 'bg-line text-muted'}`}>{it.published ? 'Published' : 'Draft'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {reorder && <>
                          <button className="btn-outline btn-sm !px-2" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><Icon name="up" className="h-4 w-4" /></button>
                          <button className="btn-outline btn-sm !px-2" disabled={i === data.items.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><Icon name="down" className="h-4 w-4" /></button>
                        </>}
                        {featureToggle && <button className="btn-outline btn-sm !px-2" onClick={() => patch(it, { featured: !it.featured }, it.featured ? 'Removed from featured' : 'Marked as featured')} aria-label={it.featured ? 'Remove featured' : 'Mark featured'} title="Featured"><Icon name="star" className={`h-4 w-4 ${it.featured ? 'text-gold' : ''}`} /></button>}
                        <button className="btn-outline btn-sm" onClick={() => patch(it, { published: !it.published }, it.published ? 'Unpublished' : 'Published')}>{it.published ? 'Unpublish' : 'Publish'}</button>
                        {publicPath && it.published && <Link className="btn-outline btn-sm !px-2" to={`${publicPath}/${it.slug && publicPath.includes('legal') ? it.slug : it._id}`} target="_blank" aria-label="View on website"><Icon name="eye" className="h-4 w-4" /></Link>}
                        <button className="btn-outline btn-sm !px-2" onClick={() => setEditing(it)} aria-label="Edit"><Icon name="edit" className="h-4 w-4" /></button>
                        <button className="btn-outline btn-sm !px-2 hover:!bg-red-700" onClick={() => remove(it)} aria-label="Delete"><Icon name="trash" className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">{data.total} total</p>
          {!reorder && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
        </>
      )}
    </div>
  );
}
