import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const Ctx = createContext({ profile: null, loading: true, error: null, reload: () => {} });
export const useSite = () => useContext(Ctx);

export function SiteProvider({ children }) {
  const [state, setState] = useState({ profile: null, loading: true, error: null });
  const reload = useCallback(() => {
    api.get('/profile')
      .then((profile) => setState({ profile, loading: false, error: null }))
      .catch((error) => setState({ profile: null, loading: false, error }));
  }, []);
  useEffect(reload, [reload]);
  return <Ctx.Provider value={{ ...state, reload }}>{children}</Ctx.Provider>;
}
