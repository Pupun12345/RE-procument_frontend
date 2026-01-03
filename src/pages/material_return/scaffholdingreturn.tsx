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
  puw: number;
}
interface GroupedReportRow {
  _id: string;
  returnedBy: string;
  issueDate: string;
  location?: string;
  woNumber?: string;
  supervisorName?: string;
  tslName?: string;

  itemsText: string;
  totalQty: number;
}

interface ReturnRecord {
  _id: string;
  personName: string;
  returnDate: string;
  location?: string;
  woNumber?: string;
  supervisorName?: string;
  tslName?: string;
  items: {
    itemName: string;
    unit: string;
    quantity: number;
    unitWeight?: number;
    returnWeight?: number;
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
  returnWeight?: string;
  returnQuantity?: string;
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
    returnQuantity: string;
    returnWeight: string;
  }
  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const [materials, setMaterials] = useState<MaterialRow[]>([
    {
      itemName: "",
      unit: "",
      unitWeight: "",
      returnQuantity: "",
      returnWeight: "",
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
        returnQuantity: "",
        returnWeight: "",
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
    // If unitWeight or returnQuantity changes, recalculate returnWeight
    if (key === "returnQuantity") {
      const unitWeightNum = parseFloat(updated[index].unitWeight || "0");
      const returnQuantityNum = parseFloat(value || "0");

      updated[index].returnWeight =
        !isNaN(unitWeightNum) && !isNaN(returnQuantityNum)
          ? String(unitWeightNum * returnQuantityNum)
          : "";
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
  const [records, setRecords] = useState<ReturnRecord[]>([]);
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
    returnWeight: "",
    returnQuantity: "",
    woNumber: "",
    supervisorName: "",
    tslName: "",
  });

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    from: "",
    to: "",
  });

  interface EditableIssueRecord {
    _id: string;
    returnDate?: string;
    personName?: string;
    location?: string;
    woNumber?: string;
    supervisorName?: string;
    tslName?: string;
    items: {
      itemName: string;
      unit: string;
      quantity: number;
      unitWeight?: number | string;
      returnQuantity?: number | string;
      returnWeight?: number | string;
    }[];
  }

  const [editRecord, setEditRecord] = useState<EditableIssueRecord | null>(
    null
  );
  const handleDelete = async (_id: string) => {
    await api.delete(`/returns/scaffolding/${_id}`);
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
    } else if (field === "unitWeight" || field === "returnQuantity") {
      // Update the field, then recalculate returnWeight
      const updatedForm = { ...form, [field]: value };
      const unitWeightNum = parseFloat(
        field === "unitWeight" ? value : updatedForm.unitWeight || "0"
      );
      const returnQuantityNum = parseFloat(
        field === "returnQuantity" ? value : updatedForm.returnQuantity || "0"
      );
      let returnWeight = "";
      if (!isNaN(unitWeightNum) && !isNaN(returnQuantityNum)) {
        returnWeight = (unitWeightNum * returnQuantityNum).toString();
      }
      setForm({ ...updatedForm, returnWeight });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  // Open edit modal for a scaffolding return
  const openEdit = (r: ReturnRecord) => {
    const mapped = (r.items || []).map((it) => ({
      itemName: it.itemName,
      unit: it.unit,
      quantity: it.quantity || 0,
      unitWeight: (it as any).unitWeight ?? "",
      returnQuantity: (it as any).returnQuantity ?? it.quantity ?? 0,
      returnWeight: (it as any).returnWeight ?? "",
    }));

    setEditRecord({
      _id: r._id,
      returnDate: r.returnDate,
      personName: r.personName,
      location: r.location,
      woNumber: r.woNumber,
      supervisorName: r.supervisorName,
      tslName: r.tslName,
      items: mapped,
    });
  };

  const updateEditItem = (
    index: number,
    key: "quantity" | "unitWeight" | "returnQuantity",
    value: string
  ) => {
    if (!editRecord) return;
    const updated = { ...editRecord } as EditableIssueRecord;
    const itemsCopy = updated.items.map((it) => ({ ...it }));
    if (key === "quantity") {
      itemsCopy[index].quantity = Number(value) || 0;
      if (!itemsCopy[index].returnQuantity)
        itemsCopy[index].returnQuantity = itemsCopy[index].quantity;
    } else if (key === "unitWeight") {
      itemsCopy[index].unitWeight = value;
    } else if (key === "returnQuantity") {
      itemsCopy[index].returnQuantity = value;
    }

    const uw = parseFloat(String(itemsCopy[index].unitWeight || "0"));
    const rq = parseFloat(
      String(
        itemsCopy[index].returnQuantity ?? itemsCopy[index].quantity ?? "0"
      )
    );
    if (!isNaN(uw) && !isNaN(rq)) {
      itemsCopy[index].returnWeight = uw * rq;
    }

    updated.items = itemsCopy;
    setEditRecord(updated);
  };

  const updateIssue = async () => {
    if (!editRecord) return;
    try {
      const itemsPayload = editRecord.items.map((it) => ({
        itemName: it.itemName,
        unit: it.unit,
        quantity: Number(it.quantity) || 0,
        unitWeight: Number(it.unitWeight) || 0,
        returnQuantity: Number(it.returnQuantity) || Number(it.quantity) || 0,
        returnWeight: Number(it.returnWeight) || 0,
      }));

      const payload = {
        personName: editRecord.personName,
        returnDate: editRecord.returnDate,
        location: editRecord.location,
        woNumber: editRecord.woNumber,
        supervisorName: editRecord.supervisorName,
        tslName: editRecord.tslName,
        items: itemsPayload,
      };

      await api.put(`/returns/scaffolding/${editRecord._id}`, payload);
      showToast("success", "Updated successfully");
      setEditRecord(null);
      const res = await api.get("/returns/scaffolding");
      setRecords(res.data);
    } catch (err) {
      showToast("error", "Failed to update record");
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
  const reportRows = records.map((r) => ({
    _id: r._id,
    issueDate: r.returnDate,
    returnedBy: r.personName,

    location: r.location,
    woNumber: r.woNumber,
    supervisorName: r.supervisorName,
    tslName: r.tslName,

    itemsText: r.items.map((i) => `${i.itemName} (${i.quantity})`).join(", "),

    totalQty: r.items.reduce((sum, i) => sum + i.quantity, 0),
  }));

  const filteredRecords = reportRows.filter((r) => {
    const searchText = (filters.search || "").toLowerCase();

    const returnedBy = (r.returnedBy || "").toLowerCase();
    const itemsText = (r.itemsText || "").toLowerCase();

    return returnedBy.includes(searchText) || itemsText.includes(searchText);
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
      doc.text("SCAFFOLDING RETURN REPORT", pageWidth / 2, 55, {
        align: "center",
      });
    };
    const addFooter = (pageNum: number, totalPages: number) => {
      const footerY = pageHeight - 50;
      doc.line(10, footerY, 200, footerY);
      doc.setFontSize(8);
      doc.text(
        "Registrations:\nGSTIN: 21AIJHPR1040H1ZO\nUDYAM: DO-12-0001261\nState: Odisha (Code: 21)",
        10,
        footerY + 5
      );
      doc.text(
        "Registered Address:\nAt- Gandakipur, Po- Gopiakuda,\nPs- Kujanga, Dist- Jagatsinghpur",
        75,
        footerY + 5
      );
      doc.text(
        `Contact & Web:\nMD Email: md@rayengineering.co\nWebsite: rayengineering.co\nPage ${pageNum} / ${totalPages}`,
        145,
        footerY + 5
      );
    };

    let tempTotalPages = 1;

    // Get matching records based on filters
    const pdfRecords = records.filter((rec) => {
      const searchText = (filters.search || "").toLowerCase();
      const personMatch = (rec.personName || "").toLowerCase().includes(searchText);
      const itemMatch = rec.items.some((i) =>
        i.itemName.toLowerCase().includes(searchText)
      );
      return personMatch || itemMatch || !searchText;
    });

    autoTable(doc, {
      startY: 65,
      margin: { top: 70, bottom: 65 },
      head: [
        [
          "Item",
          "Unit",
          "Qty",
          "Date",
          "Person",
          "Location",
          "W/O Number",
          "Supervisor",
          "TSL",
        ],
      ],
      body: pdfRecords.flatMap((r) =>
        r.items.map((item: any) => [
          item.itemName,
          item.unit,
          item.quantity,
          new Date(r.returnDate).toLocaleDateString("en-IN"),
          r.personName,
          r.location || "",
          r.woNumber || "",
          r.supervisorName || "",
          r.tslName || "",
        ])
      ),
      styles: { fontSize: 8, halign: "center", cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: "#fff" },
      theme: "grid",
      didDrawPage: (data) => {
        addHeader();
        addFooter(data.pageNumber, tempTotalPages);
      },
    });
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      addHeader();
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
      r.returnedBy,
      r.location,
      r.woNumber || "",
      r.supervisorName || "",
      r.tslName || "",
      r.unitWeight || "",
      r.returnWeight || "",
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
      const res = await api.get("/returns/scaffolding");
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
        <h2 className="ppe-title">SCAFFOLDING RETURN</h2>
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
                          updateMaterial(
                            index,
                            "unitWeight",
                            String(selected?.puw || "")
                          );
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
                        readOnly
                        placeholder="PUW"
                        style={{ background: "#f3f4f6", cursor: "not-allowed" }}
                      />

                      <input
                        className="ppe-input"
                        value={row.returnQuantity}
                        onChange={(e) =>
                          updateMaterial(
                            index,
                            "returnQuantity",
                            e.target.value
                          )
                        }
                        placeholder="Return Quantity"
                        type="number"
                        min="0"
                      />
                      <input
                        className="ppe-input"
                        value={row.returnWeight}
                        onChange={(e) =>
                          updateMaterial(index, "returnWeight", e.target.value)
                        }
                        placeholder="Return Weight"
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
                            background: "#1a9f27ff",
                            border: "1px solid #888",
                            borderRadius: 4,
                            color: "#444",
                            width: 50,
                            height: 32,
                            padding: 0,
                            minWidth: 50,
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
                      woNumber: form.woNumber,
                      location: form.location,
                      personName: form.personName,
                      supervisorName: form.supervisorName, // ✅
                      tslName: form.tslName, // ✅
                      returnDate: form.issueDate,

                      items: materials.map((m) => ({
                        itemName: m.itemName,
                        unit: m.unit,
                        quantity: Number(m.returnQuantity),
                      })),
                    };

                    if (payload.items.length === 0) {
                      showToast("error", "No valid items to issue");
                      return;
                    }

                    try {
                      // 3️⃣ POST ONCE
                      await api.post("/returns/scaffolding", payload);

                      // 4️⃣ FETCH AFTER SAVE
                      const res = await api.get("/returns/scaffolding");
                      setRecords(res.data);

                      // 5️⃣ RESET FORM
                      setMaterials([
                        {
                          itemName: "",
                          unit: "",
                          unitWeight: "",
                          returnQuantity: "",
                          returnWeight: "",
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
                        returnWeight: "",
                        returnQuantity: "",
                        woNumber: "",
                        supervisorName: "",
                        tslName: "",
                      });

                      showToast("success", "Materials issued successfully");
                      setActiveTab("report");
                    } catch (err) {
                      console.error(err);
                      showToast("error", "Failed to return materials");
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
                      <td>{formatDate(r.issueDate)}</td>
                      <td>{r.returnedBy}</td>
                      <td>{r.location || "-"}</td>
                      <td>{r.woNumber || "-"}</td>
                      <td>{r.supervisorName || "-"}</td>
                      <td>{r.tslName || "-"}</td>
                      <td>{r.itemsText}</td>
                      <td>{r.totalQty}</td>
                      <td>
                        <button
                          className="report-edit-btn"
                          onClick={() => {
                            const orig = records.find(
                              (rec) => rec._id === r._id
                            );
                            if (orig) openEdit(orig);
                          }}
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
          <div
            className="modal-backdrop"
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
              className="modal-card"
              style={{
                width: "min(720px, 95%)",
                maxHeight: "70vh",
                overflowY: "auto",
                padding: 20,
                borderRadius: 8,
                background: "#fff",
              }}
            >
              <h3>Edit Return</h3>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Return Date</label>
                <input
                  type="date"
                  value={editRecord.returnDate ?? ""}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, returnDate: e.target.value })
                  }
                />

                <label>Returned By</label>
                <input
                  value={editRecord.personName ?? ""}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, personName: e.target.value })
                  }
                />

                <label>W/O Number</label>
                <input
                  value={editRecord.woNumber ?? ""}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, woNumber: e.target.value })
                  }
                />

                <label>Supervisor Name</label>
                <input
                  value={editRecord.supervisorName ?? ""}
                  onChange={(e) =>
                    setEditRecord({
                      ...editRecord,
                      supervisorName: e.target.value,
                    })
                  }
                />

                <label>TSL Name</label>
                <input
                  value={editRecord.tslName ?? ""}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, tslName: e.target.value })
                  }
                />

                <label>Location / Site</label>
                <input
                  value={editRecord.location ?? ""}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, location: e.target.value })
                  }
                />
              </div>

              <div style={{ marginTop: 12 }}>
                <label style={{ fontWeight: 600 }}>Items</label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    marginTop: 8,
                  }}
                >
                  {editRecord.items.map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: 8,
                        borderRadius: 6,
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          {it.itemName}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          {it.unit}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 12 }}>Qty</label>
                        <input
                          type="number"
                          value={it.quantity ?? 0}
                          onChange={(e) =>
                            updateEditItem(idx, "quantity", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 12 }}>Unit Weight</label>
                        <input
                          type="number"
                          value={String(it.unitWeight ?? "")}
                          readOnly
                          style={{
                            background: "#f3f4f6",
                            cursor: "not-allowed",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 12 }}>Return Qty</label>
                        <input
                          type="number"
                          value={String(it.returnQuantity ?? it.quantity ?? 0)}
                          onChange={(e) =>
                            updateEditItem(
                              idx,
                              "returnQuantity",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 12 }}>Return Weight</label>
                        <input
                          type="number"
                          value={String(it.returnWeight ?? "")}
                          readOnly
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                <button onClick={updateIssue} className="ppe-btn-save">
                  Save
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
