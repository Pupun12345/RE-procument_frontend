import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./hrmsemployees.css";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  type Employee as EmployeeType,
} from "../../../services/employeeService";

interface Employee {
  _id: string;
  employeeCode: string;
  name: string;
  designation: string;
  employeePhoto?: string;
}

export function HRMSEmployees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeType | null>(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    employeeCode: "",
    designation: "",
    emailId: "",
    mobileNumber: "",
    panCardNumber: "",
    aadharCardNumber: "",
    safetyPassNumber: "",
    emergencyContactNumber: "",
    dateOfJoining: "",
    dateOfBirth: "",
    fatherName: "",
    fatherContactNumber: "",
    bankName: "",
    bankAccountNumber: "",
    bankIfscCode: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployees();
      // Transform backend data to match our interface
      const transformedData = data.map((emp: EmployeeType) => ({
        _id: emp._id,
        employeeCode: emp.employeeCode,
        name: emp.employeeName,
        designation: emp.designation || "N/A",
        employeePhoto: emp.employeePhoto,
      }));
      setEmployees(transformedData);
    } catch (err: any) {
      console.error("Error fetching employees:", err);
      setError(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    // Navigate to Employee Registration form
    navigate("/dashboard/registration/employee");
  };

  const handleEditEmployee = async (id: string) => {
    try {
      const data = await getEmployees();
      const employee = data.find((emp: EmployeeType) => emp._id === id);
      if (employee) {
        setEditingEmployeeId(id);
        setFormData({
          name: employee.employeeName,
          employeeCode: employee.employeeCode,
          designation: employee.designation || "",
          emailId: employee.emailId || "",
          mobileNumber: employee.mobileNumber || "",
          panCardNumber: employee.panCardNumber || "",
          aadharCardNumber: employee.aadharCardNumber || "",
          safetyPassNumber: employee.safetyPassNumber || "",
          emergencyContactNumber: employee.emergencyContactNumber || "",
          dateOfJoining: employee.dateOfJoining ? new Date(employee.dateOfJoining).toISOString().split('T')[0] : "",
          dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : "",
          fatherName: employee.fatherName || "",
          fatherContactNumber: employee.fatherContactNumber || "",
          bankName: employee.bankName || "",
          bankAccountNumber: employee.bankAccountNumber || "",
          bankIfscCode: employee.bankIfscCode || "",
          address: employee.address || "",
        });
        setIsModalOpen(true);
      }
    } catch (err: any) {
      console.error("Error fetching employee details:", err);
      alert("Failed to load employee details");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployeeId(null);
    setFormData({
      name: "",
      employeeCode: "",
      designation: "",
      emailId: "",
      mobileNumber: "",
      panCardNumber: "",
      aadharCardNumber: "",
      safetyPassNumber: "",
      emergencyContactNumber: "",
      dateOfJoining: "",
      dateOfBirth: "",
      fatherName: "",
      fatherContactNumber: "",
      bankName: "",
      bankAccountNumber: "",
      bankIfscCode: "",
      address: "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Employee name is required");
      return;
    }
    if (!editingEmployeeId && !formData.employeeCode.trim()) {
      alert("Employee code is required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (editingEmployeeId) {
        // Update existing employee with all fields
        const employeeData = {
          employeeName: formData.name.trim(),
          employeeCode: formData.employeeCode.trim(),
          designation: formData.designation.trim(),
          emailId: formData.emailId.trim(),
          mobileNumber: formData.mobileNumber.trim(),
          panCardNumber: formData.panCardNumber.trim(),
          aadharCardNumber: formData.aadharCardNumber.trim(),
          safetyPassNumber: formData.safetyPassNumber.trim(),
          emergencyContactNumber: formData.emergencyContactNumber.trim(),
          dateOfJoining: formData.dateOfJoining,
          dateOfBirth: formData.dateOfBirth,
          fatherName: formData.fatherName.trim(),
          fatherContactNumber: formData.fatherContactNumber.trim(),
          bankName: formData.bankName.trim(),
          bankAccountNumber: formData.bankAccountNumber.trim(),
          bankIfscCode: formData.bankIfscCode.trim(),
          address: formData.address.trim(),
        };
        await updateEmployee(editingEmployeeId, employeeData);
      } else {
        // Add new employee - generate unique code and provide required fields
        const employeeCode = `EMP${Date.now()}`;
        const employeeData = {
          employeeName: formData.name.trim(),
          employeeCode: employeeCode,
          designation: formData.designation.trim(),
          emailId: `${formData.name.toLowerCase().replace(/\s+/g, ".")}@company.com`,
          mobileNumber: "0000000000",
          dateOfJoining: new Date().toISOString().split('T')[0],
          address: "N/A",
        };
        await addEmployee(employeeData);
      }

      // Refresh the employee list
      await fetchEmployees();
      handleCloseModal();
    } catch (err: any) {
      console.error("Error saving employee:", err);
      setError(err.message || "Failed to save employee");
      alert(err.message || "Failed to save employee. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewEmployee = async (id: string) => {
    try {
      setError(null);
      const data = await getEmployees();
      const employee = data.find((emp: EmployeeType) => emp._id === id);
      if (employee) {
        setSelectedEmployee(employee);
        setIsViewModalOpen(true);
      } else {
        alert("Employee not found");
      }
    } catch (err: any) {
      console.error("Error fetching employee details:", err);
      alert("Failed to load employee details: " + (err.message || "Unknown error"));
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete employee "${name}"? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    try {
      setError(null);
      await deleteEmployee(id);
      // Refresh the employee list
      await fetchEmployees();
      alert("Employee deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting employee:", err);
      setError(err.message || "Failed to delete employee");
      alert("Failed to delete employee: " + (err.message || "Unknown error"));
    }
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
        {loading ? (
          <div className="loading-state">Loading employees...</div>
        ) : error ? (
          <div className="error-state">
            <p>Error: {error}</p>
            <button onClick={fetchEmployees} className="retry-btn">
              Retry
            </button>
          </div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th style={{color:"white"}}>Employee Code</th>
                <th style={{color:"white"}}>Name</th>
                <th style={{color:"white"}}>Designation</th>
                <th style={{color:"white"}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="no-employees">
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee._id}>
                    <td>{employee.employeeCode}</td>
                    <td>
                      <div className="name-with-photo">
                        <div className="table-profile-container">
                          {employee.employeePhoto ? (
                            <>
                              <img 
                                src={`http://localhost:4000${employee.employeePhoto}`}
                                alt={employee.name}
                                className="table-profile-picture"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const placeholder = document.createElement('div');
                                    placeholder.className = 'table-profile-placeholder';
                                    const initials = employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                    placeholder.innerHTML = `<span class="table-initials">${initials}</span>`;
                                    parent.appendChild(placeholder);
                                  }
                                }}
                              />
                            </>
                          ) : (
                            <div className="table-profile-placeholder">
                              <span className="table-initials">
                                {employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="employee-name-text">{employee.name}</span>
                      </div>
                    </td>
                    <td>{employee.designation}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditEmployee(employee._id)}
                        >
                          Edit
                        </button>
                        <button
                          className="view-btn"
                          onClick={() => handleViewEmployee(employee._id)}
                        >
                          View
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteEmployee(employee._id, employee.name)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
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
                <label htmlFor="name">Employee Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                  placeholder="Enter employee name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="employeeCode">Employee Code *</label>
                <input
                  type="text"
                  id="employeeCode"
                  name="employeeCode"
                  value={formData.employeeCode}
                  onChange={handleInputChange}
                  required
                  disabled={submitting || editingEmployeeId !== null}
                  placeholder="Enter employee code"
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
                  disabled={submitting}
                  placeholder="Enter designation"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emailId">Email</label>
                <input
                  type="email"
                  id="emailId"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleInputChange}
                  disabled={submitting}
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="mobileNumber">Mobile Number</label>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  disabled={submitting}
                  placeholder="Enter mobile number"
                  maxLength={10}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateOfJoining">Date of Joining</label>
                <input
                  type="date"
                  id="dateOfJoining"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="panCardNumber">PAN Card Number</label>
                <input
                  type="text"
                  id="panCardNumber"
                  name="panCardNumber"
                  value={formData.panCardNumber}
                  onChange={handleInputChange}
                  disabled={submitting}
                  placeholder="Enter PAN card number"
                  maxLength={10}
                />
              </div>

              <div className="form-group">
                <label htmlFor="aadharCardNumber">Aadhar Card Number</label>
                <input
                  type="text"
                  id="aadharCardNumber"
                  name="aadharCardNumber"
                  value={formData.aadharCardNumber}
                  onChange={handleInputChange}
                  disabled={submitting}
                  placeholder="Enter Aadhar card number"
                  maxLength={12}
                />
              </div>

              <div className="form-group">
                <label htmlFor="safetyPassNumber">Safety Pass Number</label>
                <input
                  type="text"
                  id="safetyPassNumber"
                  name="safetyPassNumber"
                  value={formData.safetyPassNumber}
                  onChange={handleInputChange}
                  disabled={submitting}
                  placeholder="Enter safety pass number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergencyContactNumber">Emergency Contact</label>
                <input
                  type="tel"
                  id="emergencyContactNumber"
                  name="emergencyContactNumber"
                  value={formData.emergencyContactNumber}
                  onChange={handleInputChange}
                  disabled={submitting}
                  placeholder="Enter emergency contact"
                  maxLength={10}
                />
              </div>

              <div className="form-group">
                <label htmlFor="fatherName">Father's Name</label>
                <input
                  type="text"
                  id="fatherName"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  disabled={submitting}
                  placeholder="Enter father's name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fatherContactNumber">Father's Contact</label>
                <input
                  type="tel"
                  id="fatherContactNumber"
                  name="fatherContactNumber"
                  value={formData.fatherContactNumber}
                  onChange={handleInputChange}
                  disabled={submitting}
                  placeholder="Enter father's contact"
                  maxLength={10}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bankName">Bank Name</label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  disabled={submitting}
                  placeholder="Enter bank name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bankAccountNumber">Bank Account Number</label>
                <input
                  type="text"
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleInputChange}
                  disabled={submitting}
                  placeholder="Enter bank account number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bankIfscCode">Bank IFSC Code</label>
                <input
                  type="text"
                  id="bankIfscCode"
                  name="bankIfscCode"
                  value={formData.bankIfscCode}
                  onChange={handleInputChange}
                  disabled={submitting}
                  placeholder="Enter IFSC code"
                  maxLength={11}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange(e as any)}
                  disabled={submitting}
                  placeholder="Enter complete address"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? "Saving..." : (editingEmployeeId ? "Update Employee" : "Add Employee")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Details Modal */}
      {isViewModalOpen && selectedEmployee && (
        <div className="modal-overlay" onClick={handleCloseViewModal}>
          <div className="view-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Employee Details</h2>
              <button className="close-btn" onClick={handleCloseViewModal}>
                &times;
              </button>
            </div>
            
            {/* Profile Picture Section */}
            <div className="employee-profile-section">
              <div className="profile-picture-container">
                {selectedEmployee.employeePhoto ? (
                  <img 
                    src={`http://localhost:4000${selectedEmployee.employeePhoto}`} 
                    alt={selectedEmployee.employeeName}
                    className="profile-picture"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/150/cccccc/666666?text=No+Photo';
                    }}
                  />
                ) : (
                  <div className="profile-picture-placeholder">
                    <span className="profile-initials">
                      {selectedEmployee.employeeName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="profile-name">{selectedEmployee.employeeName}</h3>
              <p className="profile-designation">{selectedEmployee.designation || "N/A"}</p>
              <p className="profile-code">Employee Code: {selectedEmployee.employeeCode}</p>
            </div>
            
            <div className="employee-details">
              <div className="details-grid">
                <div className="detail-section">
                  <h3>Personal Information</h3>
                  <div className="detail-item">
                    <span className="detail-label">Employee Name:</span>
                    <span className="detail-value">{selectedEmployee.employeeName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Employee Code:</span>
                    <span className="detail-value">{selectedEmployee.employeeCode}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Designation:</span>
                    <span className="detail-value">{selectedEmployee.designation || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date of Birth:</span>
                    <span className="detail-value">
                      {selectedEmployee.dateOfBirth 
                        ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date of Joining:</span>
                    <span className="detail-value">
                      {selectedEmployee.dateOfJoining 
                        ? new Date(selectedEmployee.dateOfJoining).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Contact Information</h3>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedEmployee.emailId || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mobile Number:</span>
                    <span className="detail-value">{selectedEmployee.mobileNumber || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Emergency Contact:</span>
                    <span className="detail-value">{selectedEmployee.emergencyContactNumber || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">{selectedEmployee.address || "N/A"}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Family Information</h3>
                  <div className="detail-item">
                    <span className="detail-label">Father's Name:</span>
                    <span className="detail-value">{selectedEmployee.fatherName || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Father's Contact:</span>
                    <span className="detail-value">{selectedEmployee.fatherContactNumber || "N/A"}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Government IDs</h3>
                  <div className="detail-item">
                    <span className="detail-label">PAN Card Number:</span>
                    <span className="detail-value">{selectedEmployee.panCardNumber || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Aadhar Card Number:</span>
                    <span className="detail-value">{selectedEmployee.aadharCardNumber || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Safety Pass Number:</span>
                    <span className="detail-value">{selectedEmployee.safetyPassNumber || "N/A"}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Bank Details</h3>
                  <div className="detail-item">
                    <span className="detail-label">Bank Name:</span>
                    <span className="detail-value">{selectedEmployee.bankName || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Account Number:</span>
                    <span className="detail-value">{selectedEmployee.bankAccountNumber || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">IFSC Code:</span>
                    <span className="detail-value">{selectedEmployee.bankIfscCode || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
