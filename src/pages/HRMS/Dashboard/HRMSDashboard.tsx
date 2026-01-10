import { useState, useEffect } from "react";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  FileText,
  Calendar,
  Download,
  Upload as UploadIcon
} from "lucide-react";
import "./hrmsdashboard.css";
import { getEmployees } from "../../../services/employeeService";

interface PayrollRecord {
  empId: string;
  employeeName: string;
  department: string;
  basicSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
  netSalary: number;
}

export function HRMSDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalGross: 845000,
    totalPFESI: 45200,
    wagesAdded: 15000,
    netSalary: 799800,
  });
  const [loading, setLoading] = useState(true);
  const [payrollRecords] = useState<PayrollRecord[]>([
    {
      empId: "EMP-1842",
      employeeName: "Sarah Jenkins",
      department: "Engineering",
      basicSalary: 45000,
      hra: 15000,
      allowances: 5000,
      deductions: 3500,
      netSalary: 61500,
    },
    {
      empId: "EMP-1897",
      employeeName: "Michael Chen",
      department: "HR",
      basicSalary: 38000,
      hra: 12000,
      allowances: 3000,
      deductions: 2800,
      netSalary: 50200,
    },
  ]);

  // Fetch employee count on component mount
  useEffect(() => {
    fetchEmployeeStats();
  }, []);

  const fetchEmployeeStats = async () => {
    try {
      setLoading(true);
      const employees = await getEmployees();
      setStats((prev) => ({
        ...prev,
        totalEmployees: employees.length,
      }));
    } catch (error) {
      console.error("Error fetching employee stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hrms-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Payroll Dashboard</h1>
          <p className="dashboard-subtitle">Manage monthly salary sheets and finalize processing</p>
        </div>
        <div className="header-right">
          <button className="btn-secondary">
            <Download size={18} />
            Download Template
          </button>
          <button className="btn-primary">
            <UploadIcon size={18} />
            Import Excel Data
          </button>
        </div>
      </div>

      {/* Payroll Period Section */}
      <div className="payroll-period-section">
        <div className="period-card">
          <div className="period-header">
            <Calendar size={24} className="period-icon" />
            <div>
              <h3 className="period-title">October 2023 Payroll</h3>
              <p className="period-subtitle">Manage monthly salary sheets and finalize processing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="payroll-stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-icon-wrapper blue">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Total Employees</h3>
            <p className="stat-value">{loading ? "..." : stats.totalEmployees}</p>
            <span className="stat-badge positive">↑ 6 new</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Total Gross</h3>
            <p className="stat-value">₹{stats.totalGross.toLocaleString()}</p>
            <span className="stat-badge neutral">Similar</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Total PF/ESI</h3>
            <p className="stat-value">₹{stats.totalPFESI.toLocaleString()}</p>
            <span className="stat-badge negative">↓ Deducted</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Wages Added</h3>
            <p className="stat-value">₹{stats.wagesAdded.toLocaleString()}</p>
            <span className="stat-badge positive">↑ 12%</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card attendance-chart">
          <h3 className="chart-title">Attendance vs. Salary Trends</h3>
          <p className="chart-subtitle">Overview of trends for the last 6 months</p>
          <div className="chart-placeholder">
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-dot blue"></span> Salary
              </span>
              <span className="legend-item">
                <span className="legend-dot light-blue"></span> Attendance
              </span>
            </div>
            <svg viewBox="0 0 400 200" className="line-chart">
              {/* Salary line */}
              <path
                d="M 20 160 Q 80 140 100 135 Q 140 125 180 130 Q 240 128 280 115 Q 320 105 380 95"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
              />
              {/* Attendance line */}
              <path
                d="M 20 170 Q 80 155 100 150 Q 140 145 180 148 Q 240 150 280 140 Q 320 138 380 130"
                fill="none"
                stroke="#93c5fd"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
          </div>
        </div>

        <div className="chart-card breakdown-chart">
          <h3 className="chart-title">Payroll Breakdown</h3>
          <p className="chart-subtitle">Component distribution</p>
          <div className="chart-placeholder">
            <div className="donut-chart">
              <svg viewBox="0 0 200 200" className="donut-svg">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="40"
                  strokeDasharray="352 503"
                  transform="rotate(-90 100 100)"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="40"
                  strokeDasharray="100 503"
                  strokeDashoffset="-352"
                  transform="rotate(-90 100 100)"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="40"
                  strokeDasharray="50 503"
                  strokeDashoffset="-452"
                  transform="rotate(-90 100 100)"
                />
                <text x="100" y="100" textAnchor="middle" dy=".3em" className="donut-text">
                  845k
                </text>
              </svg>
            </div>
            <div className="breakdown-legend">
              <div className="breakdown-item">
                <span className="breakdown-dot blue"></span>
                <span>Basic Sal</span>
                <strong>70%</strong>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-dot light-blue"></span>
                <span>HRA</span>
                <strong>20%</strong>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-dot pale-blue"></span>
                <span>Allowances</span>
                <strong>10%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Net Salary Card */}
      <div className="net-salary-card">
        <div className="net-salary-content">
          <h3 className="net-salary-label">Net Salary/Payable</h3>
          <p className="net-salary-value">₹{stats.netSalary.toLocaleString()}</p>
          <p className="net-salary-note">Final amount after all additions</p>
        </div>
      </div>

      {/* Recent Payroll Processing Table */}
      <div className="payroll-table-section">
        <div className="table-header">
          <h2 className="table-title">Recent Payroll Processing</h2>
          <button className="view-full-btn">View Full Sheet →</button>
        </div>

        <div className="table-container">
          <table className="payroll-table">
            <thead>
              <tr>
                <th>EMP ID</th>
                <th>EMPLOYEE NAME</th>
                <th>DEPARTMENT</th>
                <th>BASIC</th>
                <th>HRA</th>
                <th>ALLOWANCES</th>
                <th>DEDUCTIONS</th>
                <th>NET SALARY</th>
              </tr>
            </thead>
            <tbody>
              {payrollRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="no-records">
                    No payroll records available.
                  </td>
                </tr>
              ) : (
                payrollRecords.map((record, index) => (
                  <tr key={index}>
                    <td>{record.empId}</td>
                    <td>{record.employeeName}</td>
                    <td>{record.department}</td>
                    <td>₹{record.basicSalary.toLocaleString()}</td>
                    <td>₹{record.hra.toLocaleString()}</td>
                    <td>₹{record.allowances.toLocaleString()}</td>
                    <td className="deduction">-₹{record.deductions.toLocaleString()}</td>
                    <td className="net-amount">₹{record.netSalary.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
