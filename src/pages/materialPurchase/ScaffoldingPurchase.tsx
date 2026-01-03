import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./purchase.css";
import api from "../../api/axios";

/* ================= TYPES ================= */
type Party = {
  _id: string;
  partyName: string;
};

type ItemMaster = {
  _id: string;
  itemName: string;
  unit: string;
  puw: number;
};

type Item = {
  name: string;
  qty: number | "";
  unit: string;
  puw: number;
  weight: number;
  uom: string;
  workOrderNo: string;
  rate: number | "";
};

type Purchase = {
  _id: string;
  partyName: string;
  invoiceNo: string;
  invoiceDate: string;
  items: Item[];
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  total: number;
};

/* ================= jsPDF TYPE ================= */
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}

/* ================= EMPTY ITEM ================= */
const emptyItem: Item = {
  name: "",
  qty: "",
  unit: "",
  puw: 0,
  weight: 0,
  uom: "",
  workOrderNo: "",
  rate: "",
};

const PurchaseEntryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"entry" | "report">("entry");

  /* ================= MASTER DATA ================= */
  const [parties, setParties] = useState<Party[]>([]);
  const [itemMasters, setItemMasters] = useState<ItemMaster[]>([]);

  /* ================= ENTRY STATE ================= */
  const [partyName, setPartyName] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [gstPercent, setGstPercent] = useState<number | "">("");
  const [items, setItems] = useState<Item[]>([emptyItem]);

  /* ================= REPORT STATE ================= */
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ================= FETCH BACKEND DATA ================= */
  useEffect(() => {
    const loadMasters = async () => {
      try {
        const vendorsRes = await api.get("/vendors");
        setParties(vendorsRes.data);

        const itemsRes = await api.get("/items/scaffolding");
        setItemMasters(itemsRes.data);
      } catch (err) {
        console.error("Failed to load master data", err);
        setParties([]);
        setItemMasters([]);
      }
    };

    loadMasters();
  }, []);

  useEffect(() => {
    if (activeTab === "report") {
      api
        .get("/purchases/scaffolding")
        .then((res) => setPurchases(res.data))
        .catch((err) => {
          console.error("Failed to load purchases", err);
          setPurchases([]);
        });
    }
  }, [activeTab]);

  /* ================= CALCULATIONS ================= */
  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, i) => sum + Number(i.qty || 0) * Number(i.rate || 0),
        0
      ),
    [items]
  );

  const gstAmount = useMemo(
    () => (subtotal * Number(gstPercent || 0)) / 100,
    [subtotal, gstPercent]
  );

  const total = subtotal + gstAmount;

  /* ================= ITEM HANDLERS ================= */
  const handleEditPurchase = (purchase: Purchase) => {
    setEditingId(purchase._id); // 🔑 STORE ID

    setPartyName(purchase.partyName);
    setInvoiceNo(purchase.invoiceNo);
    setInvoiceDate(purchase.invoiceDate);
    setItems(purchase.items);
    setGstPercent(purchase.gstPercent);

    setActiveTab("entry");
  };

  const updateItem = (
    index: number,
    field: keyof Item,
    value: string | number | ""
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleDeletePurchase = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this purchase?"
    );
    if (!confirm) return;

    try {
      await api.delete(`/purchases/scaffolding/${id}`);

      // Refresh list after delete
      const res = await api.get("/purchases/scaffolding");
      setPurchases(res.data);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete purchase");
    }
  };

  const handleItemSelect = (index: number, name: string) => {
    const selected = itemMasters.find((i) => i.itemName === name);
    const updated = [...items];

    const qty = Number(updated[index].qty || 0);
    const puw = selected?.puw || 0;

    updated[index] = {
      ...updated[index],
      name,
      unit: selected?.unit || "",
      puw,
      weight: qty * puw, // ✅ auto calc
    };

    setItems(updated);
  };

  const addItem = () => setItems([...items, emptyItem]);
  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  /* ================= SAVE PURCHASE ================= */
  const savePurchase = async () => {
    if (!partyName || !invoiceNo || !invoiceDate) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      partyName,
      invoiceNo,
      invoiceDate,
      items: items.map((i) => ({
        name: i.name,
        qty: Number(i.qty),
        unit: i.unit,
        puw: i.puw, // ✅
        weight: i.weight,
        uom: i.uom,
        workOrderNo: i.workOrderNo,
        rate: Number(i.rate),
        amount: Number(i.qty || 0) * Number(i.rate || 0),
      })),
      subtotal,
      gstPercent: Number(gstPercent || 0),
      gstAmount,
      total,
    };

    try {
      if (editingId) {
        // ✅ UPDATE
        await api.put(`/purchases/scaffolding/${editingId}`, payload);
      } else {
        // ✅ CREATE
        await api.post("/purchases/scaffolding", payload);
      }

      // reset form
      setEditingId(null);
      setPartyName("");
      setInvoiceNo("");
      setInvoiceDate("");
      setItems([emptyItem]);
      setGstPercent("");

      setActiveTab("report");
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save purchase");
    }
  };

  /* ================= ENTRY INVOICE PDF ================= */
  const downloadInvoicePDF = () => {
    const doc = new jsPDF();
    doc.text("PURCHASE INVOICE", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Item", "Qty", "Unit", "Rate", "Amount"]],
      body: items.map((i) => [
        i.name,
        i.qty,
        i.unit,
        i.rate,
        (Number(i.qty || 0) * Number(i.rate || 0)).toFixed(2),
      ]),
    });

    const finalY = doc.lastAutoTable?.finalY ?? 40;
    doc.text(`Total: ₹${total.toFixed(2)}`, 150, finalY + 10);

    doc.save("invoice.pdf");
  };

  /* ================= REPORT PDF (BRANDED) ================= */
  const exportPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const addHeader = () => {
      try {
        doc.addImage("/ray-log.png", "PNG", 15, 10, 18, 18);
      } catch (e) {
        // ignore missing image
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("RAY ENGINEERING", 50, 15);

      doc.setFontSize(10);
      doc.text("Contact No: 9337670266", 50, 22);
      doc.text("E-Mail: accounts@rayengineering.co", 50, 28);

      doc.setLineWidth(0.5);
      doc.line(10, 40, pageWidth - 10, 40);

      doc.setFontSize(16);
      doc.text("SCAFFOLDING PURCHASE REPORT", pageWidth / 2, 55, {
        align: "center",
      });
    };

    const addFooter = (pageNum: number, totalPages: number) => {
      const footerY = pageHeight - 50;
      doc.line(10, footerY, pageWidth - 10, footerY);
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

    let currentPage = 1;
    const tempTotalPages = 1; // Placeholder, will update later

    autoTable(doc, {
      startY: 65,
      margin: { top: 70, bottom: 65 },
      head: [["Party", "Invoice", "Date", "Items", "Total"]],
      body: purchases.map((p) => [
        p.partyName,
        p.invoiceNo,
        new Date(p.invoiceDate).toLocaleDateString("en-IN"),
        p.items.map((i) => i.name).join(", "),
        `₹${p.total.toFixed(2)}`,
      ]),
      styles: { fontSize: 9, halign: "center", cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: "#fff" },
      theme: "grid",
      didDrawPage: (data) => {
        addHeader();
        addFooter(data.pageNumber, tempTotalPages);
      },
    });

    const totalPages = doc.getNumberOfPages();
    // Update all pages with correct page numbers
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      addHeader();
      addFooter(p, totalPages);
    }

    doc.save("scaffolding_purchase_report.pdf");
  };
  const totalWeight = (items: any[]) =>
    items.reduce(
      (sum, i) =>
        sum + Number(i.weight ?? Number(i.qty || 0) * Number(i.puw || 0)),
      0
    );

  /* ================= EXPORT CSV (UNCHANGED) ================= */
  const exportCSV = () => {
    const csv = [
      ["Party", "Invoice", "Date", "Items", "Total"],
      ...purchases.map((p) => [
        p.partyName,
        p.invoiceNo,
        p.invoiceDate,
        p.items.map((i) => i.name).join("|"),
        p.total,
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "purchase_report.csv";
    a.click();
  };

  return (
    <div className="purchase-container">
      <h1>
        {activeTab === "entry"
          ? "SCAFFOLDING PURCHASE ENTRY"
          : "SCAFFOLDING PURCHASE REPORT"}
      </h1>

      {/* ================= TABS ================= */}
      <div className="tabs">
        <button
          className={activeTab === "entry" ? "active" : ""}
          onClick={() => setActiveTab("entry")}
        >
          Entry Form
        </button>
        <button
          className={activeTab === "report" ? "active" : ""}
          onClick={() => setActiveTab("report")}
        >
          Purchase Report
        </button>
      </div>

      {/* ================= ENTRY FORM ================= */}
      {activeTab === "entry" && (
        <>
          <label>Party Name</label>
          <select
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
          >
            <option value="">-- Select Party --</option>
            {parties.map((p) => (
              <option key={p._id} value={p.partyName}>
                {p.partyName}
              </option>
            ))}
          </select>

          <label>Invoice Number</label>
          <input
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
          />

          <label>Invoice Date</label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
          />

          {/* ✅ ENTRY TABLE */}
          <table className="entry-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Unit</th>
                <th>PUW (kg)</th>
                <th>Total Weight (kg)</th>
                <th>UOM</th>
                <th>Qty</th>
                <th>Work Order No</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {items.map((i, idx) => (
                <tr key={idx}>
                  <td>
                    <select
                      value={i.name}
                      onChange={(e) => handleItemSelect(idx, e.target.value)}
                    >
                      <option value="">Select Item</option>
                      {itemMasters.map((im) => (
                        <option key={im._id} value={im.itemName}>
                          {im.itemName}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <input value={i.unit} disabled />
                  </td>
                  <td>
                    <input value={i.puw} disabled />
                  </td>

                  <td>
                    <input value={i.weight.toFixed(2)} disabled />
                  </td>

                  <td>
                    <input
                      placeholder="UOM"
                      value={i.uom}
                      onChange={(e) => updateItem(idx, "uom", e.target.value)}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={i.qty}
                      onChange={(e) => {
                        const qty =
                          e.target.value === "" ? "" : Number(e.target.value);

                        const updated = [...items];
                        updated[idx].qty = qty;
                        updated[idx].weight =
                          Number(qty || 0) * Number(updated[idx].puw || 0);

                        setItems(updated);
                      }}
                    />
                  </td>

                  <td>
                    <input
                      placeholder="Work Order No"
                      value={i.workOrderNo}
                      onChange={(e) =>
                        updateItem(idx, "workOrderNo", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={i.rate}
                      onChange={(e) =>
                        updateItem(
                          idx,
                          "rate",
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                    />
                  </td>

                  <td className="amount">
                    ₹{(Number(i.qty || 0) * Number(i.rate || 0)).toFixed(2)}
                  </td>

                  <td>
                    <button
                      className="entry-delete"
                      onClick={() => removeItem(idx)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="add" onClick={addItem}>
            + Add Item
          </button>

          {/* ✅ SUMMARY */}
          <div className="summary">
            <span>Subtotal: ₹{subtotal.toFixed(2)}</span>

            <span>
              GST %:
              <input
                type="number"
                value={gstPercent}
                onChange={(e) =>
                  setGstPercent(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            </span>

            <span>GST Amount: ₹{gstAmount.toFixed(2)}</span>

            <strong>Total: ₹{total.toFixed(2)}</strong>
          </div>

          {/* ✅ FOOTER */}
          <div className="footer-actions">
            <button className="save" onClick={savePurchase}>
              Save Purchase
            </button>
            <button className="download" onClick={downloadInvoicePDF}>
              Download Invoice PDF
            </button>
          </div>
        </>
      )}

      {/* ================= REPORT ================= */}
      {activeTab === "report" && (
        <>
          <h2 className="report-title">SCAFFOLDING PURCHASE REPORT</h2>

          <div className="report-toolbar">
            <div className="report-filters">
              <input placeholder="Search Party Name" />
              <input type="date" />
              <input type="date" />
            </div>

            <div className="report-actions">
              <button className="green" onClick={exportPDF}>
                Download PDF
              </button>
              <button className="orange" onClick={exportCSV}>
                Export CSV
              </button>
            </div>
          </div>

          <table className="entry-table">
            <thead>
              <tr>
                <th>Party Name</th>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total (₹)</th>
                <th>Total Weight (kg)</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No purchases found
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p._id}>
                    <td>{p.partyName}</td>
                    <td>{p.invoiceNo}</td>
                    <td>{p.invoiceDate}</td>
                    <td>
                      {p.items.map((i) => (
                        <div key={i.name}>
                          {i.name} – {i.qty} × {i.puw || 0} kg ={" "}
                          <b>{i.weight || 0} kg</b>
                        </div>
                      ))}
                    </td>
                    <td className="amount">₹{p.total.toFixed(2)}</td>
                    <td>{totalWeight(p.items).toFixed(2)} kg</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEditPurchase(p)}
                      >
                        Edit
                      </button>
                    </td>

                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeletePurchase(p._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default PurchaseEntryPage;
