import './ReportHeader.css'
export default function ReportHeader() {
    return (
        <div className="report-header">
            <div>
                <h2>PPE Final Report</h2>
                <p>Consolidated overview of Personal Protective Equipment inventory and distribution.</p>
            </div>
            <div className="actions">
                <button className="btn">Export PDF</button>
                <button className="btn danger">Refresh Data</button>
            </div>
        </div>
    )
}