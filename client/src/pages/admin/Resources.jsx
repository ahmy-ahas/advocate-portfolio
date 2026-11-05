import ResourceManager from '../../components/admin/ResourceManager.jsx';
import { ICON_NAMES } from '../../components/ui.jsx';
import { formatDate } from '../../lib/utils.js';

const year = new Date().getFullYear();
const COURTS = ['Supreme Court of Pakistan', 'Lahore High Court', 'Lahore High Court, Multan Bench', 'Sessions Court, Sahiwal', 'District & Sessions Court, Sahiwal', 'Civil Court, Sahiwal', 'Family Court, Sahiwal'];

export const PracticeAreasPage = () => (
  <ResourceManager title="Practice Area" plural="Practice Areas" endpoint="practice-areas" reorder
    columns={[{ key: 'title', label: 'Title' }, { label: 'Topics', render: (i) => `${i.items?.length || 0} listed` }]}
    fields={[
      { key: 'title', label: 'Title', required: true, half: true },
      { key: 'icon', label: 'Icon', type: 'select', options: ICON_NAMES, default: 'scale', half: true },
      { key: 'description', label: 'Short description', type: 'textarea', rows: 3 },
      { key: 'items', label: 'Topics covered', type: 'lines', help: 'One per line, for example: Bail Matters' },
      { key: 'published', label: 'Status', type: 'checkbox', checkLabel: 'Published (visible on the website)', default: true },
    ]} />
);

export const CasesPage = () => (
  <ResourceManager title="Case" plural="Important Cases" endpoint="cases" featureToggle publicPath="/cases"
    sorts={[{ value: 'recent', label: 'Recently added' }, { value: 'newest', label: 'Newest case first' }, { value: 'oldest', label: 'Oldest case first' }, { value: 'court', label: 'By court' }, { value: 'title', label: 'By title' }]}
    columns={[{ key: 'title', label: 'Case Title' }, { key: 'court', label: 'Court' }, { key: 'year', label: 'Year' }, { key: 'caseType', label: 'Category' }]}
    fields={[
      { key: 'title', label: 'Case title', required: true, max: 250, help: 'For example: ABC vs. XYZ' },
      { key: 'caseNumber', label: 'Case number', half: true },
      { key: 'court', label: 'Court', type: 'combo', options: COURTS, required: true, half: true },
      { key: 'caseType', label: 'Case type', type: 'combo', options: ['Criminal', 'Civil', 'Family', 'Bail', 'Narcotics'], required: true, half: true },
      { key: 'year', label: 'Year', type: 'number', min: 1900, max: 2100, default: year, required: true, half: true },
      { key: 'date', label: 'Date', type: 'date', half: true },
      { key: 'status', label: 'Case status', type: 'combo', options: ['Ongoing', 'Pending', 'Decided', 'Disposed'], half: true },
      { key: 'parties', label: 'Parties', max: 500 },
      { key: 'description', label: 'Case description', type: 'textarea', rows: 6 },
      { key: 'advocateRole', label: 'Advocate’s role', type: 'textarea', rows: 3 },
      { key: 'outcome', label: 'Outcome', type: 'textarea', rows: 3 },
      { key: 'judgmentSummary', label: 'Judgment summary', type: 'textarea', rows: 6 },
      { key: 'documents', label: 'Judgment / documents', type: 'files', help: 'PDF, DOC or DOCX files, up to 15 MB each' },
      { key: 'images', label: 'Images', type: 'images' },
      { key: 'tags', label: 'Tags', type: 'tags' },
      { key: 'featured', label: 'Featured', type: 'checkbox', checkLabel: 'Featured case (shown first on the homepage)', half: true },
      { key: 'published', label: 'Status', type: 'checkbox', checkLabel: 'Published (visible on the website)', half: true },
    ]} />
);

export const JudgmentsPage = () => (
  <ResourceManager title="Judgment" plural="Landmark Judgments" endpoint="landmark-judgments" publicPath="/landmark-judgments"
    sorts={[{ value: 'recent', label: 'Recently added' }, { value: 'newest', label: 'Newest' }, { value: 'oldest', label: 'Oldest' }, { value: 'court', label: 'By court' }, { value: 'category', label: 'By category' }, { value: 'year', label: 'By year' }]}
    columns={[{ key: 'title', label: 'Case Title' }, { key: 'court', label: 'Court' }, { key: 'year', label: 'Year' }, { key: 'category', label: 'Category' }]}
    fields={[
      { key: 'title', label: 'Case title', required: true, max: 250 },
      { key: 'caseNumber', label: 'Case number', half: true },
      { key: 'court', label: 'Court', type: 'combo', options: COURTS, required: true, half: true },
      { key: 'date', label: 'Date of judgment', type: 'date', half: true },
      { key: 'year', label: 'Year', type: 'number', min: 1900, max: 2100, default: year, required: true, half: true },
      { key: 'category', label: 'Legal category', type: 'combo', options: ['Criminal', 'Civil', 'Family', 'Constitutional'], half: true },
      { key: 'parties', label: 'Parties', half: true },
      { key: 'summary', label: 'Judgment summary', type: 'textarea', rows: 6 },
      { key: 'importantPoint', label: 'Important legal point', type: 'textarea', rows: 4 },
      { key: 'advocateRole', label: 'Advocate’s role', type: 'textarea', rows: 3 },
      { key: 'pdf', label: 'Judgment PDF', type: 'pdf' },
      { key: 'relatedDocuments', label: 'Related documents', type: 'files' },
      { key: 'tags', label: 'Tags', type: 'tags' },
      { key: 'published', label: 'Status', type: 'checkbox', checkLabel: 'Published (visible on the website)' },
    ]} />
);

export const AchievementsPage = () => (
  <ResourceManager title="Achievement" plural="Achievements" endpoint="achievements"
    sorts={[{ value: 'recent', label: 'Recently added' }, { value: 'newest', label: 'Newest year' }, { value: 'oldest', label: 'Oldest year' }]}
    columns={[{ key: 'title', label: 'Title' }, { key: 'year', label: 'Year' }, { key: 'category', label: 'Category' }]}
    fields={[
      { key: 'title', label: 'Title', required: true },
      { key: 'year', label: 'Date / year', half: true, help: 'For example: 2026' },
      { key: 'category', label: 'Category', type: 'combo', options: ['Professional', 'Academic', 'Bar Association', 'Community'], half: true },
      { key: 'description', label: 'Description', type: 'textarea', rows: 5 },
      { key: 'image', label: 'Image', type: 'image' },
      { key: 'certificate', label: 'Certificate / document', type: 'file' },
      { key: 'published', label: 'Status', type: 'checkbox', checkLabel: 'Published (visible on the website)' },
    ]} />
);

export const LegalUpdatesPage = () => (
  <ResourceManager title="Article" plural="Legal Updates" endpoint="legal-updates" publicPath="/legal-updates"
    sorts={[{ value: 'recent', label: 'Recently added' }, { value: 'newest', label: 'Newest published' }, { value: 'oldest', label: 'Oldest published' }]}
    columns={[{ key: 'title', label: 'Title' }, { key: 'category', label: 'Category' }, { label: 'Published on', render: (i) => formatDate(i.publishedAt) || '—' }]}
    fields={[
      { key: 'title', label: 'Title', required: true },
      { key: 'category', label: 'Category', type: 'combo', options: ['Legal Article', 'Case Update', 'Judgment', 'Legal Awareness', 'Announcement'], half: true },
      { key: 'publishedAt', label: 'Publication date', type: 'date', half: true, help: 'Set automatically when first published if left empty' },
      { key: 'excerpt', label: 'Short summary', type: 'textarea', rows: 2, max: 500 },
      { key: 'content', label: 'Content', type: 'textarea', rows: 16, required: true, help: 'Leave a blank line between paragraphs. Start a line with “## ” for a heading, or “- ” for bullet points.' },
      { key: 'featuredImage', label: 'Featured image', type: 'image' },
      { key: 'tags', label: 'Tags', type: 'tags' },
      { key: 'published', label: 'Status', type: 'checkbox', checkLabel: 'Published (visible on the website)' },
    ]} />
);
