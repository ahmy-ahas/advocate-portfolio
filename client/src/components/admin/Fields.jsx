import { useId, useRef, useState } from 'react';
import { api } from '../../lib/api.js';
import { Icon } from '../ui.jsx';
import { useToast } from '../../context/Toast.jsx';

export function Field({ label, help, required, children, htmlFor }) {
  return (
    <div>
      {label && <label className="label" htmlFor={htmlFor}>{label}{required && <span className="text-red-700"> *</span>}</label>}
      {children}
      {help && <p className="help">{help}</p>}
    </div>
  );
}

export function TagsInput({ value = [], onChange, id }) {
  const [text, setText] = useState('');
  const add = () => {
    const parts = text.split(',').map((t) => t.trim()).filter(Boolean);
    if (parts.length) onChange([...new Set([...value, ...parts])]);
    setText('');
  };
  return (
    <div className="input flex flex-wrap items-center gap-2 !py-2">
      {value.map((t) => (
        <span key={t} className="badge flex items-center gap-1 border border-line bg-paper">
          {t}<button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))}><Icon name="close" className="h-3 w-3" /></button>
        </span>
      ))}
      <input id={id} className="min-w-32 flex-1 bg-transparent py-0.5 text-sm outline-none" value={text} placeholder="Type a tag and press Enter"
        onChange={(e) => setText(e.target.value)} onBlur={add}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } else if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1)); }} />
    </div>
  );
}

export function FileField({ value, onChange, multiple = false, kind = 'image' }) {
  const toast = useToast();
  const ref = useRef();
  const [busy, setBusy] = useState(false);
  const list = multiple ? value || [] : value ? [value] : [];
  const accept = kind === 'image' ? 'image/jpeg,image/png,image/webp,image/gif' : kind === 'pdf' ? 'application/pdf' : 'application/pdf,.doc,.docx,image/jpeg,image/png,image/webp';

  const pick = async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    const done = [];
    for (const f of files) {
      try { done.push(await api.upload(f)); } catch (err) { toast(`${f.name}: ${err.message}`, 'error'); }
    }
    setBusy(false);
    if (!done.length) return;
    const pickKeys = ({ url, publicId, resourceType, name, mimetype, size }) => ({ url, publicId, resourceType, name, mimetype, size });
    onChange(multiple ? [...list, ...done.map(pickKeys)] : pickKeys(done[0]));
  };
  const remove = (i) => onChange(multiple ? list.filter((_, j) => j !== i) : null);
  const isImg = (f) => /\.(jpe?g|png|webp|gif)(\?|$)/i.test(f.url || '') || f.mimetype?.startsWith('image/') || f.resourceType === 'static';

  return (
    <div>
      {list.length > 0 && (
        <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {list.map((f, i) => (
            <li key={f.url + i} className="relative border border-line bg-white p-2">
              {isImg(f) ? <img src={f.url} alt="" className="aspect-[4/3] w-full object-cover" /> : (
                <div className="flex aspect-[4/3] items-center justify-center bg-paper"><Icon name="document" className="h-8 w-8 text-gold" /></div>
              )}
              <p className="mt-1 truncate text-xs text-muted" title={f.name}>{f.name || 'File'}</p>
              <button type="button" onClick={() => remove(i)} aria-label="Remove file" className="absolute right-1 top-1 rounded-sm bg-charcoal p-1 text-white"><Icon name="close" className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      )}
      <input ref={ref} type="file" accept={accept} multiple={multiple} className="hidden" onChange={pick} />
      <button type="button" className="btn-outline btn-sm" disabled={busy} onClick={() => ref.current.click()}>
        <Icon name="upload" className="h-4 w-4" />{busy ? 'Uploading…' : list.length && !multiple ? 'Replace file' : multiple ? 'Add files' : 'Upload file'}
      </button>
    </div>
  );
}

// Generic input for the ResourceManager field config
export function FieldInput({ field, value, onChange, id: idProp }) {
  const autoId = useId();
  const id = idProp || autoId;
  const common = { id, className: 'input' };
  switch (field.type) {
    case 'textarea':
      return <textarea {...common} rows={field.rows || 4} maxLength={field.max} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'number':
      return <input {...common} type="number" value={value ?? ''} min={field.min} max={field.max} onChange={(e) => onChange(e.target.value)} />;
    case 'date':
      return <input {...common} type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'select':
      return <select {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>{field.options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}</select>;
    case 'combo': {
      const list = `${id}-list`;
      return (<><input {...common} list={list} maxLength={field.max} value={value ?? ''} onChange={(e) => onChange(e.target.value)} /><datalist id={list}>{field.options.map((o) => <option key={o} value={o} />)}</datalist></>);
    }
    case 'checkbox':
      return (
        <label className="flex items-center gap-3 border border-line bg-white px-3 py-2.5">
          <input id={id} type="checkbox" className="h-4 w-4 accent-[#9C7A3C]" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span className="text-sm">{field.checkLabel || field.label}</span>
        </label>
      );
    case 'tags': return <TagsInput id={id} value={value || []} onChange={onChange} />;
    case 'lines':
      return <textarea {...common} rows={field.rows || 5} value={(value || []).join('\n')} onChange={(e) => onChange(e.target.value.split('\n'))} />;
    case 'image': return <FileField kind="image" value={value} onChange={onChange} />;
    case 'images': return <FileField kind="image" multiple value={value} onChange={onChange} />;
    case 'pdf': return <FileField kind="pdf" value={value} onChange={onChange} />;
    case 'file': return <FileField kind="document" value={value} onChange={onChange} />;
    case 'files': return <FileField kind="document" multiple value={value} onChange={onChange} />;
    default:
      return <input {...common} type="text" maxLength={field.max} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  }
}

export function FieldRow({ field, value, onChange }) {
  const id = useId();
  return (
    <Field label={field.type === 'checkbox' ? '' : field.label} help={field.help} required={field.required} htmlFor={id}>
      <FieldInput id={id} field={field} value={value} onChange={onChange} />
    </Field>
  );
}

// Editable list of small objects (education, memberships, stats, social links)
export function Repeater({ value = [], onChange, fields, blank, addLabel = 'Add item', itemLabel }) {
  const update = (i, k, v) => onChange(value.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {value.map((it, i) => (
        <div key={i} className="border border-line bg-paper p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">{itemLabel ? itemLabel(it, i) : `Item ${i + 1}`}</p>
            <div className="flex gap-1">
              <button type="button" className="btn-outline btn-sm !px-2" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><Icon name="up" className="h-4 w-4" /></button>
              <button type="button" className="btn-outline btn-sm !px-2" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down"><Icon name="down" className="h-4 w-4" /></button>
              <button type="button" className="btn-outline btn-sm !px-2" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove"><Icon name="trash" className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key} className={f.wide ? 'sm:col-span-2' : ''}>
                <FieldRow field={f} value={it[f.key]} onChange={(v) => update(i, f.key, v)} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="btn-outline btn-sm" onClick={() => onChange([...value, { ...blank }])}><Icon name="plus" className="h-4 w-4" />{addLabel}</button>
    </div>
  );
}
