import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./scaffolding-order.css";
import "../material_issue/scaffoldingISsue.css";
import api from "../../api/axios";
import { useAuthStore } from "../../store/authStore";

/* ================= TYPES ================= */

interface MaterialRow {
  material: string;
  unit: string;
  unitWeight: string;
  quantity: string;
  issuedWeight: string;
  provider: string;
}

interface Item {
  itemName: string;
  unit: string;
  puw: number;
}

interface Order {
  _id: string;
  orderNo: string;
  orderManager: string;
  workOrderNumber: string;
  fromDate: string;
  toDate: string;
  location: string;
  materials: {
    material: string;
    unit: string;
    unitWeight: number;
    quantity: number;
    issuedWeight: number;
    provider: string;
  }[];
}

/* ================= COMPONENT ================= */

export default function ScaffoldingOrder() {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const isAdmin = role === "admin";

  const [activeTab, setActiveTab] = useState<"entry" | "report">("entry");
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    orderManager: "",
    workOrderNumber: "",
    fromDate: "",
    toDate: "",
    location: "",
  });

  const [materials, setMaterials] = useState<MaterialRow[]>([
    { material: "", unit: "", unitWeight: "", quantity: "", issuedWeight: "", provider: "Ray Engineering" },
  ]);

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    orderManager: "",
    location: "",
  });

  /* ================= API ================= */

  const fetchOrders = async () => {
    try {
      const res = await api.get("/scaffolding/orders");
      setOrders(res.data);
    } catch {
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    const loadItems = async () => {
      try {
        const res = await api.get("/items/scaffolding");
        setItems(res.data);
      } catch {
        toast.error("Failed to load items");
      }
    };
    loadItems();
    fetchOrders();
  }, []);

  useEffect(() => {
    if (activeTab === "report") fetchOrders();
  }, [activeTab]);

  /* ================= HANDLERS ================= */

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addMaterial = () => {
    setMaterials([...materials, { material: "", unit: "", unitWeight: "", quantity: "", issuedWeight: "", provider: "Ray Engineering" }]);
  };

  const removeMaterial = (index: number) => {
    if (materials.length === 1) return;
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, key: keyof MaterialRow, value: string) => {
    const updated = [...materials];
    updated[index][key] = value;
    setMaterials(updated);
  };

  const resetForm = () => {
    setEditId(null);
    setForm({ orderManager: "", workOrderNumber: "", fromDate: "", toDate: "", location: "" });
    setMaterials([{ material: "", unit: "", unitWeight: "", quantity: "", issuedWeight: "", provider: "Ray Engineering" }]);
  };

  const handleSave = async () => {
    if (!form.orderManager || !form.fromDate || !form.toDate || !form.location) {
      toast.error("Please fill all required fields");
      return;
    }

    const validMaterials = materials.filter((m) => m.material && m.quantity);
    if (validMaterials.length === 0) {
      toast.error("Add at least one material with quantity");
      return;
    }

    const payload = {
      ...form,
      materials: validMaterials.map((m) => ({
        material: m.material,
        unit: m.unit,
        unitWeight: Number(m.unitWeight) || 0,
        quantity: Number(m.quantity),
        issuedWeight: Number(m.issuedWeight) || 0,
        provider: m.provider,
      })),
    };

    try {
      if (editId) {
        await api.put(`/scaffolding/orders/${editId}`, payload);
        toast.success("Order updated successfully ✅");
      } else {
        await api.post("/scaffolding/orders", payload);
        toast.success("Order created successfully 🎉");
      }
      resetForm();
      setActiveTab("report");
      fetchOrders();
    } catch {
      toast.error("Failed to save order");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await api.delete(`/scaffolding/orders/${id}`);
      toast.success("Order deleted");
      fetchOrders();
    } catch {
      toast.error("Failed to delete order");
    }
  };

  const handleEdit = (o: Order) => {
    setEditId(o._id);
    setForm({
      orderManager: o.orderManager,
      workOrderNumber: o.workOrderNumber || "",
      fromDate: o.fromDate?.split("T")[0] || "",
      toDate: o.toDate?.split("T")[0] || "",
      location: o.location,
    });
    setMaterials(o.materials.map((m) => ({
      material: m.material,
      unit: m.unit,
      unitWeight: String(m.unitWeight ?? ""),
      quantity: String(m.quantity),
      issuedWeight: String(m.issuedWeight ?? ""),
      provider: m.provider,
    })));
    setActiveTab("entry");
  };

  const exportPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const addHeader = () => {
      try { doc.addImage("/ray-log.png", "PNG", 15, 10, 18, 18); } catch (e) {}
      doc.setFontSize(14); doc.setFont("helvetica", "bold");
      doc.text("RAY ENGINEERING", 50, 15);
      doc.setFontSize(10); doc.setFont("helvetica", "normal");
      doc.text("Contact No: 9337670266", 50, 22);
      doc.text("E-Mail: accounts@rayengineering.co", 50, 28);
      doc.setLineWidth(0.5);
      doc.line(10, 40, pageWidth - 10, 40);
      doc.setFontSize(16); doc.setFont("helvetica", "bold");
      doc.text("SCAFFOLDING ORDER REPORT", pageWidth / 2, 55, { align: "center" });
    };

    const addFooter = (pageNum: number, total: number) => {
      const y = pageHeight - 50;
      doc.line(10, y, pageWidth - 10, y);
      doc.setFontSize(8); doc.setFont("helvetica", "normal");
      doc.text("Registrations:\nGSTIN: 21AIJHPR1040H1ZO\nUDYAM: DO-12-0001261\nState: Odisha (Code: 21)", 10, y + 5);
      doc.text("Registered Address:\nAt- Gandakipur, Po- Gopiakuda,\nPs- Kujanga, Dist- Jagatsinghpur", 90, y + 5);
      doc.text(`Contact & Web:\nMD Email: md@rayengineering.co\nWebsite: rayengineering.co\nPage ${pageNum} / ${total}`, 190, y + 5);
    };

    const tableBody: any[] = [];
    filteredOrders.forEach((o) => {
      const mats = o.materials || [];
      if (mats.length === 0) {
        tableBody.push([
          o.orderNo, o.orderManager, o.workOrderNumber || "-",
          formatDate(o.fromDate), formatDate(o.toDate), o.location,
          "-", "-", "-", "-", "-",
        ]);
        return;
      }
      mats.forEach((m, idx) => {
        tableBody.push([
          idx === 0 ? o.orderNo : "",
          idx === 0 ? o.orderManager : "",
          idx === 0 ? (o.workOrderNumber || "-") : "",
          idx === 0 ? formatDate(o.fromDate) : "",
          idx === 0 ? formatDate(o.toDate) : "",
          idx === 0 ? o.location : "",
          `${idx + 1}. ${m.material}`,
          m.unit || "-",
          m.quantity,
          Number(m.issuedWeight || 0).toFixed(2),
          m.provider || "-",
        ]);
      });
    });

    autoTable(doc, {
      startY: 65,
      margin: { top: 70, bottom: 65 },
      head: [["Order No.", "Order Manager", "W/O No.", "From Date", "To Date", "Location", "Material", "Unit", "Qty", "Weight (kg)", "Provider"]],
      body: tableBody,
      styles: { fontSize: 7, halign: "center", valign: "middle", cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: "#fff", fontStyle: "bold" },
      columnStyles: { 6: { halign: "left" }, 0: { halign: "left" }, 1: { halign: "left" } },
      theme: "grid",
      didDrawPage: () => {},
    });

    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p); addHeader(); addFooter(p, totalPages);
    }
    doc.save("Scaffolding_Order_Report.pdf");
  };

  const exportCSV = () => {
    const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const headers = ["Order No.", "Order Manager", "W/O No.", "From Date", "To Date", "Location", "#", "Material", "Unit", "Unit Weight", "Qty", "Weight (kg)", "Provider"];
    const rows: string[] = [headers.map(escape).join(",")];

    filteredOrders.forEach((o) => {
      const mats = o.materials || [];
      if (mats.length === 0) {
        rows.push([o.orderNo, o.orderManager, o.workOrderNumber || "-", formatDate(o.fromDate), formatDate(o.toDate), o.location, "-", "-", "-", "-", "-", "-", "-"].map(escape).join(","));
        return;
      }
      mats.forEach((m, idx) => {
        rows.push([
          idx === 0 ? o.orderNo : "",
          idx === 0 ? o.orderManager : "",
          idx === 0 ? (o.workOrderNumber || "-") : "",
          idx === 0 ? formatDate(o.fromDate) : "",
          idx === 0 ? formatDate(o.toDate) : "",
          idx === 0 ? o.location : "",
          idx + 1,
          m.material,
          m.unit || "-",
          m.unitWeight ?? "-",
          m.quantity,
          Number(m.issuedWeight || 0).toFixed(2),
          m.provider || "-",
        ].map(escape).join(","));
      });
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Scaffolding_Order_Report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  /* ================= HELPERS ================= */

  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString("en-IN") : "-";

  const filteredOrders = orders.filter((o) => {
    const orderFrom = o.fromDate ? new Date(o.fromDate).toISOString().split("T")[0] : "";
    const orderTo = o.toDate ? new Date(o.toDate).toISOString().split("T")[0] : "";

    const managerMatch = !filters.orderManager ||
      o.orderManager.toLowerCase().includes(filters.orderManager.toLowerCase());

    const locationMatch = !filters.location ||
      o.location.toLowerCase().includes(filters.location.toLowerCase());

    // date range: show orders whose fromDate >= filter fromDate AND toDate <= filter toDate
    const fromMatch = !filters.fromDate || orderFrom >= filters.fromDate;
    const toMatch = !filters.toDate || orderTo <= filters.toDate;

    return managerMatch && locationMatch && fromMatch && toMatch;
  });

  /* ================= UI ================= */

  return (
    <div className="scaffold-card">
      <div className="scaffold-header">
        <h2>Scaffolding Order</h2>
        <button className="close-btn" onClick={() => navigate(-1)}>✕</button>
      </div>

      <hr />

      <div className="tabs">
        <button className={`tab-btn ${activeTab === "entry" ? "active" : ""}`} onClick={() => setActiveTab("entry")}>
          Entry Form
        </button>
        <button className={`tab-btn ${activeTab === "report" ? "active" : ""}`} onClick={() => setActiveTab("report")}>
          Report
        </button>
      </div>

      {/* ================= ENTRY FORM ================= */}
      {activeTab === "entry" && (
        <div className="scaffold-form">
          {editId && (
            <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 6, padding: "8px 14px", marginBottom: 16, fontSize: 13, color: "#92400e" }}>
              ✏️ Editing existing order — <button style={{ background: "none", border: "none", color: "#b45309", cursor: "pointer", fontWeight: 600 }} onClick={resetForm}>Cancel Edit</button>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Order Manager *</label>
              <input name="orderManager" placeholder="Order Manager name" value={form.orderManager} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label>Work Order Number</label>
              <input name="workOrderNumber" placeholder="Work Order Number" value={form.workOrderNumber} onChange={handleFormChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>From Date *</label>
              <input type="date" name="fromDate" value={form.fromDate} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label>To Date *</label>
              <input type="date" name="toDate" value={form.toDate} onChange={handleFormChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location *</label>
              <input name="location" placeholder="Location / Site" value={form.location} onChange={handleFormChange} />
            </div>
          </div>

          <div className="ppe-materials-header">
            <label>Materials <span style={{ color: "#ef4444" }}>*</span></label>
            <button className="ppe-add-btn" onClick={addMaterial}>＋ Add Material</button>
          </div>

          <div className="ppe-material-table">
            <div
              className="ppe-table-head"
              style={{ display: "grid", gridTemplateColumns: "48px 2fr 1fr 1fr 1fr 1fr 1.5fr 1fr", alignItems: "center" }}
            >
              <span>#</span>
              <span>Material</span>
              <span>Unit</span>
              <span>Unit Weight</span>
              <span>Qty</span>
              <span>Issued Weight</span>
              <span>Provider</span>
              <span>Action</span>
            </div>

            {materials.map((row, i) => (
              <div
                className="ppe-table-row"
                key={i}
                style={{ display: "grid", gridTemplateColumns: "48px 2fr 1fr 1fr 1fr 1fr 1.5fr 1fr", alignItems: "center" }}
              >
                <span>{i + 1}</span>

                <select
                  className="ppe-input"
                  value={row.material}
                  onChange={(e) => {
                    const selected = items.find((it) => it.itemName === e.target.value);
                    const updated = [...materials];
                    updated[i].material = e.target.value;
                    updated[i].unit = selected?.unit || "";
                    updated[i].unitWeight = String(selected?.puw || "");
                    updated[i].issuedWeight = String((selected?.puw || 0) * Number(updated[i].quantity || 0));
                    setMaterials(updated);
                  }}
                  style={{ width: "100%", height: "38px", padding: "6px 12px", borderRadius: "10px", boxSizing: "border-box", border: "1px solid #e5e7eb", backgroundColor: "#fff", fontSize: "14px", outline: "none", appearance: "none", WebkitAppearance: "none" }}
                >
                  <option value="">Select Item</option>
                  {items.map((item) => (
                    <option key={item.itemName} value={item.itemName}>{item.itemName}</option>
                  ))}
                </select>

                <input className="ppe-input" value={row.unit} readOnly placeholder="Unit" />

                <input className="ppe-input" value={row.unitWeight} readOnly placeholder="PUW" style={{ background: "#f3f4f6", cursor: "not-allowed" }} />

                <input
                  className="ppe-input"
                  type="number" min="0"
                  value={row.quantity}
                  placeholder="Quantity"
                  onChange={(e) => {
                    const updated = [...materials];
                    updated[i].quantity = e.target.value;
                    updated[i].issuedWeight = String((Number(updated[i].unitWeight) || 0) * Number(e.target.value || 0));
                    setMaterials(updated);
                  }}
                />

                <input className="ppe-input" value={row.issuedWeight} readOnly placeholder="Issued Weight" style={{ background: "#f3f4f6", cursor: "not-allowed" }} />

                <input
                  className="ppe-input"
                  value={row.provider}
                  placeholder="Provider"
                  onChange={(e) => updateMaterial(i, "provider", e.target.value)}
                />

                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button
                    className="ppe-delete-btn"
                    onClick={() => removeMaterial(i)}
                    disabled={materials.length === 1}
                    style={{ fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", background: "#ef4444", border: "1px solid #ef4444", borderRadius: 4, width: 36, height: 32 }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="form-footer">
            <button className="save-btn" onClick={handleSave}>
              💾 {editId ? "Update Order" : "Save Order"}
            </button>
          </div>
        </div>
      )}

      {/* ================= REPORT ================= */}
      {activeTab === "report" && (
        <div className="report-section">
          <div className="report-header">
            <h3>View Orders</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={exportCSV}
                style={{ background: "#16a34a", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 600 }}
              >
                Export CSV
              </button>
              <button
                onClick={exportPDF}
                style={{ background: "#c81e1e", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 600 }}
              >
                Export PDF
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", alignItems: "end", marginTop: 16 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>From Date</label>
              <input type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>To Date</label>
              <input type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>Order Manager</label>
              <input placeholder="Search order manager..." value={filters.orderManager} onChange={(e) => setFilters({ ...filters, orderManager: e.target.value })} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>Location</label>
              <input placeholder="Search location..." value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
            </div>
          </div>

          <div className="clear-filters" onClick={() => setFilters({ fromDate: "", toDate: "", orderManager: "", location: "" })}>
            Clear All Filters
          </div>

          <p className="report-count">Showing {filteredOrders.length} of {orders.length} orders</p>

          <div style={{ overflowX: "auto", width: "100%" }}>
            <table style={{ width: "100%", minWidth: 1200, borderCollapse: "collapse", fontSize: 14 }}>
              <colgroup>
                <col style={{ width: 200 }} />
                <col style={{ width: 150 }} />
                <col style={{ width: 150 }} />
                <col style={{ width: 110 }} />
                <col style={{ width: 110 }} />
                <col style={{ width: 130 }} />
                <col style={{ width: "auto" }} />
                <col style={{ width: 130 }} />
              </colgroup>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                  {["Order No.", "Order Manager", "Work Order No.", "From Date", "To Date", "Location", "Items", "Action"].map((h, i) => (
                    <th key={i} style={{ padding: "12px 14px", fontWeight: 600, textAlign: i === 7 ? "center" : "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: "24px 16px", textAlign: "center", color: "#6b7280" }}>No orders found</td></tr>
                )}
                {filteredOrders.map((o) => (
                  <tr key={o._id} style={{ borderBottom: "1px solid #e5e7eb", verticalAlign: "top" }}>
                    <td style={{ padding: "12px 14px", maxWidth: 200, wordBreak: "break-all" }} title={o.orderNo}>{o.orderNo}</td>
                    <td style={{ padding: "12px 14px" }}>{o.orderManager}</td>
                    <td style={{ padding: "12px 14px" }}>{o.workOrderNumber || "-"}</td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>{formatDate(o.fromDate)}</td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>{formatDate(o.toDate)}</td>
                    <td style={{ padding: "12px 14px" }}>{o.location}</td>
                    <td style={{ padding: "12px 14px" }}>
                      {o.materials.map((m, n) => (
                        <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: n !== o.materials.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                          <span style={{ minWidth: 24, height: 24, borderRadius: "50%", backgroundColor: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{n + 1}</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                            <span style={{ fontWeight: 600, lineHeight: 1.4 }}>{m.material}</span>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <span style={{ backgroundColor: "#f3f4f6", color: "#6b7280", padding: "2px 8px", borderRadius: 999, fontSize: 12 }}>{m.quantity} {m.unit}</span>
                              <span style={{ backgroundColor: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{Number(m.issuedWeight || 0).toFixed(2)} kg</span>
                              <span style={{ backgroundColor: "#f0fdf4", color: "#15803d", padding: "2px 8px", borderRadius: 999, fontSize: 12 }}>{m.provider}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
                        <button className="view-btn" title="View" onClick={() => setViewOrder(o)}>👁</button>
                        {isAdmin && <button className="edit-btn" title="Edit" onClick={() => handleEdit(o)}>✏️</button>}
                        {isAdmin && <button className="delete-btn" title="Delete" onClick={() => handleDelete(o._id)}>🗑</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= VIEW MODAL ================= */}
      {viewOrder && (
        <div className="modal-backdrop" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setViewOrder(null)}>
          <div className="modal-card" style={{ backgroundColor: "white", borderRadius: 8, padding: 24, maxWidth: 800, width: "90%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "2px solid #e5e7eb", paddingBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Order Details</h3>
              <button onClick={() => setViewOrder(null)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b7280" }}>✕</button>
            </div>

            <div style={{ fontSize: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 20 }}>
              <p><strong>Order No:</strong> {viewOrder.orderNo}</p>
              <p><strong>Order Manager:</strong> {viewOrder.orderManager}</p>
              <p><strong>Work Order No:</strong> {viewOrder.workOrderNumber || "-"}</p>
              <p><strong>From Date:</strong> {formatDate(viewOrder.fromDate)}</p>
              <p><strong>To Date:</strong> {formatDate(viewOrder.toDate)}</p>
              <p><strong>Location:</strong> {viewOrder.location}</p>
            </div>

            <h4 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600 }}>Materials:</h4>
            <div className="ppe-material-table">
              <div className="ppe-table-head" style={{ display: "grid", gridTemplateColumns: "48px 2fr 1fr 1fr 1fr 1fr 1.5fr", alignItems: "center" }}>
                <span>#</span>
                <span>Material</span>
                <span>Unit</span>
                <span>Unit Weight</span>
                <span>Qty</span>
                <span>Issued Weight</span>
                <span>Provider</span>
              </div>
              {viewOrder.materials.map((m, i) => (
                <div className="ppe-table-row" key={i} style={{ display: "grid", gridTemplateColumns: "48px 2fr 1fr 1fr 1fr 1fr 1.5fr", alignItems: "center" }}>
                  <span>{i + 1}</span>
                  <span>{m.material}</span>
                  <span>{m.unit || "-"}</span>
                  <span>{m.unitWeight ?? "-"}</span>
                  <span>{m.quantity}</span>
                  <span>{Number(m.issuedWeight || 0).toFixed(2)} kg</span>
                  <span>{m.provider}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
