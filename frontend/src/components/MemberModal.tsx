import React, { useState, useEffect } from 'react';

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

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Omit<Member, 'id'>) => void;
  member: Member | null;
}

const MemberModal: React.FC<MemberModalProps> = ({ isOpen, onClose, onSave, member }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    soul_type: 'contact',
    evangelism_type: 'Street',
    department: 'None',
    completed_membership: false,
    completed_new_believers: false,
    is_baptised: false,
    completed_spiritual_maturity: false,
    first_attendance_date: new Date().toISOString().split('T')[0],
    last_attendance_date: new Date().toISOString().split('T')[0],
    soul_winner: '',
    address: '',
    point_of_contact: '',
  });

  useEffect(() => {
    if (member) {
      setFormData({
        ...member,
        first_attendance_date: new Date(member.first_attendance_date).toISOString().split('T')[0],
        last_attendance_date: new Date(member.last_attendance_date).toISOString().split('T')[0],
      });
    } else {
      // Reset to default for new member
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        soul_type: 'contact',
        evangelism_type: 'Street',
        department: 'None',
        completed_membership: false,
        completed_new_believers: false,
        is_baptised: false,
        completed_spiritual_maturity: false,
        first_attendance_date: new Date().toISOString().split('T')[0],
        last_attendance_date: new Date().toISOString().split('T')[0],
        soul_winner: '',
        address: '',
        point_of_contact: '',
      });
    }
  }, [member]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    const payload = {
        ...formData,
        first_attendance_date: new Date(formData.first_attendance_date).toISOString(),
        last_attendance_date: new Date(formData.last_attendance_date).toISOString(),
    };
    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div>
      <div>
        <h3>{member ? 'Edit Member' : 'Create Member'}</h3>
        <div>
          {/* Column 1 */}
          <div>
            <div><label>First Name</label><input type="text" name="first_name" value={formData.first_name} onChange={handleChange} /></div>
            <div><label>Last Name</label><input type="text" name="last_name" value={formData.last_name} onChange={handleChange} /></div>
            <div><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} /></div>
            <div><label>Phone</label><input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} /></div>
            <div><label>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} /></div>
            <div><label>Soul Winner</label><input type="text" name="soul_winner" value={formData.soul_winner} onChange={handleChange} /></div>
            <div><label>Point of Contact</label><input type="text" name="point_of_contact" value={formData.point_of_contact} onChange={handleChange} /></div>
          </div>
          {/* Column 2 */}
          <div>
            <div><label>Soul Type</label><select name="soul_type" value={formData.soul_type} onChange={handleChange}><option value="contact">Contact</option><option value="new believer">New Believer</option></select></div>
            <div><label>Evangelism Type</label><select name="evangelism_type" value={formData.evangelism_type} onChange={handleChange}><option value="Street">Street</option><option value="Friend">Friend</option><option value="Outreach">Outreach</option></select></div>
            {member && (
              <>
                <div><label>Department</label><input type="text" name="department" value={formData.department} onChange={handleChange} /></div>
                <div><label>First Attendance</label><input type="date" name="first_attendance_date" value={formData.first_attendance_date} onChange={handleChange} /></div>
                <div><label>Last Attendance</label><input type="date" name="last_attendance_date" value={formData.last_attendance_date} onChange={handleChange} /></div>
                <div>
                    <div><input type="checkbox" name="completed_membership" checked={formData.completed_membership} onChange={handleChange} /><label>Membership</label></div>
                    <div><input type="checkbox" name="completed_new_believers" checked={formData.completed_new_believers} onChange={handleChange} /><label>New Believers</label></div>
                    <div><input type="checkbox" name="is_baptised" checked={formData.is_baptised} onChange={handleChange} /><label>Baptised</label></div>
                    <div><input type="checkbox" name="completed_spiritual_maturity" checked={formData.completed_spiritual_maturity} onChange={handleChange} /><label>Spiritual Maturity</label></div>
                </div>
              </>
            )}
          </div>
        </div>
        <div>
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default MemberModal;