import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { leaveAPI, type Leave } from '../services/LeaveService';
import { exportLeavesToCSV } from '../services/excelExport';
import { LeaveApplication } from './LeaveApplication';
import './LeaveManagement.css';
import { Download } from "lucide-react";

export const LeaveManagement: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [showApplication, setShowApplication] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await leaveAPI.getAll();
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const handleExport = () => {
    exportLeavesToCSV(leaves);
    toast.success('CSV report downloaded successfully!');
  };

  const handleStatusUpdate = async (id: string, status: Leave['status']) => {
    try {
      await leaveAPI.updateStatus(id, status);
      toast.success(`Leave ${status} successfully!`);
      fetchLeaves();
    } catch (error) {
      toast.error(`Failed to ${status} leave`);
      console.error('Error updating leave status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'warning';
    }
  };

  return (
    <div className="card leave-management">
      <div className="card-header">
        <h3>Leave Management</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleExport} className="btn-outline">
          <Download size={16} />
          Export CSV
          </button>
          <button onClick={() => setShowApplication(true)} className="btn-primary">
            Apply Leave
          </button>
        </div>
      </div>

      {showApplication && (
        <LeaveApplication
          onLeaveApplied={fetchLeaves}
          onClose={() => setShowApplication(false)}
        />
      )}

      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => (
            <tr key={leave._id}>
              <td>
                <div>
                  <div>{leave.employeeName}</div>
                  <div className="sub">{leave.employeeId}</div>
                </div>
              </td>
              <td className="pill">{leave.leaveType}</td>
              <td>{new Date(leave.startDate).toLocaleDateString()}</td>
              <td>{new Date(leave.endDate).toLocaleDateString()}</td>
              <td>
                <span className={`pill ${getStatusColor(leave.status)}`}>
                  {leave.status}
                </span>
              </td>
              <td>
                {leave.status === 'pending' && (
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleStatusUpdate(leave._id!, 'approved')}
                      className="btn-success"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(leave._id!, 'rejected')}
                      className="btn-danger"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};