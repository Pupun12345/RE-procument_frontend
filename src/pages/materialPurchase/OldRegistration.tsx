import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./purchase.css";
import api from "../../api/axios";

/* ================= TYPES ================= */
type ItemMaster = {
  _id: string;
  itemName: string;
  unit: string;
};

type Item = {
  itemName: string;
  unit: string;
  issuedWeight: number | "";
};

type OldRegistration = {
  _id?: string;
  date: string;
  items: Item[];
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
  unit: "",
  issuedWeight: "",
};

const OldRegistrationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"entry" | "report">("entry");

  /* ================= MASTER DATA ================= */
  const [itemMasters, setItemMasters] = useState<ItemMaster[]>([]);

  /* ================= ENTRY STATE ================= */
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<Item[]>([emptyItem]);

  /* ================= REPORT STATE ================= */
  const [registrations, setRegistrations] = useState<OldRegistration[]>([]);
  const [searchText, setSearchText] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  /* ================= FETCH BACKEND DATA ================= */
  useEffect(() => {
    const loadMasters = async () => {
      try {
        // Load all items from mechanical, scaffolding, and PPE
        const [mechanicalRes, scaffoldingRes, ppeRes] = await Promise.all([
          api.get("/items/mechanical"),
          api.get("/items/scaffolding"),
          api.get("/items/ppe"),
        ]);

        const allItems = [
          ...mechanicalRes.data,
          ...scaffoldingRes.data,
          ...ppeRes.data,
        ];

        setItemMasters(allItems);
      } catch (err) {
        console.error("Failed to load items", err);
        setItemMasters([]);
      }
    };

    loadMasters();
  }, []);

  /* ================= LOAD REPORT FROM BACKEND ================= */
  useEffect(() => {
    if (activeTab === "report") {
      api
        .get("/old-registrations")
        .then((res) => setRegistrations(res.data))
        .catch((err) => {
          console.error("Failed to load old registrations", err);
          setRegistrations([]);
        });
    }
  }, [activeTab]);

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

  const handleEditRegistration = (index: number) => {
    const selected = registrations[index];

    setDate(selected.date);
    setItems(selected.items);

    setRegistrations(registrations.filter((_, i) => i !== index));
    setActiveTab("entry");
  };

  const handleDeleteRegistration = async (index: number) => {
    const registration = registrations[index];
    if (!registration?._id) return;

    if (!window.confirm("Are you sure you want to delete this registration?"))
      return;

    try {
      await api.delete(`/old-registrations/${registration._id}`);
      const res = await api.get("/old-registrations");
      setRegistrations(res.data);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete registration");
    }
  };

  const addItem = () => setItems([...items, emptyItem]);
  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  /* ================= SAVE REGISTRATION ================= */
  const saveRegistration = async () => {
    if (!date || items.length === 0) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      date,
      items: items.map((i) => ({
        itemName: i.itemName,
        unit: i.unit,
        issuedWeight: Number(i.issuedWeight),
      })),
    };

    try {
      await api.post("/old-registrations", payload);

      setDate(new Date().toISOString().split("T")[0]);
      setItems([emptyItem]);

      setActiveTab("report");
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save registration");
    }
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
      doc.text("OLD REGISTRATION REPORT", pageWidth / 2, 55, {
        align: "center",
      });
    };

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
        pageWidth / 2 - 10,
        footerY + 8
      );

      doc.text(
        `Contact & Web:\nMD Email: md@rayengineering.co\nWebsite: rayengineering.co\nPage ${pageNum} / ${totalPages}`,
        pageWidth - 80,
        footerY + 8
      );
    };

    addHeader();

    const filteredData = getFilteredData();

    autoTable(doc, {
      startY: 65,
      margin: { top: 60, bottom: 50 },
      head: [["Date", "Item Name", "Unit", "Issued Weight"]],
      body: filteredData.flatMap((r) =>
        r.items.map((item) => [
          r.date,
          item.itemName,
          item.unit,
          item.issuedWeight,
        ])
      ),
      styles: { fontSize: 9, halign: "center", cellPadding: 3 },
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

    doc.save("old_registration_report.pdf");
  };

  /* ================= EXPORT CSV ================= */
  const exportCSV = () => {
    const filteredData = getFilteredData();

    const csv = [
      ["Date", "Item Name", "Unit", "Issued Weight"],
      ...filteredData.flatMap((r) =>
        r.items.map((item) => [r.date, item.itemName, item.unit, item.issuedWeight])
      ),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "old_registration_report.csv";
    a.click();
  };

  /* ================= FILTER DATA ================= */
  const getFilteredData = () => {
    return registrations.filter((r) => {
      const matchesSearch =
        !searchText ||
        r.items.some((item) =>
          item.itemName.toLowerCase().includes(searchText.toLowerCase())
        ) ||
        r.date.includes(searchText);

      const matchesDateFrom = !dateFrom || r.date >= dateFrom;
      const matchesDateTo = !dateTo || r.date <= dateTo;

      return matchesSearch && matchesDateFrom && matchesDateTo;
    });
  };

  const filteredData = getFilteredData();

  return (
    <div className="purchase-container">
      <h1>OLD REGISTRATION</h1>

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
          Report
        </button>
      </div>

      {/* ================= ENTRY FORM ================= */}
      {activeTab === "entry" && (
        <>
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Unit</th>
                <th>Issued Weight</th>
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
                    <input value={i.unit} disabled />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={i.issuedWeight}
                      onChange={(e) =>
                        updateItem(
                          idx,
                          "issuedWeight",
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                    />
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

          <div className="footer-actions">
            <button className="save" onClick={saveRegistration}>
              Save Registration
            </button>
          </div>
        </>
      )}

      {/* ================= REPORT ================= */}
      {activeTab === "report" && (
        <>
          <h2 className="report-title">OLD REGISTRATION REPORT</h2>

          <div className="report-toolbar">
            <div className="report-filters">
              <input
                placeholder="Search Item / Date"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
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

          <table className="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Item Name</th>
                <th>Unit</th>
                <th>Issued Weight</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((r, i) =>
                r.items.map((item, itemIdx) => (
                  <tr key={`${i}-${itemIdx}`}>
                    {itemIdx === 0 && (
                      <td rowSpan={r.items.length}>{r.date}</td>
                    )}
                    <td>{item.itemName}</td>
                    <td>{item.unit}</td>
                    <td className="amount">{item.issuedWeight}</td>

                    {itemIdx === 0 && (
                      <>
                        <td rowSpan={r.items.length}>
                          <button
                            className="edit-btn"
                            onClick={() => handleEditRegistration(i)}
                          >
                            Edit
                          </button>
                        </td>

                        <td rowSpan={r.items.length}>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteRegistration(i)}
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
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

export default OldRegistrationPage;
