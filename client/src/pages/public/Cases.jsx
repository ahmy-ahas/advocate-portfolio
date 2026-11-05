import { CaseCard } from '../../components/public/Cards.jsx';
import BrowsePage from '../../components/public/BrowsePage.jsx';

export default function Cases() {
  return (
    <BrowsePage title="Important Cases" endpoint="/cases" Card={CaseCard}
      intro="Matters handled by the advocate, searchable by court, type and year."
      filters={[{ key: 'year', label: 'All years' }, { key: 'court', label: 'All courts' }, { key: 'caseType', label: 'All case types' }]}
      sorts={[{ value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' }, { value: 'featured', label: 'Featured first' }, { value: 'court', label: 'By court' }]}
      emptyTitle="No cases published yet" emptyText="Important cases will be listed here once the advocate publishes them." />
  );
}
