import { ArrowLeft, ShieldCheck, Wrench, Boxes, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function MaterialIssueManager() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Material Issue</h1>
          <p className="text-gray-600 mb-6">
            Issue materials from inventory by category
          </p>

          <button
            onClick={() => navigate("/dashboard/store-management")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Store Management
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-3 gap-6">
          <IssueCard
            title="PPE"
            desc="Issue PPE materials"
            icon={ShieldCheck}
            color="#22c55e"
            onClick={() =>
              navigate("/dashboard/material-issue/ppe-distribution")
            }
          />

          <IssueCard
            title="Mechanical"
            desc="Issue mechanical materials"
            icon={Wrench}
            color="#f97316"
            onClick={() =>
              navigate("/dashboard/material-issue/mechanical-issue")
            }
          />

          <IssueCard
            title="Scaffolding"
            desc="Issue scaffolding materials"
            icon={Boxes}
            color="#ef4444"
            onClick={() =>
              navigate("/dashboard/material-issue/scaffholding-issue")
            }
          />
          <IssueCard
            title="Old"
            desc="Issue old materials"
            icon={Archive}
            color="#64748b" // slate-500
            onClick={() => navigate("/dashboard/material-issue/old-registration")}
          />
        </div>
      </main>
    </div>
  );
}

function IssueCard({
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
