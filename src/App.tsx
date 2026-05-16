import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom';
import { Dashboard } from '@/components/Dashboard';
import { FieldsPage } from '@/pages/FieldsPage';
import { OperationsLayout } from '@/pages/OperationsLayout';
import { TasksPage } from '@/pages/TasksPage';

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-soil-900 text-white' : 'text-soil-700 hover:bg-soil-100',
  ].join(' ');

export function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-soil-200/80 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-[1920px] flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-6 xl:px-8">
            <Link to="/" className="font-display text-lg font-semibold text-soil-900">
              Agri Workforce Scheduler
            </Link>
            <nav className="flex flex-wrap gap-1" aria-label="Main">
              <NavLink to="/" className={navClass} end>
                Dashboard
              </NavLink>
              <NavLink to="/fields" className={navClass}>
                Fields
              </NavLink>
              <NavLink to="/tasks" className={navClass}>
                Tasks
              </NavLink>
            </nav>
          </div>
        </header>
        <main className="flex min-h-0 flex-1 flex-col">
          <Routes>
            <Route element={<OperationsLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/fields" element={<FieldsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
