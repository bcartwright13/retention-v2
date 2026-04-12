import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { ToastContainer } from '../ui/Toast';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header />
      <main className="pb-24 md:pb-12 pt-6 md:pt-10">
        <Outlet />
      </main>
      <BottomNav />
      <ToastContainer />
    </div>
  );
}
