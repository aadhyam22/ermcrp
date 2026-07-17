import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-surface">
          {children}
        </main>
      </div>
    </div>
  );
}
