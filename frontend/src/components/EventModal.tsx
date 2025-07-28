import React, { useState } from 'react';

interface ServiceEvent {
  id?: string;
  type: string;
  date: string;
  location: string;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<ServiceEvent, 'id'>) => void;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave }) => {
  const [type, setType] = useState('sunday');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');

  const handleSave = () => {
    if (!location) {
      alert('Please fill out all fields.');
      return;
    }
    const newEvent = { type, date, location };
    onSave(newEvent);
  };

  if (!isOpen) return null;

  return (
    <div>
      <div>
        <h3>Create Service Event</h3>
        <div>
          <div>
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="sunday">Sunday Service</option>
              <option value="midweek">Midweek Service</option>
            </select>
          </div>
          <div>
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label>Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>
        <div>
          <button onClick={handleSave}>
            Save Event
          </button>
          <button onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;