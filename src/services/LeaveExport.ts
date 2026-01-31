import { Leave, Holiday } from './api';

const downloadCSV = (data: string, filename: string) => {
  const blob = new Blob([data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

export const exportLeavesToCSV = (leaves: Leave[]) => {
  const headers = ['Employee Name', 'Employee ID', 'Leave Type', 'Start Date', 'End Date', 'Reason', 'Status', 'Applied Date'];
  
  const csvData = [
    headers.join(','),
    ...leaves.map(leave => [
      leave.employeeName,
      leave.employeeId,
      leave.leaveType,
      formatDate(leave.startDate),
      formatDate(leave.endDate),
      `"${leave.reason}"`,
      leave.status,
      leave.appliedDate ? formatDate(leave.appliedDate) : ''
    ].join(','))
  ].join('\n');
  
  downloadCSV(csvData, `leaves-report-${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportHolidaysToCSV = (holidays: Holiday[]) => {
  const headers = ['Holiday Name', 'Date', 'Type', 'Description'];
  
  const csvData = [
    headers.join(','),
    ...holidays.map(holiday => [
      holiday.name,
      formatDate(holiday.date),
      holiday.type,
      `"${holiday.description || ''}"`
    ].join(','))
  ].join('\n');
  
  downloadCSV(csvData, `holidays-report-${new Date().toISOString().split('T')[0]}.csv`);
};