// employeeService.ts
// Service for employee-related API calls

import axios from '../api/axios';

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
  createdAt?: string;
  updatedAt?: string;
}

// Fetch all employees
export async function getEmployees(): Promise<Employee[]> {
  try {
    const response = await axios.get('/employees');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    throw error.response?.data || error.message;
  }
}

// Fetch a single employee by ID
export async function getEmployeeById(id: string): Promise<Employee> {
  try {
    const response = await axios.get(`/employees/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching employee:', error);
    throw error.response?.data || error.message;
  }
}

// Add a new employee
export async function addEmployee(employeeData: Partial<Employee>): Promise<Employee> {
  try {
    const response = await axios.post('/employees', employeeData);
    return response.data;
  } catch (error: any) {
    console.error('Error adding employee:', error);
    throw error.response?.data || error.message;
  }
}

// Update an existing employee
export async function updateEmployee(id: string, employeeData: Partial<Employee>): Promise<Employee> {
  try {
    const response = await axios.put(`/employees/${id}`, employeeData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating employee:', error);
    throw error.response?.data || error.message;
  }
}

// Delete an employee
export async function deleteEmployee(id: string): Promise<void> {
  try {
    await axios.delete(`/employees/${id}`);
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    throw error.response?.data || error.message;
  }
}
