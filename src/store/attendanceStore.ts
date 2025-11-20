import { create } from "zustand";

export interface AttendanceRecord {
  employeeCode: string;
  employeeName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  shift: string;
  overtimeHours: number;
}

interface AttendanceState {
  records: AttendanceRecord[];
  setRecords: (data: AttendanceRecord[]) => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  records: [],
  setRecords: (data) => set({ records: data }),
}));
