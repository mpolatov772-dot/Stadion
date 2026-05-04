import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { useI18n } from './hooks/useI18n';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const StadiumsPage = lazy(() => import('./pages/StadiumsPage').then((module) => ({ default: module.StadiumsPage })));
const StadiumDetailsPage = lazy(() =>
  import('./pages/StadiumDetailsPage').then((module) => ({ default: module.StadiumDetailsPage })),
);
const StorePage = lazy(() => import('./pages/StorePage').then((module) => ({ default: module.StorePage })));
const ProductDetailsPage = lazy(() =>
  import('./pages/ProductDetailsPage').then((module) => ({ default: module.ProductDetailsPage })),
);
const CommunityPage = lazy(() =>
  import('./pages/CommunityPage').then((module) => ({ default: module.CommunityPage })),
);
const LeagueStatisticsPage = lazy(() =>
  import('./pages/LeagueStatisticsPage').then((module) => ({ default: module.LeagueStatisticsPage })),
);
const NotificationsPage = lazy(() =>
  import('./pages/NotificationsPage').then((module) => ({ default: module.NotificationsPage })),
);
const BookingPage = lazy(() => import('./pages/BookingPage').then((module) => ({ default: module.BookingPage })));
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const FinancialReportsPage = lazy(() =>
  import('./pages/FinancialReportsPage').then((module) => ({ default: module.FinancialReportsPage })),
);
const BlockedUsersPage = lazy(() =>
  import('./pages/BlockedUsersPage').then((module) => ({ default: module.BlockedUsersPage })),
);
const RequestsPage = lazy(() =>
  import('./pages/RequestsPage').then((module) => ({ default: module.RequestsPage })),
);
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })),
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
);
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })),
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);

function RouteFallback() {
  const { t } = useI18n();

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4">
      <div className="app-card text-sm text-gray-300">{t('common.loadingPage')}</div>
    </div>
  );
}

export default function App() {
  const { t } = useI18n();

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route
          path="/login"
          element={
            <AuthLayout
              title={t('auth.loginTitle')}
              description={t('auth.loginDescription')}
            >
              <LoginPage />
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout
              title={t('auth.registerTitle')}
              description={t('auth.registerDescription')}
            >
              <RegisterPage />
            </AuthLayout>
          }
        />

        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="news" element={<Navigate to="/" replace />} />
          <Route path="stadiums" element={<StadiumsPage />} />
          <Route path="stadiums/:id" element={<StadiumDetailsPage />} />
          <Route path="store" element={<StorePage />} />
          <Route path="store/:id" element={<ProductDetailsPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="statistics" element={<LeagueStatisticsPage />} />
          <Route
            path="booking/:stadiumId"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute roles={['stadiumOwner', 'seller', 'admin']}>
                <FinancialReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute allowBlocked>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="blocked-users"
            element={
              <ProtectedRoute roles={['stadiumOwner', 'admin']}>
                <BlockedUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="requests"
            element={
              <ProtectedRoute allowBlocked>
                <RequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
