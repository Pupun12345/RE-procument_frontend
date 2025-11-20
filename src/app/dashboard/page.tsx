"use client";

import { useAttendanceStore } from "@/store/attendanceStore";
import UploadAttendance from "@/components/UploadAttendance";

export default function DashboardPage() {
  const records = useAttendanceStore((s) => s.records);

  const totalEmployees = records.length;
  const presentToday = records.filter((r) => r.presentDays > 0).length;
  const onBreak = records.filter((r) => r.shift === "Break").length;
  const pendingApprovals = 3;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard Overview</h1>

      <div className="flex gap-4 mt-6">
        <div className="p-4 bg-white rounded shadow">Total Employees: {totalEmployees}</div>
        <div className="p-4 bg-white rounded shadow">Present Today: {presentToday}</div>
        <div className="p-4 bg-white rounded shadow">On Break: {onBreak}</div>
        <div className="p-4 bg-white rounded shadow">Pending Approvals: {pendingApprovals}</div>
      </div>

      <div className="mt-6">
        <UploadAttendance />
      </div>

      <div className="mt-6">
        <h2 className="font-semibold text-xl">Attendance Records</h2>
      </div>

      <div className="mt-4 bg-white rounded shadow">
        <table className="min-w-full p-4">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Shift</th>
              <th>OT</th>
            </tr>
          </thead>

          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="border-t">
                <td>{r.employeeCode}</td>
                <td>{r.employeeName}</td>
                <td>{r.presentDays}</td>
                <td>{r.absentDays}</td>
                <td>{r.shift}</td>
                <td>{r.overtimeHours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
