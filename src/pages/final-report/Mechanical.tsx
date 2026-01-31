import './Mechanical.css'
import ReportHeader from '../../components/ReportHeaderMechanical'
import InventoryTable from '../../components/TableMechanical'

export default function Dashboard() {
    return (
        <div className="dashboard">
            
                <ReportHeader />
                <InventoryTable />
        </div>
    )
}