import { MdDelete, MdEdit } from "react-icons/md";
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./scaffoldingISsue.css";

// ====================== TYPES ======================
interface Item {
  itemName: string;
  unit: string;
}
interface GroupedReportRow {
  _id: string;
  issuedTo: string;
  issueDate: string;
  location?: string;
  woNumber?: string;
  supervisorName?: string;
  tslName?: string;

  itemsText: string;
  totalQty: number;
}

interface IssueRecord {
  _id: string;
  issuedTo: string;
  issueDate: string;
  location?: string;
  woNumber?: string;
  supervisorName?: string;
  tslName?: string;
  items: {
    itemName: string;
    unit: string;
    qty: number;
  }[];
}

interface Stock {
  itemName: string;
  qty: number;
}

interface FormState {
  itemName: string;
  quantity: string;
  unit: string;
  issueDate: string;
  personName: string;
  location: string;
  unitWeight?: string;
  issuedWeight?: string;
  issuedQuantity?: string;
  woNumber?: string;
  supervisorName?: string;
  tslName?: string;
}

interface FilterState {
  search: string;
  from: string;
  to: string;
}

export default function ScaffoldingIssuePage() {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;
  interface MaterialRow {
    qty: number;
    itemName: string;
    unit: string;
    unitWeight: string;
    issuedQuantity: string;
    issuedWeight: string;
  }
  const [materials, setMaterials] = useState<MaterialRow[]>([
    {
      itemName: "",
      unit: "",
      unitWeight: "",
      issuedQuantity: "",
      issuedWeight: "",
    },
  ]);

  const showToast = (type: "success" | "error", msg: string) => {
    if (window && window["toast"]) {
      window["toast"][type](msg);
    } else {
      if (type === "error") alert(msg);
    }
  };

  const addMaterial = () => {
    setMaterials([
      ...materials,
      {
        itemName: "",
        unit: "",
        unitWeight: "",
        issuedQuantity: "",
        issuedWeight: "",
      },
    ]);
    showToast("success", "Material row added");
  };

  const removeMaterial = (index: number) => {
    if (materials.length === 1) {
      showToast("error", "At least one material is required");
      return;
    }
    setMaterials(materials.filter((_, i) => i !== index));
    showToast("success", "Material removed");
  };

  const updateMaterial = (
    index: number,
    key: keyof MaterialRow,
    value: string
  ) => {
    const updated = [...materials];
    updated[index][key] = value;
    // If unitWeight or issuedQuantity changes, recalculate issuedWeight
    if (key === "unitWeight" || key === "issuedQuantity") {
      const unitWeightNum = parseFloat(
        key === "unitWeight" ? value : updated[index].unitWeight || "0"
      );
      const issuedQuantityNum = parseFloat(
        key === "issuedQuantity" ? value : updated[index].issuedQuantity || "0"
      );
      let issuedWeight = "";
      if (!isNaN(unitWeightNum) && !isNaN(issuedQuantityNum)) {
        issuedWeight = (unitWeightNum * issuedQuantityNum).toString();
      }
      updated[index].issuedWeight = issuedWeight;
    }
    setMaterials(updated);
  };

  const handleBack = () => {
    navigate(-1);
  };
  const [activeTab, setActiveTab] = useState<"entry" | "report">("entry");
  const [items, setItems] = useState<Item[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState<Item>({ itemName: "", unit: "" });
  const [records, setRecords] = useState<IssueRecord[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    itemName: "",
    quantity: "",
    unit: "",
    issueDate: new Date().toISOString().split("T")[0],
    personName: "",
    location: "",
    unitWeight: "",
    issuedWeight: "",
    issuedQuantity: "",
    woNumber: "",
    supervisorName: "",
    tslName: "",
  });

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    from: "",
    to: "",
  });

  const [editRecord, setEditRecord] = useState<IssueRecord | null>(null);
  const handleDelete = async (_id: string) => {
    await api.delete(`/issue/scaffolding/${_id}`);
    setRecords((prev) => prev.filter((r) => r._id !== _id));
    showToast("success", "Issue deleted");
  };

  const handleChange = (field: keyof FormState, value: string): void => {
    if (field === "itemName") {
      const selected = items.find((i) => i.itemName === value);
      setForm({
        ...form,
        itemName: value,
        unit: selected ? selected.unit : "",
      });
    } else if (field === "unitWeight" || field === "issuedQuantity") {
      // Update the field, then recalculate issuedWeight
      const updatedForm = { ...form, [field]: value };
      const unitWeightNum = parseFloat(
        field === "unitWeight" ? value : updatedForm.unitWeight || "0"
      );
      const issuedQuantityNum = parseFloat(
        field === "issuedQuantity" ? value : updatedForm.issuedQuantity || "0"
      );
      let issuedWeight = "";
      if (!isNaN(unitWeightNum) && !isNaN(issuedQuantityNum)) {
        issuedWeight = (unitWeightNum * issuedQuantityNum).toString();
      }
      setForm({ ...updatedForm, issuedWeight });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const handleAddItem = () => {
    if (!newItem.itemName.trim() || !newItem.unit.trim()) {
      alert("Please enter both item name and unit.");
      return;
    }
    if (
      items.some(
        (i) =>
          i.itemName.toLowerCase() === newItem.itemName.trim().toLowerCase()
      )
    ) {
      alert("Item already exists.");
      return;
    }
    setItems((prev) => [
      ...prev,
      { itemName: newItem.itemName.trim(), unit: newItem.unit.trim() },
    ]);
    setShowAddItem(false);
    setNewItem({ itemName: "", unit: "" });
  };
  const reportRows = records.map((issue) => ({
    _id: issue._id,
    issueDate: issue.issueDate,
    issuedTo: issue.issuedTo,
    location: issue.location,
    woNumber: issue.woNumber,
    supervisorName: issue.supervisorName,
    tslName: issue.tslName,

    itemsText: issue.items.map((i) => `${i.itemName} (${i.qty})`).join(", "),

    totalQty: issue.items.reduce((sum, i) => sum + i.qty, 0),
  }));

  const filteredRecords = reportRows.filter((r) => {
    const searchText = filters.search.toLowerCase();

    return (
      r.issuedTo.toLowerCase().includes(searchText) ||
      r.itemsText.toLowerCase().includes(searchText)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const exportPDF = (): void => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
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
      doc.text("SCAFFOLDING ISSUE REPORT", pageWidth / 2, 55, {
        align: "center",
      });
    };
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
    addHeader();
    autoTable(doc, {
      startY: 65,
      margin: { top: 60, bottom: 50 },
      head: [
        [
          "Item",
          "Unit",
          "Date",
          "Person",
          "Location",
          "W/O Number",
          "Supervisor Name",
          "TSL Name",
          "Unit Weight",
          "Issued Weight",
          "Issued Quantity",
        ],
      ],
      body: filteredRecords.map((r) => [
        r.itemName,
        r.unit,
        r.issueDate,
        r.issuedTo,
        r.location || "",
        r.woNumber || "",
        r.supervisorName || "",
        r.tslName || "",
        r.unitWeight || "",
        r.issuedWeight || "",
        r.qty,
      ]),
      styles: { fontSize: 10, halign: "center", cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: "#fff" },
      theme: "grid",
      didDrawPage: () => {
        addHeader();
      },
    });
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      addFooter(p, totalPages);
    }
    doc.save("Scaffolding_Issue_Report.pdf");
  };

  const exportCSV = (): void => {
    const headers = [
      "Item",
      "Unit",
      "Date",
      "Person",
      "Location",
      "W/O Number",
      "Supervisor Name",
      "TSL Name",
      "Unit Weight",
      "Issued Weight",
      "Issued Quantity",
    ];
    const rows = filteredRecords.map((r) => [
      r.itemName,
      r.unit,
      r.issueDate,
      r.issuedTo,
      r.location,
      r.woNumber || "",
      r.supervisorName || "",
      r.tslName || "",
      r.unitWeight || "",
      r.issuedWeight || "",
      r.qty || "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "Scaffolding_Issue_Report.csv";
    link.click();
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get("/items/scaffolding");
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchItems();
  }, []);
  useEffect(() => {
    const fetchIssues = async () => {
      const res = await api.get("/issue/scaffolding");
      setRecords(res.data);
    };
    fetchIssues();
  }, []);
  useEffect(() => {
    console.log("ALL RECORDS:", records);
  }, [records]);
  useEffect(() => {
    if (activeTab === "report") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilters({ search: "", from: "", to: "" });
      setCurrentPage(1);
    }
  }, [activeTab]);

  return (
    <div className="ppe-container">
      <div className="ppe-content">
        <h2 className="ppe-title">SCAFFOLDING ISSUE</h2>
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
        {activeTab === "entry" && (
          <React.Fragment>
            <div
              className="ppe-form-card"
              style={{ margin: "0 auto", maxWidth: 900 }}
            >
              <div className="ppe-form-grid">
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
                    placeholder="W/O Number"
                    value={form.woNumber || ""}
                    onChange={(e) => handleChange("woNumber", e.target.value)}
                  />
                </div>
                <div className="ppe-form-group">
                  <input
                    className="ppe-input"
                    type="text"
                    placeholder="Supervisor Name"
                    value={form.supervisorName || ""}
                    onChange={(e) =>
                      handleChange("supervisorName", e.target.value)
                    }
                  />
                </div>
                <div className="ppe-form-group">
                  <input
                    className="ppe-input"
                    type="text"
                    placeholder="TSL Name"
                    value={form.tslName || ""}
                    onChange={(e) => handleChange("tslName", e.target.value)}
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
                    Materials <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <button
                    type="button"
                    className="ppe-add-btn"
                    onClick={addMaterial}
                  >
                    ＋ Add Material
                  </button>
                </div>
                <div className="ppe-material-table">
                  <div
                    className="ppe-table-head"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "48px 2fr 1fr 1fr 1fr 1fr 1fr",
                      alignItems: "center",
                    }}
                  >
                    <span>#</span>
                    <span>Item Name</span>
                    <span>Unit</span>
                    <span>Unit Weight</span>
                    <span>Issued Quantity</span>
                    <span>Issued Weight</span>
                    <span>Action</span>
                  </div>
                  {materials.map((row, index) => (
                    <div
                      className="ppe-table-row"
                      key={index}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "48px 2fr 1fr 1fr 1fr 1fr 1fr",
                        alignItems: "center",
                      }}
                    >
                      <span>{index + 1}</span>
                      <select
                        className="ppe-input"
                        value={row.itemName}
                        onChange={(e) => {
                          const selected = items.find(
                            (i) => i.itemName === e.target.value
                          );

                          updateMaterial(index, "itemName", e.target.value);
                          updateMaterial(index, "unit", selected?.unit || "");
                        }}
                      >
                        <option value="">Select Item</option>
                        {items.map((item) => (
                          <option key={item.itemName} value={item.itemName}>
                            {item.itemName}
                          </option>
                        ))}
                      </select>

                      <input
                        className="ppe-input"
                        value={row.unit}
                        readOnly
                        placeholder="Unit"
                      />

                      <input
                        className="ppe-input"
                        value={row.unitWeight}
                        onChange={(e) =>
                          updateMaterial(index, "unitWeight", e.target.value)
                        }
                        placeholder="Unit Weight"
                        type="number"
                        min="0"
                      />
                      <input
                        className="ppe-input"
                        value={row.issuedQuantity}
                        onChange={(e) =>
                          updateMaterial(
                            index,
                            "issuedQuantity",
                            e.target.value
                          )
                        }
                        placeholder="Issued Quantity"
                        type="number"
                        min="0"
                      />
                      <input
                        className="ppe-input"
                        value={row.issuedWeight}
                        onChange={(e) =>
                          updateMaterial(index, "issuedWeight", e.target.value)
                        }
                        placeholder="Issued Weight"
                        type="number"
                        min="0"
                        readOnly
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
                            background: "#fff",
                            border: "1px solid #888",
                            borderRadius: 4,
                            color: "#444",
                            width: 32,
                            height: 32,
                            padding: 0,
                          }}
                          onClick={() => {
                            /* TODO: Add edit logic here */
                          }}
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="ppe-delete-btn"
                          onClick={() => removeMaterial(index)}
                          disabled={materials.length === 1}
                          style={{
                            fontSize: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ef4444",
                            background: "#fff",
                            border: "1px solid #ef4444",
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
              <div className="ppe-form-grid"></div>
              <div className="ppe-buttons" style={{ marginTop: "18px" }}>
                <button
                  className="ppe-btn-save"
                  onClick={async () => {
                    // 1️⃣ Basic validation
                    if (!form.personName || materials.length === 0) {
                      showToast("error", "Missing required fields");
                      return;
                    }

                    // 2️⃣ Build payload ONCE
                    const payload = {
                      issuedTo: form.personName,
                      issueDate: form.issueDate,
                      location: form.location,
                      woNumber: form.woNumber,
                      supervisorName: form.supervisorName,
                      tslName: form.tslName,

                      items: materials
                        .filter((m) => m.itemName && m.issuedQuantity) // safety
                        .map((m) => ({
                          itemName: m.itemName,
                          unit: m.unit,
                          qty: Number(m.issuedQuantity),
                          unitWeight: Number(m.unitWeight) || 0,
                          issuedWeight: Number(m.issuedWeight) || 0,
                        })),
                    };

                    if (payload.items.length === 0) {
                      showToast("error", "No valid items to issue");
                      return;
                    }

                    try {
                      // 3️⃣ POST ONCE
                      await api.post("/issue/scaffolding", payload);

                      // 4️⃣ FETCH AFTER SAVE
                      const res = await api.get("/issue/scaffolding");
                      setRecords(res.data);

                      // 5️⃣ RESET FORM
                      setMaterials([
                        {
                          itemName: "",
                          unit: "",
                          unitWeight: "",
                          issuedQuantity: "",
                          issuedWeight: "",
                        },
                      ]);

                      setForm({
                        itemName: "",
                        quantity: "",
                        unit: "",
                        issueDate: new Date().toISOString().split("T")[0],
                        personName: "",
                        location: "",
                        unitWeight: "",
                        issuedWeight: "",
                        issuedQuantity: "",
                        woNumber: "",
                        supervisorName: "",
                        tslName: "",
                      });

                      showToast("success", "Materials issued successfully");
                      setActiveTab("report");
                    } catch (err) {
                      console.error(err);
                      showToast("error", "Failed to issue materials");
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
        {activeTab === "report" && (
          <React.Fragment>
            <div className="ppe-filter-bar">
              <div className="ppe-search-box">
                <span className="ppe-search-icon">🔍</span>
                <input
                  className="ppe-search-input"
                  type="text"
                  placeholder="Search Item / Person"
                  value={filters.search}
                  onChange={(e) => {
                    setFilters({ ...filters, search: e.target.value });
                    setCurrentPage(1);
                  }}
                />
              </div>

              <input
                className="ppe-date-filter"
                type="date"
                value={filters.to}
                onChange={(e) => {
                  setFilters({ ...filters, to: e.target.value });
                  setCurrentPage(1);
                }}
                style={{ width: "150px" }}
              />
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
            <div
              className="ppe-table-container"
              style={{ margin: "0 auto", maxWidth: 1000 }}
            >
              <table className="ppe-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Issued To</th>
                    <th>Location</th>
                    <th>W/O Number</th>
                    <th>Supervisor</th>
                    <th>TSL</th>
                    <th>Items Issued</th>
                    <th>Total Qty</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedRecords.map((r) => (
                    <tr key={r._id}>
                      <td>{r.issueDate}</td>
                      <td>{r.issuedTo}</td>
                      <td>{r.location || "-"}</td>
                      <td>{r.woNumber || "-"}</td>
                      <td>{r.supervisorName || "-"}</td>
                      <td>{r.tslName || "-"}</td>
                      <td>{r.itemsText}</td>
                      <td>{r.totalQty}</td>
                      <td>
                        <button
                          className="report-edit-btn"
                          onClick={() => setEditRecord(r)}
                        >
                          <MdEdit />
                        </button>
                      </td>
                      <td>
                        <button
                          className="report-delete-btn"
                          onClick={() => handleDelete(r._id)}
                        >
                          <MdDelete />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  margin: "24px 0",
                }}
              >
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: "8px 16px",
                    marginRight: 8,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    background: currentPage === 1 ? "#f3f4f6" : "#fff",
                    color: "#374151",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Previous
                </button>
                <span
                  style={{
                    fontWeight: 500,
                    margin: "0 12px",
                    color: "#374151",
                  }}
                >
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "8px 16px",
                    marginLeft: 8,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    background: currentPage === totalPages ? "#f3f4f6" : "#fff",
                    color: "#374151",
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </React.Fragment>
        )}
        {editRecord && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>Edit Issue</h3>

              <label>Issued Quantity</label>
              <input
                type="number"
                value={editRecord.qty ?? ""}
                onChange={(e) =>
                  setEditRecord({
                    ...editRecord,
                    qty: Number(e.target.value),
                  })
                }
              />

              <label>Issued To</label>
              <input
                value={editRecord.issuedTo ?? ""}
                onChange={(e) =>
                  setEditRecord({
                    ...editRecord,
                    issuedTo: e.target.value,
                  })
                }
              />

              <button onClick={() => setEditRecord(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
