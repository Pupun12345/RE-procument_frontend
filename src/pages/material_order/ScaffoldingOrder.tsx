import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./scaffolding-order.css";
import api from "../../api/axios";
import { useAuthStore } from "../../store/authStore";

/* ================= TYPES ================= */

interface MaterialRow {
  material: string;
  unit: string;
  quantity: string;
  provider: string;
}

interface Item {
  itemName: string;
  unit: string;
}

interface Order {
  _id: string;
  orderNo: string;
  supervisor: string;
  employeeId: string;
  issueDate: string;
  location: string;
  materials: MaterialRow[];
}

interface Employee {
  _id: string;
  employeeName: string;
  designation: string;
  employeeCode: string;
}

/* ================= COMPONENT ================= */

export default function ScaffoldingOrder() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"entry" | "report">("entry");

  const [items, setItems] = useState<Item[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [designation, setDesignation] = useState("Supervisor");

  const [form, setForm] = useState({
    supervisor: "",
    employeeId: "",
    issueDate: "",
    location: "",
  });

  const [materials, setMaterials] = useState<MaterialRow[]>([
    { material: "", unit: "", quantity: "", provider: "Ray Engineering" },
  ]);

  const [orders, setOrders] = useState<Order[]>([]);

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    supervisor: "",
    location: "",
  });

  const { role } = useAuthStore();
  const isAdmin = role === "admin";

  /* ================= API CALLS ================= */

  const fetchItems = async () => {
    const res = await api.get("/items/scaffolding");
    setItems(res.data);
  };

  const fetchEmployeesByDesignation = async (desg: string) => {
    try {
      const res = await api.get(`/employees?designation=${desg}`);
      setEmployees(res.data);
    } catch {
      toast.error("Failed to load employees");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/scaffolding/orders");
      setOrders(res.data);
    } catch {
      toast.error("Failed to load orders");
    }
  };
  const [editId, setEditId] = useState<string | null>(null);

  /* ================= EFFECTS ================= */

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    fetchEmployeesByDesignation(designation);
  }, [designation]);

  useEffect(() => {
    if (activeTab === "report") {
      fetchOrders();
    }
  }, [activeTab]);

  /* ================= HANDLERS ================= */
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      await api.delete(`/scaffolding/orders/${id}`);
      toast.success("Order deleted");
      fetchOrders(); // 🔥 THIS updates the report
    } catch {
      toast.error("Failed to delete order");
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addMaterial = () => {
    setMaterials([
      ...materials,
      { material: "", unit: "", quantity: "", provider: "Ray Engineering" },
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

  const handleSave = async () => {
    if (
      !form.supervisor ||
      !form.employeeId ||
      !form.issueDate ||
      !form.location
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      ...form,
      materials: materials.map((m) => ({
        material: m.material,
        unit: m.unit,
        quantity: Number(m.quantity),
        provider: m.provider,
      })),
    };

    try {
      if (editId) {
        // 🔥 UPDATE
        await api.put(`/scaffolding/orders/${editId}`, payload);
        toast.success("Order updated successfully ✅");
      } else {
        // 🔥 CREATE
        await api.post("/scaffolding/orders", payload);
        toast.success("Order created successfully 🎉");
      }

      // 🔄 RESET STATE
      setEditId(null);
      setForm({
        supervisor: "",
        employeeId: "",
        issueDate: "",
        location: "",
      });

      setMaterials([
        { material: "", unit: "", quantity: "", provider: "Ray Engineering" },
      ]);

      setActiveTab("report");
      fetchOrders(); // 🔥 FORCE REFRESH REPORT
    } catch {
      toast.error("Failed to save order");
    }
  };

  /* ================= HELPERS ================= */

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN");

  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.issueDate).toISOString().split("T")[0];

    return (
      (!filters.supervisor ||
        order.supervisor
          .toLowerCase()
          .includes(filters.supervisor.toLowerCase())) &&
      (!filters.location ||
        order.location
          .toLowerCase()
          .includes(filters.location.toLowerCase())) &&
      (!filters.fromDate || orderDate >= filters.fromDate) &&
      (!filters.toDate || orderDate <= filters.toDate)
    );
  });

  /* ================= UI ================= */

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
              <label>Supervisor *</label>
              <select
                value={form.supervisor}
                onChange={(e) =>
                  setForm({ ...form, supervisor: e.target.value })
                }
              >
                <option value="">Select Supervisor</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp.employeeName}>
                    {emp.employeeName}
                  </option>
                ))}
              </select>
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
              <span>Unit</span>
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
                    onChange={(e) => {
                      const selected = items.find(
                        (it) => it.itemName === e.target.value
                      );

                      const updated = [...materials];
                      updated[i].material = e.target.value;
                      updated[i].unit = selected?.unit || "";
                      setMaterials(updated);
                    }}
                  >
                    <option value="">Select</option>
                    {items.map((item) => (
                      <option key={item.itemName} value={item.itemName}>
                        {item.itemName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cell">
                  <input value={row.unit} readOnly />
                </div>

                <div className="cell">
                  <input
                    value={row.quantity}
                    onChange={(e) =>
                      updateMaterial(i, "quantity", e.target.value)
                    }
                  />
                </div>

                <div className="cell provider-cell">
                  <input
                    value={row.provider}
                    placeholder="Enter provider"
                    onChange={(e) =>
                      updateMaterial(i, "provider", e.target.value)
                    }
                  />
                </div>

                <div className="cell action-cell">
                  <button
                    className="delete-btn"
                    onClick={() => removeMaterial(i)}
                    title="Delete row"
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
          {/* ================= FILTERS ================= */}
          <div className="report-header">
            <h3>View Orders</h3>
          </div>

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

          <p className="report-count">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>

          <div className="report-table">
            <div className="table-head">
              <span>Order Number</span>
              <span>Supervisor</span>
              <span>Employee ID</span>
              <span>Issue Date</span>
              <span>Location</span>
              <span>Items</span>
              <span>Action</span>
            </div>

            {filteredOrders.map((o) => (
              <div className="table-row" key={o._id}>
                <div className="cell">{o.orderNo}</div>
                <div className="cell">{o.supervisor}</div>
                <div className="cell">{o.employeeId}</div>
                <div className="cell">{formatDate(o.issueDate)}</div>
                <div className="cell">{o.location}</div>
                <div className="cell items-cell">
                  {o.materials.length} item{o.materials.length > 1 ? "s" : ""}
                </div>

                {/* ✅ ACTION CELL — MUST be last */}
                <div className="cell action-cell">
                  <button
                    className="view-btn"
                    title="View"
                    onClick={() => setViewOrder(o)}
                  >
                    👁
                  </button>

                  {isAdmin && (
                    <button
                      className="edit-btn"
                      title="Edit"
                      onClick={() => {
                        setEditId(o._id); // 🔥 THIS IS KEY

                        setForm({
                          supervisor: o.supervisor,
                          employeeId: o.employeeId,
                          issueDate: o.issueDate.split("T")[0],
                          location: o.location,
                        });

                        setMaterials(o.materials);
                        setActiveTab("entry");
                      }}
                    >
                      ✏️
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      className="delete-btn"
                      title="Delete"
                      onClick={() => handleDelete(o._id)}
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ================= VIEW ORDER MODAL (OVERLAY) ================= */}
      {viewOrder && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setViewOrder(null)}
        >
          <div
            className="modal-card"
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                borderBottom: "2px solid #e5e7eb",
                paddingBottom: "12px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
                Order Details
              </h3>
              <button
                onClick={() => setViewOrder(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#6b7280",
                  padding: "0 8px",
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ fontSize: "14px" }}>
              <p style={{ marginBottom: "12px" }}>
                <strong>Order No:</strong> {viewOrder.orderNo}
              </p>
              <p style={{ marginBottom: "12px" }}>
                <strong>Supervisor:</strong> {viewOrder.supervisor}
              </p>
              <p style={{ marginBottom: "12px" }}>
                <strong>Employee ID:</strong> {viewOrder.employeeId}
              </p>
              <p style={{ marginBottom: "12px" }}>
                <strong>Date:</strong> {formatDate(viewOrder.issueDate)}
              </p>
              <p style={{ marginBottom: "20px" }}>
                <strong>Location:</strong> {viewOrder.location}
              </p>

              <h4
                style={{
                  marginBottom: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Materials:
              </h4>
              <div className="material-table">
                <div className="table-head">
                  <span>#</span>
                  <span>Material</span>
                  <span>Unit</span>
                  <span>Qty</span>
                  <span>Provider</span>
                </div>

                {viewOrder.materials.map((m, i) => (
                  <div className="table-row" key={i}>
                    <div className="cell">{i + 1}</div>
                    <div className="cell">{m.material}</div>
                    <div className="cell">{m.unit}</div>
                    <div className="cell">{m.quantity}</div>
                    <div className="cell">{m.provider}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
