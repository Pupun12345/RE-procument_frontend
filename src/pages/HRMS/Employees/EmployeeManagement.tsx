import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, TrendingUp, Download } from "lucide-react";
import "./shift-management.css";
import { 
  getEmployees, 
  updateEmployeeShift, 
  bulkAssignShift, 
  getShiftStats,
  type Employee as EmployeeType 
} from "../../../services/employeeService";

interface Employee {
  _id: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  currentShift: "day" | "night";
  shiftDuration: number;
  employeePhoto?: string;
}

export function ShiftManagement() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Stats
  const [stats, setStats] = useState({
    totalDayShift: 0,
    totalNightShift: 0,
    shiftCompliance: 98.4,
  });

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, departmentFilter, searchTerm]);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      
      // Transform data with actual shift information from backend
      const transformed = data.map((emp) => ({
        _id: emp._id,
        employeeCode: emp.employeeCode,
        employeeName: emp.employeeName,
        designation: emp.designation || "Staff",
        currentShift: emp.currentShift || "day" as "day" | "night",
        shiftDuration: emp.shiftDuration || 8,
        employeePhoto: emp.employeePhoto,
      }));

      setEmployees(transformed);
      // Fetch stats from backend
      fetchShiftStats();
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchShiftStats = async () => {
    try {
      const statsData = await getShiftStats();
      setStats({
        totalDayShift: statsData.totalDayShift,
        totalNightShift: statsData.totalNightShift,
        shiftCompliance: statsData.shiftCompliance,
      });
    } catch (error) {
      console.error("Error fetching shift stats:", error);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...employees];

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((emp) =>
        emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply department filter
    if (departmentFilter !== "All Departments") {
      filtered = filtered.filter((emp) => emp.designation === departmentFilter);
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [employees, departmentFilter, searchTerm]);

  const handleShiftChange = (employeeId: string, newShift: "day" | "night") => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp._id === employeeId ? { ...emp, currentShift: newShift } : emp
      )
    );
  };

  const handleUpdateShift = async (employeeId: string) => {
    try {
      const employee = employees.find(emp => emp._id === employeeId);
      if (!employee) return;

      await updateEmployeeShift(employeeId, employee.currentShift, employee.shiftDuration);
      alert(`Shift updated successfully for employee ${employee.employeeName}`);
      fetchShiftStats();
    } catch (error: any) {
      console.error("Error updating shift:", error);
      alert(`Failed to update shift: ${error.message || 'Unknown error'}`);
    }
  };

  const handleAddEmployee = () => {
    navigate("/dashboard/registration/employee");
  };

  const handleBulkAssign = async () => {
    if (selectedEmployees.length === 0) {
      alert("Please select employees first");
      return;
    }
    const shift = confirm("Assign to Day Shift? (Cancel for Night Shift)") ? "day" : "night";
    
    try {
      const result = await bulkAssignShift(selectedEmployees, shift as "day" | "night");
      
      // Update local state
      setEmployees((prev) =>
        prev.map((emp) =>
          selectedEmployees.includes(emp._id) ? { ...emp, currentShift: shift as "day" | "night" } : emp
        )
      );
      
      setSelectedEmployees([]);
      fetchShiftStats();
      alert(`${result.modifiedCount} employees assigned to ${shift} shift successfully`);
    } catch (error: any) {
      console.error("Error bulk assigning shifts:", error);
      alert(`Failed to assign shifts: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDownload = () => {
    // Create CSV content
    const headers = ["Employee Code", "Employee Name", "Designation", "Current Shift", "Duration (hrs)"];
    const rows = filteredEmployees.map((emp) => [
      emp.employeeCode,
      emp.employeeName,
      emp.designation,
      emp.currentShift,
      emp.shiftDuration.toString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `employee_shifts_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEmployees.length === currentEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(currentEmployees.map((emp) => emp._id));
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Get unique departments
  const departments = ["All Departments", ...Array.from(new Set(employees.map((emp) => emp.designation)))];

  if (loading) {
    return (
      <div className="shift-management loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="shift-management">
      {/* Header */}
      <div className="shift-header">
        <div className="header-left">
          <h2>Employee  Management</h2>
        </div>
        <div className="header-right">
          <div className="search-box">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667zM14 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search by Name, Code or Designation..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-bulk-assign" onClick={handleBulkAssign}>
            Bulk Assign {selectedEmployees.length > 0 && `(${selectedEmployees.length})`}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stat-card day-shift">
          <div className="stat-icon-container">
            <Sun size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-label">TOTAL ON DAY SHIFT</div>
            <div className="stat-value">{stats.totalDayShift}</div>
            <div className="stat-change">
              <span className="stat-badge positive">+5%</span>
              <span className="stat-description">Active majority in Series A-G</span>
            </div>
          </div>
        </div>

        <div className="stat-card night-shift">
          <div className="stat-icon-container moon">
            <Moon size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-label">TOTAL ON NIGHT SHIFT</div>
            <div className="stat-value">{stats.totalNightShift}</div>
            <div className="stat-change">
              <span className="stat-badge positive">+2%</span>
              <span className="stat-description">Active majority in Series A-G</span>
            </div>
          </div>
        </div>

        <div className="stat-card compliance">
          <div className="compliance-content">
            <div className="compliance-icon">
              <TrendingUp size={24} />
            </div>
            <div className="compliance-info">
              <div className="compliance-label">Shift Compliance</div>
              <div className="compliance-value">{stats.shiftCompliance}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Action Section */}
      <div className="filter-section">
        <div className="filter-left">
          <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="download-btn" onClick={handleDownload}>
            <Download size={16} />
          </button>
          {showFilters && (
            <div className="department-filter">
              <span>Show:</span>
              <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <button className="btn-add-employee" onClick={handleAddEmployee}>
          + Add Employee
        </button>
      </div>

      {/* Employee Table */}
      <div className="employee-table-container">
        <table className="employee-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedEmployees.length === currentEmployees.length && currentEmployees.length > 0}
                  onChange={toggleSelectAll}
                  style={{ cursor: "pointer" }}
                />
              </th>
              <th>EMPLOYEE PROFILE</th>
              <th style={{paddingLeft: '60px'}}>CURRENT SHIFT</th>
              <th>SHIFT SELECTION</th>
              <th>DURATION</th>
              <th style={{paddingLeft: '60px'}}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">
                  No employees found
                </td>
              </tr>
            ) : (
              currentEmployees.map((employee) => (
                <tr key={employee._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee._id)}
                      onChange={() => toggleEmployeeSelection(employee._id)}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                  <td>
                    <div className="employee-profile">
                      <div className="employee-avatar">
                        {employee.employeePhoto ? (
                          <img 
                            src={employee.employeePhoto.startsWith('http') ? employee.employeePhoto : `http://localhost:4000${employee.employeePhoto}`} 
                            alt={employee.employeeName}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const placeholder = target.nextElementSibling as HTMLElement;
                              if (placeholder) placeholder.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="avatar-placeholder" style={{ display: employee.employeePhoto ? 'none' : 'flex' }}>
                          {employee.employeeName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="employee-info">
                        <div className="employee-name">{employee.employeeName}</div>
                        <div className="employee-role">{employee.employeeCode} • {employee.designation}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`shift-badge ${employee.currentShift}`}>
                      {employee.currentShift === "day" ? (
                        <>
                          <Sun size={14} />
                          DAY SHIFT
                        </>
                      ) : (
                        <>
                          <Moon size={14} />
                          NIGHT SHIFT
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <div className="shift-selector">
                      <button
                        className={`shift-btn day ${employee.currentShift === "day" ? "selected" : ""}`}
                        onClick={() => handleShiftChange(employee._id, "day")}
                      >
                        Day
                      </button>
                      <button
                        className={`shift-btn night ${employee.currentShift === "night" ? "selected" : ""}`}
                        onClick={() => handleShiftChange(employee._id, "night")}
                      >
                        Night
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className="duration">{employee.shiftDuration} <span className="hours-label">hrs</span></span>
                  </td>
                  <td>
                    <button
                      className="btn-update"
                      onClick={() => handleUpdateShift(employee._id)}
                    >
                      UPDATE
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <div className="pagination-info">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} employees
        </div>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                className={`pagination-btn ${currentPage === pageNum ? "active" : ""}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          {totalPages > 5 && <span className="pagination-dots">...</span>}
          {totalPages > 5 && (
            <button
              className={`pagination-btn ${currentPage === totalPages ? "active" : ""}`}
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </button>
          )}
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
