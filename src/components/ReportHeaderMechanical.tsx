import { useState, useEffect } from 'react'
import './ReportHeaderMechanical.css'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ReportItem {
    itemName: string
    unit: string
    totalIssued: number
    totalReturned: number
    currentStock: number
    netIssued: number
    inField: number
}

interface ReportData {
    success: boolean
    summary: {
        totalItems: number
        totalIssued: number
        totalReturned: number
        totalInField: number
        totalCurrentStock: number
    }
    data: ReportItem[]
}

export default function ReportHeader() {
    const [reportData, setReportData] = useState<ReportData | null>(null)

    useEffect(() => {
        fetchMechanicalReport()
    }, [])

    const fetchMechanicalReport = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/reports/mechanical')
            if (response.ok) {
                const data = await response.json()
                setReportData(data)
            }
        } catch (err) {
            console.error('Error fetching mechanical report:', err)
        }
    }

    const getStockStatus = (currentStock: number, inField: number) => {
        const total = currentStock + inField
        if (currentStock === 0) return 'Critical'
        if (currentStock < total * 0.2) return 'Low Stock'
        return 'Healthy'
    }

    const exportPDF = () => {
        if (!reportData) return

        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        const headerHeight = 68

        const headers = ['Item Description', 'Unit', 'Total Issued', 'Total Returned', 'In Field', 'Current Stock', 'Status']
        const tableData = reportData.data.map(item => [
            item.itemName,
            item.unit,
            item.totalIssued.toString(),
            item.totalReturned.toString(),
            item.inField.toString(),
            item.currentStock.toString(),
            getStockStatus(item.currentStock, item.inField)
        ])

        const addHeader = () => {
            try { doc.addImage('/ray-log.png','PNG',16,14,22,22) } catch (e) {}

            doc.setFillColor(237, 246, 255)
            doc.rect(0, 0, pageWidth, headerHeight, 'F')

            doc.setFontSize(18)
            doc.setFont('helvetica', 'bold')
            doc.text('Mechanical Final Report', pageWidth / 2, 26, { align: 'center' })

            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text('Consolidated overview of Mechanical Equipment inventory and distribution.', pageWidth / 2, 36, { align: 'center' })

            doc.setLineWidth(0.5)
            doc.setDrawColor(200)
            doc.line(10, headerHeight - 6, pageWidth - 10, headerHeight - 6)
        }

        const addFooter = (pageNum: number, totalPages: number) => {
            const footerY = pageHeight - 40
            doc.line(10, footerY - 2, pageWidth - 10, footerY - 2)
            doc.setFontSize(8)
            doc.text('Registrations: GSTIN: 21AIJHPR1040H1ZO | UDYAM: DO-12-0001261 | State: Odisha (Code: 21)', 10, footerY)
            doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 20, footerY, { align: 'right' })
        }

        let tempTotalPages = 1

        const contentWidth = Math.max(pageWidth - 28, 100)
        const c0 = Math.round(contentWidth * 0.30)
        const c1 = Math.round(contentWidth * 0.08)
        const c2 = Math.round(contentWidth * 0.12)
        const c3 = Math.round(contentWidth * 0.12)
        const c4 = Math.round(contentWidth * 0.12)
        const c5 = Math.round(contentWidth * 0.14)
        const c6 = contentWidth - (c0 + c1 + c2 + c3 + c4 + c5)

        // @ts-ignore
        autoTable(doc, {
            startY: headerHeight,
            tableWidth: contentWidth,
            margin: { left: 14, right: 14, top: headerHeight + 6, bottom: 55 },
            head: [headers],
            body: tableData,
            styles: { fontSize: 9, cellPadding: 3, overflow: 'ellipsize' },
            columnStyles: {
                0: { halign: 'left', cellWidth: c0 },
                1: { halign: 'center', cellWidth: c1 },
                2: { halign: 'right', cellWidth: c2 },
                3: { halign: 'right', cellWidth: c3 },
                4: { halign: 'right', cellWidth: c4 },
                5: { halign: 'right', cellWidth: c5 },
                6: { halign: 'center', cellWidth: c6 },
            },
            headStyles: { fillColor: [11, 83, 148], textColor: 255, fontStyle: 'bold' },
            theme: 'grid',
            didParseCell: (data: any) => {
                if (data.section === 'body' && data.column.index === 6) {
                    const status = String(data.cell.raw || '')
                    if (status.includes('Healthy')) {
                        data.cell.styles.fillColor = [220, 252, 231]
                        data.cell.styles.textColor = [22, 101, 52]
                        data.cell.styles.fontStyle = 'bold'
                    } else if (status.includes('Low Stock')) {
                        data.cell.styles.fillColor = [254, 243, 199]
                        data.cell.styles.textColor = [133, 77, 14]
                        data.cell.styles.fontStyle = 'bold'
                    } else {
                        data.cell.styles.fillColor = [254, 226, 226]
                        data.cell.styles.textColor = [153, 27, 27]
                        data.cell.styles.fontStyle = 'bold'
                    }
                }

                if (data.section === 'body' && data.row.index % 2 === 0 && data.column.index !== 6) {
                    data.cell.styles.fillColor = data.cell.styles.fillColor || [250, 250, 250]
                }
            },
            didDrawPage: (data: any) => {
                addHeader()
                addFooter(data.pageNumber, tempTotalPages)
            }
        })

        const totalPages = doc.getNumberOfPages()
        for (let p = 1; p <= totalPages; p++) {
            doc.setPage(p)
            addHeader()
            addFooter(p, totalPages)
        }

        doc.save('Mechanical_Final_Report.pdf')
    }

    const exportCSV = () => {
        if (!reportData) return

        const headers = ['Item Description', 'Unit', 'Total Issued', 'Total Returned', 'In Field', 'Current Stock', 'Status']
        const tableData = reportData.data.map(item => [
            item.itemName,
            item.unit,
            item.totalIssued.toString(),
            item.totalReturned.toString(),
            item.inField.toString(),
            item.currentStock.toString(),
            getStockStatus(item.currentStock, item.inField)
        ])

        const csv = [headers, ...tableData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'Mechanical_Final_Report.csv'
        a.click()
    }

    return (
        <div className="report-header">
            <div>
                <h2>Mechanical Final Report</h2>
                <p>Consolidated overview of Mechanical Equipment inventory and distribution.</p>
            </div>
            <div className="actions">
                <button className="btn" onClick={exportPDF}>Export PDF</button>
                <button className="btn danger" onClick={exportCSV}>Export CSV</button>
            </div>
        </div>
    )
}
