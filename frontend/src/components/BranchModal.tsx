import React, { useState, useEffect } from 'react';

interface Branch {
  id?: string;
  name: string;
  region: string;
  location: string;
}

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (branch: Branch) => void;
  branch: Branch | null;
}

const BranchModal: React.FC<BranchModalProps> = ({ isOpen, onClose, onSave, branch }) => {
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (branch) {
      setName(branch.name);
      setRegion(branch.region);
      setLocation(branch.location);
    } else {
      setName('');
      setRegion('');
      setLocation('');
    }
  }, [branch]);

  const handleSave = () => {
    const newBranch: Branch = {
      id: branch?.id,
      name,
      region,
      location,
    };
    onSave(newBranch);
  };

  if (!isOpen) return null;

  return (
    <div>
      <div>
        <h3>{branch ? 'Edit Branch' : 'Create Branch'}</h3>
        <div>
          <div>
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>Region</label>
            <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} />
          </div>
          <div>
            <label>Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>
        <div>
          <button onClick={handleSave}>
            Save
          </button>
          <button onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchModal;