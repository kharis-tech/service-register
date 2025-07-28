import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface ServiceEvent {
  id: string;
  type: string;
  date: string;
  location: string;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
}

const ReportsPage: React.FC = () => {
  const [allEvents, setAllEvents] = useState<ServiceEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ServiceEvent[]>([]);
  
  const [presentEventId, setPresentEventId] = useState<string>('');
  const [absentEventId, setAbsentEventId] = useState<string>('');
  
  const [reportData, setReportData] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsResponse = await api.get<ServiceEvent[]>('/service-events');
        const sortedEvents = eventsResponse.data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAllEvents(sortedEvents);
        setFilteredEvents(sortedEvents);
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredEvents(allEvents);
  }, [allEvents]);

  const handleGenerateReport = async () => {
    if (!presentEventId || !absentEventId) {
      alert('Please select both a "present" and an "absent" event.');
      return;
    }
    setLoading(true);
    setError(null);
    setReportData([]);
    try {
      const response = await api.get<Member[]>(`/reports/lapsed-attendees`, {
        params: {
          present_event_id: presentEventId,
          absent_event_id: absentEventId,
        },
      });
      setReportData(response.data);
    } catch (err) {
      setError('Failed to generate report.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Reports</h2>
      <div>
        <div>
          <h3>Lapsed Attendees Report</h3>
          <p>Find members who were present for one event but absent for another.</p>
          
          <div>
            <div>
              <label>Present at Event:</label>
              <select value={presentEventId} onChange={(e) => setPresentEventId(e.target.value)}>
                <option value="" disabled>Select event</option>
                {filteredEvents.map(event => <option key={event.id} value={event.id}>{new Date(event.date).toLocaleDateString()} - {event.type} at {event.location}</option>)}
              </select>
            </div>
            <div>
              <label>Absent from Event:</label>
              <select value={absentEventId} onChange={(e) => setAbsentEventId(e.target.value)}>
                <option value="" disabled>Select event</option>
                {filteredEvents.map(event => <option key={event.id} value={event.id}>{new Date(event.date).toLocaleDateString()} - {event.type} at {event.location}</option>)}
              </select>
            </div>
          </div>
           <div>
              <button onClick={handleGenerateReport} disabled={loading || !presentEventId || !absentEventId}>
                {loading ? 'Generating...' : 'Generate'}
              </button>
            </div>

          {error && <div>{error}</div>}

          {reportData.length > 0 && (
            <div>
              <h4>Report Results ({reportData.length} members)</h4>
              <div>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((member) => (
                      <tr key={member.id}>
                        <td>{member.first_name} {member.last_name}</td>
                        <td>{member.email}</td>
                        <td>{member.phone_number}</td>
                        <td>{member.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;