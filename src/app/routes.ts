import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { VisitorRegistrationPage } from './pages/VisitorRegistrationPage';
import { AppointmentPage } from './pages/AppointmentPage';
import { EntryHistoryPage } from './pages/EntryHistoryPage';
import { BadgeManagementPage } from './pages/BadgeManagementPage';
import { VehiclePage } from './pages/VehiclePage';
import { RegisterBookPage } from './pages/RegisterBookPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { UsersPage } from './pages/UsersPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { NotificationPage } from './pages/NotificationPage';
import { ReportsPage } from './pages/ReportsPage';
import { SearchPage } from './pages/SearchPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { CalendarPage } from './pages/CalendarPage';
import { PartnerProfilePage } from './pages/PartnerProfilePage';
import { ArchivePage } from './pages/ArchivePage';

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
        { index: true, Component: Dashboard },
        { path: 'visitors', Component: VisitorRegistrationPage },
        { path: 'appointments', Component: AppointmentPage },
        { path: 'entry-history', Component: EntryHistoryPage },
        { path: 'badges', Component: BadgeManagementPage },
        { path: 'vehicles', Component: VehiclePage },
        { path: 'register-book', Component: RegisterBookPage },
        { path: 'notifications', Component: NotificationPage },
        { path: 'reports', Component: ReportsPage },
        { path: 'search', Component: SearchPage },
        { path: 'settings', Component: SettingsPage },
        { path: 'calendar', Component: CalendarPage },
        { path: 'partners', Component: PartnerProfilePage },
        { path: 'archive', Component: ArchivePage },
        { path: 'users', Component: UsersPage },
        { path: 'organization', Component: OrganizationPage },
        { path: 'categories', Component: CategoriesPage },
      ],
    },
    {
      path: '*',
      Component: NotFoundPage,
    },
  ],
  { basename: import.meta.env.BASE_URL }
);
