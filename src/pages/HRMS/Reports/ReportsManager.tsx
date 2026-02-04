import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../hrmsmanager.css";

export function ReportsManager() {
  const navigate = useNavigate();

  const handleBackToHRMS = () => {
    navigate("/dashboard/hrms");
  };

  const reports = [
    {
      id: 1,
      title: "Monthly Report",
      description: "View detailed monthly payroll breakdown and financial data",
      icon: Calendar,
      color: "bg-blue-500",
      action: "View Monthly Report",
      onClick: () => {
        navigate("/dashboard/hrms/reports/monthly");
      },
    },
    {
      id: 2,
      title: "Quarterly Report",
      description: "View quarterly aggregated payroll summary and trends",
      icon: BarChart3,
      color: "bg-green-500",
      action: "View Quarterly Report",
      onClick: () => {
        navigate("/dashboard/hrms/reports/weekly");
      },
    },
    {
      id: 3,
      title: "Yearly Report",
      description: "View comprehensive yearly payroll summary and analytics",
      icon: TrendingUp,
      color: "bg-purple-500",
      action: "View Yearly Report",
      onClick: () => {
        navigate("/dashboard/hrms/reports/yearly");
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Reports Management</h1>
          <p className="text-gray-600 mb-6">
            Generate and view payroll reports for different time periods
          </p>

          <button
            onClick={handleBackToHRMS}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to HRMS</span>
          </button>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    report.color ?? ""
                  }`}
                >
                  <Icon size={26} strokeWidth={2.2} className="text-white" />
                </div>

                <h3 className="text-gray-900 mb-2">{report.title}</h3>
                <p className="text-sm text-gray-600 mb-6 min-h-[40px]">
                  {report.description}
                </p>

                <button
                  onClick={report.onClick}
                  className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {report.action}
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
