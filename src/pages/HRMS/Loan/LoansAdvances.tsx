import { useState } from "react";
import "./loans-advances.css";

interface LoanData {
  id: string;
  employeeName: string;
  employeeId: string;
  loanType: string;
  loanRef: string;
  originalAmount: number;
  paidAmount: number;
  outstanding: number;
  status: 'active' | 'paid' | 'pending';
}

const LoansAdvances = () => {
  const [loans, setLoans] = useState<LoanData[]>([
    {
      id: '1',
      employeeName: 'Wade Warren',
      employeeId: 'EMP-2023-001',
      loanType: 'Personal Loan',
      loanRef: '#LN-8922',
      originalAmount: 15000,
      paidAmount: 6000,
      outstanding: 9000,
      status: 'active'
    },
    {
      id: '2',
      employeeName: 'Jane Doe',
      employeeId: 'EMP-2023-045',
      loanType: 'Salary Advance',
      loanRef: '#AD-1102',
      originalAmount: 2500,
      paidAmount: 2500,
      outstanding: 0,
      status: 'paid'
    },
    {
      id: '3',
      employeeName: 'John Smith',
      employeeId: 'EMP-2023-012',
      loanType: 'Emergency Loan',
      loanRef: '#LN-8923',
      originalAmount: 8000,
      paidAmount: 3200,
      outstanding: 4800,
      status: 'active'
    },
    {
      id: '4',
      employeeName: 'Sarah Johnson',
      employeeId: 'EMP-2023-078',
      loanType: 'Personal Loan',
      loanRef: '#LN-8924',
      originalAmount: 12000,
      paidAmount: 12000,
      outstanding: 0,
      status: 'paid'
    },
    {
      id: '5',
      employeeName: 'Mike Wilson',
      employeeId: 'EMP-2023-089',
      loanType: 'Salary Advance',
      loanRef: '#AD-1103',
      originalAmount: 3500,
      paidAmount: 1750,
      outstanding: 1750,
      status: 'active'
    },
    {
      id: '6',
      employeeName: 'Emily Davis',
      employeeId: 'EMP-2023-034',
      loanType: 'Personal Loan',
      loanRef: '#LN-8925',
      originalAmount: 20000,
      paidAmount: 0,
      outstanding: 20000,
      status: 'pending'
    },
    {
      id: '7',
      employeeName: 'Robert Brown',
      employeeId: 'EMP-2023-056',
      loanType: 'Emergency Loan',
      loanRef: '#LN-8926',
      originalAmount: 5000,
      paidAmount: 2500,
      outstanding: 2500,
      status: 'active'
    },
    {
      id: '8',
      employeeName: 'Lisa Anderson',
      employeeId: 'EMP-2023-067',
      loanType: 'Personal Loan',
      loanRef: '#LN-8927',
      originalAmount: 18000,
      paidAmount: 9000,
      outstanding: 9000,
      status: 'active'
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [showDialog, setShowDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanData | null>(null);
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    loanType: '',
    amount: '',
    paidAmount: ''
  });

  // Pagination
  const totalPages = Math.ceil(loans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLoans = loans.slice(startIndex, endIndex);

  const handleEdit = (id: string) => {
    const loan = loans.find(l => l.id === id);
    if (loan) {
      setEditingLoan(loan);
      setFormData({
        employeeName: loan.employeeName,
        employeeId: loan.employeeId,
        loanType: loan.loanType,
        amount: loan.originalAmount.toString(),
        paidAmount: loan.paidAmount.toString()
      });
      setShowEditDialog(true);
    }
  };

  //delete
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this loan?')) {
      const updatedLoans = loans.filter(loan => loan.id !== id);
      setLoans(updatedLoans);
      const newTotalPages = Math.ceil(updatedLoans.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  };

  //export to excel
  const handleExportExcel = () => {
    const headers = ['Employee Name', 'Employee ID', 'Loan Type', 'Loan Reference', 'Original Amount', 'Paid Amount', 'Outstanding', 'Status'];
    const csvData = loans.map(loan => [
      loan.employeeName,
      loan.employeeId,
      loan.loanType,
      loan.loanRef,
      loan.originalAmount,
      loan.paidAmount,
      loan.outstanding,
      loan.status
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `loans-advances-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.employeeName && formData.employeeId && formData.loanType && formData.amount) {
      if (editingLoan) {
        const updatedLoans = loans.map(l => 
          l.id === editingLoan.id 
            ? { 
                ...l, 
                employeeName: formData.employeeName,
                employeeId: formData.employeeId,
                loanType: formData.loanType,
                originalAmount: Number(formData.amount),
                paidAmount: Number(formData.paidAmount || 0),
                outstanding: Number(formData.amount) - Number(formData.paidAmount || 0)
              }
            : l
        );
        setLoans(updatedLoans);
      } else {
        const newLoan: LoanData = {
          id: (loans.length + 1).toString(),
          employeeName: formData.employeeName,
          employeeId: formData.employeeId,
          loanType: formData.loanType,
          loanRef: `#LN-${8920 + loans.length + 1}`,
          originalAmount: Number(formData.amount),
          paidAmount: 0,
          outstanding: Number(formData.amount),
          status: 'pending'
        };
        setLoans([...loans, newLoan]);
      }
      handleDialogClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate stats
  const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstanding, 0);
  const activeLoans = loans.filter(loan => loan.status === 'active').length;
  const recoveredThisMonth = loans.reduce((sum, loan) => sum + loan.paidAmount, 0);
  const pendingRequests = loans.filter(loan => loan.status === 'pending').length;
  return (
    <div className="loans-wrapper">
      <div className="breadcrumb">
        Home / Payroll / <span>Loans & Advances</span>
      </div>

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Loans & Advances</h1>
          <p className="subtitle">
            Track employee disbursements, repayments, and outstanding balances for FY 2023–2024.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn-outline" onClick={handleExportExcel}>⬇ Export Excel</button>
          <button className="btn-primary" onClick={handleNewLoan}>＋ Issue New Loan</button>
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="summary-grid">
        <div className="summary-card">
          <p className="summary-title">Total Outstanding</p>
          <h3>₹{totalOutstanding.toLocaleString()}</h3>
          <span className="trend up">+2.5%</span>
        </div>

        <div className="summary-card">
          <p className="summary-title">Active Loans</p>
          <h3>{activeLoans}</h3>
          <span className="trend down">-1.0%</span>
        </div>

        <div className="summary-card">
          <p className="summary-title">Recovered (May)</p>
          <h3>₹{recoveredThisMonth.toLocaleString()}</h3>
          <span className="trend up">+5.0%</span>
        </div>

        <div className="summary-card">
          <p className="summary-title">Pending Requests</p>
          <h3>{pendingRequests}</h3>
          <span className="trend neutral">0%</span>
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
                  <tr key={loan.id}>
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
                          <div style={{ width: `${progressPercent}%` }} />
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
                          onClick={() => handleEdit(loan.id)}
                          title="Edit loan"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => handleDelete(loan.id)}
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
              <div key={loan.id} className="loan-card">
                <div className="loan-card-header">
                  <div className="loan-card-employee">
                    <div className="employee-name">{loan.employeeName}</div>
                    <div className="employee-id">ID: {loan.employeeId}</div>
                  </div>
                  <div className="loan-card-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEdit(loan.id)}
                      title="Edit loan"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(loan.id)}
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
                    <div style={{ width: `${progressPercent}%` }} />
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
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  className="form-input"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  placeholder="e.g., EMP-2023-001"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Loan Type</label>
                <select
                  name="loanType"
                  className="form-select"
                  value={formData.loanType}
                  onChange={handleInputChange}
                  required
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
                />
              </div>
              
              {editingLoan && (
                <div className="form-group">
                  <label className="form-label">Paid Amount (₹)</label>
                  <input
                    type="number"
                    name="paidAmount"
                    className="form-input"
                    value={formData.paidAmount}
                    onChange={handleInputChange}
                    placeholder="Enter paid amount"
                    min="0"
                  />
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
    </div>
  );
};

export default LoansAdvances;



