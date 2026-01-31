import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { leaveAPI, holidayAPI } from '../../../services/LeaveService';
import StatCard from '../../../components/StatCard';
import PendingTable from '../../../components/PendingTable';
import CalendarCard from '../../../components/CalenderCard';
import UpcomingHolidays from '../../../components/UpcomingHolidays';
import { LeaveApplication } from '../../../components/LeaveApplication';
import './LeavesHolidays.css';
import '../../../components/StatCard.css';

const LeavesHolidays = () => {
  const [showLeaveApplication, setShowLeaveApplication] = useState(false);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [userRole] = useState('admin'); // For demo: 'admin' or 'user'
  const [currentEmployeeId] = useState('EMP001'); // For demo: current user's employee ID
  const [leaveStats, setLeaveStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [holidayData, setHolidayData] = useState({
    name: '',
    date: '',
    description: '',
    type: 'public' as 'public' | 'company' | 'optional'
  });

  useEffect(() => {
    fetchLeaveStats();
  }, []);

  const fetchLeaveStats = async () => {
    try {
      const response = await leaveAPI.getAll();
      let leaves = response.data;
      
      // Filter data based on user role
      if (userRole === 'user') {
        leaves = leaves.filter(leave => leave.employeeId === currentEmployeeId);
      }
      
      setLeaveStats({
        total: leaves.length,
        approved: leaves.filter(leave => leave.status === 'approved').length,
        pending: leaves.filter(leave => leave.status === 'pending').length,
        rejected: leaves.filter(leave => leave.status === 'rejected').length
      });
    } catch (error) {
      console.error('Error fetching leave stats:', error);
    }
  };

  const handleHolidaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await holidayAPI.create(holidayData);
      toast.success('Holiday added successfully!');
      setHolidayData({ name: '', date: '', description: '', type: 'public' });
      setShowHolidayForm(false);
    } catch (error) {
      toast.error('Failed to add holiday');
    }
  };

  const handleLeaveApplied = () => {
    setShowLeaveApplication(false);
    fetchLeaveStats(); // Refresh stats after new leave
  };

  return (
    <div className="content dashboard">
      <div className="stats">
        <StatCard 
          title={userRole === 'admin' ? 'Total Leaves' : 'My Total Leaves'} 
          value={leaveStats.total.toString()} 
          change="+0%" 
          type="success" 
        />
        <StatCard 
          title={userRole === 'admin' ? 'Approved' : 'My Approved'} 
          value={leaveStats.approved.toString()} 
          change="+0%" 
          type="success" 
        />
        <StatCard 
          title={userRole === 'admin' ? 'Pending' : 'My Pending'} 
          value={leaveStats.pending.toString()} 
          change="+0%" 
          type="warning" 
        />
        <StatCard 
          title={userRole === 'admin' ? 'Rejected' : 'My Rejected'} 
          value={leaveStats.rejected.toString()} 
          change="+0%" 
          type="danger" 
        />
      </div>
      <div className="grid">
        <PendingTable onLeaveStatusChanged={fetchLeaveStats} />
        <div>
          <CalendarCard />
          <UpcomingHolidays 
            onApplyLeave={() => setShowLeaveApplication(true)}
            onAddHoliday={() => setShowHolidayForm(true)}
          />
        </div>
      </div>
      
      {showLeaveApplication && (
        <LeaveApplication
          onLeaveApplied={handleLeaveApplied}
          onClose={() => setShowLeaveApplication(false)}
        />
      )}
      
      {showHolidayForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Holiday</h2>
            <form onSubmit={handleHolidaySubmit}>
              <div className="form-content">
                <div className="form-group">
                  <label>Holiday Name</label>
                  <input 
                    type="text" 
                    value={holidayData.name}
                    onChange={(e) => setHolidayData({...holidayData, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    value={holidayData.date}
                    onChange={(e) => setHolidayData({...holidayData, date: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input 
                    type="text" 
                    value={holidayData.description}
                    onChange={(e) => setHolidayData({...holidayData, description: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={holidayData.type}
                    onChange={(e) => setHolidayData({...holidayData, type: e.target.value as 'public' | 'company' | 'optional'})}
                  >
                    <option value="public">Public</option>
                    <option value="company">Company</option>
                    <option value="optional">Optional</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowHolidayForm(false)}>Cancel</button>
                <button type="submit">Add Holiday</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default LeavesHolidays;