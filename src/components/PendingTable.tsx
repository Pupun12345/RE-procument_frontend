import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { leaveAPI, type Leave } from '../services/LeaveService';
import { useAuthStore } from '../store/authStore';
import './app.css';

interface PendingTableProps {
  onLeaveStatusChanged?: () => void;
}

const PendingTable = ({ onLeaveStatusChanged }: PendingTableProps) => {
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const { role } = useAuthStore();
  const isAdmin = role === 'admin';

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      const response = await leaveAPI.getAll();
      setPendingLeaves(response.data);
    } catch (error) {
      console.error('Error fetching pending leaves:', error);
    }
  };

  const handleStatusUpdate = async (id: string, status: Leave['status']) => {
    try {
      await leaveAPI.updateStatus(id, status);
      toast.success(`Leave ${status} successfully!`);
      fetchPendingLeaves();
      // Notify parent component to refresh stats
      if (onLeaveStatusChanged) {
        onLeaveStatusChanged();
      }
    } catch (error) {
      toast.error(`Failed to ${status} leave`);
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getStatusBadgeClass = (status: Leave['status']) => {
    switch (status) {
      case 'approved':
        return 'status-badge status-approved';
      case 'rejected':
        return 'status-badge status-rejected';
      case 'pending':
        return 'status-badge status-pending';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Pending Leave Requests</h3>
        <span className="link" onClick={() => setShowFullScreen(true)}>View all</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Type</th>
            <th>Dates</th>
            <th>Days</th>
            <th>Status</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {pendingLeaves.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                No leave requests
              </td>
            </tr>
          ) : (
            pendingLeaves.map((leave) => (
              <tr key={leave._id}>
                <td>
                  <div>
                    <strong>{leave.employeeName}</strong>
                    <div className="sub">{leave.employeeId}</div>
                  </div>
                </td>
                <td><span className="pill">{leave.leaveType}</span></td>
                <td>
                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                </td>
                <td>{calculateDays(leave.startDate, leave.endDate)}</td>
                <td><span className={getStatusBadgeClass(leave.status)}>{leave.status}</span></td>
                {isAdmin && (
                  <td>
                    <div className="action-buttons">
                      {leave.status === 'pending' && (
                        <>
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
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showFullScreen && (
        <div className="modal-overlay" onClick={() => setShowFullScreen(false)}>
          <div className="modal" style={{ width: '95vw', height: '95vh', padding: '40px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>All Leave Requests</h2>
              <button className="close-btn" onClick={() => setShowFullScreen(false)}>×</button>
            </div>
            <div className="modal-content">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Status</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {pendingLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                        No leave requests
                      </td>
                    </tr>
                  ) : (
                    pendingLeaves.map((leave) => (
                      <tr key={leave._id}>
                        <td>
                          <div>
                            <strong>{leave.employeeName}</strong>
                            <div className="sub">{leave.employeeId}</div>
                          </div>
                        </td>
                        <td><span className="pill">{leave.leaveType}</span></td>
                        <td>
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td>{calculateDays(leave.startDate, leave.endDate)}</td>
                        <td><span className={getStatusBadgeClass(leave.status)}>{leave.status}</span></td>
                        {isAdmin && (
                          <td>
                            <div className="action-buttons">
                              {leave.status === 'pending' && (
                                <>
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
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingTable;