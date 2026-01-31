import './PPE.css'
import ReportHeader from '../../components/ReportHeader'
import InventoryTable from '../../components/InventoryTable'

export default function Dashboard() {
    return (
        <div className="dashboard">
            
                <ReportHeader />
                <InventoryTable />
        </div>
    )
}
