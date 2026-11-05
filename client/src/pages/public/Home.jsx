import { Link } from 'react-router-dom';
import { useSite } from '../../context/Site.jsx';
import { useFetch, useTitle } from '../../lib/hooks.js';
import { AchievementCard, CaseCard, JudgmentCard } from '../../components/public/Cards.jsx';
import { Empty, Icon, Prose, SectionHead, Spinner, TextLink } from '../../components/ui.jsx';
import { telLink, waLink } from '../../lib/utils.js';

function Hero({ profile }) {
  return (
    <header className="bg-charcoal text-white" style={{ isolation: 'isolate' }}>
      <div className="container-x grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
        <div>
          <p className="mb-4 text-[0.95rem] text-gold-light">Sahiwal, Punjab, Pakistan</p>
          <h1 className="text-5xl leading-[1.05] sm:text-6xl">{profile.name}</h1>
          <div className="my-6 h-0.5 w-14 bg-gold" />
          {profile.headline && <p className="font-serif text-xl text-white/90 sm:text-2xl">{profile.headline}</p>}
          {profile.tagline && <p className="mt-4 max-w-xl text-lg text-white/70">{profile.tagline}</p>}
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/practice-areas" className="btn-gold">View Practice Areas</Link>
            <Link to="/contact" className="btn-light">Contact Advocate</Link>
            <Link to="/cases" className="btn-light hidden sm:inline-flex">View Important Cases</Link>
          </div>
        </div>
        {profile.profilePhoto?.url && (
          <div className="relative w-full max-w-[380px] justify-self-start lg:justify-self-end">
            <img src={profile.profilePhoto.url} alt={`${profile.name}, ${profile.title}`} className="aspect-[4/5] w-full object-cover" style={{ objectPosition: '30% 18%' }} />
            <div className="pointer-events-none absolute -z-10 border border-gold" style={{ inset: '14px -14px -14px 14px' }} />
          </div>
        )}
      </div>
      {profile.stats?.length > 0 && (
        <div className="border-t border-white/10 bg-ink">
          <dl className="container-x grid grid-cols-2 lg:grid-cols-4">
            {profile.stats.map((s, i) => (
              <div key={i} className="border-white/10 py-7 pr-4 odd:border-r lg:border-r lg:pl-6 lg:first:pl-0 lg:last:border-r-0">
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-serif text-3xl text-white">{s.value}</dd>
                <dd className="mt-1 text-sm text-white/60">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </header>
  );
}

function AboutPreview({ profile }) {
  const paras = (profile.biography || '').split(/\n{2,}/).filter(Boolean).slice(0, 2).join('\n\n');
  if (!paras) return null;
  return (
    <section className="py-16 sm:py-24">
      <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <h2 className="text-3xl sm:text-4xl">About {profile.name}</h2>
        <div>
          <Prose text={paras} className="text-lg text-muted" />
          <div className="mt-6"><Link to="/about" className="btn-outline">Read More</Link></div>
        </div>
      </div>
    </section>
  );
}

function PracticeAreas() {
  const { data, loading } = useFetch('/practice-areas');
  return (
    <section className="border-y border-line bg-white py-16 sm:py-24">
      <div className="container-x">
        <SectionHead title="Practice Areas" intro="Representation across criminal, family and civil matters." />
        {loading ? <Spinner /> : !data?.items.length ? <Empty title="Practice areas coming soon" /> : (
          <div className="grid gap-6 lg:grid-cols-3">
            {data.items.map((a) => (
              <article key={a._id} className="flex flex-col border border-line bg-paper p-7">
                <Icon name={a.icon} className="h-8 w-8 text-gold" />
                <h3 className="mt-5 text-2xl">{a.title}</h3>
                {a.description && <p className="mt-3 text-[0.95rem] text-muted">{a.description}</p>}
                {a.items?.length > 0 && (
                  <ul className="mt-5 flex-1 space-y-2 border-t border-line pt-4 text-[0.93rem]">
                    {a.items.map((it) => <li key={it} className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{it}</li>)}
                  </ul>
                )}
                <div className="mt-6"><TextLink to={`/practice-areas#${a.slug}`}>Learn More <Icon name="arrow" className="h-3.5 w-3.5" /></TextLink></div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CriminalSection({ profile }) {
  const c = profile.criminalSection;
  if (!c?.heading) return null;
  return (
    <section className="py-16 sm:py-24">
      <div className="container-x">
        <div className="grid gap-10 border border-line bg-white p-7 sm:p-12 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="text-3xl sm:text-4xl">{c.heading}</h2>
            <div className="my-5 h-0.5 w-14 bg-gold" />
            {c.text && <p className="text-lg text-muted">{c.text}</p>}
          </div>
          {c.items?.length > 0 && (
            <ul className="self-center border-b border-line">
              {c.items.map((it) => <li key={it} className="border-t border-line py-3.5 font-serif text-lg">{it}</li>)}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function Cases() {
  const { data, loading } = useFetch('/cases?limit=6&sort=featured');
  return (
    <section className="border-t border-line bg-white py-16 sm:py-24">
      <div className="container-x">
        <SectionHead title="Important Cases" intro="Selected matters handled by the advocate.">
          <Link to="/cases" className="btn-outline">View All Cases</Link>
        </SectionHead>
        {loading ? <Spinner /> : !data?.items.length ? <Empty title="Cases will appear here">Important cases are published by the advocate and shown here once added.</Empty> : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{data.items.map((c) => <CaseCard key={c._id} item={c} />)}</div>
        )}
      </div>
    </section>
  );
}

function Judgments() {
  const { data, loading } = useFetch('/landmark-judgments?limit=3');
  return (
    <section className="py-16 sm:py-24">
      <div className="container-x">
        <SectionHead title="Landmark Judgments" intro="Significant judgments, with summaries and the original documents.">
          <Link to="/landmark-judgments" className="btn-outline">View All Judgments</Link>
        </SectionHead>
        {loading ? <Spinner /> : !data?.items.length ? <Empty title="Judgments will appear here">Landmark judgments are published by the advocate and shown here once added.</Empty> : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{data.items.map((j) => <JudgmentCard key={j._id} item={j} />)}</div>
        )}
      </div>
    </section>
  );
}

export function Memberships({ profile, light = false }) {
  if (!profile.memberships?.length) return null;
  return (
    <section className={light ? 'py-16 sm:py-20' : 'bg-charcoal py-16 text-white sm:py-24'}>
      <div className="container-x">
        <SectionHead light={!light} title="Professional Memberships & Affiliations" />
        <ul className={`grid gap-px sm:grid-cols-2 lg:grid-cols-4 ${light ? 'border border-line bg-line' : 'bg-white/15'}`}>
          {profile.memberships.map((m, i) => (
            <li key={i} className={`p-7 ${light ? 'bg-white' : 'bg-charcoal'}`}>
              <h3 className="text-lg leading-snug">{m.organization}</h3>
              {m.type && <p className={`mt-2 text-sm ${light ? 'text-muted' : 'text-white/60'}`}>{m.type}</p>}
              {m.description && <p className={`mt-3 text-sm ${light ? 'text-muted' : 'text-white/60'}`}>{m.description}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ContactCTA({ profile }) {
  const wa = waLink(profile.whatsapp || profile.phone);
  return (
    <section className="bg-gold py-14 text-charcoal">
      <div className="container-x flex flex-wrap items-center justify-between gap-8">
        <div>
          <h2 className="text-3xl">{profile.ctaHeading || 'Need Legal Assistance?'}</h2>
          <p className="mt-2 text-charcoal/80">{profile.ctaText || 'Contact the office to discuss your legal matter.'}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {profile.phone && <a href={telLink(profile.phone)} className="btn-dark"><Icon name="phone" className="h-4 w-4" />Call Now</a>}
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn border border-charcoal"><Icon name="whatsapp" className="h-4 w-4" />WhatsApp</a>}
          {profile.email && <a href={`mailto:${profile.email}`} className="btn border border-charcoal"><Icon name="mail" className="h-4 w-4" />Send Email</a>}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { profile } = useSite();
  useTitle('');
  return (
    <>
      <Hero profile={profile} />
      <AboutPreview profile={profile} />
      <PracticeAreas />
      <CriminalSection profile={profile} />
      <Cases />
      <Judgments />
      <Memberships profile={profile} />
      <ContactCTA profile={profile} />
    </>
  );
}
