import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { NotificationPage } from './pages/NotificationPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ArchivePage } from './pages/ArchivePage';
import { PartnerDossierPage } from './pages/PartnerDossierPage';
import { DelegationPage } from './pages/DelegationPage';

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      Component: LoginPage,
    },
    {
      path: '/',
      Component: Layout,
      children: [
        // Điều hành
        { index: true, Component: Dashboard },
        // Nghiệp vụ Đối ngoại
        { path: 'partner-dossier', Component: PartnerDossierPage },
        { path: 'delegations', Component: DelegationPage },
        // Hệ thống Dữ liệu
        { path: 'archive', Component: ArchivePage },
        { path: 'reports', Component: ReportsPage },
        { path: 'notifications', Component: NotificationPage },
        // Quản trị
        { path: 'categories', Component: CategoriesPage },
        { path: 'settings', Component: SettingsPage },
      ],
    },
    {
      path: '*',
      Component: NotFoundPage,
    },
  ],
  { basename: import.meta.env.BASE_URL }
);
