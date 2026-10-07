import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { useI18n } from './hooks/useI18n';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';

const StadiumsPage = lazy(() => import('./pages/StadiumsPage').then((module) => ({ default: module.StadiumsPage })));
const StadiumDetailsPage = lazy(() =>
  import('./pages/StadiumDetailsPage').then((module) => ({ default: module.StadiumDetailsPage })),
);
const BookingPage = lazy(() => import('./pages/BookingPage').then((module) => ({ default: module.BookingPage })));
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const OwnerStatsPage = lazy(() =>
  import('./pages/OwnerStatsPage').then((module) => ({ default: module.OwnerStatsPage })),
);
const AdminPage = lazy(() => import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })));
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

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StadiumsPage />} />
          <Route path="stadiums/:id" element={<StadiumDetailsPage />} />
          <Route
            path="booking/:stadiumId"
            element={
              <BookingPage />
            }
          />
          <Route
            path="dashboard"
            element={
              <DashboardPage />
            }
          />
          <Route
            path="owner/stats"
            element={
              <ProtectedRoute roles={['stadiumOwner', 'admin']}>
                <OwnerStatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProfilePage />
            }
          />
          <Route
            path="settings"
            element={
              <SettingsPage />
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
