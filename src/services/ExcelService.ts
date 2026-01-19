interface LoanData {
  employeeName: string;
  employeeId: string;
  loanType: string;
  loanRef: string;
  originalAmount: number;
  paidAmount: number;
  outstanding: number;
  status: string;
}

export const handleExportExcel = (loans: LoanData[]) => {
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
      .map(row => row.map((field: string | number) => `"${field}"`).join(','))
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