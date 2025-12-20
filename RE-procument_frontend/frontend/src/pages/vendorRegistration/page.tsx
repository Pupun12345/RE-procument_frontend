
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
      <div className="vendor-reg-container">
        <div className="vendor-reg-content">
          {/* Header */}
          <div className="vendor-reg-header">
            <h1 className="vendor-reg-title">Vendor Registration</h1>
            <button
              type="button"
              onClick={handleEditClick}
              className="vendor-reg-gateway-btn"
              title="Go to Vendor Gateway"
            >
              <FaEdit className="vendor-reg-gateway-icon" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="vendor-reg-form">
            {/* Party Name */}
            <div className="vendor-reg-field">
              <label htmlFor="partyName">
                Party Name <span className="vendor-reg-required">*</span>
              </label>
              <input
                id="partyName"
                type="text"
                placeholder="Enter party name"
                value={formData.partyName}
                onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                required
              />
            </div>

            {/* Address */}
            <div className="vendor-reg-field">
              <label htmlFor="address">
                Address <span className="vendor-reg-required">*</span>
              </label>
              <textarea
                id="address"
                placeholder="Enter full address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                rows={4}
              />
            </div>

            {/* GST Number */}
            <div className="vendor-reg-field">
              <label htmlFor="gstNumber">
                GST Number <span className="vendor-reg-required">*</span>
              </label>
              <input
                id="gstNumber"
                type="text"
                placeholder="Enter your 15 character GST number"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                maxLength={15}
                required
              />
            </div>

            {/* Contact Number */}
            <div className="vendor-reg-field">
              <label htmlFor="contactNumber">
                Contact Number <span className="vendor-reg-required">*</span>
              </label>
              <input
                id="contactNumber"
                type="tel"
                placeholder="Enter your 10 digit contact number"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                maxLength={10}
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="vendor-reg-buttons">
              <button
                type="button"
                onClick={handleBackClick}
                className="vendor-reg-back-btn"
              >
                Back
              </button>
              <button
                type="submit"
                className="vendor-reg-save-btn"
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

