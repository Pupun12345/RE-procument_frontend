import './InventoryTable.css'
export default function InventoryTable() {
    const rows = [
        ['Safety Helmet (Z87+)', 'Head Protection', '1,200', '850', '350', '$18.50', 'Healthy'],
        ['Reflective Safety Vest', 'Visibility', '3,500', '3,200', '300', '$12.00', 'Low Stock'],
        ['Steel Toe Boots (Black)', 'Footwear', '800', '785', '15', '$65.00', 'Critical'],
        ['Industrial Safety Glasses', 'Eye Protection', '2,500', '1,800', '700', '$8.25', 'Healthy'],
        ['Nitrile Gloves (Box 100)', 'Hand Protection', '5,000', '3,205', '1,795', '$22.00', 'Healthy'],
    ]
    return (
        <div className="table-card">
            <div className="table-header">
                <h3>Detailed Line-Item Breakdown</h3>
                <div className="header-controls">
                    <input placeholder="Search items..." />
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
                        <th>Item Description</th><th>Category</th><th>Purchased</th><th>Issued</th><th>Current Stock</th><th>Unit Cost</th><th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(r => (
                        <tr key={r[0]}>
                            {r.map((c, i) => (<td key={i}><span className={i === 6 ? `status ${c.replace(' ', '').toLowerCase()}` : ''}>{c}</span></td>))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">Showing 1 to 5 of 42 items</div>
        </div>
    )
}
