import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "antd";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUserPlus,
  FaBoxes,
  FaTruck,
  FaCogs,
  FaChartBar,
  FaQuestionCircle,
} from "react-icons/fa";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import toast from "react-hot-toast";
import "./DashboardLayout.css";

/* ---------------- Types ---------------- */

interface Props {
  children: ReactNode;
}

/* ---------------- Layout ---------------- */

export default function DashboardLayout({ children }: Props) {
  const { username, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleMenu = (key: string, label: string) => {
    setOpenMenu(openMenu === key ? null : key);

    toast(label + (openMenu === key ? " closed" : " opened"), {
      icon: "📂",
      duration: 1200,
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/", { replace: true });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f6f7fb", position: "relative" }}>
      {/* Mobile/Tablet Overlay */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 40,
            display: window.innerWidth < 1024 ? "block" : "none",
          }}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        style={{
          flexBasis: window.innerWidth < 768 ? "200px" : window.innerWidth < 1024 ? "240px" : "20%",
          flexShrink: 0,
          width: window.innerWidth < 768 ? 200 : window.innerWidth < 1024 ? 240 : undefined,
          minWidth: window.innerWidth < 768 ? 200 : 240,
          maxWidth: window.innerWidth < 1024 ? undefined : 320,
          background: "#ffffff",
          borderRight: "1px solid #e5e7eb",
          padding: window.innerWidth < 768 ? 12 : 20,
          position: window.innerWidth < 1024 ? "fixed" : "relative",
          left: window.innerWidth < 1024 ? (isSidebarOpen ? 0 : -(window.innerWidth < 768 ? 200 : 240)) : 0,
          top: 0,
          height: "100vh",
          overflowY: "auto",
          transition: "left 0.3s ease",
          zIndex: 50,
        }}
      >
        {/* Close Button for Mobile/Tablet - Only show when sidebar is open */}
        {isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            style={{
              display: window.innerWidth < 1024 ? "flex" : "none",
              position: "absolute",
              top: 12,
              right: 12,
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "2px solid #dc2626",
              background: "#fff",
              cursor: "pointer",
              fontSize: 20,
              fontWeight: "bold",
              color: "#dc2626",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              zIndex: 100,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#dc2626";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = "#dc2626";
            }}
            title="Close Sidebar"
          >
            ✕
          </button>
        )}

        <h2 className="logo">EPROC</h2>

        <div className="profile">
          <div className="avatar">
            <img
              src="/ray-log.png"
              alt="Ray Engineering Logo"
              style={{
                position: "relative",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </div>
          <p className="company">Ray Engineering</p>
          <span className="id">R306</span>
        </div>

        <SidebarButton
          icon={<FaHome />}
          label="Dashboard"
          onClick={() => navigate("/dashboard")}
        />

        <SidebarExpandable
          icon={<FaUserPlus />}
          label="Registration"
          open={openMenu === "registration"}
          onClick={() => toggleMenu("registration", "Registration")}
        >
          <SubItem label="Vendor" path="/dashboard/registration/vendor"/>
          <SubItem label="Employee" path="/dashboard/registration/employee" />
          <SubItem label="PPE" path="/dashboard/registration/ppe"/>
          <SubItem label="Mechanical" path="/dashboard/registration/mechanical"/>
          <SubItem label="Scaffolding" path="/dashboard/registration/scaffolding" />
        </SidebarExpandable>

        <SidebarExpandable
          icon={<FaBoxes />}
          label="Store Management"
          open={openMenu === "store"}
          onClick={() => toggleMenu("store", "Store Management")}
        >
          <SubGroup label="Material Purchase">
            <SubItem label="PPE" />
            <SubItem label="Mechanical" />
            <SubItem label="Scaffolding" />
          </SubGroup>

          <SubGroup label="Material orders">
            <SubItem
              label="Scaffolding"
              path="/dashboard/material-order/scaffolding"
            />
          </SubGroup>

          <SubGroup label="Material Issue">
            <SubItem label="PPE" />
            <SubItem label="Mechanical" />
            <SubItem label="Scaffolding" />
          </SubGroup>

          <SubGroup label="Material Return">
            <SubItem label="PPE" />
            <SubItem label="Mechanical" />
            <SubItem label="Scaffolding" />
          </SubGroup>

          <SubGroup label="Stock Report">
            <SubItem label="PPE" />
            <SubItem label="Mechanical" />
            <SubItem label="Scaffolding" />
          </SubGroup>
        </SidebarExpandable>

        <SidebarButton icon={<FaCogs />} label="HRMS" />
        <SidebarButton icon={<FaTruck />} label="Vehicle Management" />
        <SidebarButton icon={<FaChartBar />} label="Settings" />
        <SidebarButton icon={<FaQuestionCircle />} label="Help & Support" />
      </aside>

      {/* ================= MAIN ================= */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", minWidth: 0 }}>
        {/* HEADER */}
        <header
          style={{
            height: 70,
            background: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Mobile/Tablet Menu Button */}
            <button
              onClick={toggleSidebar}
              style={{
                display: window.innerWidth < 1024 ? "flex" : "none",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "white",
                cursor: "pointer",
                marginRight: 8,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
              }}
              title="Toggle Sidebar"
            >
              <span style={{ fontSize: 20 }}>☰</span>
            </button>
            
            <img src="/ray-log.png" alt="Ray Engineering" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "contain" }} />
            <div>
              <strong>Ray Engineering</strong>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Management System
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span>
              Welcome, <b>{role === "admin" ? "Admin" : username}</b>
            </span>
            <Button
              danger
              onClick={handleLogout}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#FF5C5C"; // light red
                e.currentTarget.style.borderColor = "#ff4d4f";
                e.currentTarget.style.color = "#ffffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "";
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.color = "";
              }}
            >
              Logout
            </Button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main style={{ padding: 32 }}>{children}</main>
      </div>
    </div>
  );
}

/* ================= Components ================= */

function SidebarButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <div style={sidebarItemStyle} onClick={onClick}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {icon}
        {label}
      </div>
    </div>
  );
}

function SidebarExpandable({
  icon,
  label,
  open,
  onClick,
  children,
}: {
  icon: ReactNode;
  label: string;
  open: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <div style={sidebarItemStyle} onClick={onClick}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {icon}
          {label}
        </div>
        {open ? <FiChevronDown /> : <FiChevronRight />}
      </div>

      {open && <div style={{ marginLeft: 28 }}>{children}</div>}
    </>
  );
}
function SubGroup({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginBottom: 10 }}>
      {/* SubGroup Header */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 13,
          fontWeight: 600,
          color: "#374151",
          margin: "8px 0 4px",
          padding: "6px 8px",
          borderRadius: 6,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <span>{label}</span>
        {open ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
      </div>

      {/* Sub Items */}
      {open && <div style={{ marginLeft: 14 }}>{children}</div>}
    </div>
  );
}
function SubItem({ label, path }: { label: string; path?: string }) {
  const navigate = useNavigate();

  const handleClick = () => {
    console.log("SubItem clicked:", label, "Path:", path);
    if (path) {
      console.log("Navigating to:", path);
      navigate(path);
      toast.success(`Navigating to ${label}`);
    } else {
      toast(label + " clicked", { icon: "➡️" });
    }
  };

  return (
    <div
      style={{
        fontSize: 13,
        padding: "6px 12px",
        borderRadius: 6,
        cursor: "pointer",
        color: "#4b5563",
      }}
      onClick={handleClick}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {label}
    </div>
  );
}

/* ================= Styles ================= */

const sidebarItemStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  marginBottom: 6,
  fontSize: 14,
  fontWeight: 500,
};
