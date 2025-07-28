import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path || path === '') return 'Dashboard';
    if (path === 'event-attendance') return 'Event Attendance';
    return path.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  return (
    <div>
      {/* Sidebar */}
      <aside className={isSidebarOpen ? 'visible' : 'hidden'}>
        <div>
          <h1>Service Register</h1>
          <button onClick={() => setSidebarOpen(false)}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/members">Members</Link>
          <Link to="/attendance">Attendance</Link>
          <Link to="/reports">Reports</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div>
        {/* Header */}
        <header>
          {/* Mobile Menu Button */}
          <button onClick={() => setSidebarOpen(true)}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          
          <div>
            <h2>{getPageTitle()}</h2>
          </div>
          <div>
            <img src={logo} alt="Logo" />
          </div>
        </header>

        {/* Content Area */}
        <main>
          {children}
        </main>
      </div>
      
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default Layout;