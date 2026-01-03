import {
  ArrowLeft,
  Users,
  UserPlus,
  ShieldCheck,
  Wrench,
  Boxes,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RegistrationManager() {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const modules = [
    {
      id: 1,
      title: "Vendor",
      description: "Vendor master registration",
      icon: Users,
      bg: "#8b5cf6", // purple-500
      action: "Open Vendor",
      onClick: () => navigate("/dashboard/registration/vendor"),
    },
    {
      id: 2,
      title: "Employee",
      description: "Employee master registration",
      icon: UserPlus,
      bg: "#3b82f6", // blue-500
      action: "Open Employee",
      onClick: () => navigate("/dashboard/registration/employee"),
    },
    {
      id: 3,
      title: "PPE",
      description: "PPE item registration",
      icon: ShieldCheck,
      bg: "#22c55e", // green-500
      action: "Open PPE",
      onClick: () => navigate("/dashboard/registration/ppe"),
    },
    {
      id: 4,
      title: "Mechanical",
      description: "Mechanical items registration",
      icon: Wrench,
      bg: "#f97316", // orange-500
      action: "Open Mechanical",
      onClick: () => navigate("/dashboard/registration/mechanical"),
    },
    {
      id: 5,
      title: "Scaffolding",
      description: "Scaffolding item registration",
      icon: Boxes,
      bg: "#ef4444", // red-500
      action: "Open Scaffolding",
      onClick: () => navigate("/dashboard/registration/scaffolding"),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Registration</h1>
          <p className="text-gray-600 mb-6">Manage all master registrations</p>

          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>

        {/* Icon Cards */}
        <div className="grid grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div
                  style={{ backgroundColor: module.bg }}
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                >
                  <Icon size={26} strokeWidth={2.2} className="text-white" />
                </div>

                <h3 className="text-gray-900 mb-2">{module.title}</h3>
                <p className="text-sm text-gray-600 mb-6 min-h-[40px]">
                  {module.description}
                </p>
                <button
                  onClick={module.onClick}
                  className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
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
