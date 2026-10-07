import {
  CircleDollarSign,
  LayoutDashboard,
  MapPinned,
  Settings,
  ShieldCheck,
  UserCircle,
} from 'lucide-react';

export const getNavigationItems = (user, isAuthenticated) => {
  const role = user?.role;
  const base = [{ to: '/', labelKey: 'nav.stadiums', icon: MapPinned }];

  if (!isAuthenticated) {
    return base;
  }

  const roleItems = {
    user: [
      { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
      { to: '/profile', labelKey: 'nav.profile', icon: UserCircle },
      { to: '/settings', labelKey: 'nav.settings', icon: Settings },
    ],
    stadiumOwner: [
      { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
      { to: '/owner/stats', labelKey: 'nav.ownerStats', icon: CircleDollarSign },
      { to: '/profile', labelKey: 'nav.profile', icon: UserCircle },
      { to: '/settings', labelKey: 'nav.settings', icon: Settings },
    ],
    admin: [
      { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
      { to: '/admin', labelKey: 'nav.admin', icon: ShieldCheck },
      { to: '/profile', labelKey: 'nav.profile', icon: UserCircle },
      { to: '/settings', labelKey: 'nav.settings', icon: Settings },
    ],
  };

  return [...base, ...(roleItems[role] || [])];
};

export const getMobileNavigationItems = (user, isAuthenticated) => {
  const items = getNavigationItems(user, isAuthenticated);
  return items.slice(0, 6);
};

export const getRouteTitleKey = (pathname = '/') => {
  if (pathname.startsWith('/stadiums/')) return 'routeTitles.stadiums';
  if (pathname.startsWith('/booking/')) return 'routeTitles.dashboard';

  const directMap = {
    '/': 'routeTitles.stadiums',
    '/dashboard': 'routeTitles.dashboard',
    '/owner/stats': 'routeTitles.ownerStats',
    '/admin': 'routeTitles.admin',
    '/profile': 'routeTitles.profile',
    '/settings': 'routeTitles.settings',
  };

  return directMap[pathname] || 'routeTitles.stadiums';
};
