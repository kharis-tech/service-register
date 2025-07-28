import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import MembersPage from './pages/Members';
import AttendancePage from './pages/Attendance';
import EventAttendancePage from './pages/EventAttendance';
import ReportsPage from './pages/Reports';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<div>Dashboard Page</div>} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/attendance/:eventId" element={<EventAttendancePage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
