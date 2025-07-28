import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EventModal from '../components/EventModal';

interface ServiceEvent {
  id: string;
  type: string;
  date: string;
  location: string;
}

const AttendancePage: React.FC = () => {
  const [events, setEvents] = useState<ServiceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get<ServiceEvent[]>('/service-events');
      setEvents(response.data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) {
      setError('Failed to fetch service events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSave = async (eventData: Omit<ServiceEvent, 'id'>) => {
    try {
      await api.post('/service-events', eventData);
      fetchEvents();
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to save event');
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div>
        <h2>Service Events</h2>
        <button onClick={() => setIsModalOpen(true)}>
          Create Event
        </button>
      </div>
      <div>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Date</th>
              <th>Location / Theme</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.type}</td>
                <td>{new Date(event.date).toLocaleDateString()}</td>
                <td>{event.location}</td>
                <td>
                  <Link to={`/attendance/${event.id}`}>
                    Mark Attendance
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default AttendancePage;