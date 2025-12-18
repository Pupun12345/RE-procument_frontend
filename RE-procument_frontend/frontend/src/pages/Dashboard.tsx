import DashboardLayout from "../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import {
  FaWarehouse,
  FaUsers,
  FaCar,
  FaFileAlt,
  FaCog,
  FaQuestionCircle,
} from "react-icons/fa";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: 34, marginBottom: 6 }}>Dashboard</h1>
      <p style={{ color: "#6b7280", marginBottom: 32 }}>
        Select a module to get started
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 24,
        }}
      >
         <ModuleCard
          icon={<FaFileAlt />}
          color="#8b5cf6"
          title="Registration"
          desc="Generate and view business reports and analytics"
        />
        
        <ModuleCard
          icon={<FaWarehouse />}
          color="#3b82f6"
          title="Store Management"
          desc="Manage inventory, stock levels, and store operations"
          onClick={() => navigate("/dashboard/store-management")}
        />

        <ModuleCard
          icon={<FaUsers />}
          color="#22c55e"
          title="HRMS"
          desc="Human resource management and employee records"
        />

        <ModuleCard
          icon={<FaCar />}
          color="#f97316"
          title="Vehicle Management"
          desc="Track and manage company vehicles and maintenance"
        />

       

        <ModuleCard
          icon={<FaCog />}
          color="#14b8a6"
          title="Settings"
          desc="Configure system preferences and user settings"
        />

        <ModuleCard
          icon={<FaQuestionCircle />}
          color="#ef4444"
          title="Help & Support"
          desc="Get assistance and access documentation"
        />
      </div>
    </DashboardLayout>
  );
}

function ModuleCard({
  icon,
  title,
  desc,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 24,
        border: "1px solid #e5e7eb",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.1)";
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: color,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          marginBottom: 16,
        }}
      >
        {icon}
      </div>

      <h3 style={{ marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 14, color: "#6b7280" }}>{desc}</p>
    </div>
  );
}
