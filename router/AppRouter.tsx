import { Routes, Route } from "react-router-dom";
import Home from "../src/pages/Home";
import Login from "../src/pages/Login";
import ForgotPassword from "../src/pages/ForgotPassword";
import Dashboard from "../src/pages/Dashboard";
import ProtectedRoute from "../src/components/ProtectedRoute";
import EmployeeRegistration from "../src/pages/EmployeeRegistration";
import DashboardLayout from "../src/layouts/DashboardLayout";
import HRMSDashboardLayout from "../src/layouts/HRMSDashboardLayout";
import ScaffoldingOrder from "../src/pages/material_order/ScaffoldingOrder";
import { StoreManager } from "../src/pages/storemanager";
import VendorForm from "../src/pages/vendorRegistration/page";
import { VendorGateway } from "../src/pages/vendorRegistration/gateway";
import MechanicalRegistration from "../src/pages/mechanical";
import PPEDistribution from "../src/pages/material_issue/PPEDistribution";
import ScaffoldingRegistration from "../src/pages/scaffholding";
import PPERegistration from "../src/pages/ppe";
import MechanicalIssuePage from "../src/pages/material_issue/MechanicalIssue";
import ScaffholdingIssuePage from "../src/pages/material_issue/scaffholdingIssue";
import ReturnPage from "../src/pages/material_return/scaffholdingreturn";
import MechanicalReturnPage from "../src/pages/material_return/mechanicalreturn";
import PPEReturnPage from "../src/pages/material_return/PPEreturn";
import PPEPurchase from "../src/pages/materialPurchase/PPEPurchase";
import MechanicalPurchase from "../src/pages/materialPurchase/MechanicalPurchase";
import ScaffoldingPurchase from "../src/pages/materialPurchase/ScaffoldingPurchase";
import PPEStockReport from "../src/pages/stockReport/PPEStockReport";
import MechanicalStockReport from "../src/pages/stockReport/MechanicalStockReport";
import ScaffoldingStockReport from "../src/pages/stockReport/ScaffoldingStockReport";
import { RegistrationManager } from "../src/pages/RegistrationManager";
import { MaterialPurchaseManager } from "../src/pages/MaterialPurchaseManager";
import { MaterialIssueManager } from "../src/pages/MaterialIssueManager";
import { MaterialReturnManager } from "../src/pages/MaterialReturnManager";
import { StockOverviewManager } from "../src/pages/StockOverviewManager";
import { FinalReportManager } from "../src/pages/FinalReportManager";
import { HRMSManager } from "../src/pages/HRMS/HRMSManager";
import { HRMSDashboard } from "../src/pages/HRMS/Dashboard/HRMSDashboard";
import { HRMSEmployees } from "../src/pages/HRMS/Employees/HRMSEmployees";
import LoansAdvances from "../src/pages/HRMS/Loan/LoansAdvances";
import { ShiftManagement } from "../src/pages/HRMS/Employees/EmployeeManagement";
import { Report } from "../src/pages/HRMS/Report";
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
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
          <DashboardLayout>
            <VendorGateway />
          </DashboardLayout>
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
      ''
      <Route
        path="/dashboard/material-issue/ppe-distribution"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PPEDistribution />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/material-issue/mechanical-issue"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MechanicalIssuePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/material-issue/scaffholding-issue"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ScaffholdingIssuePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/material-return/scaffholding-return"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ReturnPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/material-return/mechanical-return"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MechanicalReturnPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/material-return/ppe-return"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PPEReturnPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/material-purchase/ppe"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PPEPurchase />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/material-purchase/mechanical"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MechanicalPurchase />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/material-purchase/scaffolding"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ScaffoldingPurchase />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/stock-report/ppe"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PPEStockReport />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/stock-report/mechanical"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MechanicalStockReport />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/stock-report/scaffolding"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ScaffoldingStockReport />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/registration"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <RegistrationManager />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/material-purchase"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MaterialPurchaseManager />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/material-issue"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MaterialIssueManager />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/material-return"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MaterialReturnManager />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/stock-overview"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <StockOverviewManager />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/final-report"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <FinalReportManager />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/hrms"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <HRMSManager />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/hrms/dashboard"
        element={
          <ProtectedRoute>
            <HRMSDashboardLayout>
              <HRMSDashboard />
            </HRMSDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/hrms/employees"
        element={
          <ProtectedRoute>
            <HRMSDashboardLayout>
              <HRMSEmployees />
            </HRMSDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/hrms/payroll"
        element={
          <ProtectedRoute>
            <HRMSDashboardLayout>
              <HRMSDashboard />
            </HRMSDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/hrms/attendance"
        element={
          <ProtectedRoute>
            <HRMSDashboardLayout>
              <HRMSDashboard />
            </HRMSDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/hrms/reports"
        element={
          <ProtectedRoute>
            <HRMSDashboardLayout>
              <HRMSDashboard />
            </HRMSDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/hrms/configuration"
        element={
          <ProtectedRoute>
            <HRMSDashboardLayout>
              <HRMSDashboard />
            </HRMSDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/hrms/loans-advances"
        element={
          <ProtectedRoute>
            <HRMSDashboardLayout>
              <LoansAdvances />
            </HRMSDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/hrms/employees/management"
        element={
          <ProtectedRoute>
            <HRMSDashboardLayout>
              <ShiftManagement />
            </HRMSDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/hrms/reports/yearly"
        element={
          <ProtectedRoute>
            <HRMSDashboardLayout>
              <Report />
            </HRMSDashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
