import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./scaffholdingreturn.css"
import { FaPen, FaTrash } from "react-icons/fa";
import { getReturnRecords, saveReturnRecord, deleteReturnRecord } from "../../services/itemsService";

interface ReturnItem {
  woNumber: string;
  location: string;
  tslManager: string;
  supervisorName: string;
  returnDate: string;
  itemName: string;
  unitWeight: number | string;
  issuedQty: number | string;
  issuedWeight: number | string;
  unit: string;
}

interface SavedItem {
  itemName: string;
  unit: string;
}

interface ReturnRecord {
  _id?: string;
  woNumber: string;
  location: string;
  personName: string;
  returnDate: string;
  itemName: string;
  unit: string;
  unitWeight: number;
  returnQuantity: number;
  returnWeight: number;
}

export default function ReturnPage() {
    // Edit material row: populate formData with selected material row for editing
    const [editingMaterialIdx, setEditingMaterialIdx] = useState<number | null>(null);

    const handleEditMaterial = (idx: number) => {
      const mat = materials[idx];
      setFormData((prev) => ({
        ...prev,
        itemName: mat.itemName,
        unitWeight: mat.unitWeight,
        issuedQty: mat.returnQuantity,
        issuedWeight: mat.returnWeight,
        unit: mat.unit,
      }));
      setEditingMaterialIdx(idx);
      showMessage("Material row loaded for editing");
    };

    const handleDeleteMaterial = (idx: number) => {
      if (materials.length === 1) {
        showMessage("At least one material is required");
        return;
      }
      setMaterials(materials.filter((_, i) => i !== idx));
      showMessage("Material removed");
      // If editing the deleted row, reset editingMaterialIdx
      if (editingMaterialIdx === idx) setEditingMaterialIdx(null);
    };
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("entry");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");


  // Add Material Section State
  interface MaterialRow {
    itemName: string;
    quantity: string;
    unit: string;
  }
  const [materials, setMaterials] = useState<MaterialRow[]>([
    { itemName: "", quantity: "", unit: "" }
  ]);

  const addMaterial = () => {
    setMaterials([...materials, { itemName: "", quantity: "", unit: "" }]);
    showMessage("Item row added");
  };

  const removeMaterial = (index: number) => {
    if (materials.length === 1) {
      showMessage("At least one material is required");
      return;
    }
    setMaterials(materials.filter((_, i) => i !== index));
    showMessage("Material removed");
  };

  const updateMaterial = (index: number, key: keyof MaterialRow, value: string) => {
    const updated = [...materials];
    updated[index][key] = value;

    // Auto-update unit when itemName is selected in a material row
    if (key === "itemName") {
      const selected = savedItems.find((s) => s.itemName === value);
      updated[index].unit = selected ? selected.unit : "";
    }

    setMaterials(updated);
  };

  const [formData, setFormData] = useState<ReturnItem>({
    woNumber: "",
    location: "",
    tslManager: "",
    supervisorName: "",
    returnDate: "",
    itemName: "",
    unitWeight: "",
    issuedQty: "",
    issuedWeight: "",
    unit: "",
  });
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [returnRecords, setReturnRecords] = useState<ReturnRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2500);
  };

  // Load saved records from backend
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const records = await getReturnRecords();
        setReturnRecords(records);
      } catch (e) {
        console.warn("Failed to load return records", e);
      }
    };
    fetchRecords();
  }, []);

  // refresh records when switching to report tab (in case other pages updated storage)
  useEffect(() => {
    if (activeTab === "report") {
      try {
        const raw = localStorage.getItem("scaff_returnRecords");
        if (raw) setReturnRecords(JSON.parse(raw));
      } catch (e) {
        console.warn("Failed to load saved return records", e);
      }
    }
  }, [activeTab]);

  // ✅ Updated handleChange with auto-calculation
  const handleChange = (field: keyof ReturnItem, value: string | number) => {
    let updated = { ...formData, [field]: value };

    // Auto-update unit when selecting an item
    if (field === "itemName") {
      const selected = savedItems.find((s) => s.itemName === value);
      updated.unit = selected ? selected.unit : "";
    }

    // Auto-calculate Return Weight = Unit Weight × Return Quantity
    const qty = Number(field === "issuedQty" ? value : formData.issuedQty) || 0;
    const unitWt =
      Number(field === "unitWeight" ? value : formData.unitWeight) || 0;
    updated.issuedWeight = qty * unitWt;

    setFormData(updated);
  };

  // Removed API call. Only local state update or validation can be done here.
  const handleSave = async () => {
    const hasValidMaterial = materials.some(
      (m) => m.itemName && m.quantity !== "" && Number(m.quantity) > 0
    );

    if (!formData.location || !hasValidMaterial) {
      showMessage("⚠️ Fill all required fields before saving");
      return;
    }

    const newRecords = materials.map((m) => ({
      woNumber: formData.woNumber || "",
      location: formData.location,
      personName: formData.tslManager || formData.supervisorName || "",
      returnDate: formData.returnDate || new Date().toISOString(),
      itemName: m.itemName,
      unit: m.unit || formData.unit || "",
      unitWeight: 0,
      returnQuantity: Number(m.quantity),
      returnWeight: 0,
    }));

    try {
      await Promise.all(newRecords.map((record) => saveReturnRecord(record)));
      showMessage(editingId ? "✅ Return updated" : "✅ Return saved");
      setEditingId(null);
      setMaterials([{ itemName: "", quantity: "", unit: "" }]);
      setFormData({
        location: "",
        supervisorName: "",
        returnDate: "",
        itemName: "",
        issuedQty: "",
        unit: "",
      });
      const updatedRecords = await getReturnRecords();
      setReturnRecords(updatedRecords);
    } catch (e) {
      console.warn("Failed to save return records", e);
    }
  };

  const handleEdit = (record: ReturnRecord) => {
    setActiveTab("entry");
    setFormData({
      woNumber: record.woNumber,
      location: record.location,
      tslManager: record.personName,
      supervisorName: "",
      returnDate: record.returnDate
        ? new Date(record.returnDate).toISOString().split("T")[0]
        : "",
      itemName: record.itemName,
      unitWeight: record.unitWeight,
      issuedQty: record.returnQuantity,
      issuedWeight: record.returnWeight,
      unit: record.unit,
    });
    setEditingId(record._id || null);
    showMessage("✏️ Editing existing record");
  };
  // ================= FILTER LOGIC =================
  const filteredRecords = returnRecords.filter((r) => {
    const matchesSearch =
      r.woNumber.toLowerCase().includes(search) ||
      r.itemName.toLowerCase().includes(search.toLowerCase()) ||
      r.personName.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());

    const recordDate = r.returnDate
      ? new Date(r.returnDate).toISOString().split("T")[0]
      : "";

    const matchesFromDate = fromDate ? recordDate >= fromDate : true;
    const matchesToDate = toDate ? recordDate <= toDate : true;

    return matchesSearch && matchesFromDate && matchesToDate;
  });

  // Removed API call. Remove record from local state + storage.
  const handleDelete = async (record) => {
    const formattedDate = record.returnDate
      ? new Date(record.returnDate).toISOString().split("T")[0]
      : "";

    if (!window.confirm(`Delete ${record.itemName} returned on ${formattedDate}?`)) {
      return;
    }

    try {
      await deleteReturnRecord(record._id);
      const updatedRecords = await getReturnRecords();
      setReturnRecords(updatedRecords);
      showMessage("🗑️ Return deleted");
    } catch (e) {
      console.warn("Failed to delete return record", e);
    }
  };
  const exportCSV = () => {
    const headers = [
      "W/O No,Location,TSL Manager,Return Date,Item,Unit,Unit Wt,Return Qty,Return Wt",
    ];

    const rows = returnRecords.map((r) => [
      r.woNumber,
      r.location,
      r.personName,
      r.returnDate ? new Date(r.returnDate).toLocaleDateString() : "",
      r.itemName,
      r.unit,
      r.unitWeight,
      r.returnQuantity,
      r.returnWeight,
    ]);

    let csvContent = headers.join("\n") + "\n";

    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Return_Report.csv");
    link.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF("p", "mm", "a4"); // Portrait orientation

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header function (similar to generateInvoicePDF)
    const addHeader = () => {
      doc.addImage("/ray-log.png", "PNG", 15, 10, 18, 18);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("RAY ENGINEERING", 50, 15);

      doc.setFontSize(10);
      doc.text("Contact No: 9337670266", 50, 22);
      doc.text("E-Mail: accounts@rayengineering.co", 50, 28);

      doc.setLineWidth(0.5);
      doc.line(10, 40, pageWidth - 10, 40);

      doc.setFontSize(16);
      doc.text("RETURN REPORT", pageWidth / 2, 55, { align: "center" });
    };

    // Footer function (similar to generateInvoicePDF)
    const addFooter = (pageNum: number, totalPages: number) => {
      const footerY = pageHeight - 40;

      doc.line(10, footerY, pageWidth - 10, footerY);
      doc.setFontSize(9);

      doc.text(
        "Registrations:\nGSTIN: 21AIJHPR1040H1ZO\nUDYAM: DO-12-0001261\nState: Odisha (Code: 21)",
        10,
        footerY + 8
      );

      doc.text(
        "Registered Address:\nAt- Gandakipur, Po- Gopiakuda,\nPs- Kujanga, Dist- Jagatsinghpur",
        pageWidth / 3,
        footerY + 8
      );

      doc.text(
        `Contact & Web:\nMD Email: md@rayengineering.co\nWebsite: rayengineering.co\nPage ${pageNum} / ${totalPages}`,
        (pageWidth / 3) * 2,
        footerY + 8
      );
    };

    // Draw first page header
    addHeader();

    // Generate the table using autoTable
    autoTable(doc, {
      startY: 65,
      margin: { top: 60, bottom: 50 },

      head: [
        [
          "W/O No",
          "Location",
          "TSL Manager",
          "Return Date",
          "Item",
          "Unit",
          "Unit Wt",
          "Return Qty",
          "Return Wt",
        ],
      ],

      body: returnRecords.map((r) => [
        r.woNumber,
        r.location,
        r.personName,
        r.returnDate ? new Date(r.returnDate).toLocaleDateString() : "",
        r.itemName,
        r.unit,
        r.unitWeight,
        r.returnQuantity,
        r.returnWeight,
      ]),

      styles: { fontSize: 10, halign: "center", cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: "#fff" },
      theme: "grid",

      didDrawPage: () => {
        addHeader();
      },
    });

    // Add footers to all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i, totalPages);
    }

    // Save PDF
    doc.save("Return_Report.pdf");
  };

  return (

    <div className="sr-container">
      <div className="sr-content">
        <h1 className="sr-title">RETURN MATERIALS</h1>
        {message && <div className="sr-toast">{message}</div>}

        <div className="sr-tabs">
          <button
            className={`sr-tab${activeTab === "entry" ? " active" : ""}`}
            onClick={() => setActiveTab("entry")}
          >
            Entry Form
          </button>
          <button
            className={`sr-tab${activeTab === "report" ? " active" : ""}`}
            onClick={() => setActiveTab("report")}
          >
            Report
          </button>
        </div>

        {activeTab === "entry" && (
          <div className="sr-form-card">
            <div className="sr-form-grid">
              <input
                className="sr-input"
                placeholder="W/O Number"
                value={formData.woNumber}
                onChange={(e) => handleChange("woNumber", e.target.value)}
              />
              <input
                className="sr-input"
                placeholder="Location / Site"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
              <input
                className="sr-input"
                placeholder="TSL Manager"
                value={formData.tslManager}
                onChange={(e) => handleChange("tslManager", e.target.value)}
              />
              <input
                className="sr-input"
                type="date"
                value={formData.returnDate}
                onChange={(e) => handleChange("returnDate", e.target.value)}
              />
            
            </div>

            {/* --- Add Material Section --- */}
            <div className="sr-materials-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 50 }}>
              <label style={{ fontSize: 14, fontWeight: 500 }}>Materials</label>
              <button type="button" className="sr-add-btn" onClick={addMaterial}>
                + Add Material
              </button>
            </div>
            <div className="sr-material-table">
              <div className="sr-table-head" style={{ display: "grid", gridTemplateColumns: "48px 2fr 1.2fr 1.2fr 100px", alignItems: "center" }}>
                <div>#</div>
                <div>Item</div>
                <div>Return Quantity</div>
                <div>Unit</div>
                <div>Action</div>
              </div>
              {materials.map((row, idx) => (
                <div className="sr-table-row" key={idx} style={{ display: "grid", gridTemplateColumns: "48px 2fr 1.2fr 1.2fr 100px", alignItems: "center", borderTop: "1px solid #e5e7eb", background: "#fff" }}>
                  <div>{idx + 1}</div>
                  <select
                    className="sr-material-input"
                    value={row.itemName}
                    onChange={(e) => updateMaterial(idx, "itemName", e.target.value)}
                  >
                    <option value="">Select Item</option>
                    {savedItems.map((item, i) => (
                      <option key={i} value={item.itemName}>{item.itemName}</option>
                    ))}
                  </select>
                  <input
                    className="sr-material-input"
                    value={row.quantity}
                    onChange={(e) => updateMaterial(idx, "quantity", e.target.value)}
                    placeholder="Return Quantity"
                    type="number"
                  />
                  <select
                    className="sr-material-input"
                    value={row.unit}
                    onChange={(e) => updateMaterial(idx, "unit", e.target.value)}
                  >
                    <option value="">Select Unit</option>
                    <option value="kg">kg</option>
                    <option value="pcs">pcs</option>
                    <option value="liters">liters</option>
                    {/* Add more units as needed */}
                  </select>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                    <button
                      type="button"
                      className="sr-edit-btn"
                      title="Edit"
                      style={{ background: "#3B82F6", color: "white", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer" }}
                      onClick={() => alert('Edit functionality to be implemented')}
                    >
                      <FaPen size={16} />
                    </button>
                    <button
                      type="button"
                      className="sr-delete-btn"
                      title="Delete"
                      style={{ background: "#EF4444", color: "white", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: materials.length === 1 ? "not-allowed" : "pointer", opacity: materials.length === 1 ? 0.4 : 1 }}
                      onClick={() => removeMaterial(idx)}
                      disabled={materials.length === 1}
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
      

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <button className="sr-btn-save" onClick={handleSave}>
                💾 {editingId ? "Update Return" : "Save Return"}
              </button>
              <button className="sr-btn-save" onClick={() => navigate(-1)}>
                Back
              </button>
            </div>
          </div>
        )}

        {activeTab === "report" && (
          <>
            <div className="sr-filter-bar">
              <input
                type="text"
                placeholder="🔍Item / Person / Location"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="sr-search-input"
              />

               <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="sr-date-filter"
                style={{width:"fit-content"}}
              />

              <button className="sr-export-btn sr-export-pdf" style={{marginLeft:"400px"}} onClick={exportPDF}>
                Download Report
              </button>

              <button className="sr-export-btn sr-export-csv" onClick={exportCSV}>
                Export CSV
              </button>
            </div>

            <div className="sr-table-container">
              <table className="sr-table">
                <thead>
                  <tr>
                    <th>W/O No</th>
                    <th>Location</th>
                    <th>TSL Manager</th>
                    <th>Return Date</th>
                    <th>Item</th>
                    <th>Unit</th>
                    <th>Unit Wt</th>
                    <th>Return Qty</th>
                    <th>Return Wt</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: "center" }}>
                        No Records Found
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r) => (
                      <tr key={r._id}>
                        <td>{r.woNumber}</td>
                        <td>{r.location}</td>
                        <td>{r.personName}</td>
                        <td>
                          {r.returnDate
                            ? new Date(r.returnDate).toLocaleDateString()
                            : ""}
                        </td>
                        <td>{r.itemName}</td>
                        <td>{r.unit}</td>
                        <td>{r.unitWeight}</td>
                        <td>{r.returnQuantity}</td>
                        <td>{r.returnWeight}</td>
                        <td>
                          <button
                            className="sr-action-btn sr-edit-btn"
                            onClick={() => handleEdit(r)}
                          >
                            Edit
                          </button>
                        </td>
                        <td>
                          <button
                            className="sr-action-btn sr-delete-btn"
                            onClick={() => handleDelete(r)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Removed Back button from report section to avoid confusion */}
          </>
        )}
      </div>
    </div>  
  );
}
//updated delete button