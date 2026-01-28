import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "antd";
import { useAuthStore } from "../store/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  HelpCircle,
  Menu,
  X,
  ChevronLeft,
  Clock,
  CheckSquare,
  DollarSign,
  CreditCard,
  UserCog,
  Activity,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import "./HRMSDashboardLayout.css";

interface Props {
  children: ReactNode;
}

export default function HRMSDashboardLayout({ children }: Props) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [employeeMenuOpen, setEmployeeMenuOpen] = useState(false);
  const [payrollMenuOpen, setPayrollMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/", { replace: true });
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };


  const employeeSubItems = [
    {
      label: "Employees Details",
      path: "/dashboard/hrms/employees",
    },
    {
      label: "Employee Managements",
      path : "/dashboard/hrms/employees/management",
    },
    {
      label: "Salary Sheet",
      path: "/dashboard/hrms/salary-sheet",
    },
    {
      label: "Attendance",
      path: "/dashboard/hrms/attendance",
    },
  ];

  const payrollSubItems = [
    {
      label: "Employee Management",
      path: "/dashboard/hrms/payroll/employee-management",
    },
    {
      label: "Payroll Processing",
      path: "/dashboard/hrms/payroll/processing",
    },
    {
      label: "Attendance",
      path: "/dashboard/hrms/payroll/attendance",
    },
    {
      label: "Reports",
      path: "/dashboard/hrms/reports/yearly",
    },
  ];
  
  const menuItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      path: "/dashboard/hrms/dashboard",
    },
    {
      icon: <Clock size={20} />,
      label: "Manage Shifts",
      path: "/dashboard/hrms/shifts",
    },
    {
      icon: <Calendar size={20} />,
      label: "Leaves & Holidays",
      path: "/dashboard/hrms/leaves",
    },
    {
      icon: <CheckSquare size={20} />,
      label: "Approval Requests",
      path: "/dashboard/hrms/approvals",
    },
    {
      icon: <CreditCard size={20} />,
      label: "Loans & Advances",
      path: "/dashboard/hrms/loans-advances",
    },
    {
      icon: <UserCog size={20} />,
      label: "User Management",
      path: "/dashboard/hrms/user-management",
    },
    {
      icon: <Activity size={20} />,
      label: "Activity Logs",
      path: "/dashboard/hrms/activity-logs",
    },
    {
      icon: <BarChart3 size={20} />,
      label: "Reports",
      path: "/dashboard/hrms/reports/yearly",
    },
  ];

  return (
    <div className="hrms-layout-container">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="hrms-mobile-overlay" onClick={toggleSidebar} />
      )}

      {/* HRMS Sidebar */}
      <aside className={`hrms-sidebar ${isSidebarOpen ? "open" : ""} ${sidebarCollapsed ? "collapsed" : ""}`}>
        {/* Close Button for Mobile */}
        <button className="hrms-sidebar-close" onClick={toggleSidebar}>
          <X size={24} />
        </button>

        {/* Desktop Toggle Button */}
        <button className="hrms-sidebar-toggle" onClick={toggleSidebarCollapse}>
          <Menu size={20} />
        </button>

        {/* Back to Dashboard Button */}
        <button className="hrms-back-button" onClick={handleBackToDashboard}>
          <ChevronLeft size={20} />
          <span>Back to Main Dashboard</span>
        </button>

        {/* HRMS Portal Header */}
        <div className="hrms-portal-header">
          <div className="hrms-portal-icon">
            <Users size={24} />
          </div>
          <h2 className="hrms-portal-title">HRMS Portal</h2>
        </div>

        {/* Navigation Menu */}
        <nav className="hrms-nav">
        
          {/* Expandable Employee Section */}
          <div>
            <button
              className={`hrms-nav-item ${
                employeeSubItems.some(sub => isActive(sub.path)) ? "active" : ""
              }`}
              onClick={() => setEmployeeMenuOpen(!employeeMenuOpen)}
            >
              <span className="hrms-nav-icon">
                <Users size={20} />
              </span>
              <span className="hrms-nav-label">Employees</span>
              <span className="hrms-nav-chevron">
                {employeeMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            </button>
            
            {employeeMenuOpen && (
              <div className="hrms-nav-submenu">
                {employeeSubItems.map((subItem, index) => (
                  <button
                    key={index}
                    className={`hrms-nav-subitem ${
                      isActive(subItem.path) ? "active" : ""
                    }`}
                    onClick={() => {
                      navigate(subItem.path);
                      setIsSidebarOpen(false);
                    }}
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Expandable Payroll Section */}
          <div>
            <button
              className={`hrms-nav-item ${
                payrollSubItems.some(sub => isActive(sub.path)) ? "active" : ""
              }`}
              onClick={() => setPayrollMenuOpen(!payrollMenuOpen)}
            >
              <span className="hrms-nav-icon">
                <DollarSign size={20} />
              </span>
              <span className="hrms-nav-label">Payroll</span>
              <span className="hrms-nav-chevron">
                {payrollMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            </button>
            
            {payrollMenuOpen && (
              <div className="hrms-nav-submenu">
                {payrollSubItems.map((subItem, index) => (
                  <button
                    key={index}
                    className={`hrms-nav-subitem ${
                      isActive(subItem.path) ? "active" : ""
                    }`}
                    onClick={() => {
                      navigate(subItem.path);
                      setIsSidebarOpen(false);
                    }}
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
            {menuItems.map((item, index) => (
            <button
              key={index}
              className={`hrms-nav-item ${
                isActive(item.path) ? "active" : ""
              }`}
              onClick={() => {
                navigate(item.path);
                setIsSidebarOpen(false);
              }}
            >
              <span className="hrms-nav-icon">{item.icon}</span>
              <span className="hrms-nav-label">{item.label}</span>
            </button>
          ))}

        </nav>

        {/* Settings Section */}
        <div className="hrms-settings-section">
          <div className="hrms-settings-header">SETTINGS</div>
          <button
            className="hrms-nav-item"
            onClick={() => {
              navigate("/dashboard/hrms/configuration");
              setIsSidebarOpen(false);
            }}
          >
            <span className="hrms-nav-icon">
              <Settings size={20} />
            </span>
            <span className="hrms-nav-label">Configuration</span>
          </button>
        </div>

        {/* User Profile Section */}
        <div className="hrms-user-profile">
          <div className="hrms-user-avatar">
            <img
              src="/ray-log.png"
              alt="User Avatar"
              className="hrms-avatar-img"
            />
          </div>
          <div className="hrms-user-info">
            <div className="hrms-user-name">Alex Morgan</div>
            <div className="hrms-user-role">HR Manager</div>
          </div>
          <button className="hrms-user-menu-btn">
            <Settings size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="hrms-main-content">
        {/* Header */}
        <header className="hrms-header">
          <div className="hrms-header-left">
            {/* Mobile Menu Button */}
            <button className="hrms-mobile-menu-btn" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>

            <div className="hrms-header-title">
              <h1>Payroll Dashboard</h1>
              <p>Ray Engineering • October 16, 2023</p>
            </div>
          </div>

          <div className="hrms-header-right">
            <div className="hrms-search-box">
              <input
                type="text"
                placeholder="Search employees, payroll IDs..."
                className="hrms-search-input"
              />
            </div>

            <button className="hrms-icon-btn" title="Notifications">
              <Bell size={20} />
              <span className="hrms-notification-badge">3</span>
            </button>

            <button className="hrms-icon-btn" title="Help">
              <HelpCircle size={20} />
            </button>

            <Button
              danger
              onClick={handleLogout}
              style={{ marginLeft: "12px" }}
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="hrms-page-content">{children}</main>
      </div>
    </div>
  );
}
