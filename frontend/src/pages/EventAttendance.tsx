import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import axios from 'axios';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  first_attendance_date: string;
  last_attendance_date: string;
  point_of_contact: string;
}

interface ServiceEvent {
  id: string;
  type: string;
  date: string;
  location: string;
}

interface AttendanceRecord {
    id: string;
    user_id: string;
    event_id: string;
}

const EventAttendancePage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [presentMembers, setPresentMembers] = useState<Set<string>>(new Set());
  const [nameFilter, setNameFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const filteredMembers = useMemo(() => {
    if (!nameFilter) {
      return allMembers;
    }
    return allMembers.filter(member =>
      `${member.first_name} ${member.last_name}`.toLowerCase().includes(nameFilter.toLowerCase())
    );
  }, [allMembers, nameFilter]);

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      try {
        setLoading(true);
        const eventResponse = await api.get<ServiceEvent>(`/service-events/${eventId}`);
        const eventData = eventResponse.data;

        if (eventData) {
          // Use the eventId to optimize the query and only fetch members for this event
          const membersResponse = await api.get<{
            data: Member[];
            page: number;
            pageSize: number;
            hasMore: boolean;
          }>(`/members`, {
            params: {
              page: '1',
              pageSize: '100',
              eventId: eventId
            }
          });
          
          setAllMembers(membersResponse.data.data);
          setPage(1);
          setHasMore(membersResponse.data.hasMore);

          try {
            const attendanceResponse = await api.get<AttendanceRecord[]>(`/attendance/${eventId}`);
            const presentIds = new Set(attendanceResponse.data.map(att => att.user_id));
            setPresentMembers(presentIds);
          } catch (attError) {
            if (axios.isAxiosError(attError) && attError.response?.status !== 404) {
              throw attError;
            }
          }
        }
      } catch (err) {
        setError('Failed to fetch page data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const handleToggleAttendance = async (memberId: string) => {
    if (!eventId) return;

    const isPresent = presentMembers.has(memberId);

    if (isPresent) {
      // Logic to unmark attendance can be added here if needed
      console.log("Member is already marked as present.");
      return;
    }

    try {
      setPresentMembers(prev => new Set(prev).add(memberId));
      await api.post(`/attendance?user_id=${memberId}&event_id=${eventId}`);
    } catch (err) {
      setPresentMembers(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
      alert('Failed to mark attendance.');
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const loadMoreMembers = async () => {
    if (!eventId || !hasMore) return;
    
    try {
      setLoading(true);
      const nextPage = page + 1;
      
      const membersResponse = await api.get<{
        data: Member[];
        page: number;
        pageSize: number;
        hasMore: boolean;
      }>(`/members`, {
        params: {
          page: nextPage.toString(),
          pageSize: '100',
          eventId: eventId
        }
      });
      
      setAllMembers(prev => [...prev, ...membersResponse.data.data]);
      setPage(nextPage);
      setHasMore(membersResponse.data.hasMore);
    } catch (err) {
      console.error('Failed to load more members', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      const membersResponse = await api.get<{
        data: Member[];
        page: number;
        pageSize: number;
        hasMore: boolean;
      }>(`/members`, {
        params: {
          page: '1',
          pageSize: '100',
          searchTerm: nameFilter,
          eventId: eventId
        }
      });
      
      setAllMembers(membersResponse.data.data);
      setPage(1);
      setHasMore(membersResponse.data.hasMore);
    } catch (err) {
      console.error('Failed to search members', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h2>
          Chatham Admin Service Attendance Register
        </h2>
        <button onClick={() => alert('Exporting...')}>
          Export
        </button>
      </div>
      <div>
          <input
            type="text"
            placeholder="Search by name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
      </div>
      <div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>First Attended</th>
              <th>Last Attended</th>
              <th>Phone</th>
              <th>Church Contact</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member.id}>
                <td>{`${member.first_name} ${member.last_name}`}</td>
                <td>{new Date(member.first_attendance_date).toLocaleDateString()}</td>
                <td>{new Date(member.last_attendance_date).toLocaleDateString()}</td>
                <td>{member.phone_number}</td>
                <td>{member.point_of_contact}</td>
                <td>
                  <button
                    onClick={() => handleToggleAttendance(member.id)}
                    disabled={presentMembers.has(member.id)}
                  >
                    {presentMembers.has(member.id) ? 'Present' : 'Mark Attendance'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <div>
          <button onClick={loadMoreMembers} disabled={loading}>
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default EventAttendancePage;