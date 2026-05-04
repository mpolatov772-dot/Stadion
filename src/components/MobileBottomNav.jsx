import { NavLink } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { getMobileNavigationItems } from '../utils/navigation';

export function MobileBottomNav() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const items = getMobileNavigationItems(user, isAuthenticated);

  return (
    <nav
      className="mobile-bottom-nav lg:hidden"
      style={{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `mobile-bottom-link ${isActive ? 'is-active' : ''}`}
          >
            <Icon className="h-5 w-5" />
            <span>{t(item.labelKey)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
