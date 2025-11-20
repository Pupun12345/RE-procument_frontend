"use client";

import { parseAttendance } from "@/lib/excelParser";
import { useAttendanceStore } from "@/store/attendanceStore";

export default function UploadAttendance() {
  const setRecords = useAttendanceStore((s) => s.setRecords);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = await parseAttendance(file);
    setRecords(data);

    alert("Attendance uploaded successfully!");
  }

  return (
    <label className="cursor-pointer p-3 bg-blue-600 text-white rounded-lg">
      Upload Attendance Excel
      <input type="file" className="hidden" onChange={handleUpload} />
    </label>
  );
}
