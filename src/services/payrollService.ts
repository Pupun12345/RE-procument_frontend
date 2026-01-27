// payrollService.ts
// Service for payroll and report-related API calls

import axios from "../api/axios";

export interface MonthlyData {
  month: string;
  monthNumber: number;
  year: number;
  headcount: number;
  basicPay: number;
  hra: number;
  allowances: number;
  grossSalary: number;
  pfEmp: number;
  esiEmp: number;
  netSalary: number;
}

export interface YearlyData {
  totalGrossSalary: number;
  totalDeductions: number;
  totalWagesAccrued: number;
  netPayableSalary: number;
  grossSalaryChange: number;
  deductionsStatus: string;
  wagesAccruedChange: number;
  salaryStatus: string;
}

export interface YearlyReportResponse {
  fiscalYear: string;
  yearlyData: YearlyData;
  monthlyData: MonthlyData[];
  totals: {
    basicPay: number;
    hra: number;
    allowances: number;
    grossSalary: number;
    pfEmp: number;
    esiEmp: number;
    netSalary: number;
  };
}

export interface PayrollEntry {
  _id?: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  month: string;
  year: number;
  monthNumber: number;
  fiscalYear: string;
  basicPay: number;
  hra: number;
  allowances: number;
  grossSalary: number;
  pfEmployee: number;
  esiEmployee: number;
  professionalTax?: number;
  incomeTax?: number;
  otherDeductions?: number;
  totalDeductions: number;
  netSalary: number;
  status: "pending" | "processed" | "paid" | "cleared";
  paymentDate?: string;
  paymentMode?: string;
  workingDays?: number;
  presentDays?: number;
  leaves?: number;
  overtime?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Fetch yearly report data
export async function getYearlyReport(fiscalYear: string): Promise<YearlyReportResponse> {
  try {
    const response = await axios.get(`/payroll/report/yearly/${fiscalYear}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching yearly report:", error);
    throw error.response?.data || error.message;
  }
}

// Fetch monthly report data
export async function getMonthlyReport(month: string, year: number) {
  try {
    const response = await axios.get(`/payroll/report/monthly/${month}/${year}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching monthly report:", error);
    throw error.response?.data || error.message;
  }
}

// Fetch all fiscal years
export async function getAllFiscalYears(): Promise<string[]> {
  try {
    const response = await axios.get("/payroll/fiscal-years");
    return response.data.fiscalYears;
  } catch (error: any) {
    console.error("Error fetching fiscal years:", error);
    throw error.response?.data || error.message;
  }
}

// Create a payroll entry
export async function createPayroll(payrollData: Partial<PayrollEntry>): Promise<PayrollEntry> {
  try {
    const response = await axios.post("/payroll", payrollData);
    return response.data.payroll;
  } catch (error: any) {
    console.error("Error creating payroll:", error);
    throw error.response?.data || error.message;
  }
}

// Bulk create payroll entries
export async function bulkCreatePayroll(payrolls: Partial<PayrollEntry>[]) {
  try {
    const response = await axios.post("/payroll/bulk", { payrolls });
    return response.data;
  } catch (error: any) {
    console.error("Error bulk creating payroll:", error);
    throw error.response?.data || error.message;
  }
}

// Get employee payroll history
export async function getEmployeePayrollHistory(employeeId: string): Promise<PayrollEntry[]> {
  try {
    const response = await axios.get(`/payroll/employee/${employeeId}`);
    return response.data.payrolls;
  } catch (error: any) {
    console.error("Error fetching employee payroll history:", error);
    throw error.response?.data || error.message;
  }
}

// Update payroll status
export async function updatePayrollStatus(
  payrollId: string,
  status: string,
  paymentDate?: string,
  paymentMode?: string
): Promise<PayrollEntry> {
  try {
    const response = await axios.put(`/payroll/${payrollId}/status`, {
      status,
      paymentDate,
      paymentMode,
    });
    return response.data.payroll;
  } catch (error: any) {
    console.error("Error updating payroll status:", error);
    throw error.response?.data || error.message;
  }
}

// Delete payroll entry
export async function deletePayroll(payrollId: string): Promise<void> {
  try {
    await axios.delete(`/payroll/${payrollId}`);
  } catch (error: any) {
    console.error("Error deleting payroll:", error);
    throw error.response?.data || error.message;
  }
}
