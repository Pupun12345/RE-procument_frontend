"use client";

import { useAttendanceStore } from "@/store/attendanceStore";
import UploadAttendance from "@/components/UploadAttendance";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const records = useAttendanceStore((s) => s.records);

  // -----------------------------
  // 🔐 Auth Hydration
  // -----------------------------
  const { role, hydrated } = useAuthStore();
  const [displayRole, setDisplayRole] = useState<string>("");

  useEffect(() => {
    if (hydrated && role) {
      setDisplayRole(role);
    }
  }, [hydrated, role]);

  // -----------------------------
  // ⏳ Prevent UI flash before hydration
  // -----------------------------
  if (!hydrated) {
    return (
      <div className="p-6 text-center text-gray-500 text-lg">
        Loading dashboard...
      </div>
    );
  }

  // -----------------------------
  // 📊 Safe Attendance Summary
  // -----------------------------
  const totalEmployees = records?.length || 0;
  const presentToday = records?.filter((r) => r.presentDays > 0).length || 0;
  const onBreak = records?.filter((r) => r.shift === "Break").length || 0;
  const pendingApprovals = 3; // static for now

  return (
    <div className="p-6">

      {/* ------------------------------------------------
          🔥 Welcome Header Based on Role
      ------------------------------------------------ */}
      <h1 className="text-3xl font-bold mb-2 text-blue-700">
        Welcome {displayRole === "admin" ? "Admin" : "User"} 👋
      </h1>

      <p className="text-gray-600 mb-6">
        Here’s your HRMS dashboard overview.
      </p>

      {/* ------------------------------------------------
          📌 Summary Cards
      ------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        
        <SummaryCard
          title="Total Employees"
          value={totalEmployees}
          color="text-blue-600"
        />

        <SummaryCard
          title="Present Today"
          value={presentToday}
          color="text-green-600"
        />

        <SummaryCard
          title="On Break"
          value={onBreak}
          color="text-yellow-600"
        />

        <SummaryCard
          title="Pending Approvals"
          value={pendingApprovals}
          color="text-red-600"
        />

      </div>

      {/* ------------------------------------------------
          📤 Upload Attendance
      ------------------------------------------------ */}
      <div className="mt-8">
        <UploadAttendance />
      </div>

      {/* ------------------------------------------------
          📄 Attendance Table
      ------------------------------------------------ */}
      <div className="mt-8">
        <h2 className="font-semibold text-xl mb-3">Attendance Records</h2>

        <div className="bg-white rounded shadow overflow-auto">
          <table className="min-w-full p-4">
            <thead className="bg-gray-100">
              <tr>
                <Th>Code</Th>
                <Th>Name</Th>
                <Th>Present</Th>
                <Th>Absent</Th>
                <Th>Shift</Th>
                <Th>OT</Th>
              </tr>
            </thead>

            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={6}>
                    No attendance records uploaded yet.
                  </td>
                </tr>
              ) : (
                records.map((r, i) => (
                  <tr key={i} className="border-t text-center">
                    <Td>{r.employeeCode}</Td>
                    <Td>{r.employeeName}</Td>
                    <Td>{r.presentDays}</Td>
                    <Td>{r.absentDays}</Td>
                    <Td>{r.shift}</Td>
                    <Td>{r.overtimeHours}</Td>
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

/* -------------------------------------------
   🔧 Reusable Components (Cleaner JSX)
------------------------------------------- */

function SummaryCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="p-4 bg-white rounded shadow text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="p-2 font-semibold">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="p-2">{children}</td>;
}
//updated code