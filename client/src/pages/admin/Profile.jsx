import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/Toast.jsx';
import { useSite } from '../../context/Site.jsx';
import { ErrorBox, Spinner } from '../../components/ui.jsx';
import { FieldRow, Repeater, TagsInput, Field } from '../../components/admin/Fields.jsx';

const T = (key, label, extra = {}) => ({ key, label, ...extra });
const Section = ({ title, children, hint }) => (
  <section className="card p-5 sm:p-7">
    <h3 className="text-xl">{title}</h3>
    {hint && <p className="help mb-4">{hint}</p>}
    <div className={`${hint ? '' : 'mt-4'} space-y-5`}>{children}</div>
  </section>
);

export default function ProfileEditor() {
  const toast = useToast();
  const { reload } = useSite();
  const [p, setP] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get('/admin/profile').then(setP).catch(setError); }, []);
  if (error) return <ErrorBox error={error} />;
  if (!p) return <Spinner />;

  const set = (k) => (v) => setP((s) => ({ ...s, [k]: v }));
  const f = (key, label, extra) => <FieldRow field={T(key, label, extra)} value={p[key]} onChange={set(key)} />;
  const crim = p.criminalSection || {};
  const setCrim = (k) => (v) => setP((s) => ({ ...s, criminalSection: { ...(s.criminalSection || {}), [k]: v } }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...p, criminalSection: { ...crim, items: (crim.items || []).map((s) => s.trim()).filter(Boolean) } };
      setP(await api.put('/admin/profile', body));
      reload();
      toast('Profile saved. The website is updated.');
    } catch (err) { toast(err.message, 'error'); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <h2 className="text-2xl">Profile</h2>

      <Section title="Personal information">
        <div className="grid gap-5 sm:grid-cols-2">
          {f('name', 'Full name', { required: true })}
          {f('title', 'Professional title')}
        </div>
        {f('headline', 'Headline', { help: 'Shown under the name on the homepage, for example: Advocate | Criminal, Civil & Family Law' })}
        {f('tagline', 'Introduction line', { type: 'textarea', rows: 2 })}
        {f('biography', 'Biography', { type: 'textarea', rows: 10, help: 'Leave a blank line between paragraphs.' })}
        {f('profilePhoto', 'Profile photo', { type: 'image' })}
      </Section>

      <Section title="Contact details">
        <div className="grid gap-5 sm:grid-cols-2">
          {f('phone', 'Phone')}
          {f('whatsapp', 'WhatsApp number', { help: 'International format without + or spaces, for example 923001234567' })}
          {f('email', 'Email')}
          {f('chamberNumber', 'Chamber number')}
        </div>
        {f('chamberLocation', 'Chamber location', { help: 'Shown after the chamber number, for example: Sahiwal Courts, Sahiwal, Punjab, Pakistan' })}
        {f('officeAddress', 'Office address')}
        {f('mapEmbedUrl', 'Google Maps embed URL (optional)', { help: 'In Google Maps choose Share → Embed a map and paste the src link. If empty, the map is found from the chamber location.' })}
      </Section>

      <Section title="Experience">
        {f('yearsExperience', 'Years of experience', { help: 'For example: 20+' })}
        {f('experienceHistory', 'Professional history', { type: 'textarea', rows: 6, help: 'Optional. Shown on the About page.' })}
        <Field label="Statistics shown on the homepage">
          <Repeater value={p.stats} onChange={set('stats')} blank={{ value: '', label: '' }} addLabel="Add statistic"
            itemLabel={(s) => [s.value, s.label].filter(Boolean).join(' ') || 'Statistic'}
            fields={[T('value', 'Value (large text)', { half: true }), T('label', 'Label', { half: true })]} />
        </Field>
      </Section>

      <Section title="Education">
        <Repeater value={p.education} onChange={set('education')} blank={{ qualification: '', subtitle: '', institution: '', year: '', description: '' }} addLabel="Add qualification"
          itemLabel={(e) => e.qualification || 'Qualification'}
          fields={[T('qualification', 'Qualification'), T('subtitle', 'Subtitle'), T('institution', 'Institution / place'), T('year', 'Year'), T('description', 'Description', { type: 'textarea', rows: 2, wide: true })]} />
      </Section>

      <Section title="Memberships & affiliations">
        <Repeater value={p.memberships} onChange={set('memberships')} blank={{ organization: '', type: '', description: '' }} addLabel="Add membership"
          itemLabel={(m) => m.organization || 'Membership'}
          fields={[T('organization', 'Organization'), T('type', 'Membership type'), T('description', 'Description', { type: 'textarea', rows: 2, wide: true })]} />
      </Section>

      <Section title="Criminal law section" hint="The highlighted section on the homepage.">
        <FieldRow field={T('heading', 'Heading')} value={crim.heading} onChange={setCrim('heading')} />
        <FieldRow field={T('text', 'Text', { type: 'textarea', rows: 4 })} value={crim.text} onChange={setCrim('text')} />
        <FieldRow field={T('items', 'Listed areas', { type: 'lines', help: 'One per line' })} value={crim.items || []} onChange={setCrim('items')} />
      </Section>

      <Section title="Call to action">
        <div className="grid gap-5 sm:grid-cols-2">
          {f('ctaHeading', 'Heading')}
          {f('ctaText', 'Text')}
        </div>
      </Section>

      <Section title="Social media" hint="Links appear in the footer and on the contact page.">
        <Repeater value={p.social} onChange={set('social')} blank={{ platform: '', url: '' }} addLabel="Add social link"
          itemLabel={(s) => s.platform || 'Social link'} fields={[T('platform', 'Platform', { half: true }), T('url', 'Link (https://…)', { half: true })]} />
      </Section>

      <div className="sticky bottom-0 -mx-1 border-t border-line bg-paper/95 px-1 py-4 backdrop-blur">
        <button className="btn-dark" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </div>
    </form>
  );
}
