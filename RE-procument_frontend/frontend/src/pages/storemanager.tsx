import { ArrowLeft, ClipboardList, ShoppingCart, PackageOpen, Truck, RotateCcw, ShoppingBag, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import './storemanager.css';

export function StoreManager() {
  const navigate = useNavigate();
  const { logout, username, role } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/', { replace: true });
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const modules = [
    {
      id: 2,
      title: 'Material purchase',
      description: 'Manage material purchases and procurement',
      icon: ShoppingCart,
      color: 'bg-green-500',
      action: 'Open Material Purchase',
      onClick: () => {
        toast.info('Material Purchase - Coming Soon');
      }
    },
    {
      id: 3,
      title: 'Material issue',
      description: 'Issue materials from inventory',
      icon: PackageOpen,
      color: 'bg-orange-500',
      action: 'Open Material Issue',
     
    },
    {
      id: 4,
      title: 'Material orders',
      description: 'View and manage material orders',
      icon: ShoppingBag,
      color: 'bg-red-500',
      action: 'Open Material Orders',
      onClick: () => {
        navigate('/dashboard/material-order/scaffolding');
      }
    },
    {
      id: 5,
      title: 'Material return',
      description: 'Manage material returns and refunds',
      icon: RotateCcw,
      color: 'bg-cyan-500',
      action: 'Open Material Return',
      onClick: () => {
        toast.info('Material Return - Coming Soon');
      }
    },
    {
      id: 6,
      title: 'Material report',
      description: 'View stock levels and inventory reports',
      icon: BarChart3,
      color: 'bg-blue-600',
      action: 'Open Material Report',
      onClick: () => {
        toast.info('Material Report - Coming Soon');
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Store Management</h1>
          <p className="text-gray-600 mb-6">
            Manage inventory, stock levels, and store operations
          </p>
          
          <button 
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-3 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <div key={module.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className={`${module.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="text-white" size={24} />
                </div>
                
                <h3 className="text-gray-900 mb-2">{module.title}</h3>
                <p className="text-sm text-gray-600 mb-6 min-h-[40px]">{module.description}</p>
                
                <button 
                  onClick={module.onClick}
                  className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {module.action}
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
