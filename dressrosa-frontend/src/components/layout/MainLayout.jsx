import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';


const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="pt-16 min-h-screen">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default MainLayout;