import { useState, useEffect } from "react";
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
import { 
  getYearlyReport, 
  getAllFiscalYears,
  type MonthlyData,
  type YearlyData
} from "../../services/payrollService";

export function Report() {
  const navigate = useNavigate();
  const [fiscalYear, setFiscalYear] = useState("FY 2023-2024");
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fiscalYears, setFiscalYears] = useState<string[]>([]);
  
  // Data from backend
  const [yearlyData, setYearlyData] = useState<YearlyData>({
    totalGrossSalary: 0,
    totalDeductions: 0,
    totalWagesAccrued: 0,
    netPayableSalary: 0,
    grossSalaryChange: 0,
    deductionsStatus: "consistent",
    wagesAccruedChange: 0,
    salaryStatus: "cleared"
  });
  
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [totals, setTotals] = useState({
    basicPay: 0,
    hra: 0,
    allowances: 0,
    grossSalary: 0,
    pfEmp: 0,
    esiEmp: 0,
    netSalary: 0
  });

  // Fetch fiscal years on mount
  useEffect(() => {
    fetchFiscalYears();
  }, []);

  // Fetch report data when fiscal year changes
  useEffect(() => {
    if (fiscalYear) {
      fetchReportData(fiscalYear);
    }
  }, [fiscalYear]);

  const fetchFiscalYears = async () => {
    try {
      const years = await getAllFiscalYears();
      setFiscalYears(years);
      if (years.length > 0 && !fiscalYear) {
        setFiscalYear(years[0]);
      }
    } catch (err: any) {
      console.error("Error fetching fiscal years:", err);
      // If no fiscal years exist, use default
      setFiscalYears(["FY 2023-2024", "FY 2022-2023", "FY 2021-2022"]);
    }
  };

  const fetchReportData = async (year: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getYearlyReport(year);
      setYearlyData(response.yearlyData);
      setMonthlyData(response.monthlyData);
      setTotals(response.totals);
    } catch (err: any) {
      console.error("Error fetching report data:", err);
      setError(err.message || "Failed to load report data");
      // Keep using sample data if backend fails
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    // Fallback sample data
    const sampleMonthlyData: MonthlyData[] = [
      {
        month: "April 2023",
        monthNumber: 4,
        year: 2023,
        headcount: 142,
        basicPay: 3456000,
        hra: 225000,
        allowances: 125000,
        grossSalary: 3808000,
        pfEmp: 54000,
        esiEmp: 12000,
        netSalary: 3742000
      },
      {
        month: "May 2023",
        monthNumber: 5,
        year: 2023,
        headcount: 145,
        basicPay: 3455000,
        hra: 227500,
        allowances: 128000,
        grossSalary: 3810500,
        pfEmp: 54600,
        esiEmp: 12150,
        netSalary: 3743750
      },
    ];
    
    setMonthlyData(sampleMonthlyData);
    
    const sampleTotals = sampleMonthlyData.reduce(
      (acc, curr) => ({
        basicPay: acc.basicPay + curr.basicPay,
        hra: acc.hra + curr.hra,
        allowances: acc.allowances + curr.allowances,
        grossSalary: acc.grossSalary + curr.grossSalary,
        pfEmp: acc.pfEmp + curr.pfEmp,
        esiEmp: acc.esiEmp + curr.esiEmp,
        netSalary: acc.netSalary + curr.netSalary
      }),
      { basicPay: 0, hra: 0, allowances: 0, grossSalary: 0, pfEmp: 0, esiEmp: 0, netSalary: 0 }
    );
    
    setTotals(sampleTotals);
  };

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

  if (loading) {
    return (
      <div className="yearly-report-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error && monthlyData.length === 0) {
    return (
      <div className="yearly-report-container">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => fetchReportData(fiscalYear)} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

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
                  {fiscalYears.map((year) => (
                    <div 
                      key={year}
                      className="year-dropdown-item"
                      onClick={() => {
                        setFiscalYear(year);
                        setShowYearDropdown(false);
                      }}
                    >
                      {year}
                    </div>
                  ))}
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
          <span className="viewing-text">Viewing {monthlyData.length} of 12 months</span>
        </div>
      </div>
    </div>
  );
}
