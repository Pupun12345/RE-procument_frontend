import { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";
import "./hrmsdashboard.css";
import { getEmployees } from "../../../services/employeeService";

interface AttendanceRecord {
  code: string;
  name: string;
  present: string;
  absent: string;
  shift: string;
  ot: string;
}

export function HRMSDashboard() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onBreak: 0,
    pendingApprovals: 3,
  });
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUploadExcel = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        // Transform the data to match our AttendanceRecord interface
        const records: AttendanceRecord[] = jsonData.map((row) => ({
          code: row.Code || row.code || "",
          name: row.Name || row.name || "",
          present: row.Present || row.present || "0",
          absent: row.Absent || row.absent || "0",
          shift: row.Shift || row.shift || "",
          ot: row.OT || row.ot || "0",
        }));

        setAttendanceRecords(records);

        // Calculate stats - merge with existing employee count from backend
        const totalEmployees = stats.totalEmployees || records.length;
        const presentToday = records.reduce(
          (sum, record) => sum + (parseInt(record.present) || 0),
          0
        );
        const onBreak = 0; // This would need to come from the data

        setStats((prev) => ({
          ...prev,
          totalEmployees,
          presentToday,
          onBreak,
        }));
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        alert("Error parsing Excel file. Please check the file format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="hrms-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1 className="welcome-title">
          Welcome User <span className="wave-emoji">👋</span>
        </h1>
        <p className="welcome-subtitle">Here's your HRMS dashboard overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3 className="stat-label">Total Employees</h3>
          <p className="stat-value stat-blue">
            {loading ? "..." : stats.totalEmployees}
          </p>
        </div>

        <div className="stat-card">
          <h3 className="stat-label">Present Today</h3>
          <p className="stat-value stat-green">{stats.presentToday}</p>
        </div>

        <div className="stat-card">
          <h3 className="stat-label">On Break</h3>
          <p className="stat-value stat-orange">{stats.onBreak}</p>
        </div>

        <div className="stat-card">
          <h3 className="stat-label">Pending Approvals</h3>
          <p className="stat-value stat-red">{stats.pendingApprovals}</p>
        </div>
      </div>

      {/* Upload Button */}
      <div className="upload-section">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx,.xls"
          style={{ display: "none" }}
        />
        <button className="upload-btn" onClick={handleUploadExcel}>
          <Upload size={20} />
          Upload Attendance Excel
        </button>
      </div>

      {/* Attendance Records Table */}
      <div className="attendance-section">
        <h2 className="section-title">Attendance Records</h2>

        <div className="table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th style={{color:"white"}}>Code</th>
                <th style={{color:"white"}}>Name</th>
                <th style={{color:"white"}}>Present</th>
                <th style={{color:"white"}}>Absent</th>
                <th style={{color:"white"}}>Shift</th>
                <th style={{color:"white"}}>OT</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-records">
                    No attendance records uploaded yet.
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record, index) => (
                  <tr key={index}>
                    <td>{record.code}</td>
                    <td>{record.name}</td>
                    <td>{record.present}</td>
                    <td>{record.absent}</td>
                    <td>{record.shift}</td>
                    <td>{record.ot}</td>
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
