import {
  Bell,
  ChartColumnBig,
  CircleDollarSign,
  FileText,
  Home,
  LayoutDashboard,
  MapPinned,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Users,
  UserCircle,
} from 'lucide-react';

import { hasActiveBlockRestriction } from './blocking';

export const getNavigationItems = (user, isAuthenticated) => {
  const role = user?.role;
  const isBlocked = hasActiveBlockRestriction(user);
  const base = [
    { to: '/', labelKey: 'nav.home', icon: Home },
    { to: '/statistics', labelKey: 'nav.statistics', icon: ChartColumnBig },
    { to: '/stadiums', labelKey: 'nav.stadiums', icon: MapPinned },
    { to: '/store', labelKey: 'nav.store', icon: ShoppingBag },
    { to: '/community', labelKey: 'nav.community', icon: Users },
  ];

  if (!isAuthenticated) {
    return base;
  }

  if (isBlocked) {
    return [
      { to: '/requests', labelKey: 'nav.requests', icon: FileText },
      { to: '/notifications', labelKey: 'nav.notifications', icon: Bell },
    ];
  }

  const roleItems = {
    user: [
      { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
      { to: '/notifications', labelKey: 'nav.notifications', icon: Bell },
      { to: '/profile', labelKey: 'nav.profile', icon: UserCircle },
      { to: '/settings', labelKey: 'nav.settings', icon: Settings },
    ],
    seller: [
      { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
      { to: '/notifications', labelKey: 'nav.notifications', icon: Bell },
      { to: '/reports', labelKey: 'nav.reports', icon: CircleDollarSign },
      { to: '/profile', labelKey: 'nav.profile', icon: UserCircle },
      { to: '/settings', labelKey: 'nav.settings', icon: Settings },
    ],
    stadiumOwner: [
      { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
      { to: '/reports', labelKey: 'nav.reports', icon: CircleDollarSign },
      { to: '/blocked-users', labelKey: 'nav.blockedUsers', icon: ShieldAlert },
      { to: '/requests', labelKey: 'nav.requests', icon: FileText },
      { to: '/notifications', labelKey: 'nav.notifications', icon: Bell },
      { to: '/profile', labelKey: 'nav.profile', icon: UserCircle },
      { to: '/settings', labelKey: 'nav.settings', icon: Settings },
    ],
    admin: [
      { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
      { to: '/reports', labelKey: 'nav.reports', icon: CircleDollarSign },
      { to: '/notifications', labelKey: 'nav.notifications', icon: Bell },
      { to: '/profile', labelKey: 'nav.profile', icon: UserCircle },
      { to: '/settings', labelKey: 'nav.settings', icon: Settings },
    ],
  };

  return [...base, ...(roleItems[role] || [])];
};

export const getMobileNavigationItems = (user, isAuthenticated) => {
  const items = getNavigationItems(user, isAuthenticated);
  const preferredOrder = hasActiveBlockRestriction(user)
    ? ['/requests', '/notifications']
    : ['/', '/statistics', '/stadiums', '/store', '/community', '/profile', '/dashboard', '/notifications'];
  const seen = new Set();

  return preferredOrder
    .map((path) => items.find((item) => item.to === path))
    .filter((item) => item && !seen.has(item.to) && seen.add(item.to))
    .slice(0, 6);
};

export const getRouteTitleKey = (pathname = '/') => {
  if (pathname === '/') return 'routeTitles.home';
  if (pathname.startsWith('/stadiums/')) return 'routeTitles.stadiums';
  if (pathname.startsWith('/store/')) return 'routeTitles.store';
  if (pathname.startsWith('/booking/')) return 'routeTitles.dashboard';

  const directMap = {
    '/stadiums': 'routeTitles.stadiums',
    '/statistics': 'routeTitles.statistics',
    '/store': 'routeTitles.store',
    '/community': 'routeTitles.community',
    '/dashboard': 'routeTitles.dashboard',
    '/reports': 'routeTitles.reports',
    '/blocked-users': 'routeTitles.blockedUsers',
    '/requests': 'routeTitles.requests',
    '/notifications': 'routeTitles.notifications',
    '/profile': 'routeTitles.profile',
    '/settings': 'routeTitles.settings',
  };

  return directMap[pathname] || 'routeTitles.home';
};
