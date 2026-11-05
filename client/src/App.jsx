import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './components/public/Layout.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import Home from './pages/public/Home.jsx';
import About from './pages/public/About.jsx';
import PracticeAreas from './pages/public/PracticeAreas.jsx';
import Cases from './pages/public/Cases.jsx';
import Judgments from './pages/public/Judgments.jsx';
import Achievements from './pages/public/Achievements.jsx';
import LegalUpdates from './pages/public/LegalUpdates.jsx';
import { CaseDetail, JudgmentDetail, UpdateDetail } from './pages/public/Details.jsx';
import Contact from './pages/public/Contact.jsx';
import NotFound from './pages/public/NotFound.jsx';
import Login from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ProfileEditor from './pages/admin/Profile.jsx';
import Media from './pages/admin/Media.jsx';
import Messages from './pages/admin/Messages.jsx';
import Settings from './pages/admin/Settings.jsx';
import { AchievementsPage, CasesPage, JudgmentsPage, LegalUpdatesPage, PracticeAreasPage } from './pages/admin/Resources.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/practice-areas" element={<PracticeAreas />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/cases/:id" element={<CaseDetail />} />
        <Route path="/landmark-judgments" element={<Judgments />} />
        <Route path="/landmark-judgments/:id" element={<JudgmentDetail />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/legal-updates" element={<LegalUpdates />} />
        <Route path="/legal-updates/:slug" element={<UpdateDetail />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<ProfileEditor />} />
        <Route path="practice-areas" element={<PracticeAreasPage />} />
        <Route path="cases" element={<CasesPage />} />
        <Route path="landmark-judgments" element={<JudgmentsPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="legal-updates" element={<LegalUpdatesPage />} />
        <Route path="media" element={<Media />} />
        <Route path="messages" element={<Messages />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route element={<PublicLayout />}><Route path="*" element={<NotFound />} /></Route>
    </Routes>
  );
}
