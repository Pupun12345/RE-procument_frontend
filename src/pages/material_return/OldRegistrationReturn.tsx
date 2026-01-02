"use client";

import React, { useEffect, useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./PPEreturn.css";
import toast from "react-hot-toast";

// ====================== TYPES ======================
interface Item {
  itemName: string;
  unit: string;
  qty: number;
}

interface ReturnRecord {
  _id: string;
  personName: string;
  returnDate: string;
  location: string;
  items: {
    itemName: string;
    quantity: number;
    unit: string;
  }[];
}

interface StockItem {
  _id: string;
  itemName: string;
  unit: string;
  qty: number;
}

interface FormState {
  itemName: string;
  quantity: string;
  unit: string;
  issueDate: string;
  personName: string;
  location: string;
}

interface FilterState {
  search: string;
  from: string;
  to: string;
}

// ====================== MAIN COMPONENT ======================

const DistributionPage: React.FC = () => {
  const [records, setRecords] = useState<ReturnRecord[]>([]);
  // Item row type for dynamic items
  interface ItemRow {
    itemName: string;
    quantity: string;
    unit: string;
  }
  // Dynamic items state (like ScaffoldingOrder)
  const [items, setItems] = useState<ItemRow[]>([
    { itemName: "", quantity: "", unit: "" },
  ]);

  // Update item row
  const updateItem = (index: number, key: keyof ItemRow, value: string) => {
    const updated = [...items];
    updated[index][key] = value;
    setItems(updated);
  };
  // Navigation function
  const handleBack = () => {
    navigate(-1);
  };
  const [activeTab, setActiveTab] = useState<"entry" | "report">("entry");
  // Items state is now mutable to allow adding new items

  // Modal state for adding item
  const fetchRecords = async () => {
    try {
      const res = await api.get("returns/old");

      setRecords(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to fetch old returns");
      setRecords([]);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    itemName: "",
    quantity: "",
    unit: "",
    issueDate: new Date().toISOString().split("T")[0],
    personName: "",
    location: "",
  });

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    from: "",
    to: "",
  });

  // Editable shape for the modal (maps a ReturnRecord + a specific item index)
  interface EditableReturnRecord {
    _id: string;
    itemIndex: number;
    itemName: string;
    quantity: number;
    unit: string;
    issueDate: string;
    personName: string;
    location: string;
  }

  const [editRecord, setEditRecord] = useState<EditableReturnRecord | null>(
    null
  );

  // Delete record from report section
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this old return?")) return;

    try {
      await api.delete(`/returns/old/${id}`);
      toast("success");
      fetchRecords();
    } catch {
      toast("error");
    }
  };

  // Open edit modal for a record. By default edits the first item (index 0).
  const openEdit = (r: ReturnRecord, itemIndex = 0) => {
    const item = r.items[itemIndex] || { itemName: "", quantity: 0, unit: "" };
    setEditRecord({
      _id: r._id,
      itemIndex,
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit,
      issueDate: r.returnDate,
      personName: r.personName,
      location: r.location,
    });
  };

  const updateDistribution = async () => {
    if (!editRecord) return;

    try {
      // find original record to preserve other items
      const orig = records.find((x) => x._id === editRecord._id);
      const updatedItems = orig ? [...orig.items] : [];

      // ensure the index exists
      if (updatedItems.length === 0) {
        updatedItems.push({
          itemName: editRecord.itemName,
          quantity: editRecord.quantity,
          unit: editRecord.unit,
        });
      } else {
        updatedItems[editRecord.itemIndex] = {
          itemName: editRecord.itemName,
          quantity: editRecord.quantity,
          unit: editRecord.unit,
        };
      }

      const payload = {
        personName: editRecord.personName,
        returnDate: editRecord.issueDate,
        location: editRecord.location,
        items: updatedItems,
      };

      await api.put(`/returns/old/${editRecord._id}`, payload);

      toast.success("Updated successfully");
      setEditRecord(null);
      fetchRecords();
    } catch (err) {
      toast.error("Failed to update record");
    }
  };

  // ====================== FETCH DATA ======================
  // Fetch items from backend on component mount
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await api.get("/old-stock");

        // 🔑 FIX IS HERE
        setStockItems(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        toast("Failed to load stock items");
      }
    };

    fetchStock();
  }, []);

  // ====================== HANDLERS ======================
  const handleChange = (field: keyof FormState, value: string): void => {
    if (field === "itemName") {
      const selected = stockItems.find((s) => s.itemName === value);
      setForm({
        ...form,
        itemName: value,
        unit: selected ? selected.unit : "",
      });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  // Add item logic

  const filteredRecords = records.filter((r) => {
    const search = filters.search.toLowerCase();

    const itemMatch = r.items.some((i) =>
      i.itemName.toLowerCase().includes(search)
    );

    const personMatch = r.personName.toLowerCase().includes(search);
    const date = new Date(r.returnDate);

    const from = filters.from ? new Date(filters.from) : null;
    const to = filters.to ? new Date(filters.to) : null;

    const dateMatch = (!from || date >= from) && (!to || date <= to);

    return (itemMatch || personMatch) && dateMatch;
  });

  // ====================== EXPORT ======================
  const exportPDF = (): void => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ------------------------------------------
    // HEADER (Every Page)
    // ------------------------------------------
    const addHeader = () => {
      doc.addImage("/ray-log.png", "PNG", 15, 10, 18, 18);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("RAY ENGINEERING", 50, 15);

      doc.setFontSize(10);
      doc.text("Contact No: 9337670266", 50, 22);
      doc.text("E-Mail: accounts@rayengineering.co", 50, 28);

      doc.setLineWidth(0.5);
      doc.line(10, 40, 200, 40);

      doc.setFontSize(16);
      doc.text("OLD RETURN REPORT", pageWidth / 2, 55, {
        align: "center",
      });
    };

    // ------------------------------------------
    // FOOTER (Every Page)
    // ------------------------------------------
    const addFooter = (pageNum: number, totalPages: number) => {
      const footerY = pageHeight - 40;

      doc.line(10, footerY, 200, footerY);
      doc.setFontSize(9);

      doc.text(
        "Registrations:\nGSTIN: 21AIJHPR1040H1ZO\nUDYAM: DO-12-0001261\nState: Odisha (Code: 21)",
        10,
        footerY + 8
      );

      doc.text(
        "Registered Address:\nAt- Gandakipur, Po- Gopiakuda,\nPs- Kujanga, Dist- Jagatsinghpur",
        75,
        footerY + 8
      );

      doc.text(
        `Contact & Web:\nMD Email: md@rayengineering.co\nWebsite: rayengineering.co\nPage ${pageNum} / ${totalPages}`,
        150,
        footerY + 8
      );
    };

    // Draw header on first page
    addHeader();

    // ------------------------------------------
    // AUTO TABLE (NO FOOTER INSIDE)
    // ------------------------------------------
    autoTable(doc, {
      startY: 65,
      margin: { top: 60, bottom: 50 },

      head: [["Item", "Qty", "Unit", "Date", "Person", "Location"]],

      body: filteredRecords.map((r) => [
        r.itemName,
        r.quantity,
        r.unit,
        r.issueDate,
        r.personName,
        r.location,
      ]),

      styles: { fontSize: 10, halign: "center", cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: "#fff" },
      theme: "grid",

      didDrawPage: () => {
        addHeader(); // redraw header only (no footer here)
      },
    });

    // ------------------------------------------
    // ADD FOOTERS AFTER ALL PAGES ARE CREATED
    // ------------------------------------------
    const totalPages = doc.getNumberOfPages();

    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      addFooter(p, totalPages);
    }

    // ------------------------------------------
    // SAVE PDF
    // ------------------------------------------
    doc.save("PPE_Distribution_Report.pdf");
  };

  const exportCSV = (): void => {
    const headers = ["Item", "Quantity", "Unit", "Date", "Person", "Location"];
    const rows = filteredRecords.map((r) => [
      r.itemName,
      r.quantity,
      r.unit,
      r.issueDate,
      r.personName,
      r.location,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "PPE_Distribution_Report.csv";
    link.click();
  };
  const addItem = () => {
    setItems([...items, { itemName: "", quantity: "", unit: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // ====================== UI ======================
  return (
    <div className="ppe-container">
      <div className="ppe-content">
        <h2 className="ppe-title">OLD RETURN</h2>

        <div className="ppe-tabs">
          <button
            className={activeTab === "entry" ? "ppe-tab active" : "ppe-tab"}
            onClick={() => setActiveTab("entry")}
          >
            Entry Form
          </button>
          <button
            className={activeTab === "report" ? "ppe-tab active" : "ppe-tab"}
            onClick={() => setActiveTab("report")}
          >
            Report
          </button>
        </div>

        {/* ENTRY FORM */}
        {activeTab === "entry" && (
          <React.Fragment>
            {/* Materials Section */}
            {/* Materials Section - moved to top of form */}
            <div
              className="ppe-form-card"
              style={{ margin: "0 auto", maxWidth: 900 }}
            >
              <div className="ppe-form-grid">
                {/* Removed select item, quantity, and unit fields as requested */}
                <div className="ppe-form-group">
                  <input
                    className="ppe-input"
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => handleChange("issueDate", e.target.value)}
                  />
                </div>
                <div className="ppe-form-group">
                  <input
                    className="ppe-input"
                    type="text"
                    placeholder="Issued To (Person Name) *"
                    value={form.personName}
                    onChange={(e) => handleChange("personName", e.target.value)}
                  />
                </div>
                <div className="ppe-form-group">
                  <input
                    className="ppe-input"
                    type="text"
                    placeholder="Location / Site"
                    value={form.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div className="ppe-materials-header">
                  <label>
                    Items <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <button
                    type="button"
                    className="ppe-add-btn"
                    onClick={addItem}
                  >
                    ＋ Add Item
                  </button>
                </div>
                <div className="ppe-material-table">
                  <div className="ppe-table-head">
                    <span>#</span>
                    <span>Item Name</span>
                    <span>Quantity</span>
                    <span>Unit</span>
                    <span>Action</span>
                  </div>
                  {items.map((row, index) => (
                    <div className="ppe-table-row" key={index}>
                      <span>{index + 1}</span>
                      <select
                        className="ppe-input"
                        value={row.itemName}
                        onChange={(e) => {
                          const selected = stockItems.find(
                            (s) => s.itemName === e.target.value
                          );

                          updateItem(index, "itemName", e.target.value);
                          updateItem(
                            index,
                            "unit",
                            selected ? selected.unit : ""
                          );
                        }}
                      >
                        <option value="">Select Item</option>
                        {stockItems.map((s) => (
                          <option key={s._id} value={s.itemName}>
                            {s.itemName}
                          </option>
                        ))}
                      </select>

                      <input
                        className="ppe-input"
                        value={row.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                        placeholder="Quantity"
                        type="number"
                        min="1"
                        style={{ width: "fit-content" }}
                      />
                      <input
                        className="ppe-input"
                        value={row.unit}
                        onChange={(e) =>
                          updateItem(index, "unit", e.target.value)
                        }
                        placeholder="Unit"
                        style={{ width: "fit-content" }} // Adjust width to fit content dynamically
                      />
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          justifyContent: "center",
                        }}
                      >
                        <button
                          className="ppe-action-btn ppe-edit-btn"
                          type="button"
                            style={{
                            fontSize: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#1a9f27ff",
                            border: "1px solid #888",
                            borderRadius: 4,
                            color: "#444",
                            width: 50,
                            height: 32,
                            padding: 0,
                            minWidth:50
                          }}
                          onClick={() => {
                            /* TODO: Add edit logic here */
                          }}
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="ppe-delete-btn"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                         style={{
                            fontSize: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#000000ff",
                            background: "#ff0000ff",
                            border: "1px solid #ff0000ff",
                            borderRadius: 4,
                          }}
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ppe-form-grid">
                {/* ...existing code for form fields... */}
              </div>

              <div className="ppe-buttons" style={{ marginTop: "18px" }}>
                <button
                  className="ppe-btn-save"
                  onClick={async () => {
                    try {
                      const payload = {
                        personName: form.personName,
                        returnDate: form.issueDate, // reuse date input
                        location: form.location,
                        items: items
                          .filter((i) => i.itemName && Number(i.quantity) > 0)
                          .map((i) => ({
                            itemName: i.itemName,
                            unit: i.unit,
                            quantity: Number(i.quantity),
                          })),
                      };

                      if (payload.items.length === 0) {
                        toast.error("Please add at least one item");
                        return;
                      }

                      await api.post("returns/old", payload);

                      setItems([{ itemName: "", quantity: "", unit: "" }]);
                      setForm({
                        itemName: "",
                        quantity: "",
                        unit: "",
                        issueDate: new Date().toISOString().split("T")[0],
                        personName: "",
                        location: "",
                      });

                      setActiveTab("report");
                      fetchRecords();
                    } catch {
                      toast.error("Failed to issue PPE");
                    }
                  }}
                >
                  Submit
                </button>

                <button
                  onClick={handleBack}
                  className="ppe-btn-back"
                  style={{ marginTop: 0 }}
                >
                  Back
                </button>
              </div>
            </div>
          </React.Fragment>
        )}

        {/* REPORT SECTION */}
        {activeTab === "report" && (
          <React.Fragment>
            <div
              className="ppe-filter-bar"
              style={{ display: "flex", alignItems: "center", gap: "16px" }}
            >
              <div className="ppe-search-box">
                <span className="ppe-search-icon">🔍</span>
                <input
                  className="ppe-search-input"
                  type="text"
                  placeholder="Search Item / Person"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>
              <input
                className="ppe-date-filter"
                type="date"
                value={filters.from}
                onChange={(e) =>
                  setFilters({ ...filters, from: e.target.value })
                }
                style={{ width: "fit-content" }} // Adjusted width to fit content
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={exportPDF}
                  className="ppe-export-btn ppe-export-pdf"
                >
                  Export PDF
                </button>
                <button
                  onClick={exportCSV}
                  className="ppe-export-btn ppe-export-csv"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <div
              className="ppe-table-container"
              style={{ margin: "0 auto", maxWidth: 1000 }}
            >
              <table className="ppe-table">
                <thead>
                  <tr>
                    <th>Items</th>
                    <th>Date</th>
                    <th>Issued To</th>
                    <th>Location</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((r) => (
                      <tr key={r._id}>
                        <td>
                          {r.items
                            .map((i) => `${i.itemName} (${i.quantity} ${i.unit})`)
                            .join(", ")}
                        </td>
                        <td>{new Date(r.returnDate).toLocaleDateString()}</td>
                        <td>{r.personName}</td>

                        <td>{r.location || "-"}</td>
                        <td>
                          <button
                            className="ppe-action-btn ppe-edit-btn"
                            onClick={() => openEdit(r)}
                          >
                            Edit
                          </button>
                        </td>
                        <td>
                          <button
                            className="ppe-action-btn ppe-delete-btn"
                            onClick={() => handleDelete(r._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center" }}>
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </React.Fragment>
        )}

        {/* EDIT MODAL */}
        {editRecord && (
          <div
            className="ppe-modal-overlay"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              className="ppe-modal"
              style={{
                width: "min(720px, 95%)",
                maxHeight: "70vh",
                overflowY: "auto",
                padding: 20,
                borderRadius: 8,
                background: "#fff",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              }}
            >
              <h3 style={{ marginTop: 0 }}>EDIT DISTRIBUTION</h3>

              <label>Item</label>
              <input
                className="ppe-input"
                type="text"
                value={editRecord.itemName}
                readOnly
              />

              <label>Qty</label>
              <input
                className="ppe-input"
                type="number"
                value={editRecord.quantity}
                onChange={(e) =>
                  setEditRecord({
                    ...editRecord,
                    quantity: Number(e.target.value),
                  })
                }
              />

              <label>Unit</label>
              <input
                className="ppe-input"
                type="text"
                value={editRecord.unit}
                readOnly
              />

              <label>Date</label>
              <input
                className="ppe-input"
                type="date"
                value={editRecord.issueDate.split("T")[0]}
                onChange={(e) =>
                  setEditRecord({ ...editRecord, issueDate: e.target.value })
                }
              />

              <label>Issued To</label>
              <input
                className="ppe-input"
                type="text"
                value={editRecord.personName}
                onChange={(e) =>
                  setEditRecord({ ...editRecord, personName: e.target.value })
                }
              />

              <label>Location</label>
              <input
                className="ppe-input"
                type="text"
                value={editRecord.location}
                onChange={(e) =>
                  setEditRecord({ ...editRecord, location: e.target.value })
                }
              />

              <div className="ppe-buttons" style={{ marginTop: "18px" }}>
                <button onClick={updateDistribution} className="ppe-btn-save">
                  💾 Save
                </button>
                <button
                  onClick={() => setEditRecord(null)}
                  className="ppe-btn-back"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back button moved above, below Save Distribution button in entry form */}
      </div>
    </div>
  );
};

export default DistributionPage;
