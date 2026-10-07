import { LogOut, Menu, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { BrandLockup } from './BrandLockup';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { getRoleLabelKey } from '../utils/display';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 rounded-[28px] border border-white/12 bg-[#0A0A0A]/78 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <BrandLockup size="sm" className="gap-3" taglineClassName="hidden sm:block" />
          </Link>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-right lg:block">
              <p className="text-sm font-semibold text-white">{user.fullName}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{t(getRoleLabelKey(user.role))}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-[#111827] px-4 py-2.5 text-sm text-gray-100 sm:inline-flex"
            >
              <LogOut className="h-4 w-4" />
              {t('buttons.logout')}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <div className="hidden items-center gap-2 rounded-full border border-[#00C26F]/20 bg-[#00C26F]/10 px-4 py-2 text-sm text-[#C8FF00] lg:flex">
              <ShieldCheck className="h-4 w-4" />
              Matchday Access
            </div>
            <Link
              to="/login"
              className="rounded-full border border-white/12 bg-[#111827] px-4 py-2.5 text-sm text-white"
            >
              {t('buttons.login')}
            </Link>
            <Link
              to="/register"
              className="hidden rounded-full bg-[#00C26F] px-4 py-2.5 text-sm font-semibold text-black shadow-[0_0_30px_rgba(0,194,111,0.24)] sm:inline-flex"
            >
              {t('buttons.register')}
            </Link>
            <Link
              to="/"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-200 xl:hidden"
              aria-label="open stadiums"
            >
              <Menu className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
