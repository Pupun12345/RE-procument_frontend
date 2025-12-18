import { Routes, Route } from "react-router-dom";
import Home from "../src/pages/Home";
import Login from "../src/pages/Login";
import Dashboard from "../src/pages/Dashboard";
import ProtectedRoute from "../src/components/ProtectedRoute";
import EmployeeRegistration from "../src/pages/EmployeeRegistration";
import DashboardLayout from "../src/layouts/DashboardLayout";
import ScaffoldingOrder from "../src/pages/material_order/ScaffoldingOrder";
import { StoreManager } from "../src/pages/storemanager";
import VendorForm from "../src/pages/vendorRegistration/page";
import { VendorGateway } from "../src/pages/vendorRegistration/gateway";
import MechanicalRegistration from "../src/pages/mechanical";
import PPERegistration from "../src/pages/ppe";
import ScaffoldingRegistration from "../src/pages/scaffholding";
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
           </ProtectedRoute> 
        }
      />
      <Route
        path="/dashboard/store-management"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <StoreManager />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/registration/employee"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EmployeeRegistration />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/material-order/scaffolding"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ScaffoldingOrder />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/registration/vendor"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <VendorForm />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/vendor-gateway"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <VendorGateway />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/registration/mechanical"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MechanicalRegistration />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    
      <Route
        path="/dashboard/registration/ppe"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PPERegistration />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/registration/scaffolding"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ScaffoldingRegistration />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
    
  );
}
