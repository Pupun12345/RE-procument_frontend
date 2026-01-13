import "./loans-advances.css";

const LoansAdvances = () => {
  return (
    <div className="loans-wrapper">
      <div className="breadcrumb">
         <span>Loans & Advances</span>
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
          <button className="btn-outline">⬇ Export Excel</button>
          <button className="btn-primary">＋ Issue New Loan</button>
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="summary-grid">
        <div className="summary-card">
          <p className="summary-title">Total Outstanding</p>
          <h3>$45,200</h3>
          <span className="trend up">+2.5%</span>
        </div>

        <div className="summary-card">
          <p className="summary-title">Active Loans</p>
          <h3>12</h3>
          <span className="trend down">-1.0%</span>
        </div>

        <div className="summary-card">
          <p className="summary-title">Recovered (May)</p>
          <h3>$8,500</h3>
          <span className="trend up">+5.0%</span>
        </div>

        <div className="summary-card">
          <p className="summary-title">Pending Requests</p>
          <h3>3</h3>
          <span className="trend neutral">0%</span>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="table-card">
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
            
            <tr>
              <td>
                <div className="employee-cell">
                  <div className="employee-name">Wade Warren</div>
                  <div className="employee-id">ID: EMP-2023-001</div>
                </div>
              </td>

              <td>
                <div className="type-cell">
                  <div className="loan-type">Personal Loan</div>
                  <div className="loan-ref">#LN-8922</div>
                </div>
              </td>

              <td className="amount">$15,000</td>

              <td>
                <div className="repayment-cell">
                  <div className="repayment-text">$6,000 paid</div>
                  <div className="progress-bar">
                    <div style={{ width: "40%" }} />
                  </div>
                  <div className="repayment-percent">40%</div>
                </div>
              </td>

              <td className="outstanding">$9,000</td>
              <td><span className="status-pill active">active</span></td>
              <td className="action">⋮</td>
            </tr>

            
            <tr>
              <td>
                <div className="employee-cell">
                  <div className="employee-name">Jane Doe</div>
                  <div className="employee-id">ID: EMP-2023-045</div>
                </div>
              </td>

              <td>
                <div className="type-cell">
                  <div className="loan-type">Salary Advance</div>
                  <div className="loan-ref">#AD-1102</div>
                </div>
              </td>

              <td className="amount">$2,500</td>

              <td>
                <div className="repayment-cell">
                  <div className="repayment-text">$2,500 paid</div>
                  <div className="progress-bar">
                    <div style={{ width: "100%" }} />
                  </div>
                  <div className="repayment-percent">100%</div>
                </div>
              </td>

              <td className="outstanding">$0</td>
              <td><span className="status-pill paid">paid</span></td>
              <td className="action">⋮</td>
            </tr>
          </tbody>
        </table>

        {/* FOOTER */}
        <div className="table-footer">
          <span>Showing 1 to 5 of 42 results</span>
          <div className="pagination">‹ 1 2 3 ›</div>
        </div>
      </div>
    </div>
  );
};

export default LoansAdvances;



