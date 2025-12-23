import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./purchase.css";

/* ================= TYPES ================= */
type Party = { id: number; name: string };
type ItemMaster = { id: number; name: string; unit: string };

type Item = {
  name: string;
  qty: number | "";
  unit: string;
  rate: number | "";
};

type Purchase = {
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

  /* ================= FETCH BACKEND DATA ================= */
  useEffect(() => {
    fetch("/api/parties")
      .then((r) => r.json())
      .then(setParties)
      .catch(() => setParties([]));

    fetch("/api/items")
      .then((r) => r.json())
      .then(setItemMasters)
      .catch(() => setItemMasters([]));
  }, []);

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
  const updateItem = (
    index: number,
    field: keyof Item,
    value: string | number | ""
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleItemSelect = (index: number, name: string) => {
    const selected = itemMasters.find((i) => i.name === name);
    const updated = [...items];

    updated[index] = {
      ...updated[index],
      name,
      unit: selected?.unit || "",
    };

    setItems(updated);
  };
  const handleEditPurchase = (index: number) => {
    const selected = purchases[index];

    setPartyName(selected.partyName);
    setInvoiceNo(selected.invoiceNo);
    setInvoiceDate(selected.invoiceDate);
    setItems(selected.items);
    setGstPercent(selected.gstPercent);

    setPurchases(purchases.filter((_, i) => i !== index));
    setActiveTab("entry");
  };

  const handleDeletePurchase = (index: number) => {
    if (!window.confirm("Are you sure you want to delete this purchase?"))
      return;
    setPurchases(purchases.filter((_, i) => i !== index));
  };

  const addItem = () => setItems([...items, emptyItem]);
  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  /* ================= SAVE PURCHASE ================= */
  const savePurchase = () => {
    if (!partyName || !invoiceNo || !invoiceDate) {
      alert("Please fill all required fields");
      return;
    }

    const newPurchase: Purchase = {
      partyName,
      invoiceNo,
      invoiceDate,
      items,
      subtotal,
      gstPercent: Number(gstPercent || 0),
      gstAmount,
      total,
    };

    setPurchases([...purchases, newPurchase]);

    setPartyName("");
    setInvoiceNo("");
    setInvoiceDate("");
    setItems([emptyItem]);
    setGstPercent("");

    setActiveTab("report");
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

  /* ================= REPORT PDF (UNCHANGED) ================= */
  const exportPDF = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [["Party", "Invoice", "Date", "Items", "Total"]],
      body: purchases.map((p) => [
        p.partyName,
        p.invoiceNo,
        p.invoiceDate,
        p.items.map((i) => i.name).join(", "),
        `₹${p.total.toFixed(2)}`,
      ]),
      headStyles: { fillColor: [0, 0, 0] },
    });

    doc.save("purchase_report.pdf");
  };

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
      <h1>PURCHASE ENTRY</h1>

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
              <option key={p.id} value={p.name}>
                {p.name}
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

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit</th>
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
                        <option key={im.id} value={im.name}>
                          {im.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <input
                      type="number"
                      value={i.qty}
                      onChange={(e) =>
                        updateItem(
                          idx,
                          "qty",
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                    />
                  </td>

                  <td>
                    <input value={i.unit} disabled />
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

                  <td>
                    ₹{(Number(i.qty || 0) * Number(i.rate || 0)).toFixed(2)}
                  </td>

                  <td>
                    <button className="delete" onClick={() => removeItem(idx)}>
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
          <h2 className="report-title">PPE PURCHASE REPORT</h2>

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

          <table className="report-table">
            <thead>
              <tr>
                <th>Party Name</th>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total (₹)</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {purchases.map((p, i) => (
                <tr key={i}>
                  <td>{p.partyName}</td>
                  <td>{p.invoiceNo}</td>
                  <td>{p.invoiceDate}</td>
                  <td>{p.items.map((x) => x.name).join(", ")}</td>
                  <td className="amount">₹{p.total.toFixed(2)}</td>

                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditPurchase(i)}
                    >
                      Edit
                    </button>
                  </td>

                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeletePurchase(i)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default PurchaseEntryPage;
