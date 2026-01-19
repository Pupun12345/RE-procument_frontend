// employeeService.ts
// Service for employee-related API calls

import axios from "../api/axios";

export interface Employee {
  _id: string;
  employeeName: string;
  employeeCode: string;
  designation?: string;
  emailId?: string;
  mobileNumber?: string;
  panCardNumber?: string;
  aadharCardNumber?: string;
  safetyPassNumber?: string;
  emergencyContactNumber?: string;
  dateOfJoining?: string;
  dateOfBirth?: string;
  fatherName?: string;
  fatherContactNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  address?: string;
  employeePhoto?: string;
  currentShift?: "day" | "night";
  shiftDuration?: number;
  lastShiftUpdate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Fetch all employees
export async function getEmployees(): Promise<Employee[]> {
  try {
    const response = await axios.get("/employees");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching employees:", error);
    throw error.response?.data || error.message;
  }
}

// Fetch a single employee by employee code
export async function getEmployeeByCode(employeeCode: string): Promise<Employee> {
  try {
    const response = await axios.get(`/employees/code/${employeeCode}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching employee by code:", error);
    throw error.response?.data || error.message;
  }
}

// Fetch a single employee by ID
export async function getEmployeeById(id: string): Promise<Employee> {
  try {
    const response = await axios.get(`/employees/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching employee:", error);
    throw error.response?.data || error.message;
  }
}

// Add a new employee
export async function addEmployee(employeeData: FormData) {
  return (await axios.post("/employees", employeeData)).data;
}

export async function updateEmployee(id: string, employeeData: FormData) {
  return (await axios.put(`/employees/${id}`, employeeData)).data;
}

// Delete an employee
export async function deleteEmployee(id: string): Promise<void> {
  try {
    await axios.delete(`/employees/${id}`);
  } catch (error: any) {
    console.error("Error deleting employee:", error);
    throw error.response?.data || error.message;
  }
}

// Shift Management APIs

export interface ShiftStats {
  totalEmployees: number;
  totalDayShift: number;
  totalNightShift: number;
  shiftCompliance: number;
}

// Update employee shift
export async function updateEmployeeShift(
  employeeId: string, 
  currentShift: "day" | "night", 
  shiftDuration?: number
): Promise<Employee> {
  try {
    const response = await axios.put(`/employees/shift/${employeeId}`, {
      currentShift,
      shiftDuration: shiftDuration || 8
    });
    return response.data;
  } catch (error: any) {
    console.error("Error updating employee shift:", error);
    throw error.response?.data || error.message;
  }
}

// Bulk assign shifts to multiple employees
export async function bulkAssignShift(
  employeeIds: string[], 
  currentShift: "day" | "night", 
  shiftDuration?: number
): Promise<{ message: string; modifiedCount: number }> {
  try {
    const response = await axios.post("/employees/shift/bulk-assign", {
      employeeIds,
      currentShift,
      shiftDuration: shiftDuration || 8
    });
    return response.data;
  } catch (error: any) {
    console.error("Error bulk assigning shifts:", error);
    throw error.response?.data || error.message;
  }
}

// Get shift statistics
export async function getShiftStats(): Promise<ShiftStats> {
  try {
    const response = await axios.get("/employees/shift/stats");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching shift stats:", error);
    throw error.response?.data || error.message;
  }
}
