import { useState } from 'react';
import { useSite } from '../../context/Site.jsx';
import { useTitle } from '../../lib/hooks.js';
import { api } from '../../lib/api.js';
import { Icon, PageHero } from '../../components/ui.jsx';
import { telLink, waLink } from '../../lib/utils.js';

const blank = { name: '', email: '', phone: '', subject: '', message: '', website: '' };

export default function Contact() {
  const { profile } = useSite();
  useTitle('Contact');
  const [form, setForm] = useState(blank);
  const [state, setState] = useState({ sending: false, done: false, error: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const wa = waLink(profile.whatsapp || profile.phone);
  const chamber = profile.chamberNumber ? `Chamber No. ${profile.chamberNumber}${profile.chamberLocation ? `, ${profile.chamberLocation}` : ''}` : profile.chamberLocation;
  const mapQuery = chamber || profile.officeAddress || 'Sahiwal Courts, Sahiwal, Pakistan';
  const mapSrc = profile.mapEmbedUrl || `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

  const submit = async (e) => {
    e.preventDefault();
    setState({ sending: true, done: false, error: '' });
    try {
      await api.post('/messages', form);
      setForm(blank);
      setState({ sending: false, done: true, error: '' });
    } catch (err) {
      setState({ sending: false, done: false, error: err.message });
    }
  };

  return (
    <>
      <PageHero title="Contact" intro="Contact the office to discuss your legal matter." />
      <section className="py-14 sm:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <div className="flex flex-wrap gap-3">
              {profile.phone && <a href={telLink(profile.phone)} className="btn-dark"><Icon name="phone" className="h-4 w-4" />Call</a>}
              {profile.email && <a href={`mailto:${profile.email}`} className="btn-outline"><Icon name="mail" className="h-4 w-4" />Email</a>}
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-outline"><Icon name="whatsapp" className="h-4 w-4" />WhatsApp</a>}
            </div>
            <dl className="mt-10 space-y-6">
              {profile.phone && <div><dt className="text-sm text-muted">Phone</dt><dd className="text-lg"><a href={telLink(profile.phone)}>{profile.phone}</a></dd></div>}
              {profile.email && <div><dt className="text-sm text-muted">Email</dt><dd className="break-all text-lg"><a href={`mailto:${profile.email}`}>{profile.email}</a></dd></div>}
              {chamber && <div><dt className="text-sm text-muted">Chamber</dt><dd className="text-lg">{chamber}</dd></div>}
              {profile.officeAddress && <div><dt className="text-sm text-muted">Office address</dt><dd className="text-lg">{profile.officeAddress}</dd></div>}
            </dl>
            {profile.social?.some((s) => s.url) && (
              <ul className="mt-8 flex flex-wrap gap-4 text-sm">{profile.social.filter((s) => s.url).map((s) => <li key={s.url}><a className="border-b border-gold" href={s.url} target="_blank" rel="noopener noreferrer">{s.platform || 'Link'}</a></li>)}</ul>
            )}
          </div>

          <form onSubmit={submit} className="card space-y-5 p-6 sm:p-9" noValidate>
            <h2 className="text-2xl">Send a message</h2>
            {state.done && <p className="border border-green-300 bg-green-50 p-4 text-sm text-green-800" role="status">Thank you. Your message has been sent and the office will contact you.</p>}
            {state.error && <p className="border border-red-300 bg-red-50 p-4 text-sm text-red-800" role="alert">{state.error}</p>}
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label className="label" htmlFor="c-name">Name *</label><input id="c-name" className="input" required maxLength={100} value={form.name} onChange={set('name')} autoComplete="name" /></div>
              <div><label className="label" htmlFor="c-phone">Phone</label><input id="c-phone" type="tel" className="input" maxLength={40} value={form.phone} onChange={set('phone')} autoComplete="tel" /></div>
            </div>
            <div><label className="label" htmlFor="c-email">Email</label><input id="c-email" type="email" className="input" maxLength={200} value={form.email} onChange={set('email')} autoComplete="email" /><p className="help">Provide a phone number or email so the office can reply.</p></div>
            <div><label className="label" htmlFor="c-subject">Subject</label><input id="c-subject" className="input" maxLength={150} value={form.subject} onChange={set('subject')} /></div>
            <div><label className="label" htmlFor="c-message">Message *</label><textarea id="c-message" className="input min-h-36" required minLength={10} maxLength={3000} value={form.message} onChange={set('message')} /></div>
            <div aria-hidden="true" className="absolute -left-[9999px]"><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} /></label></div>
            <button className="btn-dark w-full sm:w-auto" disabled={state.sending}>{state.sending ? 'Sending…' : 'Send message'}</button>
            <p className="help">Please do not send confidential documents through this form. Sending a message does not create a lawyer–client relationship.</p>
          </form>
        </div>
      </section>

      <section className="border-t border-line bg-white py-12">
        <div className="container-x">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl">Location</h2>
            <a className="btn-outline btn-sm" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noopener noreferrer"><Icon name="map" className="h-4 w-4" />Open in Google Maps</a>
          </div>
          <iframe title="Office location map" src={mapSrc} className="h-80 w-full border border-line sm:h-96" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </section>
    </>
  );
}
