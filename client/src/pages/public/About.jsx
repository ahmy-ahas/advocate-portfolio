import { useSite } from '../../context/Site.jsx';
import { useTitle } from '../../lib/hooks.js';
import { PageHero, Prose, SectionHead } from '../../components/ui.jsx';
import { ContactCTA, Memberships } from './Home.jsx';

export default function About() {
  const { profile } = useSite();
  useTitle('About');
  return (
    <>
      <PageHero title={`About ${profile.name}`} intro={profile.headline} />
      <section className="py-14 sm:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
          <div>
            <Prose text={profile.biography} className="text-lg text-muted" />
            {profile.experienceHistory && (
              <div className="mt-12">
                <h2 className="mb-4 text-2xl">Professional Experience</h2>
                <Prose text={profile.experienceHistory} className="text-muted" />
              </div>
            )}
          </div>
          <aside className="space-y-8">
            {profile.profilePhoto?.url && <img src={profile.profilePhoto.url} alt={profile.name} className="aspect-[4/5] w-full max-w-sm object-cover" style={{ objectPosition: '30% 18%' }} />}
            {profile.stats?.length > 0 && (
              <dl className="grid grid-cols-2 gap-px border border-line bg-line">
                {profile.stats.map((s, i) => (
                  <div key={i} className="bg-white p-5"><dd className="font-serif text-2xl">{s.value}</dd><dd className="text-sm text-muted">{s.label}</dd></div>
                ))}
              </dl>
            )}
          </aside>
        </div>
      </section>

      {profile.education?.length > 0 && (
        <section className="border-y border-line bg-white py-14 sm:py-20">
          <div className="container-x">
            <SectionHead title="Education" />
            <ol className="ml-1.5 max-w-2xl border-l-2 border-line pl-8">
              {profile.education.map((e, i) => (
                <li key={i} className="relative pb-9 last:pb-0">
                  <span className="absolute -left-[39px] top-2 h-2.5 w-2.5 rounded-full bg-gold" />
                  <h3 className="text-xl">{e.qualification}</h3>
                  {e.subtitle && <p className="text-muted">{e.subtitle}</p>}
                  {(e.institution || e.year) && <p className="text-sm text-muted">{[e.institution, e.year].filter(Boolean).join(' · ')}</p>}
                  {e.description && <p className="mt-2 text-[0.95rem] text-muted">{e.description}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <Memberships profile={profile} />
      <ContactCTA profile={profile} />
    </>
  );
}
