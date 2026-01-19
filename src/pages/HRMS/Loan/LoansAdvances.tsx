import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';
import "./loans-advances.css";
import { loanAPI } from "../../../services/loanService"
import { getEmployeeByCode } from "../../../services/employeeService";
import { handleExportExcel } from "../../../services/ExcelService";

import Loader from "../../../components/Loader";

interface LoanData {
  _id: string;
  employeeName: string;
  employeeId: string;
  loanType: string;
  loanRef: string;
  originalAmount: number;
  paidAmount: number;
  outstanding: number;
  status: 'paid' | 'pending';
}

const LoansAdvances = () => {
  const queryClient = useQueryClient();
  const { data: loans = [], isLoading } = useQuery<LoanData[]>({
    queryKey: ['loans'],
    queryFn: loanAPI.getAllLoans
  });
  
  const { data: stats = { totalOutstanding: 0, pendingLoans: 0, recoveredThisMonth: 0, paidLoans: 0 }, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: loanAPI.getStats
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [showDialog, setShowDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingLoanId, setDeletingLoanId] = useState<string | null>(null);
  const [editingLoan, setEditingLoan] = useState<LoanData | null>(null);
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    loanType: '',
    amount: '',
    paidAmount: ''
  });
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(false);
  
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: loanAPI.deleteLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Loan deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete loan');
    }
  });
  
  const createMutation = useMutation<LoanData, Error, { employeeName: string; employeeId: string; loanType: string; originalAmount: number }>({
    mutationFn: loanAPI.createLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Loan created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to create loan');
    }
  });
  
  const updateMutation = useMutation<LoanData, Error, { id: string; data: { paymentAmount?: number; loanType?: string; originalAmount?: number } }>({
    mutationFn: ({ id, data }) => loanAPI.updateLoan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Loan updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update loan');
    }
  });

  // Pagination
  const totalPages = Math.ceil(loans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLoans = loans.slice(startIndex, endIndex);

  const handleEdit = (id: string) => {
    const loan = loans.find(l => l._id === id);
    if (loan) {
      setEditingLoan(loan);
      setFormData({
        employeeName: loan.employeeName,
        employeeId: loan.employeeId,
        loanType: loan.loanType,
        amount: loan.originalAmount.toString(),
        paidAmount: ''
      });
      setShowEditDialog(true);
    }
  };

  const handleDelete = (id: string) => {
    setDeletingLoanId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deletingLoanId) {
      deleteMutation.mutate(deletingLoanId);
      setShowDeleteDialog(false);
      setDeletingLoanId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setDeletingLoanId(null);
  };

  const handleExcelExportButton = () => {
    handleExportExcel(loans);
  };

  const handleNewLoan = () => {
    setShowDialog(true);
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setShowEditDialog(false);
    setEditingLoan(null);
    setFormData({ employeeName: '', employeeId: '', loanType: '', amount: '', paidAmount: '' });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.employeeName?.trim() || !formData.employeeId?.trim() || !formData.loanType || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = Number(formData.amount);
    if (isNaN(amount) || amount < 1000) {
      toast.error('Loan amount must be at least ₹1000');
      return;
    }
    
    if (editingLoan) {
      const newPayment = Number(formData.paidAmount || 0);
      
      if (isNaN(newPayment) || newPayment < 0) {
        toast.error('Payment amount must be a valid positive number');
        return;
      }
      
      if (newPayment > editingLoan.outstanding) {
        toast.error('Payment amount cannot be greater than the outstanding amount');
        return;
      }
      
      updateMutation.mutate({
        id: editingLoan._id,
        data: {
          paymentAmount: newPayment,
          loanType: formData.loanType,
          originalAmount: amount
        }
      });
    } else {
      createMutation.mutate({
        employeeName: formData.employeeName.trim(),
        employeeId: formData.employeeId.trim(),
        loanType: formData.loanType,
        originalAmount: amount
      });
    }
    handleDialogClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEmployeeIdKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const employeeId = (e.target as HTMLInputElement).value.trim();
      if (employeeId && !editingLoan) {
        setIsLoadingEmployee(true);
        try {
          const employee = await getEmployeeByCode(employeeId);
          if (employee && employee.employeeName) {
            setFormData(prev => ({
              ...prev,
              employeeId: employeeId,
              employeeName: employee.employeeName
            }));
            toast.success('Employee details loaded');
          } else {
            throw new Error('Employee data incomplete');
          }
        } catch (error) {
          setFormData(prev => ({
            ...prev,
            employeeId: employeeId,
            employeeName: ''
          }));
          toast.error('Employee not found or invalid ID');
        } finally {
          setIsLoadingEmployee(false);
        }
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  if (isLoading || statsLoading) {
    return <Loader />;
  }
  
  return (
    <div className="loans-wrapper">
      <Toaster position="top-right" />
      <div className="breadcrumb">
        Home / Payroll / <span>Loans & Advances</span>
      </div>

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Loans & Advances</h1>
          <p className="subtitle">
            Track employee disbursements, repayments, and outstanding balances for FY {new Date().getFullYear()}–{new Date().getFullYear() + 1}.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn-outline" onClick={handleExcelExportButton}>⬇ Export Excel</button>
          <button className="btn-primary" onClick={handleNewLoan}>＋ Issue New Loan</button>
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="summary-grid">
        <div className="summary-card">
          <p className="summary-title">Total Outstanding</p>
          <h3>₹{stats.totalOutstanding.toLocaleString()}</h3>
          <span className={`trend ${stats.outstandingTrend || 'neutral'}`}>{(stats.outstandingChange || 0) > 0 ? '+' : ''}{stats.outstandingChange || 0}%</span>
        </div>

        <div className="summary-card">
          <p className="summary-title">Pending Loans</p>
          <h3>{stats.pendingLoans}</h3>
          <span className={`trend ${stats.pendingTrend || 'neutral'}`}>{(stats.pendingChange || 0) > 0 ? '+' : ''}{stats.pendingChange || 0}%</span>
        </div>

        <div className="summary-card">
          <p className="summary-title">Recovered (May)</p>
          <h3>₹{stats.recoveredThisMonth.toLocaleString()}</h3>
          <span className={`trend ${stats.recoveredTrend || 'neutral'}`}>{(stats.recoveredChange || 0) > 0 ? '+' : ''}{stats.recoveredChange || 0}%</span>
        </div>

        <div className="summary-card">
          <p className="summary-title">Paid Loans</p>
          <h3>{stats.paidLoans}</h3>
          <span className={`trend ${stats.paidTrend || 'neutral'}`}>{(stats.paidChange || 0) > 0 ? '+' : ''}{stats.paidChange || 0}%</span>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="table-card">
        {/* Desktop Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>TYPE / REF</th>
                <th>ORIGINAL AMOUNT</th>
                <th>REPAYMENT PROGRESS</th>
                <th>OUTSTANDING</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {currentLoans.map((loan) => {
                const progressPercent = Math.round((loan.paidAmount / loan.originalAmount) * 100);
                return (
                  <tr key={loan._id}>
                    <td>
                      <div className="employee-cell">
                        <div className="employee-name">{loan.employeeName}</div>
                        <div className="employee-id">ID: {loan.employeeId}</div>
                      </div>
                    </td>

                    <td>
                      <div className="type-cell">
                        <div className="loan-type">{loan.loanType}</div>
                        <div className="loan-ref">{loan.loanRef}</div>
                      </div>
                    </td>

                    <td className="amount">₹{loan.originalAmount.toLocaleString()}</td>

                    <td>
                      <div className="repayment-cell">
                        <div className="repayment-text">₹{loan.paidAmount.toLocaleString()} paid</div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <div className="repayment-percent">{progressPercent}%</div>
                      </div>
                    </td>

                    <td className="outstanding">₹{loan.outstanding.toLocaleString()}</td>
                    <td><span className={`status-pill ${loan.status}`}>{loan.status}</span></td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-edit" 
                          onClick={() => handleEdit(loan._id)}
                          title="Edit loan"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => handleDelete(loan._id)}
                          title="Delete loan"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mobile-cards">
          {currentLoans.map((loan) => {
            const progressPercent = Math.round((loan.paidAmount / loan.originalAmount) * 100);
            return (
              <div key={loan._id} className="loan-card">
                <div className="loan-card-header">
                  <div className="loan-card-employee">
                    <div className="employee-name">{loan.employeeName}</div>
                    <div className="employee-id">ID: {loan.employeeId}</div>
                  </div>
                  <div className="loan-card-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEdit(loan._id)}
                      title="Edit loan"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(loan._id)}
                      title="Delete loan"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="loan-card-body">
                  <div className="loan-card-field">
                    <div className="loan-card-label">Loan Type</div>
                    <div className="loan-card-value">{loan.loanType}</div>
                    <div className="loan-ref">{loan.loanRef}</div>
                  </div>
                  
                  <div className="loan-card-field">
                    <div className="loan-card-label">Original Amount</div>
                    <div className="loan-card-value">₹{loan.originalAmount.toLocaleString()}</div>
                  </div>
                  
                  <div className="loan-card-field">
                    <div className="loan-card-label">Outstanding</div>
                    <div className="loan-card-value">₹{loan.outstanding.toLocaleString()}</div>
                  </div>
                  
                  <div className="loan-card-field">
                    <div className="loan-card-label">Status</div>
                    <span className={`status-pill ${loan.status}`}>{loan.status}</span>
                  </div>
                </div>

                <div className="loan-card-progress">
                  <div className="repayment-text">₹{loan.paidAmount.toLocaleString()} paid of ₹{loan.originalAmount.toLocaleString()}</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <div className="repayment-percent">{progressPercent}% completed</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="table-footer">
          <span>Showing {startIndex + 1} to {Math.min(endIndex, loans.length)} of {loans.length} results</span>
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹ Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={currentPage === page ? 'active' : ''}
              >
                {page}
              </button>
            ))}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next ›
            </button>
          </div>
        </div>
      </div>
      
      {/* Loan Dialog */}
      {(showDialog || showEditDialog) && (
        <div className="dialog-overlay" onClick={handleDialogClose}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">{editingLoan ? 'Edit Loan' : 'Issue New Loan'}</h2>
              <button className="dialog-close" onClick={handleDialogClose}>
                ×
              </button>
            </div>
            
            <form className="dialog-form" onSubmit={handleFormSubmit}>
              {!editingLoan && (
                <>
                  <div className="form-group">
                    <label className="form-label">Employee ID</label>
                    <input
                      type="text"
                      name="employeeId"
                      className="form-input"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      onKeyPress={handleEmployeeIdKeyPress}
                      placeholder="e.g., EMP-2023-001 (Press Enter to load)"
                      required
                    />
                    {isLoadingEmployee && <small style={{ color: '#3b82f6' }}>Loading employee details...</small>}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Employee Name</label>
                    <input
                      type="text"
                      name="employeeName"
                      className="form-input"
                      value={formData.employeeName}
                      onChange={handleInputChange}
                      placeholder="Enter employee name"
                      required
                      readOnly={!!formData.employeeName && !editingLoan}
                      style={{
                        backgroundColor: formData.employeeName && !editingLoan ? '#f8fafc' : 'white',
                        cursor: formData.employeeName && !editingLoan ? 'not-allowed' : 'text'
                      }}
                    />
                  </div>
                </>
              )}
              
              <div className="form-group">
                <label className="form-label">Loan Type</label>
                <select
                  name="loanType"
                  className="form-select"
                  value={formData.loanType}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingLoan}
                >
                  <option value="">Select loan type</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Salary Advance">Salary Advance</option>
                  <option value="Emergency Loan">Emergency Loan</option>
                  <option value="Home Loan">Home Loan</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Loan Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  className="form-input"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount in rupees"
                  min="1000"
                  required
                  disabled={!!editingLoan}
                />
              </div>
              
              {editingLoan && (
                <div className="form-group">
                  <label className="form-label">Payment Amount (₹)</label>
                  <input
                    type="number"
                    name="paidAmount"
                    className="form-input"
                    value={formData.paidAmount}
                    onChange={handleInputChange}
                    placeholder="Enter payment amount"
                    min="0"
                    max={editingLoan.outstanding}
                  />
                  <small style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Outstanding: ₹{editingLoan.outstanding.toLocaleString()}
                  </small>
                </div>
              )}
              
              <div className="dialog-actions">
                <button type="button" className="btn-cancel" onClick={handleDialogClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingLoan ? 'Update Loan' : 'Issue Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="dialog-overlay" onClick={cancelDelete}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="dialog-header">
              <h2 className="dialog-title">Confirm Delete</h2>
              <button className="dialog-close" onClick={cancelDelete}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              <p>Are you sure you want to delete this loan? This action cannot be undone.</p>
            </div>
            <div className="dialog-actions">
              <button type="button" className="btn-cancel" onClick={cancelDelete}>Cancel</button>
              <button type="button" className="btn-submit" onClick={confirmDelete} style={{ background: '#ef4444' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoansAdvances;







