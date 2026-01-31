import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { leaveAPI, type Leave } from '../services/LeaveService';
import { getEmployeeByCode } from '../services/employeeService'; 
import './app.css';

interface LeaveApplicationProps {
  onLeaveApplied: () => void;
  onClose: () => void;
}

export const LeaveApplication: React.FC<LeaveApplicationProps> = ({ onLeaveApplied, onClose }) => {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    leaveType: 'vacation' as Leave['leaveType'],
    startDate: '',
    endDate: '',
    reason: '',
    status: 'pending' as Leave['status']
  });

  const handleEmployeeIdKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter' && formData.employeeId) {
      e.preventDefault();
      try {
        const response = await getEmployeeByCode(formData.employeeId);
        setFormData({ ...formData, employeeName: response.employeeName });
        toast.success('Employee found!');
      } catch (error) {
        toast.error('Employee not found');
        setFormData({ ...formData, employeeName: '' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (startDate <= today) {
      toast.error('Leave start date must be scheduled for a future date');
      return;
    }
    
    if (endDate <= startDate) {
      toast.error('Leave end date must be later than the start date');
      return;
    }
    
    try {
      await leaveAPI.create(formData);
      toast.success('Leave application submitted successfully!');
      onLeaveApplied();
      onClose();
    } catch (error) {
      toast.error('Failed to submit leave application');
      console.error('Error applying leave:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Apply for Leave</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-content">
            <div className="form-group">
              <label>Employee ID</label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) =>
                  setFormData({ ...formData, employeeId: e.target.value })
                }
                onKeyDown={handleEmployeeIdKeyDown}
                placeholder="Enter Employee ID and press Enter"
                required
              />
            </div>

            <div className="form-group">
              <label>Employee Name</label>
              <input
                type="text"
                value={formData.employeeName}
                readOnly
                required
              />
            </div>

            <div className="form-group">
              <label>Leave Type</label>
              <select
                value={formData.leaveType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    leaveType: e.target.value as Leave['leaveType']
                  })
                }
              >
                <option value="vacation">Vacation</option>
                <option value="sick">Sick</option>
                <option value="personal">Personal</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Apply Leave</button>
          </div>
        </form>
      </div>
    </div>
  );
};
