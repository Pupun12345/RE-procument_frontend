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
};

type Item = {
  itemName: string;
  qty: number | "";
  unit: string;
  rate: number | "";
};

type Purchase = {
  _id?: string;
  partyName: string;
  invoiceNumber: string;
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
  itemName: "",
  qty: "",
  unit: "",
  rate: "",
};

const MechanicalPurchasePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"entry" | "report" | "old">(
    "entry"
  );

  /* ================= MASTER DATA ================= */
  const [parties, setParties] = useState<Party[]>([]);
  const [itemMasters, setItemMasters] = useState<ItemMaster[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ================= ENTRY STATE ================= */
  const [partyName, setPartyName] = useState("");
  const [invoiceNumber, setinvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [gstPercent, setGstPercent] = useState<number | "">("");
  const [items, setItems] = useState<Item[]>([emptyItem]);

  /* ================= REPORT STATE ================= */
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    date: ""
  });

  /* ================= OLD STOCK STATE ================= */
  const [oldItemName, setOldItemName] = useState("");
  const [oldQty, setOldQty] = useState<number | "">("");
  const [oldUnit, setOldUnit] = useState("");

  /* ================= FETCH BACKEND DATA ================= */
  useEffect(() => {
    const loadMasters = async () => {
      try {
        const vendorsRes = await api.get("/vendors");
        setParties(vendorsRes.data);

        const itemsRes = await api.get("/items/mechanical");
        setItemMasters(itemsRes.data);
      } catch (err) {
        console.error("Failed to load vendors/items", err);
        setParties([]);
        setItemMasters([]);
      }
    };

    loadMasters();
  }, []);
  /* ================= LOAD REPORT FROM BACKEND ================= */
  useEffect(() => {
    if (activeTab === "report") {
      api
        .get("/purchases/mechanical")
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
    const selected = itemMasters.find((i) => i.itemName === name);
    const updated = [...items];

    updated[index] = {
      ...updated[index],
      itemName: name,
      unit: selected?.unit || "",
    };

    setItems(updated);
  };
  const handleEditPurchase = (index: number) => {
    const selected = purchases[index];

    setEditingId(selected._id || null); // 🔑 STORE ID

    setPartyName(selected.partyName);
    setinvoiceNumber(selected.invoiceNumber);
    setInvoiceDate(selected.invoiceDate);
    setItems(selected.items);
    setGstPercent(selected.gstPercent);

    setActiveTab("entry");
  };

  const handleDeletePurchase = async (index: number) => {
    const purchase = purchases[index];
    if (!purchase?._id) return;

    if (!window.confirm("Are you sure you want to delete this purchase?"))
      return;

    try {
      await api.delete(`/purchases/mechanical/${purchase._id}`);
      const res = await api.get("/purchases/mechanical");
      setPurchases(res.data);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete purchase");
    }
  };

  const addItem = () => setItems([...items, emptyItem]);
  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  /* ================= SAVE OLD STOCK ================= */
  const saveOldStock = async () => {
    if (!oldItemName || !oldQty || !oldUnit) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      itemName: oldItemName,
      qty: Number(oldQty),
      unit: oldUnit,
    };

    try {
      await api.post("/stock/mechanical", payload);

      // reset form
      setOldItemName("");
      setOldQty("");
      setOldUnit("");

      alert("Old stock added successfully");
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save old stock");
    }
  };

  /* ================= FILTERED PURCHASES ================= */
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const searchText = filters.search.toLowerCase().trim();
      
      // Search filter - party name and item names only
      if (searchText) {
        const partyMatch = p.partyName.toLowerCase().includes(searchText);
        const itemMatch = p.items.some((i) =>
          i.itemName.toLowerCase().includes(searchText)
        );
        if (!partyMatch && !itemMatch) return false;
      }
      
      // Date filter - exact date match
      if (filters.date) {
        const purchaseDate = new Date(p.invoiceDate).toISOString().split('T')[0];
        if (purchaseDate !== filters.date) return false;
      }
      
      return true;
    });
  }, [purchases, filters]);

  /* ================= SAVE PURCHASE ================= */
  const savePurchase = async () => {
    if (!partyName || !invoiceNumber || !invoiceDate) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      partyName,
      invoiceNumber,
      invoiceDate,
      items: items.map((i) => ({
        itemName: i.itemName,
        qty: Number(i.qty),
        unit: i.unit,
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
        await api.put(`/purchases/mechanical/${editingId}`, payload);
      } else {
        // ✅ CREATE
        await api.post("/purchases/mechanical", payload);
      }

      // reset form
      setEditingId(null);
      setPartyName("");
      setinvoiceNumber("");
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
        i.itemName,
        i.qty,
        i.unit,
        i.rate,
        (Number(i.qty || 0) * Number(i.rate || 0)).toFixed(2),
      ]),
    });

    const finalY = doc.lastAutoTable?.finalY ?? 40;
    doc.text(`Total: ₹${total.toFixed(2)}`, 150, finalY + 10);

    doc.save("mechanical_invoice.pdf");
  };

  /* ================= REPORT PDF (BRANDED) ================= */
  const exportPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const addHeader = () => {
      try {
        doc.addImage("/ray-log.png", "PNG", 15, 10, 18, 18);
      } catch {
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
      doc.text("MECHANICAL PURCHASE REPORT", pageWidth / 2, 55, {
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

    const tempTotalPages = 1; // Placeholder, will update later

    autoTable(doc, {
      startY: 65,
      margin: { top: 70, bottom: 65 },
      head: [["Party", "Invoice", "Date", "Items", "Total"]],
      body: filteredPurchases.map((p) => [
        p.partyName,
        p.invoiceNumber,
        new Date(p.invoiceDate).toLocaleDateString("en-IN"),
        p.items.map((i) => i.itemName).join(", "),
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

    doc.save("mechanical_purchase_report.pdf");
  };

  /* ================= EXPORT CSV ================= */
  const exportCSV = () => {
    const csv = [
      ["Party", "Invoice", "Date", "Items", "Total"],
      ...filteredPurchases.map((p) => [
        p.partyName,
        p.invoiceNumber,
        p.invoiceDate,
        p.items.map((i) => i.itemName).join("|"),
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
      <h1>MECHANICAL PURCHASE ENTRY</h1>

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
        <button
          className={activeTab === "old" ? "active" : ""}
          onClick={() => setActiveTab("old")}
        >
          Opening Stock
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
            value={invoiceNumber}
            onChange={(e) => setinvoiceNumber(e.target.value)}
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
                      value={i.itemName}
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
          <h2 className="report-title">MECHANICAL PURCHASE REPORT</h2>

          <div className="report-toolbar">
            <div className="report-filters">
              <input 
                placeholder="Search Party / Item Name" 
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
              <input 
                type="date" 
                value={filters.date}
                onChange={(e) => setFilters({...filters, date: e.target.value})}
              />
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

          <div className="report-table-wrapper">
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
                {filteredPurchases.map((p, i) => (
                  <tr key={i}>
                    <td>{p.partyName}</td>
                    <td>{p.invoiceNumber}</td>
                    <td>{p.invoiceDate}</td>
                    <td>{p.items.map((x) => x.itemName).join(", ")}</td>
                    <td className="amount">₹{p.total.toFixed(2)}</td>

                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => {
                          const originalIndex = purchases.findIndex(purchase => purchase._id === p._id);
                          handleEditPurchase(originalIndex);
                        }}
                      >
                        Edit
                      </button>
                    </td>

                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => {
                          const originalIndex = purchases.findIndex(purchase => purchase._id === p._id);
                          handleDeletePurchase(originalIndex);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ================= OLD STOCK FORM ================= */}
      {activeTab === "old" && (
        <>
          <h2>Add Old Stock</h2>

          <label>Item Name</label>
          <select
            value={oldItemName}
            onChange={(e) => {
              const selectedItem = itemMasters.find(
                (im) => im.itemName === e.target.value
              );
              setOldItemName(e.target.value);
              if (selectedItem) {
                setOldUnit(selectedItem.unit);
              }
            }}
          >
            <option value="">-- Select Item --</option>
            {itemMasters.map((im) => (
              <option key={im._id} value={im.itemName}>
                {im.itemName}
              </option>
            ))}
          </select>

          <label>Quantity</label>
          <input
            type="number"
            value={oldQty}
            onChange={(e) =>
              setOldQty(e.target.value === "" ? "" : Number(e.target.value))
            }
          />

          <label>Unit</label>
          <input value={oldUnit} readOnly placeholder="Auto-filled from item" />

          <div className="old-stock-buttons">
            <button className="add-stock" onClick={saveOldStock}>
              Add to Stock
            </button>
            <button
              className="clear-stock"
              onClick={() => {
                setOldItemName("");
                setOldQty("");
                setOldUnit("");
              }}
            >
              Clear
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MechanicalPurchasePage;
