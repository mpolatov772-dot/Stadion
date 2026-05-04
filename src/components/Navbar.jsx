import { Bell, LogOut, Menu, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import brandMark from '../assets/brand-mark.svg';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { notificationService } from '../services/notificationService';
import { getRoleLabelKey } from '../utils/display';

const navItems = [
  { label: 'Bosh sahifa', to: '/' },
  { label: 'Stadionlar', to: '/stadiums' },
  { label: 'Statistika', to: '/statistics' },
  { label: 'Do\'kon', to: '/store' },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(user?.meta?.unreadNotificationsCount || 0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return undefined;
    }

    const syncNotifications = async () => {
      try {
        const notifications = await notificationService.list();
        setUnreadCount(notifications.filter((item) => !item.isRead).length);
      } catch {
        setUnreadCount(user?.meta?.unreadNotificationsCount || 0);
      }
    };

    syncNotifications();

    const handleRefresh = () => {
      syncNotifications();
    };

    window.addEventListener('notifications-updated', handleRefresh);
    return () => window.removeEventListener('notifications-updated', handleRefresh);
  }, [isAuthenticated, user?.meta?.unreadNotificationsCount]);

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;

      setIsScrolled(currentY > 24);

      if (currentY < 80) {
        setHidden(false);
      } else {
        setHidden(currentY > lastY);
      }

      lastY = currentY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activePath = useMemo(() => location.pathname, [location.pathname]);

  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: hidden ? -110 : 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4"
    >
      <div
        className={`mx-auto flex max-w-[1600px] items-center justify-between gap-3 rounded-[28px] border px-4 py-3 sm:px-6 ${
          isScrolled
            ? 'border-white/12 bg-[#0A0A0A]/78 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl'
            : 'border-white/8 bg-[#0A0A0A]/60 backdrop-blur-xl'
        }`}
      >
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={brandMark} alt="GoalX logo" className="h-11 w-auto sm:h-12" />
            <div className="min-w-0">
              <p className="heading-font text-3xl uppercase leading-none text-white">
                GOAL<span className="text-[#00C26F]">X</span>
              </p>
              <p className="hidden text-xs uppercase tracking-[0.3em] text-gray-400 sm:block">
                FOOTBALL PLATFORM
              </p>
            </div>
          </Link>

          <nav className="ml-6 hidden items-center gap-2 xl:flex">
            {navItems.map((item) => {
              const isActive = activePath === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`goalx-ripple rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#00C26F] text-black shadow-[0_0_24px_rgba(0,194,111,0.24)]'
                      : 'text-gray-300 hover:bg-white/6 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-right lg:block">
              <p className="text-sm font-semibold text-white">{user.fullName}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{t(getRoleLabelKey(user.role))}</p>
            </div>
            <Link
              to="/notifications"
              className="goalx-ripple relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#111827] px-4 py-2.5 text-sm text-gray-100 hover:border-[#00C26F]/40 hover:text-white"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
              {unreadCount ? (
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#00C26F] px-2 py-0.5 text-xs font-bold text-black">
                  {unreadCount}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={logout}
              className="goalx-ripple hidden items-center gap-2 rounded-full border border-white/10 bg-[#111827] px-4 py-2.5 text-sm text-gray-100 hover:border-[#00C26F]/40 hover:text-white sm:inline-flex"
            >
              <LogOut className="h-4 w-4" />
              {t('buttons.logout')}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#00C26F]/20 bg-[#00C26F]/10 px-4 py-2 text-sm text-[#C8FF00] lg:flex">
              <ShieldCheck className="h-4 w-4" />
              Matchday Access
            </div>
            <Link
              to="/login"
              className="goalx-ripple rounded-full border border-white/12 bg-[#111827] px-4 py-2.5 text-sm text-white hover:border-white/20 hover:bg-white/8"
            >
              {t('buttons.login')}
            </Link>
            <Link
              to="/register"
              className="goalx-ripple hidden rounded-full bg-[#00C26F] px-4 py-2.5 text-sm font-semibold text-black shadow-[0_0_30px_rgba(0,194,111,0.24)] hover:brightness-110 sm:inline-flex"
            >
              {t('buttons.register')}
            </Link>
            <Link
              to="/stadiums"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-200 xl:hidden"
              aria-label="open stadiums"
            >
              <Menu className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </motion.header>
  );
}
