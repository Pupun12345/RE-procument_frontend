import {
  ArrowLeft,
  Users,
  Clock,
  Calendar,
  CheckSquare,
  DollarSign,
  CreditCard,
  FileText,
  UserCog,
  Activity,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./hrmsmanager.css";

export function HRMSManager() {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const modules = [
    {
      id: 1,
      title: "Dashboard",
      description: "The main landing page overview",
      icon: LayoutDashboard,
      color: "bg-purple-500",
      action: "Open Dashboard",
      onClick: () => {
        navigate("/dashboard/hrms/dashboard");
      },
    },
    {
      id: 2,
      title: "Employees",
      description: "For managing staff records (Add, View, Edit)",
      icon: Users,
      color: "bg-blue-500",
      action: "Manage Employees",
      onClick: () => {
        navigate("/dashboard/hrms/employees");
      },
    },
    {
      id: 3,
      title: "Manage Shifts",
      description: "To schedule and assign work hours",
      icon: Clock,
      color: "bg-green-500",
      action: "Manage Shifts",
      onClick: () => {
        navigate("/dashboard/hrms/shifts");
      },
    },
    {
      id: 4,
      title: "Leaves & Holidays",
      description: "For tracking time-off requests and public holidays",
      icon: Calendar,
      color: "bg-orange-500",
      action: "Manage Leaves",
      onClick: () => {
        navigate("/dashboard/hrms/leaves");
      },
    },
    {
      id: 5,
      title: "Approval Requests",
      description: "A consolidated view of all items requiring management sign-off",
      icon: CheckSquare,
      color: "bg-yellow-500",
      action: "View Requests",
      onClick: () => {
        navigate("/dashboard/hrms/approvals");
      },
    },
    {
      id: 6,
      title: "Payroll",
      description: "For handling salaries, bonuses, and deductions",
      icon: DollarSign,
      color: "bg-emerald-500",
      action: "Manage Payroll",
      onClick: () => {
        navigate("/dashboard/hrms/payroll");
      },
    },
    {
      id: 7,
      title: "Loans & Advances",
      description: "For managing employee financial requests",
      icon: CreditCard,
      color: "bg-cyan-500",
      action: "Manage Loans",
      onClick: () => {
        navigate("/dashboard/hrms/loans");
      },
    },
    {
      id: 8,
      title: "Reports",
      description: "For generating data analytics and summaries",
      icon: FileText,
      color: "bg-indigo-500",
      action: "View Reports",
      onClick: () => {
        navigate("/dashboard/hrms/reports");
      },
    },
    {
      id: 9,
      title: "User Management",
      description: "To control access levels and user roles",
      icon: UserCog,
      color: "bg-pink-500",
      action: "Manage Users",
      onClick: () => {
        navigate("/dashboard/hrms/user-management");
      },
    },
    {
      id: 10,
      title: "Activity Logs",
      description: "To monitor system usage and changes",
      icon: Activity,
      color: "bg-red-500",
      action: "View Logs",
      onClick: () => {
        navigate("/dashboard/hrms/activity-logs");
      },
    },
    {
      id: 11,
      title: "Configuration",
      description: "For general system settings",
      icon: Settings,
      color: "bg-gray-600",
      action: "Open Configuration",
      onClick: () => {
        navigate("/dashboard/hrms/configuration");
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">HRMS Management</h1>
          <p className="text-gray-600 mb-6">
            Manage human resources, payroll, and employee operations
          </p>

          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-3 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    module.color ?? ""
                  }`}
                  style={module.bg ? { backgroundColor: module.bg } : undefined}
                >
                  <Icon size={26} strokeWidth={2.2} className="text-white" />
                </div>

                <h3 className="text-gray-900 mb-2">{module.title}</h3>
                <p className="text-sm text-gray-600 mb-6 min-h-[40px]">
                  {module.description}
                </p>

                <button
                  onClick={module.onClick}
                  className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {module.action}
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
