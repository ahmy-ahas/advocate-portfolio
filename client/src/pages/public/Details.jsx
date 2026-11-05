import { Link, useParams } from 'react-router-dom';
import { useFetch, useTitle } from '../../lib/hooks.js';
import { ErrorBox, FileLink, Icon, Prose, Spinner, Tags } from '../../components/ui.jsx';
import { formatDate, isSafeUrl } from '../../lib/utils.js';

function Shell({ back, backLabel, loading, error, children }) {
  return (
    <section className="py-12 sm:py-16">
      <div className="container-x max-w-4xl">
        <Link to={back} className="mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"><Icon name="arrow" className="h-4 w-4 rotate-180" />{backLabel}</Link>
        {loading ? <Spinner /> : error ? (
          <div className="border border-line bg-white p-10 text-center">
            <h1 className="text-2xl">{error.status === 404 ? 'This page could not be found' : 'Something went wrong'}</h1>
            <p className="mt-2 text-muted">{error.status === 404 ? 'It may have been removed or is not published.' : error.message}</p>
            <Link to={back} className="btn-dark mt-6">{backLabel}</Link>
          </div>
        ) : children}
      </div>
    </section>
  );
}

const Row = ({ label, children }) => (children ? (
  <div className="grid gap-1 border-t border-line py-4 sm:grid-cols-[180px_1fr] sm:gap-6"><dt className="text-sm text-muted">{label}</dt><dd className="whitespace-pre-line">{children}</dd></div>
) : null);

const Block = ({ title, text }) => (text ? (
  <section className="mt-10"><h2 className="mb-3 text-2xl">{title}</h2><Prose text={text} className="text-muted" /></section>
) : null);

export function CaseDetail() {
  const { id } = useParams();
  const { data: c, loading, error } = useFetch(`/cases/${id}`);
  useTitle(c?.title);
  return (
    <Shell back="/cases" backLabel="All cases" loading={loading} error={error}>
      {c && (
        <article>
          <p className="mb-3 text-sm text-muted">{[c.court, c.caseType, c.year].filter(Boolean).join(' · ')}</p>
          <h1 className="text-4xl leading-tight sm:text-5xl">{c.title}</h1>
          <dl className="mt-8 border-b border-line">
            <Row label="Case number">{c.caseNumber}</Row><Row label="Court">{c.court}</Row><Row label="Case type">{c.caseType}</Row>
            <Row label="Year">{c.year}</Row><Row label="Date">{formatDate(c.date)}</Row><Row label="Parties">{c.parties}</Row>
            <Row label="Status">{c.status}</Row><Row label="Advocate’s role">{c.advocateRole}</Row><Row label="Outcome">{c.outcome}</Row>
          </dl>
          <Block title="Case description" text={c.description} />
          <Block title="Judgment summary" text={c.judgmentSummary} />
          {c.images?.length > 0 && (
            <section className="mt-10"><h2 className="mb-4 text-2xl">Images</h2>
              <div className="grid gap-4 sm:grid-cols-2">{c.images.map((im, i) => (
                <a key={i} href={isSafeUrl(im.url) ? im.url : '#'} target="_blank" rel="noopener noreferrer"><img src={im.url} alt={im.name || c.title} loading="lazy" className="aspect-[4/3] w-full border border-line object-cover" /></a>
              ))}</div>
            </section>
          )}
          {c.documents?.length > 0 && (
            <section className="mt-10"><h2 className="mb-4 text-2xl">Documents</h2><div className="space-y-2">{c.documents.map((d, i) => <FileLink key={i} file={d} />)}</div></section>
          )}
          {c.tags?.length > 0 && <div className="mt-10"><Tags tags={c.tags} /></div>}
        </article>
      )}
    </Shell>
  );
}

export function JudgmentDetail() {
  const { id } = useParams();
  const { data: j, loading, error } = useFetch(`/landmark-judgments/${id}`);
  useTitle(j?.title);
  return (
    <Shell back="/landmark-judgments" backLabel="All judgments" loading={loading} error={error}>
      {j && (
        <article>
          <p className="mb-3 text-sm text-muted">{[j.court, j.year, j.category].filter(Boolean).join(' | ')}</p>
          <h1 className="text-4xl leading-tight sm:text-5xl">{j.title}</h1>
          {j.pdf?.url && <a href={isSafeUrl(j.pdf.url) ? j.pdf.url : '#'} target="_blank" rel="noopener noreferrer" className="btn-gold mt-6"><Icon name="document" className="h-4 w-4" />View Judgment PDF</a>}
          <dl className="mt-8 border-b border-line">
            <Row label="Case number">{j.caseNumber}</Row><Row label="Court">{j.court}</Row><Row label="Date">{formatDate(j.date)}</Row>
            <Row label="Year">{j.year}</Row><Row label="Legal category">{j.category}</Row><Row label="Parties">{j.parties}</Row><Row label="Advocate’s role">{j.advocateRole}</Row>
          </dl>
          {j.importantPoint && <aside className="mt-10 border-l-4 border-gold bg-white p-6"><h2 className="mb-2 text-xl">Important legal point</h2><Prose text={j.importantPoint} className="text-muted" /></aside>}
          <Block title="Judgment summary" text={j.summary} />
          {j.relatedDocuments?.length > 0 && (
            <section className="mt-10"><h2 className="mb-4 text-2xl">Related documents</h2><div className="space-y-2">{j.relatedDocuments.map((d, i) => <FileLink key={i} file={d} />)}</div></section>
          )}
          {j.tags?.length > 0 && <div className="mt-10"><Tags tags={j.tags} /></div>}
        </article>
      )}
    </Shell>
  );
}

export function UpdateDetail() {
  const { slug } = useParams();
  const { data: u, loading, error } = useFetch(`/legal-updates/${slug}`);
  useTitle(u?.title);
  return (
    <Shell back="/legal-updates" backLabel="All legal updates" loading={loading} error={error}>
      {u && (
        <article>
          <p className="mb-3 text-sm text-muted">{[u.category, formatDate(u.publishedAt)].filter(Boolean).join(' · ')}</p>
          <h1 className="text-4xl leading-tight sm:text-5xl">{u.title}</h1>
          {u.featuredImage?.url && <img src={u.featuredImage.url} alt="" className="mt-8 aspect-[16/9] w-full object-cover" />}
          <Prose text={u.content} className="mt-8 text-lg text-ink/85" />
          {u.tags?.length > 0 && <div className="mt-10"><Tags tags={u.tags} /></div>}
        </article>
      )}
    </Shell>
  );
}
