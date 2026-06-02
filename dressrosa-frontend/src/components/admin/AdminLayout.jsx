import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

/**
 * AdminLayout — the shell for the entire Dressrosa Admin Dashboard.
 * Replaces MainLayout for all /admin/* routes.
 * Full viewport: dark sidebar on the left (w-72), content fills the rest.
 */
const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fc] flex">
      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Main Content Area — offset by sidebar width */}
      <main className="flex-1 ml-72 min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
