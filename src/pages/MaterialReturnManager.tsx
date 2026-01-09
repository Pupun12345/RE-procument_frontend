import { ArrowLeft, Wrench, Boxes } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ComponentType } from "react";

export function MaterialReturnManager() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Material Return</h1>
          <p className="text-gray-600 mb-6">
            Return materials back to inventory by category
          </p>

          <button
            onClick={() => navigate("/dashboard/store-management")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Store Management
          </button>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-3 gap-6">
          {/* <ReturnCard
            title="PPE"
            desc="Return PPE materials"
            icon={ShieldCheck}
            color="#22c55e"
            onClick={() =>
              navigate("/dashboard/material-return/ppe-return")
            }
          /> */}

          <ReturnCard
            title="Mechanical"
            desc="Return mechanical materials"
            icon={Wrench}
            color="#f97316"
            onClick={() =>
              navigate("/dashboard/material-return/mechanical-return")
            }
          />

          <ReturnCard
            title="Scaffolding"
            desc="Return scaffolding materials"
            icon={Boxes}
            color="#ef4444"
            onClick={() =>
              navigate("/dashboard/material-return/scaffholding-return")
            }
          />
        </div>
      </main>
    </div>
  );
}

function ReturnCard({
  title,
  desc,
  icon: Icon,
  color,
  onClick,
}: {
  title: string;
  desc: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
  onClick: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
        style={{ backgroundColor: color }}
      >
        <Icon size={26} className="text-white" />
      </div>

      <h3 className="text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-6">{desc}</p>

      <button
        onClick={onClick}
        className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
      >
        Open {title}
      </button>
    </div>
  );
}
