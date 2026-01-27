import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "./stockreport.module.css";
import api from "../../api/axios";

interface Stock {
  itemName: string;
  qty: number;
  unit?: string;
  puw: number;
  weight: number;
}

const PAGE_SIZE = 50;

const ScaffoldingStockReport: React.FC = () => {
  const navigate = useNavigate();

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchStocks = async () => {
      try {
        setLoading(true);

        const { data } = await api.get("/stock/scaffolding", {
          params: {
            page,
            limit: PAGE_SIZE,
            search,
          },
          signal: controller.signal,
        });

        setStocks(data.data || []);
        setTotal(data.total || 0);
      } catch (err: any) {
        if (err.name === "CanceledError") return;

        console.error("Failed to fetch scaffolding stock", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();

    return () => controller.abort();
  }, [page, search]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const exportCSV = () => {
    const headers = [
      "Item Name",
      "PUW (kg)",
      "Quantity",
      "Total Weight (kg)",
      "Unit",
      "Status",
    ];
    const rows = stocks.map((s) => [
      s.itemName,
      s.puw,
      s.qty,
      (s.weight ?? s.qty * s.puw).toFixed(2),
      s.unit || "-",
      s.qty > 10 ? "In Stock" : s.qty > 0 ? "Low Stock" : "Out of Stock",
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "scaffolding_stock_report.csv";
    link.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const addHeader = () => {
      try {
        doc.addImage("/ray-log.png", "PNG", 15, 10, 18, 18);
      } catch (e) {}

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("RAY ENGINEERING", 50, 15);

      doc.setFontSize(10);
      doc.text("Contact No: 9337670266", 50, 22);
      doc.text("E-Mail: accounts@rayengineering.co", 50, 28);

      doc.setLineWidth(0.5);
      doc.line(10, 40, pageWidth - 10, 40);

      doc.setFontSize(16);
      doc.text("SCAFFOLDING STOCK REPORT", pageWidth / 2, 55, {
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
        footerY + 5,
      );

      doc.text(
        "Registered Address:\nAt- Gandakipur, Po- Gopiakuda,\nPs- Kujanga, Dist- Jagatsinghpur",
        75,
        footerY + 5,
      );

      doc.text(
        `Contact & Web:\nMD Email: md@rayengineering.co\nWebsite: rayengineering.co\nPage ${pageNum} / ${totalPages}`,
        145,
        footerY + 5,
      );
    };

    let tempTotalPages = 1;

    autoTable(doc, {
      startY: 65,
      margin: { top: 70, bottom: 65 },
      head: [
        ["Item Name", "PUW (kg)", "Qty", "Total Weight (kg)", "Unit", "Status"],
      ],
      body: stocks.map((s) => [
        s.itemName,
        String(s.puw),
        String(s.qty),
        (s.weight ?? s.qty * s.puw).toFixed(2),
        s.unit || "-",
        s.qty > 10 ? "In Stock" : s.qty > 0 ? "Low Stock" : "Out of Stock",
      ]),

      styles: { fontSize: 9, halign: "center", cellPadding: 3 },
      headStyles: { fillColor: [245, 158, 11], textColor: "#fff" },
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

    doc.save("scaffolding_stock_report.pdf");
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>SCAFFOLDING STOCK OVERVIEW</h2>

      <div className={styles.controls}>
        <input
          placeholder="🔍 Search scaffolding item..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <button className={styles.pdfBtn} onClick={exportPDF}>
          Export PDF
        </button>
        <button className={styles.csvBtn} onClick={exportCSV}>
          Export CSV
        </button>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <p className={styles.loading}>Loading scaffolding stock...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>PUW (kg)</th>
                <th>Quantity</th>
                <th>Total Weight (kg)</th>
                <th>Unit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((s, i) => (
                <tr key={i}>
                  <td className={styles.itemName}>{s.itemName}</td>
                  <td>{s.puw}</td>
                  <td>{s.qty}</td>
                  <td>{(s.weight ?? s.qty * s.puw).toFixed(2)} kg</td>
                  <td>{s.unit || "-"}</td>
                  <td
                    className={
                      s.qty > 10
                        ? styles.inStock
                        : s.qty > 0
                          ? styles.lowStock
                          : styles.outStock
                    }
                  >
                    {s.qty > 10
                      ? "In Stock"
                      : s.qty > 0
                        ? "Low Stock"
                        : "Out of Stock"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.pagination}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span>
          Page {page} of {totalPages || 1}
        </span>
        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        Go Back
      </button>
    </div>
  );
};

export default ScaffoldingStockReport;
