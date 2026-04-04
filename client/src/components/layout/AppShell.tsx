import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { ToastContainer } from '../ui/Toast';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-surface-alt">
      <Header />
      <main className="pb-20 md:pb-6 pt-4">
        <Outlet />
      </main>
      <BottomNav />
      <ToastContainer />
    </div>
  );
}
