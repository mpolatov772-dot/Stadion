import { X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

import brandMark from '../assets/brand-mark.svg';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { getNavigationItems } from '../utils/navigation';

export function Sidebar({ open, onClose }) {
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const items = getNavigationItems(user, isAuthenticated);

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label={t('common.cancel')}
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[84vw] max-w-72 flex-col border-r border-white/5 bg-[#0D131A] px-4 py-5 transition duration-200 lg:static lg:h-screen lg:w-72 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" onClick={onClose}>
            <img src={brandMark} alt={t('app.name')} className="h-14 w-auto" />
            <div>
              <p className="heading-font text-xl font-semibold text-white">{t('app.name')}</p>
              <p className="text-xs text-gray-400">{t('app.subtitle')}</p>
            </div>
          </Link>
          <button type="button" className="app-button-secondary lg:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-2 overflow-y-auto pr-1">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    isActive
                      ? 'bg-green-500 text-black'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{t(item.labelKey)}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-5 lg:mt-auto app-card bg-gradient-to-br from-green-500/10 to-transparent">
          <p className="text-sm font-medium text-white">{t('app.desktopBadgeTitle')}</p>
          <p className="mt-2 text-sm text-gray-400">
            {t('app.desktopBadgeDescription')}
          </p>
        </div>
      </aside>
    </>
  );
}
