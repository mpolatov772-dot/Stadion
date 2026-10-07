import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { MobileBottomNav } from '../components/MobileBottomNav';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell lg:grid lg:grid-cols-[288px_1fr]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0">
        <Navbar />
        <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-3 py-5 pb-28 sm:px-6 sm:py-8 lg:pb-8">
          <Outlet />
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
