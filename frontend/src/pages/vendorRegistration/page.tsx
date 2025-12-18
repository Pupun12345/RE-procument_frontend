import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import "./VendorRegistration.css";

interface Vendor {
  partyName: string;
  address: string;
  gstNumber: string;
  contactNumber: string;
}

export default function VendorForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Vendor>({
    partyName: '',
    address: '',
    gstNumber: '',
    contactNumber: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = "http://localhost:5000"; // API URL
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`${url}/api/vendors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        toast.error('Failed to register vendor');
        return;
      }
      
      toast.success('Vendor registered successfully!');
      // Reset form after submission
      setFormData({
        partyName: '',
        address: '',
        gstNumber: '',
        contactNumber: ''
      });
    } catch (error) {
      console.error('Error submitting vendor:', error);
      toast.error('Server error. Please try again.');
    }
  };

  const handleEditClick = () => {
    // Navigate to gateway page
    navigate('/dashboard/vendor-gateway');
  };

  const handleBackClick = () => {
    // Navigate back
    navigate(-1);
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)' }}>
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative">
        {/* Header */}
        <div className="flex items-center justify-center mb-8 relative">
          <h1 className="text-gray-800">Vendor Registration</h1>
          <button
            type="button"
            onClick={handleEditClick}
            className="absolute right-0 text-gray-400 hover:text-blue-500 transition-colors p-1"
            title="Go to Vendor Gateway"
          >
            <FaEdit className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Party Name */}
          <div className="space-y-2">
            <label htmlFor="partyName" className="block text-sm font-medium text-gray-700">
              Party Name <span className="text-red-500">*</span>
            </label>
            <input
              id="partyName"
              type="text"
              placeholder="Enter party name"
              value={formData.partyName}
              onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              placeholder="Enter full address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              rows={4}
            />
          </div>

          {/* GST Number */}
          <div className="space-y-2">
            <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700">
              GST Number <span className="text-red-500">*</span>
            </label>
            <input
              id="gstNumber"
              type="text"
              placeholder="Enter your 15 character GST number"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={15}
              required
            />
          </div>

          {/* Contact Number */}
          <div className="space-y-2">
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              id="contactNumber"
              type="tel"
              placeholder="Enter your 10 digit contact number"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={10}
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 mt-8">
            <button
              type="button"
              onClick={handleBackClick}
              className="px-6 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors h-10"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 h-10 px-6 py-2 rounded-md text-white font-medium transition-colors"
              style={{ backgroundColor: '#9333ea' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7e22ce'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#9333ea'}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}

