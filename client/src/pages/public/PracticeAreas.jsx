import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useFetch, useTitle } from '../../lib/hooks.js';
import { Empty, ErrorBox, Icon, PageHero, Spinner } from '../../components/ui.jsx';
import { useSite } from '../../context/Site.jsx';
import { ContactCTA } from './Home.jsx';

export default function PracticeAreas() {
  useTitle('Practice Areas');
  const { profile } = useSite();
  const { data, loading, error } = useFetch('/practice-areas');
  const { hash } = useLocation();
  useEffect(() => { if (hash && data) document.getElementById(hash.slice(1))?.scrollIntoView(); }, [hash, data]);
  return (
    <>
      <PageHero title="Practice Areas" intro="Legal representation across criminal, family and civil matters." />
      <section className="py-14 sm:py-20">
        <div className="container-x space-y-6">
          {loading ? <Spinner /> : error ? <ErrorBox error={error} /> : !data.items.length ? <Empty title="Practice areas coming soon" /> : data.items.map((a) => (
            <article key={a._id} id={a.slug} className="scroll-mt-28 grid gap-6 border border-line bg-white p-7 sm:p-10 md:grid-cols-[auto_1fr_1fr] md:gap-10">
              <Icon name={a.icon} className="h-10 w-10 text-gold" />
              <div>
                <h2 className="text-3xl">{a.title}</h2>
                {a.description && <p className="mt-3 text-muted">{a.description}</p>}
              </div>
              {a.items?.length > 0 && (
                <ul className="self-center border-b border-line">{a.items.map((it) => <li key={it} className="border-t border-line py-3 text-[0.97rem]">{it}</li>)}</ul>
              )}
            </article>
          ))}
        </div>
      </section>
      <ContactCTA profile={profile} />
    </>
  );
}
