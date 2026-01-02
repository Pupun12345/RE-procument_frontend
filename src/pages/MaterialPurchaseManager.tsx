import { ArrowLeft, ShieldCheck, Wrench, Boxes, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function MaterialPurchaseManager() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Material Purchase</h1>
          <p className="text-gray-600 mb-6">
            Select category to proceed with material purchase
          </p>

          <button
            onClick={() => navigate("/dashboard/store-management")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Store Management
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* PPE */}
          <PurchaseCard
            title="PPE"
            desc="Purchase PPE materials"
            icon={ShieldCheck}
            color="#22c55e"
            onClick={() => navigate("/dashboard/material-purchase/ppe")}
          />

          {/* Mechanical */}
          <PurchaseCard
            title="Mechanical"
            desc="Purchase mechanical materials"
            icon={Wrench}
            color="#f97316"
            onClick={() => navigate("/dashboard/material-purchase/mechanical")}
          />

          {/* Scaffolding */}
          <PurchaseCard
            title="Scaffolding"
            desc="Purchase scaffolding materials"
            icon={Boxes}
            color="#ef4444"
            onClick={() => navigate("/dashboard/material-purchase/scaffolding")}
          />
          {/* Old */}
          <PurchaseCard
            title="Old"
            desc="Purchase old materials"
            icon={Archive}
            color="#64748b" // slate-500
            onClick={() => navigate("/dashboard/material-purchase/old-registration")}
          />
        </div>
      </main>
    </div>
  );
}

function PurchaseCard({
  title,
  desc,
  icon: Icon,
  color,
  onClick,
}: {
  title: string;
  desc: string;
  icon: any;
  color: string;
  onClick: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div
        style={{ backgroundColor: color }}
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
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
