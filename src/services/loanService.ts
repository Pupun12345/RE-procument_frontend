import axios from '../api/axios';

export const loanAPI = {
  // Get all loans
  getAllLoans: async () => {
    const response = await axios.get('/loans');
    return response.data;
  },

  // Create new loan
  createLoan: async (loanData: {
    employeeName: string;
    employeeId: string;
    loanType: string;
    originalAmount: number;
  }) => {
    const response = await axios.post('/loans', loanData);
    return response.data;
  },

  // Update loan (add payment)
  updateLoan: async (id: string, updateData: {
    paymentAmount?: number;
    loanType?: string;
    originalAmount?: number;
  }) => {
    const response = await axios.put(`/loans/${id}`, updateData);
    return response.data;
  },

  // Delete loan
  deleteLoan: async (id: string) => {
    const response = await axios.delete(`/loans/${id}`);
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await axios.get('/loans/stats');
    return response.data;
  }
};
