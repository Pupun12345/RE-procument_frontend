import './TableScafolding.css'
import { useState, useEffect } from 'react'

interface ScaffoldingItem {
    itemName: string
    unit: string
    totalIssued: number
    totalReturned: number
    netIssued: number
    inField: number
    currentStock: number
    status: string
}

interface ReportData {
    summary: {
        totalItems: number
        totalIssued: number
        totalReturned: number
        totalInField: number
        totalStock: number
        criticalItems: number
        lowStockItems: number
    }
    data: ScaffoldingItem[]
}

export default function InventoryTable() {
    const [reportData, setReportData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchScaffoldingReport()
    }, [])

    const fetchScaffoldingReport = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch('http://localhost:4000/api/reports/scaffolding')
            if (!response.ok) {
                throw new Error('Failed to fetch scaffolding report')
            }
            const result = await response.json()
            if (result.success) {
                setReportData(result)
            } else {
                throw new Error(result.message || 'Failed to load data')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            console.error('Error fetching scaffolding report:', err)
        } finally {
            setLoading(false)
        }
    }

    const filteredData = reportData?.data.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    if (loading) {
        return (
            <div className="table-card">
                <div className="table-header">
                    <h3>Detailed Line-Item Breakdown</h3>
                </div>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Loading scaffolding data...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="table-card">
                <div className="table-header">
                    <h3>Detailed Line-Item Breakdown</h3>
                </div>
                <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
                    <p>Error: {error}</p>
                    <button onClick={fetchScaffoldingReport} style={{ marginTop: '1rem' }}>
                        Retry
                    </button>
                </div>
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
                    <button className="filter-btn" title="Filter items">
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
                            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                                {searchTerm ? 'No items match your search' : 'No data available'}
                            </td>
                        </tr>
                    ) : (
                        filteredData.map((item) => (
                            <tr key={item.itemName}>
                                <td><span>{item.itemName}</span></td>
                                <td><span>{item.unit}</span></td>
                                <td><span>{item.totalIssued.toLocaleString()}</span></td>
                                <td><span>{item.totalReturned.toLocaleString()}</span></td>
                                <td><span>{item.inField.toLocaleString()}</span></td>
                                <td><span>{item.currentStock.toLocaleString()}</span></td>
                                <td>
                                    <span className={`status ${item.status.replace(/\s+/g, '').toLowerCase()}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <div className="pagination">
                Showing {filteredData.length} of {reportData?.summary.totalItems || 0} items
            </div>
        </div>
    )
}