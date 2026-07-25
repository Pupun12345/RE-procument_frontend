import { useState, useEffect } from "react";
import "./ReportHeader.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../api/axios";

interface ReportItem {
  itemName: string;
  unit: string;
  totalIssued: number;
  totalReturned: number;
  currentStock: number;
  netIssued: number;
  inField: number;
}

interface ReportData {
  success: boolean;
  summary: {
    totalItems: number;
    totalIssued: number;
    totalReturned: number;
    totalInField: number;
    totalCurrentStock: number;
  };
  data: ReportItem[];
}

export default function ReportHeader() {
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetchPPEReport();
  }, []);

  const fetchPPEReport = async () => {
    try {
      const response = await api.get("/reports/ppe");
      if (response.status === 200) {
        setReportData(response.data);
      }
    } catch (err) {
      console.error("Error fetching PPE report:", err);
    }
  };

  const getStockStatus = (currentStock: number, inField: number) => {
    const total = currentStock + inField;
    if (currentStock === 0) return "Critical";
    if (currentStock < total * 0.2) return "Low Stock";
    return "Healthy";
  };

  const exportPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    /* ---------------- HEADER ---------------- */

    const addHeader = () => {
      try {
        doc.addImage("/logo.jpg", "PNG", 15, 10, 18, 18);
      } catch (e) {}

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("RAY ENGINEERING", 50, 15);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Contact No: 9337670266", 50, 22);
      doc.text("E-Mail: accounts@rayengineering.co", 50, 28);

      doc.setLineWidth(0.5);
      doc.line(10, 40, pageWidth - 10, 40);

      doc.setFontSize(16);
      doc.text("PPE FINAL REPORT", pageWidth / 2, 55, {
        align: "center",
      });
    };

    /* ---------------- FOOTER ---------------- */

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

    /* ---------------- TABLE ---------------- */

    const headers = [
      "Item Description",
      "Unit",
      "Total Issued",
      "Current Stock",
      "Status",
    ];

    const rows = reportData.data.map((item) => [
      item.itemName,
      item.unit,
      item.totalIssued,
      item.currentStock,
      getStockStatus(item.currentStock, item.inField),
    ]);

    let tempTotalPages = 1;

    autoTable(doc, {
      startY: 65,
      margin: { top: 70, bottom: 65 },

      head: [headers],
      body: rows,

      styles: {
        fontSize: 9,
        halign: "center",
        cellPadding: 3,
      },

      headStyles: {
        fillColor: [46, 134, 193],
        textColor: 255,
        fontStyle: "bold",
      },

      columnStyles: {
        0: { halign: "left" },
        2: { halign: "right" },
        3: { halign: "right" },
      },

      theme: "grid",

      didParseCell: (data: any) => {
        if (data.section === "body" && data.column.index === 4) {
          const status = String(data.cell.raw);

          if (status === "Healthy") {
            data.cell.styles.fillColor = [220, 252, 231];
            data.cell.styles.textColor = [22, 101, 52];
            data.cell.styles.fontStyle = "bold";
          } else if (status === "Low Stock") {
            data.cell.styles.fillColor = [254, 243, 199];
            data.cell.styles.textColor = [133, 77, 14];
            data.cell.styles.fontStyle = "bold";
          } else {
            data.cell.styles.fillColor = [254, 226, 226];
            data.cell.styles.textColor = [153, 27, 27];
            data.cell.styles.fontStyle = "bold";
          }
        }

        if (data.section === "body" && data.row.index % 2 === 0) {
          data.cell.styles.fillColor ||= [250, 250, 250];
        }
      },

      didDrawPage: (data) => {
        addHeader();
        addFooter(data.pageNumber, tempTotalPages);
      },
    });

    const totalPages = doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addHeader();
      addFooter(i, totalPages);
    }

    doc.save("PPE_Final_Report.pdf");
  };

  const exportCSV = () => {
    if (!reportData) return;

    const headers = [
      "Item Description",
      "Unit",
      "Total Issued",
      "Current Stock",
      "Status",
    ];
    const tableData = reportData.data.map((item) => [
      item.itemName,
      item.unit,
      item.totalIssued.toString(),
      item.currentStock.toString(),
      getStockStatus(item.currentStock, item.inField),
    ]);

    const csv = [headers, ...tableData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "PPE_Final_Report.csv";
    a.click();
  };

  return (
    <div className="report-header">
      <div>
        <h2>PPE Final Report</h2>
        <p>
          Consolidated overview of Personal Protective Equipment inventory and
          distribution.
        </p>
      </div>
      <div className="actions">
        <button
          onClick={exportPDF}
          style={{
            background: "#c81e1e",
            color: "#fff",
            border: "none",
            padding: "8px 14px",
            borderRadius: "6px",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Export PDF
        </button>

        <button
          onClick={exportCSV}
          style={{
            background: "#16a34a",
            color: "#fff",
            border: "none",
            padding: "8px 14px",
            borderRadius: "6px",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Export CSV
        </button>
      </div>
    </div>
  );
}
