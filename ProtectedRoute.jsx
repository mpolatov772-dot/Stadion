import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';

export function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, isBooting, user } = useAuth();
  const { t } = useI18n();
  const location = useLocation();

  if (isBooting) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="app-card text-sm text-gray-300">{t('common.loadingSession')}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
