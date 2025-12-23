import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./scaffolding-order.css";

interface MaterialRow {
  material: string;
  quantity: string;
  provider: string;
}

interface Order {
  orderNo: string;
  supervisor: string;
  employeeId: string;
  issueDate: string;
  location: string;
  materials: MaterialRow[];
}

export default function ScaffoldingOrder() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"entry" | "report">("entry");
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    supervisor: "",
    location: "",
  });

  const [form, setForm] = useState({
    supervisor: "",
    employeeId: "",
    issueDate: "",
    location: "",
  });

  const [materials, setMaterials] = useState<MaterialRow[]>([
    { material: "", quantity: "", provider: "Ray Engineering" },
  ]);

  const [orders, setOrders] = useState<Order[]>([]);

  /* ---------------- Handlers ---------------- */

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addMaterial = () => {
    setMaterials([
      ...materials,
      { material: "", quantity: "", provider: "Ray Engineering" },
    ]);
  };

  const removeMaterial = (index: number) => {
    if (materials.length === 1) return;
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const updateMaterial = (
    index: number,
    key: keyof MaterialRow,
    value: string
  ) => {
    const updated = [...materials];
    updated[index][key] = value;
    setMaterials(updated);
  };

  const handleSave = () => {
    if (
      !form.supervisor ||
      !form.employeeId ||
      !form.issueDate ||
      !form.location
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    for (const row of materials) {
      if (!row.material || !row.quantity) {
        toast.error("Please complete all material rows");
        return;
      }
    }

    const newOrder: Order = {
      orderNo: `ORD-${new Date().getFullYear()}-${String(
        orders.length + 1
      ).padStart(3, "0")}`,
      supervisor: form.supervisor,
      employeeId: form.employeeId,
      issueDate: form.issueDate,
      location: form.location,
      materials,
    };

    setOrders([...orders, newOrder]);

    toast.success("Order saved successfully 🎉");

    setActiveTab("report");
  };

  /* ---------------- UI ---------------- */
  // ---------------- FILTERED ORDERS ----------------
  const filteredOrders = orders.filter((order) => {
    return (
      (!filters.supervisor ||
        order.supervisor
          .toLowerCase()
          .includes(filters.supervisor.toLowerCase())) &&
      (!filters.location ||
        order.location
          .toLowerCase()
          .includes(filters.location.toLowerCase())) &&
      (!filters.fromDate || order.issueDate >= filters.fromDate) &&
      (!filters.toDate || order.issueDate <= filters.toDate)
    );
  });

  return (
    <div className="scaffold-card">
      {/* Header */}
      <div className="scaffold-header">
        <h2>Scaffolding Order</h2>
        <button className="close-btn" onClick={() => navigate(-1)}>
          ✕
        </button>
      </div>

      <hr />

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "entry" ? "active" : ""}`}
          onClick={() => setActiveTab("entry")}
        >
          Entry Form
        </button>
        <button
          className={`tab-btn ${activeTab === "report" ? "active" : ""}`}
          onClick={() => setActiveTab("report")}
        >
          Report
        </button>
      </div>

      {/* ENTRY FORM */}
      {activeTab === "entry" && (
        <div className="scaffold-form">
          <div className="form-row">
            <div className="form-group">
              <label>Supervisor Name *</label>
              <input
                name="supervisor"
                value={form.supervisor}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label>Employee ID *</label>
              <input
                name="employeeId"
                value={form.employeeId}
                onChange={handleFormChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Issue Date *</label>
              <input
                type="date"
                name="issueDate"
                value={form.issueDate}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                name="location"
                value={form.location}
                onChange={handleFormChange}
              />
            </div>
          </div>

          <div className="materials-header">
            <label>Materials *</label>
            <button className="add-btn" onClick={addMaterial}>
              + Add Material
            </button>
          </div>

          <div className="material-table">
            <div className="table-head">
              <span>#</span>
              <span>Material</span>
              <span>Qty</span>
              <span>Provider</span>
              <span>Action</span>
            </div>

            {materials.map((row, i) => (
              <div className="table-row" key={i}>
                <div className="cell">{i + 1}</div>

                <div className="cell">
                  <select
                    value={row.material}
                    onChange={(e) =>
                      updateMaterial(i, "material", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    <option>Scaffold Pipe</option>
                    <option>Coupler</option>
                    <option>Plank</option>
                  </select>
                </div>

                <div className="cell">
                  <select
                    value={row.quantity}
                    onChange={(e) =>
                      updateMaterial(i, "quantity", e.target.value)
                    }
                  >
                    <option value="">Qty</option>
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                  </select>
                </div>

                <div className="cell">
                  <input value={row.provider} disabled />
                </div>

                <div className="cell action-cell">
                  <button
                    className="delete-btn"
                    onClick={() => removeMaterial(i)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="form-footer">
            <button className="save-btn" onClick={handleSave}>
              💾 Save Order
            </button>
          </div>
        </div>
      )}

      {/* REPORT */}
      {activeTab === "report" && (
        <div className="report-section">
          {/* Report Header */}
          <div className="report-header">
            <h3>View Orders</h3>
            <button className="close-btn" onClick={() => setActiveTab("entry")}>
              ✕
            </button>
          </div>

          <hr />

          {/* Filters */}
          <div className="report-filters">
            <div className="filter-group">
              <label>From Date</label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) =>
                  setFilters({ ...filters, fromDate: e.target.value })
                }
              />
            </div>

            <div className="filter-group">
              <label>To Date</label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) =>
                  setFilters({ ...filters, toDate: e.target.value })
                }
              />
            </div>

            <div className="filter-group">
              <label>Supervisor Name</label>
              <input
                placeholder="Search supervisor..."
                value={filters.supervisor}
                onChange={(e) =>
                  setFilters({ ...filters, supervisor: e.target.value })
                }
              />
            </div>

            <div className="filter-group">
              <label>Location</label>
              <input
                placeholder="Search location..."
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
              />
            </div>
          </div>

          <div
            className="clear-filters"
            onClick={() =>
              setFilters({
                fromDate: "",
                toDate: "",
                supervisor: "",
                location: "",
              })
            }
          >
            Clear All Filters
          </div>

          {/* Count */}
          <p className="report-count">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>

          {/* Report Table */}
          <div className="report-table">
            <div className="table-head">
              <span>Order Number</span>
              <span>Supervisor</span>
              <span>Employee ID</span>
              <span>Issue Date</span>
              <span>Location</span>
              <span>Action</span>
            </div>

            {filteredOrders.map((o, i) => (
              <div className="table-row" key={i}>
                <div className="cell">{o.orderNo}</div>
                <div className="cell">{o.supervisor}</div>
                <div className="cell">{o.employeeId}</div>
                <div className="cell">{o.issueDate}</div>
                <div className="cell">{o.location}</div>

                <div className="cell action-cell">
                  <button
                    className="view-btn"
                    onClick={() => {
                      console.log("VIEW ORDER:", o);
                      toast(`Viewing ${o.orderNo}`, { icon: "👁" });
                    }}
                  >
                    👁
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
