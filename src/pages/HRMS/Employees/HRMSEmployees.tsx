import { useState, useEffect } from "react";
import "./hrmsemployees.css";

interface Employee {
  id: string;
  name: string;
  designation: string;
}

export function HRMSEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([
    { id: "1", name: "Animesh Mohapatra", designation: "Frontend Developer" },
    { id: "2", name: "Anyusha Panda", designation: "HR Manager" },
    { id: "3", name: "Ravi Kumar", designation: "Backend Engineer" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
  });

  const handleAddEmployee = () => {
    setEditingEmployeeId(null);
    setFormData({ name: "", designation: "" });
    setIsModalOpen(true);
  };

  const handleEditEmployee = (id: string) => {
    const employee = employees.find((emp) => emp.id === id);
    if (employee) {
      setEditingEmployeeId(id);
      setFormData({
        name: employee.name,
        designation: employee.designation,
      });
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployeeId(null);
    setFormData({ name: "", designation: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.designation.trim()) {
      if (editingEmployeeId) {
        // Update existing employee
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === editingEmployeeId
              ? {
                  ...emp,
                  name: formData.name.trim(),
                  designation: formData.designation.trim(),
                }
              : emp
          )
        );
      } else {
        // Add new employee
        const newEmployee: Employee = {
          id: (employees.length + 1).toString(),
          name: formData.name.trim(),
          designation: formData.designation.trim(),
        };
        setEmployees((prev) => [...prev, newEmployee]);
      }
      handleCloseModal();
    }
  };

  const handleViewEmployee = (id: string) => {
    // TODO: Implement view employee functionality
    console.log("View employee:", id);
  };

  return (
    <div className="hrms-employees">
      {/* Header Section */}
      <div className="employees-header">
        <h1 className="employees-title">Employees</h1>
        <button className="add-employee-btn" onClick={handleAddEmployee}>
          Add Employee
        </button>
      </div>

      {/* Employees Table */}
      <div className="employees-table-container">
        <table className="employees-table">
          <thead>
            <tr>
              <th style={{color:"white"}}>Name</th>
              <th style={{color:"white"}}>Designation</th>
              <th style={{color:"white"}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={3} className="no-employees">
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.designation}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditEmployee(employee.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="view-btn"
                        onClick={() => handleViewEmployee(employee.id)}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEmployeeId ? "Edit Employee" : "Add New Employee"}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="employee-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter employee name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="designation">Designation</label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter designation"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingEmployeeId ? "Update Employee" : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
