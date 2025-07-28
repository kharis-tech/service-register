import React, { useEffect, useState } from 'react';
import api from '../services/api';
import BranchModal from '../components/BranchModal';

interface Branch {
  id?: string;
  name: string;
  region: string;
  location: string;
}

const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/branches');
      setBranches(response.data);
    } catch (err) {
      setError('Failed to fetch branches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSave = async (branch: Branch) => {
    try {
      if (branch.id) {
        await api.put(`/branches/${branch.id}`, branch);
      } else {
        await api.post('/branches', branch);
      }
      fetchBranches();
      setIsModalOpen(false);
      setSelectedBranch(null);
    } catch (err) {
      setError('Failed to save branch');
      console.error(err);
    }
  };

  const handleCreate = () => {
    setSelectedBranch(null);
    setIsModalOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  if (loading) return <div className="text-center text-brand-light">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold text-brand-light">Branches</h2>
        <button
          onClick={handleCreate}
          className="bg-brand-purple hover:bg-brand-maroon text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
        >
          Create Branch
        </button>
      </div>
      <div className="bg-brand-purple shadow-md rounded p-2 sm:p-4 overflow-x-auto">
        <table className="min-w-full text-sm text-brand-light">
          <thead className="bg-brand-maroon">
            <tr>
              <th className="text-left py-2 px-4">Name</th>
              <th className="text-left py-2 px-4">Region</th>
              <th className="text-left py-2 px-4">Location</th>
              <th className="text-left py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-brand-purple">
            {branches.map((branch) => (
              <tr key={branch.id} className="border-t border-brand-maroon hover:bg-brand-maroon">
                <td className="py-2 px-4">{branch.name}</td>
                <td className="py-2 px-4">{branch.region}</td>
                <td className="py-2 px-4">{branch.location}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleEdit(branch)}
                    className="text-brand-gold hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BranchModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBranch(null);
        }}
        onSave={handleSave}
        branch={selectedBranch}
      />
    </div>
  );
};

export default BranchesPage;