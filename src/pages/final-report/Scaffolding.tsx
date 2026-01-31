import './Scaffolding.css'
import ReportHeader from '../../components/ReportHeaderScaffolding'
import InventoryTable from '../../components/TableScafolding'

export default function Dashboard() {
    return (
        <div className="dashboard">
            
                <ReportHeader />
                <InventoryTable />
        </div>
    )
}