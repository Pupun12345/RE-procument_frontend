import { MdDelete, MdEdit } from "react-icons/md";
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./scaffoldingISsue.css";
import { useAuthStore } from "../../store/authStore";

// ====================== TYPES ======================
interface Item {
  itemName: string;
  unit: string;
  puw: number;
}
interface ReturnRecord {
  _id: string;
  personName: string;
  returnDate: string;
  location?: string;
  woNumber?: string;
  supervisorName?: string;
  tslName?: string;
  issueId?: { _id: string; issuedTo: string; issueDate: string } | string;
  items: {
    itemName: string;
    unit: string;
    quantity: number;
    unitWeight?: number;
    returnWeight?: number;
    returnedWeight?: number;
  }[];
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
    itemName: string;
    unit: string;
    unitWeight: string;
    issuedQuantity: string;
    issuedWeight: string;
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
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState("");

  useEffect(() => {
    api.get("/issue/scaffolding").then((res) => {
      setIssues(res.data);
    });
  }, []);

  // 🔥 ADD THIS useEffect HERE
  useEffect(() => {
    if (!selectedIssueId) return;

    const issue = issues.find((i) => i._id === selectedIssueId);
    if (!issue) return;

    setMaterials(
      issue.items.map((it: any) => ({
        itemName: it.itemName,
        unit: it.unit,
        unitWeight: String(it.unitWeight ?? ""),
        issuedQuantity: String(it.issuedQuantity ?? it.qty ?? ""),
        issuedWeight: String(it.issuedWeight ?? ""),
        returnQuantity: "",
        returnWeight: "",
      })),
    );
  }, [selectedIssueId, issues]); // include issues as dependency

  const [materials, setMaterials] = useState<MaterialRow[]>([
    {
      itemName: "",
      unit: "",
      unitWeight: "",
      issuedQuantity: "",
      issuedWeight: "",
      returnQuantity: "",
      returnWeight: "",
    },
  ]);

  type ToastFn = {
    success: (msg: string) => void;
    error: (msg: string) => void;
  };

  const showToast = (type: "success" | "error", msg: string) => {
    const w = window as unknown as { toast?: ToastFn };

    if (w.toast) {
      w.toast[type](msg);
    } else if (type === "error") {
      alert(msg);
    }
  };

  const { role } = useAuthStore();
  const isAdmin = role === "admin";

  const addMaterial = () => {
    setMaterials([
      ...materials,
      {
        itemName: "",
        unit: "",
        unitWeight: "",
        issuedQuantity: "",
        issuedWeight: "",
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

  const updateMaterial = <K extends keyof MaterialRow>(
    index: number,
    key: K,
    value: MaterialRow[K],
  ) => {
    const updated = [...materials];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };

    if (key === "returnQuantity") {
      const uw = Number(updated[index].unitWeight || 0);
      const rq = Number(value || 0);
      updated[index].returnWeight = String(uw * rq);
    }

    setMaterials(updated);
  };

  const handleBack = () => {
    navigate(-1);
  };
  const [activeTab, setActiveTab] = useState<"entry" | "report">("entry");
  const [items, setItems] = useState<Item[]>([]);
  const [records, setRecords] = useState<ReturnRecord[]>([]);
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
    items: {
      itemName: string;
      unit: string;
      quantity: number;
      unitWeight?: number | string;
      returnQuantity?: number | string;
      returnWeight?: number | string;
    }[];
  }

  // Material edit modal state
  interface MaterialEditState {
    index: number;
    itemName: string;
    unit: string;
    unitWeight: string;
    returnQuantity: string;
    returnWeight: string;
  }

  const [editRecord, setEditRecord] = useState<EditableIssueRecord | null>(
    null,
  );
  const [editMaterialState, setEditMaterialState] =
    useState<MaterialEditState | null>(null);

  // Open material edit modal from the add materials table
  const openMaterialEdit = (index: number) => {
    const material = materials[index];
    setEditMaterialState({
      index,
      itemName: material.itemName,
      unit: material.unit,
      unitWeight: material.unitWeight,
      returnQuantity: material.returnQuantity,
      returnWeight: material.returnWeight,
    });
  };

  // Save edited material
  const saveMaterialEdit = () => {
    if (!editMaterialState) return;

    const updatedMaterials = [...materials];
    updatedMaterials[editMaterialState.index] = {
      itemName: editMaterialState.itemName,
      unit: editMaterialState.unit,
      unitWeight: editMaterialState.unitWeight,
      returnQuantity: editMaterialState.returnQuantity,
      returnWeight: editMaterialState.returnWeight,
    };
    setMaterials(updatedMaterials);
    setEditMaterialState(null);
    showToast("success", "Material updated successfully");
  };
  const handleDelete = async (_id: string) => {
    const confirmed = window.confirm(
      "Are you sure?\nThis will rollback stock and return data.",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/returns/scaffolding/${_id}`);

      // refresh records
      const res = await api.get("/returns/scaffolding");
      setRecords(res.data);

      showToast("success", "Return deleted successfully");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to delete return");
    }
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
        field === "unitWeight" ? value : updatedForm.unitWeight || "0",
      );
      const returnQuantityNum = parseFloat(
        field === "returnQuantity" ? value : updatedForm.returnQuantity || "0",
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
      items: mapped,
    });
  };

  const updateEditItem = (
    index: number,
    key: "quantity" | "unitWeight" | "returnQuantity",
    value: string,
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
        itemsCopy[index].returnQuantity ?? itemsCopy[index].quantity ?? "0",
      ),
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
        items: itemsPayload,
      };

      await api.put(`/returns/scaffolding/${editRecord._id}`, payload);
      showToast("success", "Updated successfully");
      setEditRecord(null);
      const res = await api.get("/returns/scaffolding");
      setRecords(res.data);
    } catch {
      showToast("error", "Failed to update record");
    }
  };

  const reportRows = records.map((r) => ({
    _id: r._id,
    issueDate: r.returnDate,
    returnedBy: r.personName,
    tslName: r.tslName,
    location: r.location,
    woNumber: r.woNumber,
    supervisorName: r.supervisorName,
    itemsText: r.items.map((i) => `${i.itemName} (${i.quantity})`).join(", "),
    totalQty: r.items.reduce((sum, i) => sum + i.quantity, 0),
  }));

  const filteredRecords = reportRows.filter((r) => {
    const searchText = (filters.search || "").toLowerCase();

    const originalRecord = records.find((rec) => rec._id === r._id);
    const itemMatch = originalRecord
      ? originalRecord.items.some((i) => i.itemName.toLowerCase().includes(searchText))
      : false;
    const tslManagerMatch = (r.returnedBy || "").toLowerCase().includes(searchText);
    const woNumberMatch = (r.woNumber || "").toLowerCase().includes(searchText);
    const supervisorMatch = (r.supervisorName || "").toLowerCase().includes(searchText);
    const searchMatch = !searchText || itemMatch || tslManagerMatch || woNumberMatch || supervisorMatch;

    let dateMatch = true;
    if (filters.to) {
      const recordDate = new Date(r.issueDate).toISOString().split("T")[0];
      dateMatch = recordDate === filters.to;
    }

    return searchMatch && dateMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  const exportPDF = (): void => {
    const doc = new jsPDF("l", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const addHeader = () => {
      doc.addImage("/ray-log.png", "PNG", 15, 10, 18, 18);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("RAY ENGINEERING", 50, 15);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Contact No: 9337670266", 50, 22);
      doc.text("E-Mail: accounts@rayengineering.co", 50, 28);
      doc.setLineWidth(0.5);
      doc.line(10, 40, pageWidth - 10, 40);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("SCAFFOLDING RETURN REPORT", pageWidth / 2, 55, { align: "center" });
    };
    const addFooter = (pageNum: number, totalPages: number) => {
      const footerY = pageHeight - 50;
      doc.line(10, footerY, pageWidth - 10, footerY);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Registrations:\nGSTIN: 21AIJHPR1040H1ZO\nUDYAM: DO-12-0001261\nState: Odisha (Code: 21)", 10, footerY + 5);
      doc.text("Registered Address:\nAt- Gandakipur, Po- Gopiakuda,\nPs- Kujanga, Dist- Jagatsinghpur", 90, footerY + 5);
      doc.text(`Contact & Web:\nMD Email: md@rayengineering.co\nWebsite: rayengineering.co\nPage ${pageNum} / ${totalPages}`, 190, footerY + 5);
    };

    const pdfRecords = filteredRecords
      .map((fr) => records.find((r) => r._id === fr._id))
      .filter(Boolean) as ReturnRecord[];

    // Group by supervisorName
    const grouped: Record<string, ReturnRecord[]> = {};
    pdfRecords.forEach((r) => {
      const key = r.supervisorName || "Unknown";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });

    const tableBody: any[] = [];

    Object.entries(grouped).forEach(([supervisor, recs]) => {
      let itemNum = 1;
      let totalWeight = 0;

      // Pre-compute total return weight per date within this supervisor's records
      const dateTotals: Record<string, number> = {};
      recs.forEach((r) => {
        const dateKey = new Date(r.returnDate).toLocaleDateString("en-IN");
        r.items.forEach((item: any) => {
          dateTotals[dateKey] = (dateTotals[dateKey] || 0) + (Number(item.returnWeight) || 0);
        });
      });
      const dateTotalShown = new Set<string>();

      recs.forEach((r) => {
        const dateKey = new Date(r.returnDate).toLocaleDateString("en-IN");
        r.items.forEach((item: any, index: number) => {
          const w = Number(item.returnWeight) || 0;
          totalWeight += w;

          const showDateTotal = !dateTotalShown.has(dateKey);
          if (showDateTotal) dateTotalShown.add(dateKey);

          tableBody.push([
            supervisor,
            `${itemNum++}. ${item.itemName}`,
            item.unit,
            item.quantity,
            w > 0 ? w.toFixed(2) : "-",
            index === 0
              ? { content: new Date(r.returnDate).toLocaleDateString("en-IN"), rowSpan: r.items.length, styles: { valign: "middle" } }
              : "",
            index === 0
              ? { content: r.personName, rowSpan: r.items.length, styles: { valign: "middle" } }
              : "",
            index === 0
              ? { content: r.location || "-", rowSpan: r.items.length, styles: { valign: "middle" } }
              : "",
            index === 0
              ? { content: r.woNumber || "-", rowSpan: r.items.length, styles: { valign: "middle" } }
              : "",
            showDateTotal
              ? { content: `${dateTotals[dateKey].toFixed(2)} kg`, styles: { fontStyle: "bold", halign: "center", fillColor: [240, 249, 255] } }
              : "",
          ]);
        });
      });
      // subtotal row per supervisor
      tableBody.push([
        { content: `Total — ${supervisor}`, colSpan: 9, styles: { halign: "right", fontStyle: "bold", fillColor: [234, 244, 255] } },
        { content: `${totalWeight.toFixed(2)} kg`, styles: { fontStyle: "bold", fillColor: [234, 244, 255], halign: "center" } },
      ]);
    });

    let tempTotalPages = 1;
    autoTable(doc, {
      startY: 65,
      margin: { top: 70, bottom: 65 },
      head: [["Supervisor", "Item", "Unit", "Qty", "Return Weight (kg)", "Date", "TSL Manager", "Location", "W/O No.", "Total Returned Weight"]],
      body: tableBody,
      styles: { fontSize: 7, halign: "center", valign: "middle", cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: "#fff", fontStyle: "bold" },
      columnStyles: { 1: { halign: "left" }, 0: { halign: "left" } },
      theme: "grid",
      didParseCell: (data: any) => {
        if (data.section === "body" && data.column.index === 0) {
          const prevRow = data.row.index > 0 ? tableBody[data.row.index - 1] : null;
          if (prevRow && prevRow[0] === tableBody[data.row.index][0]) {
            data.cell.text = [""];
          }
        }
      },
      didDrawPage: (data) => {
        addHeader();
        addFooter(data.pageNumber, tempTotalPages);
      },
    });

    // Remove separate summary box — totals are now inline in the table
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      addHeader();
      addFooter(p, totalPages);
    }
    doc.save("Scaffolding_Return_Report.pdf");
  };

  const exportCSV = (): void => {
    const headers = ["Supervisor", "#", "Item", "Unit", "Qty", "Return Weight (kg)", "Date", "TSL Manager", "Location", "W/O Number"];

    const csvRecords = filteredRecords
      .map((fr) => records.find((r) => r._id === fr._id))
      .filter(Boolean) as ReturnRecord[];

    const grouped: Record<string, ReturnRecord[]> = {};
    csvRecords.forEach((r) => {
      const key = r.supervisorName || "Unknown";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });

    const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;

    const rows: string[] = [headers.map(escape).join(",")];
    let itemNum = 1;
    Object.entries(grouped).forEach(([supervisor, recs]) => {
      let supervisorTotal = 0;
      recs.forEach((r) => {
        r.items.forEach((item: any) => {
          const w = Number(item.returnWeight) || 0;
          supervisorTotal += w;
          rows.push([
            escape(supervisor),
            escape(itemNum++),
            escape(item.itemName),
            escape(item.unit),
            escape(item.quantity),
            escape(w > 0 ? w.toFixed(2) : "-"),
            escape(new Date(r.returnDate).toLocaleDateString("en-IN")),
            escape(r.personName),
            escape(r.location || ""),
            escape(r.woNumber || ""),
          ].join(","));
        });
      });
      rows.push([
        escape(`Total — ${supervisor}`), "", "", "", "", "", "", "", "",
        escape(`${supervisorTotal.toFixed(2)} kg`),
      ].join(","));
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Scaffolding_Return_Report.csv";
    link.click();
    URL.revokeObjectURL(url);
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
                    placeholder="Returned by TSL Manager *"
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
                <div className="ppe-form-group">
                  <select
                    className="ppe-input"
                    value={selectedIssueId}
                    onChange={(e) => setSelectedIssueId(e.target.value)}
                  >
                    <option value="">Select Issue *</option>
                    {issues.map((issue) => (
                      <option key={issue._id} value={issue._id}>
                        {issue.issuedTo} —{" "}
                        {new Date(issue.issueDate).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
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
                      gridTemplateColumns: "48px 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
                      alignItems: "center",
                    }}
                  >
                    <span>#</span>
                    <span>Item Name</span>
                    <span>Unit</span>
                    <span>Unit Weight</span>
                    <span>Issued Qty</span>
                    <span>Issued Weight</span>
                    <span>Return Quantity</span>
                    <span>Return Weight</span>
                    <span>Action</span>
                  </div>
                  {materials.map((row, index) => (
                    <div
                      className="ppe-table-row"
                      key={index}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "48px 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
                        alignItems: "center",
                      }}
                    >
                      <span>{index + 1}</span>
                      <select
                        className="ppe-input"
                        value={row.itemName}
                        onChange={(e) => {
                          const selected = items.find(
                            (i) => i.itemName === e.target.value,
                          );

                          updateMaterial(index, "itemName", e.target.value);
                          updateMaterial(index, "unit", selected?.unit || "");
                          updateMaterial(
                            index,
                            "unitWeight",
                            String(selected?.puw || ""),
                          );
                        }}
                        style={{
                          width: "100%",
                          height: "38px",
                          padding: "6px 12px",
                          borderRadius: "10px",
                          boxSizing: "border-box",
                          border: "1px solid #e5e7eb",
                          backgroundColor: "#fff",
                          fontSize: "14px",
                          outline: "none",
                          appearance: "none",
                          WebkitAppearance: "none",
                          MozAppearance: "none",
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
                        value={row.issuedQuantity}
                        readOnly
                        placeholder="Issued Qty"
                        style={{ background: "#f3f4f6", cursor: "not-allowed" }}
                      />

                      <input
                        className="ppe-input"
                        value={row.issuedWeight ? Number(row.issuedWeight).toFixed(2) : ""}
                        readOnly
                        placeholder="Issued Weight"
                        style={{ background: "#f3f4f6", cursor: "not-allowed" }}
                      />

                      <input
                        className="ppe-input"
                        value={row.returnQuantity}
                        onChange={(e) =>
                          updateMaterial(
                            index,
                            "returnQuantity",
                            e.target.value,
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
                            color: "#fff",
                            width: 50,
                            height: 32,
                            padding: 0,
                            minWidth: 50,
                            cursor: "pointer",
                          }}
                          onClick={() => openMaterialEdit(index)}
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
                    if (!selectedIssueId) {
                      showToast("error", "Please select an issue");
                      return;
                    }

                    // 2️⃣ Build payload ONCE
                    const payload = {
                      issueId: selectedIssueId,
                      woNumber: form.woNumber,
                      location: form.location,
                      personName: form.personName,
                      supervisorName: form.supervisorName,
                      returnDate: form.issueDate,

                      items: materials
                        .filter((m) => Number(m.returnQuantity) > 0)
                        .map((m) => ({
                          itemName: m.itemName,
                          unit: m.unit,
                          quantity: Number(m.returnQuantity),
                        })),
                    };

                    if (payload.items.length === 0) {
                      showToast(
                        "error",
                        "Enter return quantity for at least one item",
                      );
                      return;
                    }

                    if (payload.items.some((m: any) => m.quantity < 1)) {
                      showToast("error", "Return quantity must be at least 1 for all items");
                      return;
                    }

                    try {
                      // 3️⃣ POST ONCE
                      console.log("RETURN PAYLOAD", payload);
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
                          issuedQuantity: "",
                          issuedWeight: "",
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
                      });

                      showToast("success", "Materials issued successfully");
                      setActiveTab("report");
                    } catch (err: any) {
                      console.error("RETURN ERROR:", err?.response?.data);
                      showToast("error", err?.response?.data?.message || "Failed to return materials");
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
                  placeholder="Search TSL Manager / Item / W/O Number / Supervisor"
                  value={filters.search}
                  onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setCurrentPage(1); }}
                />
              </div>
              <input
                className="ppe-date-filter"
                type="date"
                value={filters.to}
                onChange={(e) => { setFilters({ ...filters, to: e.target.value }); setCurrentPage(1); }}
                style={{ width: "150px" }}
              />
              <button onClick={exportPDF} className="ppe-export-btn ppe-export-pdf">Export PDF</button>
              <button onClick={exportCSV} className="ppe-export-btn ppe-export-csv">Export CSV</button>
            </div>
            <div
              className="ppe-table-container"
              style={{ margin: "0 auto", maxWidth: 1400, overflowX: "auto" }}
            >
              <table
                className="ppe-table"
                style={{
                  width: "100%",
                  minWidth: "1400px",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ color: "black" }}>#</th>
                    <th style={{ color: "black" }}>Date</th>
                    <th style={{ color: "black" }}>TSL Manager</th>
                    <th style={{ color: "black" }}>Supervisor</th>
                    <th style={{ color: "black" }}>W/O No.</th>
                    <th style={{ color: "black" }}>Location</th>
                    <th style={{ color: "black", minWidth: "500px" }}>
                      Items
                    </th>
                    {isAdmin && <th style={{ color: "black" }}>Edit</th>}
                  </tr>
                </thead>

                <tbody>
                  {paginatedRecords.map((r) => {
                    const orig = records.find((rec) => rec._id === r._id);

                    return (
                      <tr key={r._id}>
                        <td>{filteredRecords.indexOf(r) + 1}</td>

                        <td>
                          {new Date(r.issueDate).toLocaleDateString("en-IN")}
                        </td>

                        <td>{r.returnedBy}</td>

                        <td>{r.supervisorName || "-"}</td>

                        <td>{r.woNumber || "-"}</td>

                        <td>{r.location || "-"}</td>

                        <td
                          style={{
                            minWidth: "500px",
                            textAlign: "left",
                            verticalAlign: "top",
                          }}
                        >
                          {orig?.items.map((i: any, n: number) => (
                            <div
                              key={n}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "12px",
                                padding: "12px 0",
                                borderBottom:
                                  n !== orig.items.length - 1
                                    ? "1px solid #e5e7eb"
                                    : "none",
                              }}
                            >
                              <span
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  borderRadius: "50%",
                                  backgroundColor: "#2563eb",
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 600,
                                  flexShrink: 0,
                                }}
                              >
                                {n + 1}
                              </span>

                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "8px",
                                  flex: 1,
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 600,
                                    lineHeight: "1.5",
                                  }}
                                >
                                  {i.itemName}
                                </span>

                                <div
                                  style={{
                                    display: "flex",
                                    gap: "10px",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <span
                                    style={{
                                      backgroundColor: "#f3f4f6",
                                      color: "#6b7280",
                                      padding: "4px 10px",
                                      borderRadius: "999px",
                                      fontSize: "12px",
                                    }}
                                  >
                                    {i.quantity} {i.unit}
                                  </span>

                                  <span
                                    style={{
                                      backgroundColor: "#dbeafe",
                                      color: "#1d4ed8",
                                      padding: "4px 10px",
                                      borderRadius: "999px",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {Number(i.returnWeight || 0).toFixed(2)} kg
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </td>

                        {isAdmin && (
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                              <button
                                className="report-edit-btn"
                                onClick={() => {
                                  const orig = records.find((rec) => rec._id === r._id);
                                  if (orig) openEdit(orig);
                                }}
                              >
                                <MdEdit />
                              </button>
                              <button
                                className="ppe-delete-btn"
                                style={{
                                  fontSize: 16,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#fff",
                                  background: "#ef4444",
                                  border: "1px solid #ef4444",
                                  borderRadius: 4,
                                  padding: "4px 8px",
                                  cursor: "pointer",
                                }}
                                onClick={() => handleDelete(r._id)}
                              >
                                <MdDelete />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
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

                <label>Returned by TSL Manager</label>
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
                          // onChange={(e) =>
                          //   updateEditItem(idx, "quantity", e.target.value)
                          // }
                          readOnly
                          style={{
                            background: "#f3f4f6",
                            cursor: "not-allowed",
                          }}
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
                          readOnly
                          style={{
                            background: "#f3f4f6",
                            cursor: "not-allowed",
                          }}
                        // onChange={(e) =>
                        //   updateEditItem(
                        //     idx,
                        //     "returnQuantity",
                        //     e.target.value,
                        //   )
                        // }
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

        {/* MATERIAL EDIT MODAL - For editing materials in the add table */}
        {editMaterialState && (
          <div
            className="ppe-modal-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              className="ppe-modal"
              style={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                padding: "24px",
                maxWidth: "600px",
                width: "90%",
                maxHeight: "90vh",
                overflow: "auto",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 style={{ marginBottom: "20px", color: "#333" }}>
                EDIT MATERIAL
              </h3>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Item Name
                </label>
                <input
                  className="ppe-input"
                  type="text"
                  value={editMaterialState.itemName}
                  onChange={(e) =>
                    setEditMaterialState({
                      ...editMaterialState,
                      itemName: e.target.value,
                    })
                  }
                  placeholder="Item Name"
                  style={{ width: "100%" }}
                  readOnly
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Unit
                </label>
                <input
                  className="ppe-input"
                  type="text"
                  value={editMaterialState.unit}
                  onChange={(e) =>
                    setEditMaterialState({
                      ...editMaterialState,
                      unit: e.target.value,
                    })
                  }
                  placeholder="Unit"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Unit Weight
                </label>
                <input
                  className="ppe-input"
                  type="number"
                  min="0"
                  value={editMaterialState.unitWeight}
                  onChange={(e) =>
                    setEditMaterialState({
                      ...editMaterialState,
                      unitWeight: e.target.value,
                    })
                  }
                  placeholder="Unit Weight"
                  style={{ width: "100%" }}
                  readOnly
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Return Quantity
                </label>
                <input
                  className="ppe-input"
                  type="number"
                  min="0"
                  value={editMaterialState.returnQuantity}
                  onChange={(e) => {
                    const unitWeightNum = parseFloat(
                      editMaterialState.unitWeight || "0",
                    );
                    const returnQuantityNum = parseFloat(e.target.value || "0");
                    const returnWeight =
                      !isNaN(unitWeightNum) && !isNaN(returnQuantityNum)
                        ? (unitWeightNum * returnQuantityNum).toString()
                        : "";
                    setEditMaterialState({
                      ...editMaterialState,
                      returnQuantity: e.target.value,
                      returnWeight,
                    });
                  }}
                  placeholder="Return Quantity"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Return Weight
                </label>
                <input
                  className="ppe-input"
                  type="number"
                  value={editMaterialState.returnWeight}
                  placeholder="Return Weight (calculated)"
                  style={{ width: "100%" }}
                  readOnly
                />
              </div>

              <div
                className="ppe-buttons"
                style={{ marginTop: "24px", display: "flex", gap: "12px" }}
              >
                <button
                  onClick={saveMaterialEdit}
                  className="ppe-btn-save"
                  style={{ flex: 1 }}
                >
                  💾 Save
                </button>
                <button
                  onClick={() => setEditMaterialState(null)}
                  className="ppe-btn-back"
                  style={{ flex: 1 }}
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
