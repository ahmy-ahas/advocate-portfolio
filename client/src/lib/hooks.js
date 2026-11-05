import { useEffect, useState } from 'react';
import { api } from './api.js';
import { useSite } from '../context/Site.jsx';

export function useFetch(path, deps = []) {
  const [state, setState] = useState({ data: null, loading: !!path, error: null });
  useEffect(() => {
    if (!path) { setState({ data: null, loading: false, error: null }); return undefined; }
    const ac = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    api.get(path, { signal: ac.signal })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => { if (error.name !== 'AbortError') setState({ data: null, loading: false, error }); });
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);
  return state;
}

export function useTitle(title) {
  const { profile } = useSite();
  const site = profile?.name ? `${profile.name}, ${profile.title || 'Advocate'}` : 'Advocate';
  useEffect(() => { document.title = title ? `${title} | ${site}` : site; }, [title, site]);
}

export function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}
