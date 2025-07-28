import React, { useEffect, useState } from "react";
import api from "../services/api";
import MemberModal from "../components/MemberModal";

interface Member {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  soul_type: string;
  evangelism_type: string;
  department: string;
  completed_membership: boolean;
  completed_new_believers: boolean;
  is_baptised: boolean;
  completed_spiritual_maturity: boolean;
  first_attendance_date: string;
  last_attendance_date: string;
  soul_winner: string;
  address: string;
  point_of_contact: string;
}

const MembersPage: React.FC = () => {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [filters, setFilters] = useState({
    name: "",
    department: "",
    soul_type: "",
    is_baptised: "any",
    completed_membership: "any",
    completed_new_believers: "any",
    completed_spiritual_maturity: "any",
  });

  const fetchData = async (resetData = true) => {
    setLoading(true);
    setError(null);
    try {
      // Convert filters to search parameters
      const searchParams: Record<string, string> = {};
      
      if (filters.name) {
        searchParams.searchTerm = filters.name;
      }
      
      // Add other filters as needed
      if (filters.department) searchParams.department = filters.department;
      if (filters.soul_type) searchParams.soul_type = filters.soul_type;
      if (filters.is_baptised !== 'any') searchParams.is_baptised = filters.is_baptised;
      if (filters.completed_membership !== 'any') searchParams.completed_membership = filters.completed_membership;
      if (filters.completed_new_believers !== 'any') searchParams.completed_new_believers = filters.completed_new_believers;
      if (filters.completed_spiritual_maturity !== 'any') searchParams.completed_spiritual_maturity = filters.completed_spiritual_maturity;
      
      // Add pagination
      searchParams.page = resetData ? '1' : page.toString();
      searchParams.pageSize = '50'; // Fetch 50 records at a time
      
      const membersResponse = await api.get<{
        data: Member[];
        page: number;
        pageSize: number;
        hasMore: boolean;
      }>("/members", { params: searchParams });
      
      if (resetData) {
        setAllMembers(membersResponse.data.data);
        setPage(1);
      } else {
        setAllMembers(prev => [...prev, ...membersResponse.data.data]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(membersResponse.data.hasMore);
    } catch (err) {
      setError("Failed to fetch data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // We're now using server-side filtering, so we don't need the client-side filtering
  const filteredMembers = allMembers;

  const handleSave = async (memberData: Omit<Member, "id">) => {
    try {
      const memberId = selectedMember?.id;
      if (memberId) {
        await api.put(`/members/${memberId}`, memberData);
      } else {
        await api.post("/members", memberData);
      }
      fetchData();
      setIsModalOpen(false);
      setSelectedMember(null);
    } catch (err) {
      setError("Failed to save member");
      console.error(err);
    }
  };

  const handleCreate = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleApplyFilters = () => {
    fetchData(true); // Reset data when applying filters
  };
  
  const loadMoreMembers = () => {
    fetchData(false); // Don't reset data when loading more
  };

  return (
    <div>
      <div>
        <h2>Members</h2>
        <button onClick={handleCreate}>
          Create Member
        </button>
      </div>

      {/* Filter Section */}
      <div>
        <h3>Filters</h3>
        <div>
          <input
            type="text"
            name="name"
            placeholder="Search by name..."
            value={filters.name}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="department"
            placeholder="Filter by department..."
            value={filters.department}
            onChange={handleFilterChange}
          />
          <select
            name="soul_type"
            value={filters.soul_type}
            onChange={handleFilterChange}
          >
            <option value="">All Soul Types</option>
            <option value="contact">Contact</option>
            <option value="new believer">New Believer</option>
          </select>
          <select
            name="is_baptised"
            value={filters.is_baptised}
            onChange={handleFilterChange}
          >
            <option value="any">Baptised (Any)</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <select
            name="completed_membership"
            value={filters.completed_membership}
            onChange={handleFilterChange}
          >
            <option value="any">Membership (Any)</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <select
            name="completed_new_believers"
            value={filters.completed_new_believers}
            onChange={handleFilterChange}
          >
            <option value="any">New Believers (Any)</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <select
            name="completed_spiritual_maturity"
            value={filters.completed_spiritual_maturity}
            onChange={handleFilterChange}
          >
            <option value="any">Spiritual Maturity (Any)</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <button onClick={handleApplyFilters}>
          Apply Filters
        </button>
      </div>

      {error && <div>{error}</div>}

      <div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Department</th>
                <th>Soul Type</th>
                <th>Evangelism</th>
                <th>Soul Winner</th>
                <th>Contact Person</th>
                <th>First Attendance</th>
                <th>Last Attendance</th>
                <th>Membership</th>
                <th>New Believers</th>
                <th>Baptised</th>
                <th>Spiritual Maturity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td>{member.first_name}</td>
                  <td>{member.last_name}</td>
                  <td>{member.email}</td>
                  <td>{member.phone_number}</td>
                  <td>{member.address}</td>
                  <td>{member.department}</td>
                  <td>{member.soul_type}</td>
                  <td>{member.evangelism_type}</td>
                  <td>{member.soul_winner}</td>
                  <td>{member.point_of_contact}</td>
                  <td>
                    {new Date(
                      member.first_attendance_date
                    ).toLocaleDateString()}
                  </td>
                  <td>
                    {new Date(member.last_attendance_date).toLocaleDateString()}
                  </td>
                  <td>
                    {member.completed_membership ? "Yes" : "No"}
                  </td>
                  <td>
                    {member.completed_new_believers ? "Yes" : "No"}
                  </td>
                  <td>
                    {member.is_baptised ? "Yes" : "No"}
                  </td>
                  <td>
                    {member.completed_spiritual_maturity ? "Yes" : "No"}
                  </td>
                  <td>
                    <button onClick={() => handleEdit(member)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {hasMore && !loading && (
          <div>
            <button onClick={loadMoreMembers}>
              Load More
            </button>
          </div>
        )}
      </div>
      <MemberModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMember(null);
        }}
        onSave={handleSave}
        member={selectedMember}
      />
    </div>
  );
};

export default MembersPage;
