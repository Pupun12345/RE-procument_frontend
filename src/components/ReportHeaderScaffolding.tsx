import "./ReportHeaderScaffolding.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useState, useEffect } from "react";
import api from "../api/axios";

interface ScaffoldingItem {
  itemName: string;
  unit: string;
  totalIssued: number;
  totalIssuedWeight: number;
  totalReturned: number;
  totalReturnedWeight: number;
  netIssued: number;
  inField: number;
  currentStock: number;
  currentStockWeight: number;
  status: string;
}

interface ReportData {
  summary: {
    totalItems: number;
    totalIssued: number;
    totalIssuedWeight: number;
    totalReturned: number;
    totalReturnedWeight: number;
    totalInField: number;
    totalStock: number;
    criticalItems: number;
    lowStockItems: number;
  };
  data: ScaffoldingItem[];
}

export default function ReportHeader() {
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetchScaffoldingReport();
  }, []);

  const fetchScaffoldingReport = async () => {
    try {
      const response = await api.get("/reports/scaffolding");
      const result = response.data;
      if (result.success) {
        setReportData(result);
      }
    } catch (err) {
      console.error("Error fetching scaffolding report:", err);
    }
  };

  const tableData =
    reportData?.data.map((item) => [
      item.itemName,
      item.unit,
      item.totalIssued.toString(),
      (item.totalIssuedWeight || 0).toFixed(2),
      item.totalReturned.toString(),
      (item.totalReturnedWeight || 0).toFixed(2),
      item.inField.toString(),
      item.currentStock.toString(),
      (item.currentStockWeight || 0).toFixed(2),
      item.status,
    ]) || [];

  const headers = [
    "Item Description",
    "Unit",
    "Total Issued (Qty)",
    "Issued Weight (kg)",
    "Total Returned (Qty)",
    "Returned Weight (kg)",
    "In Field",
    "Current Stock (Qty)",
    "Current Stock Weight (kg)",
    "Status",
  ];

  const exportPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    /* ---------------- HEADER ---------------- */

    const addHeader = () => {
      try {
        doc.addImage("/ray-log.png", "PNG", 15, 10, 18, 18);
      } catch (e) {}

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
      doc.text("SCAFFOLDING FINAL REPORT", pageWidth / 2, 55, {
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

    /* ---------------- TABLE DATA ---------------- */

    const headers = [
      "Item Description",
      "Unit",
      "Total Issued (Qty)",
      "Issued Weight (kg)",
      "Total Returned (Qty)",
      "Returned Weight (kg)",
      "In Field",
      "Current Stock (Qty)",
      "Current Stock Weight (kg)",
      "Status",
    ];

    const rows =
      reportData?.data.map((item) => [
        item.itemName,
        item.unit,
        item.totalIssued,
        (item.totalIssuedWeight || 0).toFixed(2),
        item.totalReturned,
        (item.totalReturnedWeight || 0).toFixed(2),
        item.inField,
        item.currentStock,
        (item.currentStockWeight || 0).toFixed(2),
        item.status,
      ]) || [];

    let tempTotalPages = 1;

    /* ---------------- AUTOTABLE ---------------- */

    autoTable(doc, {
      startY: 65,
      margin: { top: 70, bottom: 65 },

      head: [headers],
      body: rows,

      styles: {
        fontSize: 8,
        halign: "center",
        cellPadding: 2,
      },

      headStyles: {
        fillColor: [46, 134, 193],
        textColor: "#fff",
        fontStyle: "bold",
      },

      columnStyles: {
        0: { halign: "left" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "right" },
        8: { halign: "right" },
      },

      theme: "grid",

      didParseCell: (data: any) => {
        if (data.section === "body" && data.column.index === 9) {
          const status = String(data.cell.raw);

          if (status.includes("Healthy")) {
            data.cell.styles.fillColor = [220, 252, 231];
            data.cell.styles.textColor = [22, 101, 52];
            data.cell.styles.fontStyle = "bold";
          } else if (status.includes("Low")) {
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

    /* --------- FINAL PAGE NUMBERS FIX -------- */

    const totalPages = doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addHeader();
      addFooter(i, totalPages);
    }

    doc.save("Scaffolding_Final_Report.pdf");
  };

  const exportCSV = () => {
    const csv = [headers, ...tableData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Scaffolding_Final_Report.csv";
    a.click();
  };

  return (
    <div className="report-header">
      <div>
        <h2>Scaffolding Final Report</h2>
        <p>
          Consolidated overview of Scaffolding Equipment inventory and
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
