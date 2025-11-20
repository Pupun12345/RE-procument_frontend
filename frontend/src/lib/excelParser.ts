import * as XLSX from "xlsx";
import { AttendanceRecord } from "@/store/attendanceStore";

export function parseAttendance(file: File): Promise<AttendanceRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<any>(sheet);

      const records: AttendanceRecord[] = json.map((row) => ({
        employeeCode: row["Employee Code"],
        employeeName: row["Employee Name"],
        totalDays: row["Total Days"],
        presentDays: row["Present"],
        absentDays: row["Absent"],
        shift: row["Shift"],
        overtimeHours: row["OT Hours"] || 0,
      }));

      resolve(records);
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
