import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Empty, ErrorBox, Icon, PageHero, Pagination, Spinner } from '../ui.jsx';
import { useDebounced, useFetch, useTitle } from '../../lib/hooks.js';
import { qs } from '../../lib/api.js';

// Shared list page: search, filters, sorting and pagination, all kept in the URL
export default function BrowsePage({ title, intro, endpoint, filters = [], sorts = [], Card, emptyTitle, emptyText, limit = 9 }) {
  useTitle(title);
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const page = parseInt(params.get('page')) || 1;
  const sort = params.get('sort') || '';
  const [input, setInput] = useState(q);
  const debounced = useDebounced(input);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };
  useEffect(() => { if (debounced !== q) update({ q: debounced, page: '' }); /* eslint-disable-next-line */ }, [debounced]);

  const meta = useFetch(filters.length ? `${endpoint}/meta` : null);
  const query = qs({ q, page, limit, sort, ...Object.fromEntries(filters.map((f) => [f.key, params.get(f.key) || ''])) });
  const { data, loading, error } = useFetch(`${endpoint}?${query}`);
  const active = q || filters.some((f) => params.get(f.key));

  return (
    <>
      <PageHero title={title} intro={intro} />
      <section className="py-12 sm:py-16">
        <div className="container-x">
          <form className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)]" role="search" onSubmit={(e) => e.preventDefault()}>
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input className="input pl-9" type="search" placeholder={`Search ${title.toLowerCase()}`} value={input} onChange={(e) => setInput(e.target.value)} aria-label="Search" />
            </div>
            {filters.map((f) => (
              <select key={f.key} className="input" aria-label={f.label} value={params.get(f.key) || ''} onChange={(e) => update({ [f.key]: e.target.value, page: '' })}>
                <option value="">{f.label}</option>
                {(meta.data?.[f.metaKey || f.key] || []).map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            ))}
            {sorts.length > 0 && (
              <select className="input" aria-label="Sort" value={sort} onChange={(e) => update({ sort: e.target.value, page: '' })}>
                {sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            )}
          </form>

          {loading ? <Spinner /> : error ? <ErrorBox error={error} /> : data.items.length === 0 ? (
            active ? (
              <Empty title="No results found">Try a different search or clear the filters.
                <button className="mt-4 block w-full text-gold underline" onClick={() => { setInput(''); setParams({}, { replace: true }); }}>Clear search and filters</button>
              </Empty>
            ) : <Empty title={emptyTitle}>{emptyText}</Empty>
          ) : (
            <>
              <p className="mb-5 text-sm text-muted">{data.total} {data.total === 1 ? 'result' : 'results'}</p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{data.items.map((it) => <Card key={it._id} item={it} />)}</div>
              <Pagination page={data.page} pages={data.pages} onChange={(p) => { update({ page: p > 1 ? String(p) : '' }); window.scrollTo({ top: 0 }); }} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
