import { MdDelete, MdEdit } from "react-icons/md";
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PPEDistribution.css";

// ====================== TYPES ======================
interface Item {
  itemName: string;
  unit: string;
}

interface IssueRecord {
  _id: string;
  itemName: string;
  quantity: number;
  unit: string;
  issueDate: string;
  personName: string;
  location: string;
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
}

interface FilterState {
  search: string;
  from: string;
  to: string;
}

export default function MechanicalIssuePage() {
  interface MaterialRow {
    itemName: string;
    quantity: string;
    unit: string;
  }
  const [materials, setMaterials] = useState<MaterialRow[]>([
    { itemName: '', quantity: '', unit: '' }
  ]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    if (window && window['toast']) {
      window['toast'][type](msg);
    } else {
      if (type === 'error') alert(msg);
    }
  };

  const addMaterial = () => {
    setMaterials([...materials, { itemName: '', quantity: '', unit: '' }]);
    showToast('success', 'Material row added');
  };

  const removeMaterial = (index: number) => {
    if (materials.length === 1) {
      showToast('error', 'At least one material is required');
      return;
    }
    setMaterials(materials.filter((_, i) => i !== index));
    showToast('success', 'Material removed');
  };

  const updateMaterial = (index: number, key: keyof MaterialRow, value: string) => {
    const updated = [...materials];
    updated[index][key] = value;
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
  });

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    from: "",
    to: "",
  });

  const [editRecord, setEditRecord] = useState<IssueRecord | null>(null);

  const handleDelete = (_id: string) => {
    setRecords((prev) => prev.filter((r) => r._id !== _id));
    showToast('success', 'Record deleted!');
  };

  const handleChange = (field: keyof FormState, value: string): void => {
    if (field === "itemName") {
      const selected = items.find((i) => i.itemName === value);
      setForm({
        ...form,
        itemName: value,
        unit: selected ? selected.unit : "",
      });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const handleAddItem = () => {
    if (!newItem.itemName.trim() || !newItem.unit.trim()) {
      alert("Please enter both item name and unit.");
      return;
    }
    if (items.some(i => i.itemName.toLowerCase() === newItem.itemName.trim().toLowerCase())) {
      alert("Item already exists.");
      return;
    }
    setItems(prev => [...prev, { itemName: newItem.itemName.trim(), unit: newItem.unit.trim() }]);
    setShowAddItem(false);
    setNewItem({ itemName: "", unit: "" });
  };

  const filteredRecords = records.filter((r: IssueRecord) => {
    const searchMatch =
      r.itemName.toLowerCase().includes(filters.search.toLowerCase()) ||
      r.personName.toLowerCase().includes(filters.search.toLowerCase());
    const from = filters.from ? new Date(filters.from) : null;
    const to = filters.to ? new Date(filters.to) : null;
    const date = new Date(r.issueDate);
    const dateMatch = (!from || date >= from) && (!to || date <= to);
    return searchMatch && dateMatch;
  });

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
      doc.text("MECHANICAL ISSUE REPORT", pageWidth / 2, 55, {
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
        addHeader();
      },
    });
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      addFooter(p, totalPages);
    }
    doc.save("Mechanical_Issue_Report.pdf");
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
    link.download = "Mechanical_Issue_Report.csv";
    link.click();
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('/api/items');
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, []);

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
  };

  const headerStyle = {
    position: "sticky",
    top: 0,
    backgroundColor: "#f3f4f6",
    zIndex: 1,
    textAlign: "center",
  };

  const inputStyle = {
    width: "120px",
    padding: "4px", // Reduced padding to lower the gap
    border: "1px solid #e5e7eb",
    borderRadius: "4px",
  };

  return (
    <div className="ppe-container">
      <div className="ppe-content">
        <h2 className="ppe-title">MECHANICAL ISSUE</h2>
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
            <div className="ppe-form-card" style={{ margin: "0 auto", maxWidth: 900 }}>
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
                  <label >Materials <span style={{ color: '#ef4444' }}>*</span></label>
                  <button type="button" className="ppe-add-btn" onClick={addMaterial}>
                    ＋ Add Material
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
                  {materials.map((row, index) => (
                    <div className="ppe-table-row" key={index}>
                      <span>{index + 1}</span>
                      <input
                        className="ppe-input"
                        value={row.itemName}
                        onChange={e => updateMaterial(index, 'itemName', e.target.value)}
                        placeholder="Item Name"
                        style={inputStyle}
                      />
                      <input
                        className="ppe-input"
                        value={row.quantity}
                        onChange={e => updateMaterial(index, 'quantity', e.target.value)}
                        placeholder="Quantity"
                        type="number"
                        min="1"
                        style={inputStyle}
                      />
                      <input
                        className="ppe-input"
                        value={row.unit}
                        onChange={e => updateMaterial(index, 'unit', e.target.value)}
                        placeholder="Unit"
                        style={inputStyle}
                      />
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          className="ppe-action-btn ppe-edit-btn"
                          type="button"
                          style={{ fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #888', borderRadius: 4, color: '#444', width: 32, height: 32, padding: 0 }}
                          onClick={() => {/* TODO: Add edit logic here */}}
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="ppe-delete-btn"
                          onClick={() => removeMaterial(index)}
                          disabled={materials.length === 1}
                          style={{ fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', background: '#fff', border: '1px solid #ef4444', borderRadius: 4 }}
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
                  style={{ marginBottom: "10px" }}
                  onClick={() => {
                    const newRecords = materials.map((mat) => ({
                      _id: Math.random().toString(36).substr(2, 9),
                      itemName: mat.itemName,
                      quantity: Number(mat.quantity),
                      unit: mat.unit,
                      issueDate: form.issueDate,
                      personName: form.personName,
                      location: form.location,
                    }));
                    setRecords((prev) => [...prev, ...newRecords]);
                    setMaterials([{ itemName: '', quantity: '', unit: '' }]);
                    setForm({
                      itemName: '',
                      quantity: '',
                      unit: '',
                      issueDate: new Date().toISOString().split('T')[0],
                      personName: '',
                      location: '',
                    });
                    showToast('success', 'Materials submitted!');
                    setActiveTab('report');
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
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>
            
              <input
                className="ppe-date-filter"
                type="date"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                style={{ width: '150px' }}
              />
              <button onClick={exportPDF} className="ppe-export-btn ppe-export-pdf">
                Export PDF
              </button>
              <button onClick={exportCSV} className="ppe-export-btn ppe-export-csv">
                Export CSV
              </button>
            </div>
            <div className="ppe-table-container" style={{ margin: "0 auto", maxWidth: 1000 }}>
              <table className="ppe-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Date</th>
                    <th>Issued To</th>
                    <th>Location</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length ? (
                    filteredRecords.map((r) => (
                      <tr key={r._id}>
                        <td>{r.itemName}</td>
                        <td>{r.quantity}</td>
                        <td>{r.unit}</td>
                        <td>{r.issueDate}</td>
                        <td>{r.personName}</td>
                        <td>{r.location}</td>
                        <td>
                          <button
                            onClick={() => setEditRecord(r)}
                            className="ppe-action-btn ppe-edit-btn"
                          >
                            Edit
                          </button>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(r._id)}
                            className="ppe-action-btn ppe-delete-btn"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center" }}>
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </React.Fragment>
        )}
        {editRecord && (
          <div className="ppe-modal-overlay">
            <div className="ppe-modal">
              <h3>EDIT MECHANICAL ISSUE</h3>
              <label>Item</label>
              <input className="ppe-input" type="text" value={editRecord.itemName} readOnly />
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
              <input className="ppe-input" type="text" value={editRecord.unit} readOnly />
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
                <button
                  onClick={() => {
                    if (editRecord) {
                      setRecords((prev) =>
                        prev.map((r) =>
                          r._id === editRecord._id ? { ...editRecord } : r
                        )
                      );
                      setEditRecord(null);
                      showToast('success', 'Record updated!');
                    }
                  }}
                  className="ppe-btn-save"
                >
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
      </div>
    </div>
  );
}
