import { Outlet } from 'react-router-dom';
import StudioSidebar from './StudioSidebar';

/**
 * StudioLayout — the shell for the entire Dressrosa Studio (Seller Business Suite).
 * Replaces MainLayout for all /studio/* routes.
 * Full viewport: sidebar on the left (w-72), content fills the rest.
 */
const StudioLayout = () => {
  return (
    <div className="min-h-screen bg-[#F4F5F7] flex">
      {/* Fixed Sidebar */}
      <StudioSidebar />

      {/* Main Content Area — offset by sidebar width */}
      <main className="flex-1 ml-72 min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default StudioLayout;
