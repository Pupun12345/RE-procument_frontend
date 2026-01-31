import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Leave {
  _id?: string;
  employeeName: string;
  employeeId: string;
  leaveType: 'sick' | 'vacation' | 'personal' | 'emergency';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate?: string;
}

export interface Holiday {
  _id?: string;
  name: string;
  date: string;
  description?: string;
  type: 'public' | 'company' | 'optional';
  createdDate?: string;
}

// export const employeeAPI = {
//   getByEmployeeId: (employeeCode: string) => api.get(`/employees/${employeeCode}`)
// };

export const leaveAPI = {
  getAll: () => api.get<Leave[]>('/leaves'),
  create: (leave: Omit<Leave, '_id' | 'appliedDate'>) => api.post<Leave>('/leaves', leave),
  updateStatus: (id: string, status: Leave['status']) => api.patch<Leave>(`/leaves/${id}`, { status }),
  delete: (id: string) => api.delete(`/leaves/${id}`)
};

export const holidayAPI = {
  getAll: () => api.get<Holiday[]>('/holidays'),
  create: (holiday: Omit<Holiday, '_id' | 'createdDate'>) => api.post<Holiday>('/holidays', holiday),
  update: (id: string, holiday: Partial<Holiday>) => api.put<Holiday>(`/holidays/${id}`, holiday),
  delete: (id: string) => api.delete(`/holidays/${id}`)
};

export { Leave, Holiday };