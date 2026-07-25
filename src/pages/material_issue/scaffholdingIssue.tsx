import { MdDelete, MdEdit } from "react-icons/md";
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./scaffoldingISsue.css";
import "./PPEDistribution.css";
import { useAuthStore } from "../../store/authStore";

// ====================== TYPES ======================
interface Item {
  itemName: string;
  unit: string;
  puw: number;
}

interface IssueRecord {
  _id: string;
  issuedTo: string;
  issueDate: string;
  location?: string;
  woNumber?: string;
  supervisorName?: string;
  items: {
    itemName: string;
    unit: string;
    qty: number;
    unitWeight: number;
    issuedQuantity?: number; // ✅ ADD
    issuedWeight: number;
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
  issuedWeight?: string;
  issuedQuantity?: string;
  woNumber?: string;
  supervisorName?: string;
}

interface FilterState {
  search: string;
  from: string;
  to: string;
}

interface EditableIssue {
  _id: string;
  qty: number;
  issuedTo: string;
  issueDate: string;
  location?: string;
  woNumber?: string;
  supervisorName?: string;
  unitWeight?: number | string;
  issuedQuantity?: number | string;
  issuedWeight?: number | string;
  items: {
    itemName: string;
    unit: string;
    qty: number;
    unitWeight?: number | string;
    issuedQuantity?: number | string;
    issuedWeight?: number | string;
  }[];
}

// Material edit modal state
interface MaterialEditState {
  index: number;
  itemName: string;
  unit: string;
  unitWeight: string;
  issuedQuantity: string;
  issuedWeight: string;
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
      qty: 0,
      itemName: "",
      unit: "",
      unitWeight: "",
      issuedQuantity: "",
      issuedWeight: "",
    },
  ]);
  type ToastType = {
    success: (msg: string) => void;
    error: (msg: string) => void;
  };

  const showToast = (type: "success" | "error", msg: string) => {
    const toast = (window as unknown as { toast?: ToastType }).toast;

    if (toast) {
      toast[type](msg);
    } else if (type === "error") {
      alert(msg);
    }
  };

  const addMaterial = () => {
    setMaterials((prev) => [
      ...prev,
      {
        qty: 0,
        itemName: "",
        unit: "",
        unitWeight: "",
        issuedQuantity: "",
        issuedWeight: "",
      },
    ]);
  };

  const removeMaterial = (index: number) => {
    if (materials.length === 1) {
      showToast("error", "At least one material is required");
      return;
    }
    setMaterials(materials.filter((_, i) => i !== index));
    showToast("success", "Material removed");
  };
  const { role } = useAuthStore();
  const isAdmin = role === "admin";

  const updateMaterial = <K extends keyof MaterialRow>(
    index: number,
    key: K,
    value: MaterialRow[K],
  ) => {
    setMaterials((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };

      if (key === "unitWeight" || key === "issuedQuantity") {
        const uw = Number(updated[index].unitWeight || 0);
        const iq = Number(updated[index].issuedQuantity || 0);
        updated[index].issuedWeight = !isNaN(uw * iq) ? String(uw * iq) : "";
      }

      return updated;
    });
  };

  const handleBack = () => {
    navigate(-1);
  };
  const [activeTab, setActiveTab] = useState<"entry" | "report">("entry");
  const [items, setItems] = useState<Item[]>([]);
  const [records, setRecords] = useState<IssueRecord[]>([]);
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
  });

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    from: "",
    to: "",
  });

  const [editRecord, setEditRecord] = useState<EditableIssue | null>(null);
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
      issuedQuantity: material.issuedQuantity,
      issuedWeight: material.issuedWeight,
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
      issuedQuantity: editMaterialState.issuedQuantity,
      issuedWeight: editMaterialState.issuedWeight,
      qty: 0,
    };
    setMaterials(updatedMaterials);
    setEditMaterialState(null);
    showToast("success", "Material updated successfully");
  };

  const openEdit = (id: string) => {
    const record = records.find((r) => r._id === id);
    if (!record) return;

    const mapped = record.items.map((it) => ({
      itemName: it.itemName,
      unit: it.unit,
      qty: it.qty,
      unitWeight: it.unitWeight ?? "",
      issuedQuantity: it.issuedQuantity ?? it.qty,
      issuedWeight: it.issuedWeight ?? "",
    }));

    setEditRecord({
      _id: record._id,
      qty: mapped[0]?.qty ?? 0,
      issuedTo: record.issuedTo,
      issueDate: record.issueDate,
      location: record.location,
      woNumber: record.woNumber,
      supervisorName: record.supervisorName,
      items: mapped,
    });
  };

  const updateEditItem = (
    index: number,
    key: "qty" | "unitWeight" | "issuedQuantity",
    value: string,
  ) => {
    if (!editRecord) return;
    const updated = { ...editRecord } as EditableIssue;
    const itemsCopy = updated.items.map((it) => ({ ...it }));
    if (key === "qty") {
      itemsCopy[index].qty = Number(value) || 0;
      if (!itemsCopy[index].issuedQuantity)
        itemsCopy[index].issuedQuantity = itemsCopy[index].qty;
    } else if (key === "unitWeight") {
      itemsCopy[index].unitWeight = value;
    } else if (key === "issuedQuantity") {
      itemsCopy[index].issuedQuantity = value;
    }

    const uw = parseFloat(String(itemsCopy[index].unitWeight || "0"));
    const iq = parseFloat(
      String(itemsCopy[index].issuedQuantity ?? itemsCopy[index].qty ?? "0"),
    );
    if (!isNaN(uw) && !isNaN(iq)) {
      itemsCopy[index].issuedWeight = uw * iq;
    }

    updated.items = itemsCopy;
    updated.qty = itemsCopy.length > 0 ? itemsCopy[0].qty : 0;
    setEditRecord(updated);
  };

  const updateIssue = async () => {
    if (!editRecord) return;
    try {
      const itemsPayload = editRecord.items.map((it) => ({
        itemName: it.itemName,
        unit: it.unit,
        qty: Number(it.qty) || 0,
        unitWeight: Number(it.unitWeight) || 0,
        issuedQuantity: Number(it.issuedQuantity) || Number(it.qty) || 0,
        issuedWeight: Number(it.issuedWeight) || 0,
      }));

      const payload = {
        issuedTo: editRecord.issuedTo,
        issueDate: editRecord.issueDate,
        location: editRecord.location,
        woNumber: editRecord.woNumber,
        supervisorName: editRecord.supervisorName,
        items: itemsPayload,
      };

      await api.put(`/issue/scaffolding/${editRecord._id}`, payload);
      // refresh list
      const res = await api.get("/issue/scaffolding");
      setRecords(res.data);
      setEditRecord(null);
      showToast("success", "Updated successfully");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update issue");
    }
  };
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
        field === "unitWeight" ? value : updatedForm.unitWeight || "0",
      );
      const issuedQuantityNum = parseFloat(
        field === "issuedQuantity" ? value : updatedForm.issuedQuantity || "0",
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
  const reportRows = records.map((issue) => ({
    _id: issue._id,
    issueDate: issue.issueDate,
    issuedTo: issue.issuedTo,
    location: issue.location,
    woNumber: issue.woNumber,
    supervisorName: issue.supervisorName,

    itemsText: issue.items
      .map(
        (i) =>
          `${i.itemName} – ${i.qty} × ${i.unitWeight} kg = ${i.issuedWeight} kg`,
      )
      .join("\n"),

    totalQty: issue.items.reduce((sum, i) => sum + i.qty, 0),
  }));

  const filteredRecords = reportRows.filter((r) => {
    const searchText = filters.search.toLowerCase().trim();

    const originalRecord = records.find((rec) => rec._id === r._id);
    const itemMatch = originalRecord
      ? originalRecord.items.some((i) => i.itemName.toLowerCase().includes(searchText))
      : false;
    const tslManagerMatch = r.issuedTo.toLowerCase().includes(searchText);
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
      doc.text("SCAFFOLDING ISSUE REPORT", pageWidth / 2, 55, { align: "center" });
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
      .filter(Boolean) as IssueRecord[];

    // Group by supervisorName
    const grouped: Record<string, IssueRecord[]> = {};
    pdfRecords.forEach((r) => {
      const key = r.supervisorName || "Unknown";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });

    const tableBody: any[] = [];
    const supervisorTotals: { name: string; totalIssuedWeight: number }[] = [];

    Object.entries(grouped).forEach(([supervisor, recs]) => {
      let itemNum = 1;
      let totalWeight = 0;

      // Pre-compute total weight per date within this supervisor's records
      const dateTotals: Record<string, number> = {};
      recs.forEach((r) => {
        const dateKey = new Date(r.issueDate).toLocaleDateString("en-IN");
        r.items.forEach((item: any) => {
          dateTotals[dateKey] = (dateTotals[dateKey] || 0) + (Number(item.issuedWeight) || 0);
        });
      });
      const dateTotalShown = new Set<string>();

      recs.forEach((r) => {
        const dateKey = new Date(r.issueDate).toLocaleDateString("en-IN");
        r.items.forEach((item: any, index: number) => {
          const w = Number(item.issuedWeight) || 0;
          totalWeight += w;

          const showDateTotal = !dateTotalShown.has(dateKey);
          if (showDateTotal) dateTotalShown.add(dateKey);

          tableBody.push([
            supervisor,
            `${itemNum++}. ${item.itemName}`,
            item.unit,
            item.qty,
            w > 0 ? w.toFixed(2) : "-",
            index === 0
              ? { content: new Date(r.issueDate).toLocaleDateString("en-IN"), rowSpan: r.items.length, styles: { valign: "middle" } }
              : "",
            index === 0
              ? { content: r.issuedTo, rowSpan: r.items.length, styles: { valign: "middle" } }
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
      supervisorTotals.push({ name: supervisor, totalIssuedWeight: totalWeight });
    });

    let tempTotalPages = 1;
    autoTable(doc, {
      startY: 65,
      margin: { top: 70, bottom: 65 },
      head: [["Supervisor", "Item", "Unit", "Qty", "Issued Weight (kg)", "Date", "TSL Manager", "Location", "W/O No.", "Total Issued Weight"]],
      body: tableBody,
      styles: {
        fontSize: 7,
        halign: "center",
        valign: "middle",
        cellPadding: 2,
      },
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
    doc.save("Scaffolding_Issue_Report.pdf");
  };


  const exportCSV = (): void => {
    const headers = ["Supervisor", "#", "Item", "Unit", "Qty", "Issued Weight (kg)", "Date", "TSL Manager", "Location", "W/O Number"];

    const csvRecords = filteredRecords
      .map((fr) => records.find((r) => r._id === fr._id))
      .filter(Boolean) as IssueRecord[];

    const grouped: Record<string, IssueRecord[]> = {};
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
          const w = Number(item.issuedWeight) || 0;
          supervisorTotal += w;
          rows.push([
            escape(supervisor),
            escape(itemNum++),
            escape(item.itemName),
            escape(item.unit),
            escape(item.qty),
            escape(w > 0 ? w.toFixed(2) : "-"),
            escape(new Date(r.issueDate).toLocaleDateString("en-IN")),
            escape(r.issuedTo),
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
    link.download = "Scaffolding_Issue_Report.csv";
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
                    placeholder="Issue to TSL Manager *"
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
                          width: "95%",
                          height: "38px",
                          minHeight: "38px",
                          padding: "4px 10px",
                          borderRadius: "10px",
                          boxSizing: "border-box",
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
                        onChange={(e) =>
                          updateMaterial(
                            index,
                            "issuedQuantity",
                            e.target.value,
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
                            background: "#1a9f27ff",
                            border: "1px solid #888",
                            borderRadius: 4,
                            color: "#fff",
                            width: 50,
                            height: 32,
                            padding: 0,
                            minWidth: 30,
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
                    if (!form.personName || materials.length === 0) {
                      showToast("error", "Missing required fields");
                      return;
                    }

                    // 1.5️⃣ Validate issued quantity
                    const invalidQty = materials.some((m) => Number(m.issuedQuantity) < 1);
                    if (invalidQty) {
                      showToast("error", "Issued quantity must be at least 1 for all items");
                      return;
                    }

                    // 2️⃣ Build payload ONCE
                    const payload = {
                      issuedTo: form.personName,
                      issueDate: form.issueDate,
                      location: form.location,
                      woNumber: form.woNumber,
                      supervisorName: form.supervisorName,

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
                          qty: 0,
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
              style={{
                width: "100%",
                overflowX: "auto",
                overflowY: "hidden",
              }}
            >
              <table
                className="ppe-table"
                style={{
                  minWidth: "1700px",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ color: "black", minWidth: "60px" }}>#</th>

                    <th style={{ color: "black", minWidth: "120px" }}>Date</th>

                    <th style={{ color: "black", minWidth: "180px" }}>
                      TSL Manager
                    </th>

                    <th style={{ color: "black", minWidth: "180px" }}>
                      Supervisor
                    </th>

                    <th style={{ color: "black", minWidth: "140px" }}>
                      W/O No.
                    </th>

                    <th style={{ color: "black", minWidth: "180px" }}>
                      Location
                    </th>

                    <th
                      style={{
                        color: "black",
                        minWidth: "500px",
                        width: "500px",
                      }}
                    >
                      Items
                    </th>

                    <th
                      style={{
                        color: "black",
                        minWidth: "180px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Issued Weight (kg)
                    </th>

                    {isAdmin && (
                      <th style={{ color: "black", minWidth: "100px" }}>
                        Edit
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {paginatedRecords.map((r) => {
                    const orig = records.find((rec) => rec._id === r._id);

                    const totalWeight = orig
                      ? orig.items.reduce(
                        (sum, i: any) => sum + (Number(i.issuedWeight) || 0),
                        0
                      )
                      : 0;

                    return (
                      <tr key={r._id}>
                        <td>{filteredRecords.indexOf(r) + 1}</td>

                        <td>
                          {new Date(r.issueDate).toLocaleDateString("en-IN")}
                        </td>

                        <td>{r.issuedTo}</td>

                        <td>{r.supervisorName || "-"}</td>

                        <td>{r.woNumber || "-"}</td>

                        <td>{r.location || "-"}</td>

                        <td
                          style={{
                            minWidth: "350px",
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
                                padding: "10px 0",
                                borderBottom:
                                  n !== orig.items.length - 1
                                    ? "1px solid #e5e7eb"
                                    : "none",
                              }}
                            >
                              <span
                                style={{
                                  minWidth: "28px",
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  backgroundColor: "#2563eb",
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "13px",
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
                                  gap: "6px",
                                  flex: 1,
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 600,
                                    lineHeight: "1.5",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {i.itemName}
                                </span>

                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
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
                                    {i.qty} {i.unit}
                                  </span>

                                  <span
                                    style={{
                                      backgroundColor: "#e0f2fe",
                                      color: "#0369a1",
                                      padding: "4px 10px",
                                      borderRadius: "999px",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {Number(i.issuedWeight || 0).toFixed(2)} kg
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </td>

                        <td
                          style={{
                            textAlign: "center",
                            verticalAlign: "middle",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {totalWeight > 0
                            ? `${totalWeight.toFixed(2)} kg`
                            : "-"}
                        </td>

                        {isAdmin && (
                          <td style={{ textAlign: "center" }}>
                            <button
                              className="report-edit-btn"
                              onClick={() => openEdit(r._id)}
                            >
                              <MdEdit />
                            </button>
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
          <div className="ppe-modal-overlay">
            <div
              className="ppe-modal"
              style={{ maxHeight: "70vh", overflowY: "auto", padding: 16 }}
            >
              <h3>Edit Issue</h3>

              <div style={{ display: "grid", gap: 8, marginBottom: 8 }}>
                <label>Issue Date</label>
                <input
                  type="date"
                  value={editRecord.issueDate}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, issueDate: e.target.value })
                  }
                />

                <label>Issue to TSL Manager</label>
                <input
                  value={editRecord.issuedTo ?? ""}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, issuedTo: e.target.value })
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

              <div style={{ marginTop: 8 }}>
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
                          value={it.qty ?? 0}
                          readOnly
                          disabled
                          style={{ background: "#f3f4f6", cursor: "not-allowed" }}
                        // onChange={(e) =>
                        //   updateEditItem(idx, "qty", e.target.value)
                        // }
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 12 }}>Unit Weight</label>
                        <input
                          type="number"
                          value={String(it.unitWeight ?? "")}
                          readOnly
                          disabled
                          style={{ background: "#f3f4f6", cursor: "not-allowed" }}
                        // onChange={(e) =>
                        //   updateEditItem(idx, "unitWeight", e.target.value)
                        // }
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 12 }}>Issued Qty</label>
                        <input
                          type="number"
                          value={String(it.issuedQuantity ?? it.qty ?? 0)}
                          readOnly
                          disabled
                          style={{ background: "#f3f4f6", cursor: "not-allowed" }}
                        // onChange={(e) =>
                        //   updateEditItem(
                        //     idx,
                        //     "issuedQuantity",
                        //     e.target.value,
                        //   )
                        // }
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 12 }}>Issued Weight</label>
                        <input
                          type="number"
                          value={String(it.issuedWeight ?? "")}
                          readOnly
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
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
                <select
                  className="ppe-input"
                  value={editMaterialState.itemName}
                  onChange={(e) => {
                    setEditMaterialState({
                      ...editMaterialState,
                      itemName: e.target.value,
                    });
                  }}
                  style={{ width: "100%" }}
                >
                  <option value="">Select Item</option>
                  {items.map((item) => (
                    <option key={item.itemName} value={item.itemName}>
                      {item.itemName}
                    </option>
                  ))}
                </select>
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
                  onChange={(e) => {
                    const unitWeightNum = parseFloat(e.target.value || "0");
                    const issuedQuantityNum = parseFloat(
                      editMaterialState.issuedQuantity || "0",
                    );
                    const issuedWeight =
                      !isNaN(unitWeightNum) && !isNaN(issuedQuantityNum)
                        ? (unitWeightNum * issuedQuantityNum).toString()
                        : "";
                    setEditMaterialState({
                      ...editMaterialState,
                      unitWeight: e.target.value,
                      issuedWeight,
                    });
                  }}
                  placeholder="Unit Weight"
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
                  Issued Quantity
                </label>
                <input
                  className="ppe-input"
                  type="number"
                  min="0"
                  value={editMaterialState.issuedQuantity}
                  onChange={(e) => {
                    const unitWeightNum = parseFloat(
                      editMaterialState.unitWeight || "0",
                    );
                    const issuedQuantityNum = parseFloat(e.target.value || "0");
                    const issuedWeight =
                      !isNaN(unitWeightNum) && !isNaN(issuedQuantityNum)
                        ? (unitWeightNum * issuedQuantityNum).toString()
                        : "";
                    setEditMaterialState({
                      ...editMaterialState,
                      issuedQuantity: e.target.value,
                      issuedWeight,
                    });
                  }}
                  placeholder="Issued Quantity"
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
                  Issued Weight
                </label>
                <input
                  className="ppe-input"
                  type="number"
                  value={editMaterialState.issuedWeight}
                  placeholder="Issued Weight (calculated)"
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
