import { Link } from 'react-router-dom';
import { formatDate, truncate } from '../../lib/utils.js';
import { Icon, TextLink } from '../ui.jsx';

export function CaseCard({ item }) {
  return (
    <article className="card flex flex-col p-6 transition-colors hover:border-gold">
      <p className="mb-3 flex flex-wrap items-center gap-x-2 text-[0.82rem] text-muted">
        <span>{item.court}</span><span aria-hidden>·</span><span>{item.caseType}</span><span aria-hidden>·</span><span>{item.year}</span>
        {item.featured && <span className="badge ml-auto bg-gold/15 text-gold">Featured</span>}
      </p>
      <h3 className="text-xl leading-snug"><Link to={`/cases/${item._id}`} className="hover:text-gold">{item.title}</Link></h3>
      {item.description && <p className="mt-3 flex-1 text-[0.95rem] text-muted">{truncate(item.description, 170)}</p>}
      <div className="mt-5"><TextLink to={`/cases/${item._id}`}>View Case <Icon name="arrow" className="h-3.5 w-3.5" /></TextLink></div>
    </article>
  );
}

export function JudgmentCard({ item }) {
  return (
    <article className="card flex flex-col p-6 transition-colors hover:border-gold">
      <p className="mb-3 flex flex-wrap items-center gap-x-2 text-[0.82rem] text-muted">
        <span className="badge bg-charcoal text-white">Landmark Judgment</span>
        <span>{item.court}</span><span aria-hidden>|</span><span>{item.year}</span>
      </p>
      <h3 className="text-xl leading-snug"><Link to={`/landmark-judgments/${item._id}`} className="hover:text-gold">{item.title}</Link></h3>
      {item.category && <p className="mt-1 text-sm text-muted">{item.category}</p>}
      {item.summary && <p className="mt-3 flex-1 text-[0.95rem] text-muted">{truncate(item.summary, 170)}</p>}
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
        <TextLink to={`/landmark-judgments/${item._id}`}>Read More <Icon name="arrow" className="h-3.5 w-3.5" /></TextLink>
        {item.pdf?.url && <TextLink href={item.pdf.url}>View Judgment PDF <Icon name="external" className="h-3.5 w-3.5" /></TextLink>}
      </div>
    </article>
  );
}

export function AchievementCard({ item }) {
  return (
    <article className="card flex flex-col overflow-hidden">
      {item.image?.url && <img src={item.image.url} alt={item.title} loading="lazy" className="aspect-[16/10] w-full object-cover" />}
      <div className="flex flex-1 flex-col p-6">
        <p className="mb-2 flex items-center gap-2 text-[0.82rem] text-muted">
          {item.year && <span>{item.year}</span>}{item.year && item.category && <span aria-hidden>·</span>}{item.category && <span>{item.category}</span>}
        </p>
        <h3 className="text-xl leading-snug">{item.title}</h3>
        {item.description && <p className="mt-3 flex-1 whitespace-pre-line text-[0.95rem] text-muted">{item.description}</p>}
        {item.certificate?.url && <div className="mt-4"><TextLink href={item.certificate.url}>View certificate <Icon name="external" className="h-3.5 w-3.5" /></TextLink></div>}
      </div>
    </article>
  );
}

export function UpdateCard({ item }) {
  return (
    <article className="card flex flex-col overflow-hidden transition-colors hover:border-gold">
      {item.featuredImage?.url && <img src={item.featuredImage.url} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />}
      <div className="flex flex-1 flex-col p-6">
        <p className="mb-2 flex items-center gap-2 text-[0.82rem] text-muted">
          {item.category && <span>{item.category}</span>}{item.category && item.publishedAt && <span aria-hidden>·</span>}
          {item.publishedAt && <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>}
        </p>
        <h3 className="text-xl leading-snug"><Link to={`/legal-updates/${item.slug || item._id}`} className="hover:text-gold">{item.title}</Link></h3>
        {item.excerpt && <p className="mt-3 flex-1 text-[0.95rem] text-muted">{truncate(item.excerpt, 180)}</p>}
        <div className="mt-5"><TextLink to={`/legal-updates/${item.slug || item._id}`}>Read article <Icon name="arrow" className="h-3.5 w-3.5" /></TextLink></div>
      </div>
    </article>
  );
}
