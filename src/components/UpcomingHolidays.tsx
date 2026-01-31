import { useState, useEffect } from 'react';
import { PlusCircle, CalendarPlus } from "lucide-react";
import { holidayAPI, type Holiday } from '../services/LeaveService';
import FullCalendar from './FullCalendar';
import './LeaveManagement.css';

interface UpcomingHolidaysProps {
  onApplyLeave: () => void;
  onAddHoliday: () => void;
}

const UpcomingHolidays = ({ onApplyLeave, onAddHoliday }: UpcomingHolidaysProps) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [allHolidays, setAllHolidays] = useState<Holiday[]>([]);
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await holidayAPI.getAll();
      setAllHolidays(response.data);
      const today = new Date();
      const upcomingHolidays = response.data
        .filter(holiday => new Date(holiday.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
      setHolidays(upcomingHolidays);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                       'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return {
      month: monthNames[date.getMonth()],
      day: date.getDate().toString().padStart(2, '0'),
      dayName: dayNames[date.getDay()]
    };
  };

  return (
    <div className="card upcoming-holidays">
      <h3>Upcoming Holidays</h3>

      {holidays.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
          No upcoming holidays
        </div>
      ) : (
        holidays.map((holiday) => {
          const dateInfo = formatDate(holiday.date);
          return (
            <div key={holiday._id} className="holiday">
              <div className="date">{dateInfo.month}<br/>{dateInfo.day}</div>
              <div>
                <strong>{holiday.name}</strong>
                <div className="sub">{dateInfo.dayName} · {holiday.type}</div>
              </div>
            </div>
          );
        })
      )}

      <div className="view-link" onClick={() => setShowFullCalendar(true)}>View full calendar</div>
      
      <div className="holiday-actions">
        <button className="primary" onClick={onApplyLeave}>
          <PlusCircle size={18} />
          Apply Leave
        </button>
        <button className="secondary" onClick={onAddHoliday}>
          <CalendarPlus size={18} />
          Add Holiday
        </button>
      </div>
      
      {showFullCalendar && (
        <div className="calendar-modal-overlay" onClick={() => setShowFullCalendar(false)}>
          <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="calendar-modal-header">
              <h2>Holiday Calendar</h2>
              <button className="close-btn" onClick={() => setShowFullCalendar(false)}>×</button>
            </div>
            <div className="full-calendar">
              <FullCalendar holidays={allHolidays} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingHolidays;