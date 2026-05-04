import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { BlockedRestrictionCard } from '../components/BlockedRestrictionCard';
import { GlobalMotionEffects } from '../components/GlobalMotionEffects';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { NotificationBridge } from '../components/NotificationBridge';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { blockedAllowedRoutes, hasActiveBlockRestriction } from '../utils/blocking';

export function MainLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isBlocked = hasActiveBlockRestriction(user);
  const location = useLocation();

  if (isBlocked && !blockedAllowedRoutes.has(location.pathname)) {
    return <Navigate to="/requests" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="app-shell lg:grid lg:grid-cols-[288px_1fr]">
      <GlobalMotionEffects />
      <NotificationBridge />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0">
        <Navbar />
        <main className="page-enter mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-3 py-5 pb-28 sm:px-6 sm:py-8 lg:pb-8">
          {isBlocked ? <BlockedRestrictionCard compact /> : null}
          <div key={location.pathname} className="page-route-enter">
            <Outlet />
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
