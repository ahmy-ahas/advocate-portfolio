import { UpdateCard } from '../../components/public/Cards.jsx';
import BrowsePage from '../../components/public/BrowsePage.jsx';

export default function LegalUpdates() {
  return (
    <BrowsePage title="Legal Updates" endpoint="/legal-updates" Card={UpdateCard}
      intro="Legal articles, case updates and announcements."
      filters={[{ key: 'category', label: 'All categories' }]}
      sorts={[{ value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' }]}
      emptyTitle="No articles published yet" emptyText="Legal articles and announcements will appear here once published." />
  );
}
