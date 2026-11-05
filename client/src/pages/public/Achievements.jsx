import { AchievementCard } from '../../components/public/Cards.jsx';
import BrowsePage from '../../components/public/BrowsePage.jsx';

export default function Achievements() {
  return (
    <BrowsePage title="Achievements" endpoint="/achievements" Card={AchievementCard}
      intro="Professional achievements and recognitions."
      filters={[{ key: 'category', label: 'All categories' }]}
      sorts={[{ value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' }]}
      emptyTitle="Achievements will be added soon" emptyText="Professional achievements will appear here once the advocate adds them." />
  );
}
