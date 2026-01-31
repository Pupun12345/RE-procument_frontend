import { useState, useEffect } from 'react'
import './TableMechanical.css'

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

export default function InventoryTable() {
    const [reportData, setReportData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchMechanicalReport()
    }, [])

    const fetchMechanicalReport = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:4000/api/reports/mechanical')
            
            if (!response.ok) {
                throw new Error('Failed to fetch mechanical report')
            }
            
            const data = await response.json()
            setReportData(data)
            setError(null)
        } catch (err) {
            console.error('Error fetching mechanical report:', err)
            setError(err instanceof Error ? err.message : 'Failed to load report')
        } finally {
            setLoading(false)
        }
    }

    const getStockStatus = (currentStock: number, inField: number) => {
        const total = currentStock + inField
        if (currentStock === 0) return 'Critical'
        if (currentStock < total * 0.2) return 'Low Stock'
        return 'Healthy'
    }

    const filteredData = reportData?.data.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    if (loading) {
        return (
            <div className="table-card">
                <div className="loading">Loading mechanical report...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="table-card">
                <div className="error">Error: {error}</div>
                <button onClick={fetchMechanicalReport}>Retry</button>
            </div>
        )
    }

    return (
        <div className="table-card">
            <div className="table-header">
                <h3>Detailed Line-Item Breakdown</h3>
                <div className="header-controls">
                    <input 
                        placeholder="Search items..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="filter-btn" title="Filter items" onClick={fetchMechanicalReport}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Item Description</th>
                        <th>Unit</th>
                        <th>Total Issued</th>
                        <th>Total Returned</th>
                        <th>In Field</th>
                        <th>Current Stock</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.length === 0 ? (
                        <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                                {searchTerm ? 'No items found matching your search' : 'No data available'}
                            </td>
                        </tr>
                    ) : (
                        filteredData.map((item) => {
                            const status = getStockStatus(item.currentStock, item.inField)
                            return (
                                <tr key={item.itemName}>
                                    <td><span>{item.itemName}</span></td>
                                    <td><span>{item.unit}</span></td>
                                    <td><span>{item.totalIssued.toLocaleString()}</span></td>
                                    <td><span>{item.totalReturned.toLocaleString()}</span></td>
                                    <td><span>{item.inField.toLocaleString()}</span></td>
                                    <td><span>{item.currentStock.toLocaleString()}</span></td>
                                    <td>
                                        <span className={`status ${status.replace(/\s+/g, '').toLowerCase()}`}>
                                            {status}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })
                    )}
                </tbody>
            </table>
            <div className="pagination">
                Showing {filteredData.length} of {reportData?.summary.totalItems || 0} items
            </div>
        </div>
    )
}