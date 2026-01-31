import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { holidayAPI, Holiday } from '../services/api';
import { exportHolidaysToCSV } from '../services/excelExport';
import '../styles/HolidayManagement.css';
import { Download } from "lucide-react";

export const HolidayManagement: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    type: 'public' as Holiday['type']
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await holidayAPI.getAll();
      setHolidays(response.data);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  const handleExport = () => {
    exportHolidaysToCSV(holidays);
    toast.success('CSV report downloaded successfully!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await holidayAPI.create(formData);
      toast.success('Holiday added successfully!');
      fetchHolidays();
      setShowForm(false);
      setFormData({ name: '', date: '', description: '', type: 'public' });
    } catch (error) {
      toast.error('Failed to add holiday');
      console.error('Error adding holiday:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await holidayAPI.delete(id);
      toast.success('Holiday deleted successfully!');
      fetchHolidays();
    } catch (error) {
      toast.error('Failed to delete holiday');
      console.error('Error deleting holiday:', error);
    }
  };

  return (
    <div className="card holiday-management">
      <div className="card-header">
        <h3>Holiday Management</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleExport} className="btn-outline">

            <Download size={16} />
            Export Report
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Add Holiday
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Holiday</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-content">
                <div className="form-group">
                  <label>Holiday Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Holiday['type'] })}
                  >
                    <option value="public">Public</option>
                    <option value="company">Company</option>
                    <option value="optional">Optional</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit">Add Holiday</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {holidays.map((holiday) => (
            <tr key={holiday._id}>
              <td>{holiday.name}</td>
              <td>{new Date(holiday.date).toLocaleDateString()}</td>
              <td className="pill">{holiday.type}</td>
              <td>
                <button onClick={() => handleDelete(holiday._id!)} className="btn-danger">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};