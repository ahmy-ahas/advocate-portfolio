import { JudgmentCard } from '../../components/public/Cards.jsx';
import BrowsePage from '../../components/public/BrowsePage.jsx';

export default function Judgments() {
  return (
    <BrowsePage title="Landmark Judgments" endpoint="/landmark-judgments" Card={JudgmentCard}
      intro="Browse and search significant judgments by court, category and year."
      filters={[{ key: 'year', label: 'All years' }, { key: 'court', label: 'All courts' }, { key: 'category', label: 'All categories' }]}
      sorts={[{ value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' }, { value: 'court', label: 'By court' }, { value: 'category', label: 'By category' }]}
      emptyTitle="No judgments published yet" emptyText="Landmark judgments will be listed here once the advocate publishes them." />
  );
}
