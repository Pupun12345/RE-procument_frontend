import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "./stockreport.module.css";

interface Stock {
  itemName: string;
  qty: number;
  unit?: string;
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
    const fetchStocks = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:5000/api/scaffolding-stocks?page=${page}&limit=${PAGE_SIZE}&search=${search}`
        );
        const data = await res.json();
        setStocks(data.data);
        setTotal(data.total);
      } catch (err) {
        console.error("Failed to fetch scaffolding stock", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [page, search]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const exportCSV = () => {
    const headers = ["Item Name", "Quantity", "Unit", "Status"];
    const rows = stocks.map((s) => [
      s.itemName,
      s.qty,
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
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Item Name", "Quantity", "Unit", "Status"]],
      body: stocks.map((s) => [
        s.itemName,
        s.qty,
        s.unit || "-",
        s.qty > 10 ? "In Stock" : s.qty > 0 ? "Low Stock" : "Out of Stock",
      ]),
      styles: { fontSize: 9, halign: "center" },
      headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255] },
    });
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
                <th>Quantity</th>
                <th>Unit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((s, i) => (
                <tr key={i}>
                  <td className={styles.itemName}>{s.itemName}</td>
                  <td>{s.qty}</td>
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
        <span>Page {page} of {totalPages || 1}</span>
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
