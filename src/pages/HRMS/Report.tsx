import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Printer, 
  Download,
  ChevronDown
} from "lucide-react";
import "./report.css";

interface MonthlyData {
  month: string;
  headcount: number;
  basicPay: number;
  hra: number;
  allowances: number;
  grossSalary: number;
  pfEmp: number;
  esiEmp: number;
}

export function Report() {
  const navigate = useNavigate();
  const [fiscalYear, setFiscalYear] = useState("FY 2023-2024");
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Sample data for the report
  const yearlyData = {
    totalGrossSalary: 12450000,
    totalDeductions: 1250000,
    totalWagesAccrued: 50000,
    netPayableSalary: 11200000,
    grossSalaryChange: 12.5,
    deductionsStatus: "consistent",
    wagesAccruedChange: -5,
    salaryStatus: "cleared"
  };

  const monthlyData: MonthlyData[] = [
    {
      month: "April 2023",
      headcount: 142,
      basicPay: 3456000,
      hra: 225000,
      allowances: 125000,
      grossSalary: 3808000,
      pfEmp: 54000,
      esiEmp: 12000
    },
    {
      month: "May 2023",
      headcount: 145,
      basicPay: 3455000,
      hra: 227500,
      allowances: 128000,
      grossSalary: 3810500,
      pfEmp: 54600,
      esiEmp: 12150
    },
    {
      month: "June 2023",
      headcount: 148,
      basicPay: 3462000,
      hra: 231000,
      allowances: 130000,
      grossSalary: 3823000,
      pfEmp: 55440,
      esiEmp: 12345
    },
    {
      month: "July 2023",
      headcount: 150,
      basicPay: 3486000,
      hra: 240000,
      allowances: 160000,
      grossSalary: 3908000,
      pfEmp: 57600,
      esiEmp: 13500
    },
    {
      month: "August 2023",
      headcount: 151,
      basicPay: 3482000,
      hra: 241000,
      allowances: 155000,
      grossSalary: 3858000,
      pfEmp: 57840,
      esiEmp: 12970
    }
  ];

  // Calculate totals
  const totals = monthlyData.reduce(
    (acc, curr) => ({
      headcount: acc.headcount,
      basicPay: acc.basicPay + curr.basicPay,
      hra: acc.hra + curr.hra,
      allowances: acc.allowances + curr.allowances,
      grossSalary: acc.grossSalary + curr.grossSalary,
      pfEmp: acc.pfEmp + curr.pfEmp,
      esiEmp: acc.esiEmp + curr.esiEmp
    }),
    {
      headcount: 0,
      basicPay: 0,
      hra: 0,
      allowances: 0,
      grossSalary: 0,
      pfEmp: 0,
      esiEmp: 0
    }
  );

  // Annual trends data for chart
  const annualTrends = [
    { month: "Jan", value: 85 },
    { month: "Feb", value: 88 },
    { month: "Mar", value: 90 },
    { month: "Apr", value: 92 },
    { month: "May", value: 94 },
    { month: "Jun", value: 97 },
    { month: "Jul", value: 98 },
    { month: "Aug", value: 99 },
    { month: "Sep", value: 100 },
    { month: "Oct", value: 102 },
    { month: "Nov", value: 104 },
    { month: "Dec", value: 105 }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const handleBackToPayroll = () => {
    navigate("/dashboard/hrms");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    // Export functionality would be implemented here
    alert("Exporting to Excel...");
  };

  return (
    <div className="yearly-report-container">
      {/* Header Section */}
      <div className="report-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBackToPayroll}>
            <ArrowLeft size={20} />
          </button>
          <div className="header-content">
            <div className="breadcrumb">
              <span className="breadcrumb-item">Record's</span>
              <span className="breadcrumb-separator">&gt;</span>
              <span className="breadcrumb-item active">Financials</span>
            </div>
            <h1 className="report-title">Yearly Data Report</h1>
            <p className="report-subtitle">
              A comprehensive payroll summary and financial trends for the fiscal year.
            </p>
          </div>
        </div>
        <div className="header-right">
          <div className="fiscal-year-selector">
            <Calendar size={18} />
            <div className="year-dropdown-wrapper">
              <button 
                className="year-dropdown-button"
                onClick={() => setShowYearDropdown(!showYearDropdown)}
              >
                {fiscalYear}
                <ChevronDown size={16} />
              </button>
              {showYearDropdown && (
                <div className="year-dropdown-menu">
                  <div 
                    className="year-dropdown-item"
                    onClick={() => {
                      setFiscalYear("FY 2023-2024");
                      setShowYearDropdown(false);
                    }}
                  >
                    FY 2023-2024
                  </div>
                  <div 
                    className="year-dropdown-item"
                    onClick={() => {
                      setFiscalYear("FY 2022-2023");
                      setShowYearDropdown(false);
                    }}
                  >
                    FY 2022-2023
                  </div>
                  <div 
                    className="year-dropdown-item"
                    onClick={() => {
                      setFiscalYear("FY 2021-2022");
                      setShowYearDropdown(false);
                    }}
                  >
                    FY 2021-2022
                  </div>
                </div>
              )}
            </div>
          </div>
          <button className="print-button" onClick={handlePrint}>
            <Printer size={18} />
            Print
          </button>
          <button className="export-button" onClick={handleExportExcel}>
            <Download size={18} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card card-blue">
          <div className="card-header">
            <span className="card-title">Total Gross Salary</span>
            <div className="card-icon icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="card-value">{formatCurrency(yearlyData.totalGrossSalary)}</div>
          <div className="card-footer">
            <TrendingUp size={16} className="trend-icon trend-up" />
            <span className="trend-text">+{yearlyData.grossSalaryChange}% vs last year</span>
          </div>
        </div>

        <div className="summary-card card-orange">
          <div className="card-header">
            <span className="card-title">Total Deductions</span>
            <div className="card-icon icon-orange">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="card-value">{formatCurrency(yearlyData.totalDeductions)}</div>
          <div className="card-footer">
            <Minus size={16} className="trend-icon trend-neutral" />
            <span className="trend-text">Consistent with projection</span>
          </div>
        </div>

        <div className="summary-card card-purple">
          <div className="card-header">
            <span className="card-title">Total Wages Accrued</span>
            <div className="card-icon icon-purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="card-value">{formatCurrency(yearlyData.totalWagesAccrued)}</div>
          <div className="card-footer">
            <TrendingDown size={16} className="trend-icon trend-down" />
            <span className="trend-text">{yearlyData.wagesAccruedChange}% allocation</span>
          </div>
        </div>

        <div className="summary-card card-green">
          <div className="card-header">
            <span className="card-title">Net Payable Salary</span>
            <div className="card-icon icon-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
                <circle cx="7" cy="15" r="1" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <div className="card-value">{formatCurrency(yearlyData.netPayableSalary)}</div>
          <div className="card-footer">
            <span className="status-badge">Cleared for processing</span>
          </div>
        </div>
      </div>

      {/* Annual Salary Trends Chart */}
      <div className="chart-section">
        <div className="chart-header">
          <h2 className="chart-title">Annual Salary Trends</h2>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot legend-gross"></span>
              <span className="legend-label">Gross</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot legend-net"></span>
              <span className="legend-label">Net Pay</span>
            </div>
          </div>
        </div>
        <div className="chart-container">
          <div className="chart-bars">
            {annualTrends.map((data, index) => (
              <div key={index} className="bar-group">
                <div className="bar-wrapper">
                  <div 
                    className="bar bar-gross"
                    style={{ height: `${data.value}%` }}
                    title={`${data.month}: ${data.value}%`}
                  ></div>
                </div>
                <div className="bar-label">{data.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Monthly Breakdown Table */}
      <div className="table-section">
        <div className="table-header">
          <h2 className="table-title">Detailed Monthly Breakdown</h2>
          <div className="table-actions">
            <button className="table-action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2"/>
                <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2"/>
                <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2"/>
              </svg>
            </button>
            <button className="table-action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="7" height="7" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>MONTH</th>
                <th>HEADCOUNT</th>
                <th>BASIC PAY</th>
                <th>H.R.A</th>
                <th>ALLOWANCES</th>
                <th>GROSS SALARY</th>
                <th>PF (EMP)</th>
                <th>ESI (EMP)</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((data, index) => (
                <tr key={index}>
                  <td className="month-cell">
                    <div className="month-wrapper">
                      <span className="month-name">{data.month.split(" ")[0]}</span>
                      <span className="month-year">{data.month.split(" ")[1]}</span>
                    </div>
                  </td>
                  <td>{data.headcount}</td>
                  <td>{formatCurrency(data.basicPay)}</td>
                  <td>{formatCurrency(data.hra)}</td>
                  <td>{formatCurrency(data.allowances)}</td>
                  <td className="gross-salary-cell">{formatCurrency(data.grossSalary)}</td>
                  <td>{formatCurrency(data.pfEmp)}</td>
                  <td>{formatCurrency(data.esiEmp)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td className="total-label">Total<br/><span className="ytd-label">YTD</span></td>
                <td>-</td>
                <td>{formatCurrency(totals.basicPay)}</td>
                <td>{formatCurrency(totals.hra)}</td>
                <td>{formatCurrency(totals.allowances)}</td>
                <td className="gross-salary-cell">{formatCurrency(totals.grossSalary)}</td>
                <td>{formatCurrency(totals.pfEmp)}</td>
                <td>{formatCurrency(totals.esiEmp)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span className="viewing-text">Viewing 5 of 12 months</span>
        </div>
      </div>
    </div>
  );
}
