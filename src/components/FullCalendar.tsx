import { useState, useEffect } from 'react';
import { holidayAPI, type Holiday } from '../services/LeaveService';
import "./app.css"

interface FullCalendarProps {
  holidays: Holiday[];
}

const FullCalendar = ({ holidays }: FullCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getHolidayName = (date: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
    const holiday = holidays.find(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.toDateString() === checkDate.toDateString();
    });
    return holiday ? holiday.name : null;
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate.getDate(), isCurrentMonth: false });
    }
    
    for (let date = 1; date <= daysInMonth; date++) {
      days.push({ date, isCurrentMonth: true });
    }
    
    return days;
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="full-calendar-view">
      <div className="calendar-nav">
        <span className="nav-btn" onClick={() => navigateMonth(-1)}>‹</span>
        <span className="month">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <span className="nav-btn" onClick={() => navigateMonth(1)}>›</span>
      </div>

      <div className="calendar-grid">
        {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
          <div key={d} className="day-name">{d}</div>
        ))}

        {getDaysInMonth().map((day, index) => {
          const holidayName = day.isCurrentMonth ? getHolidayName(day.date) : null;
          return (
            <div 
              key={index} 
              className={`day ${
                !day.isCurrentMonth ? 'muted' : 
                holidayName ? 'holiday' : 
                day.date === new Date().getDate() && 
                currentDate.getMonth() === new Date().getMonth() && 
                currentDate.getFullYear() === new Date().getFullYear() ? 'selected' : ''
              }`}
            >
              <span className="day-number">{day.date}</span>
              {holidayName && <span className="holiday-name">{holidayName}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FullCalendar;