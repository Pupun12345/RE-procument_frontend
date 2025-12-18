import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./employee-form.css";
import "./employee-registration.css";

/* ================= TYPES ================= */

interface EmployeeForm {
  name: string;
  email: string;
  designation: string;
  dateOfJoining: string;
  mobileNumber: string;
  alternateMobileNumber: string;
  aadharCard: string;
  panCard: string;
  employeeCode: string;
  fatherName: string;
  fatherMobileNumber: string;
  safetyPassNumber: string;
  ifscCode: string;
  accountNumber: string;
  address: string;
}

/* ================= FIELD ================= */

interface FieldProps {
  label: string;
  name: keyof EmployeeForm;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: FieldProps) {
  return (
    <div className="erp-field">
      <label>
        {label} {required && <span>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

/* ================= MAIN ================= */

export default function EmployeeRegistration() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    emailId: '',
    employeeCode: '',
    panNo: '',
    aadharNo: '',
    safetyPassNo: '',
    contactNumber: '',
    address: '',
    dateOfJoining: '',
    dateOfBirth: '',
    bankAccountNumber: '',
    bankName: '',
    ifscCode: '',
    designation: '',
    emergencyContact: '',
    fatherName: '',
    fatherContact: ''
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Show confirmation dialog instead of submitting directly
    setShowConfirmDialog(true);
  };

  const handleConfirmRegistration = () => {
    console.log('Form submitted:', formData);
    toast.success(`Employee registered successfully! ${formData.employeeName} has been added to the system.`, {
      duration: 4000,
    });
    setShowConfirmDialog(false);
    // Navigate to dashboard after successful registration
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmDialog(false);
  };

  const handleCancel = () => {
    // Go back to previous page using React Router
    navigate(-1);
  };

  const handleDashboardClick = () => {
    // Navigate to dashboard using React Router
    navigate('/dashboard');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    // Dispatch event to notify DashboardLayout
    window.dispatchEvent(new CustomEvent('toggleSidebar'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)' }}>
      <div className="bg-white rounded-lg shadow-lg w-full p-4 sm:p-6 md:p-8 relative" style={{ flexBasis: '80%', maxWidth: '95%' }}>
        {/* Heading Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-gray-800 text-center text-xl sm:text-2xl md:text-3xl font-bold">Employee Registration Form</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* Employee Name */}
            <div className="space-y-2">
              <label htmlFor="employeeName" className="employee-form-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Employee Name <span className="text-red-500">*</span>
              </label>
              <input
                id="employeeName"
                type="text"
                placeholder="Enter employee name"
                value={formData.employeeName}
                onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                required
                className="employee-form-input"
              />
            </div>

            {/* Photo Upload Section - Top Right */}
            <div className="row-span-2 space-y-2 flex flex-col items-center justify-center">
              <label className="employee-form-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70 self-center">Employee Photo</label>
              <div className="relative employee-photo-upload">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Employee"
                    className="w-32 h-32 object-cover rounded border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400 text-2xl">📷</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs text-gray-500 text-center">Click to upload photo</p>
            </div>

            {/* Employee Code */}
            <div className="space-y-2">
              <label htmlFor="employeeCode" className="employee-form-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Employee Code <span className="text-red-500">*</span>
              </label>
              <input
                id="employeeCode"
                type="text"
                placeholder="Enter employee code"
                value={formData.employeeCode}
                onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                required
                className="employee-form-input"
              />
            </div>

            {/* Designation */}
            <div className="space-y-2">
              <label htmlFor="designation" className="employee-form-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Designation
              </label>
              <select
                id="designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="employee-form-select"
              >
                <option value="">Select designation</option>
                <option value="management">Management</option>
                <option value="supervisor">Supervisor</option>
                <option value="in-charge">In-charge</option>
                <option value="hr">HR</option>
                <option value="it">IT</option>
                <option value="workers">Workers</option>
              </select>
            </div>

            {/* Email ID */}
            <div className="space-y-2">
              <label htmlFor="emailId" className="employee-form-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email ID <span className="text-red-500">*</span>
              </label>
              <input
                id="emailId"
                type="email"
                placeholder="Enter email address"
                value={formData.emailId}
                onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                required
                className="employee-form-input"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label htmlFor="contactNumber" className="employee-form-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                id="contactNumber"
                type="tel"
                placeholder="Enter 10 digit mobile number"
                value={formData.contactNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                  setFormData({ ...formData, contactNumber: value });
                }}
                maxLength={10}
                pattern="[0-9]{10}"
                required
                className="employee-form-input"
              />
            </div>

            {/* PAN Card Number */}
            <div className="space-y-2">
              <label htmlFor="panNo" className="employee-form-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                PAN Card Number
              </label>
              <input
                id="panNo"
                type="text"
                placeholder="Enter PAN number (e.g., ABCDE1234F)"
                value={formData.panNo}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
                  setFormData({ ...formData, panNo: value });
                }}
                maxLength={10}
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                className="employee-form-input"
              />
            </div>

            {/* Aadhar Card Number */}
            <div className="space-y-2">
              <label htmlFor="aadharNo" className="employee-form-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Aadhar Card Number
              </label>
              <input
                id="aadharNo"
                type="tel"
                placeholder="Enter 12 digit Aadhar number"
                value={formData.aadharNo}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                  setFormData({ ...formData, aadharNo: value });
                }}
                maxLength={12}
                pattern="[0-9]{12}"
                className="employee-form-input"
              />
            </div>

            {/* Safety Pass Number */}
            <div className="space-y-2">
              <label htmlFor="safetyPassNo" className="employee-form-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Safety Pass Number
              </label>
              <input
                id="safetyPassNo"
                type="text"
                placeholder="Enter safety pass number"
                value={formData.safetyPassNo}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().slice(0, 20);
                  setFormData({ ...formData, safetyPassNo: value });
                }}
                maxLength={20}
                className="employee-form-input"
              />
            </div>

            {/* Emergency Contact Number */}
            <div className="space-y-2">
              <label htmlFor="emergencyContact" className="employee-form-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Emergency Contact Number
              </label>
              <input
                id="emergencyContact"
                type="tel"
                placeholder="Enter 10 digit emergency contact"
                value={formData.emergencyContact}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                  setFormData({ ...formData, emergencyContact: value });
                }}
                maxLength={10}
                pattern="[0-9]{10}"
                className="employee-form-input"
              />
            </div>

            {/* Date of Joining */}
            <div className="space-y-2">
              <label htmlFor="dateOfJoining" className="employee-form-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Date of Joining <span className="text-red-500">*</span>
              </label>
              <input
                id="dateOfJoining"
                type="date"
                value={formData.dateOfJoining}
                onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                required
                className="employee-form-input"
              />
            </div>
            {/* Date of Birth */}
            <div className="space-y-2">
              <label htmlFor="dateOfBirth" className="employee-form-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="employee-form-input"
              />
            </div>

            {/* Father's Name */}
            <div className="space-y-2">
              <label htmlFor="fatherName" className="employee-form-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Father's Name
              </label>
              <input
                id="fatherName"
                type="text"
                placeholder="Enter father's name"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                className="employee-form-input"
              />
            </div>

            {/* Father's Contact Number */}
            <div className="space-y-2">
              <label htmlFor="fatherContact" className="employee-form-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Father's Contact Number
              </label>
              <input
                id="fatherContact"
                type="tel"
                placeholder="Enter 10 digit father's contact"
                value={formData.fatherContact}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                  setFormData({ ...formData, fatherContact: value });
                }}
                maxLength={10}
                pattern="[0-9]{10}"
                className="employee-form-input"
              />
            </div>

            {/* Bank Name */}
            <div className="space-y-2">
              <label htmlFor="bankName" className="employee-form-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Bank Name
              </label>
              <input
                id="bankName"
                type="text"
                placeholder="Enter bank name"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="employee-form-input"
              />
            </div>

            {/* Bank Account Number */}
            <div className="space-y-2">
              <label htmlFor="bankAccountNumber" className="employee-form-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Bank A/C Number
              </label>
              <input
                id="bankAccountNumber"
                type="tel"
                placeholder="Enter bank account number"
                value={formData.bankAccountNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 18);
                  setFormData({ ...formData, bankAccountNumber: value });
                }}
                maxLength={18}
                className="employee-form-input"
              />
            </div>

            {/* IFSC Code */}
            <div className="space-y-2">
              <label htmlFor="ifscCode" className="employee-form-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Bank IFSC Code
              </label>
              <input
                id="ifscCode"
                type="text"
                placeholder="Enter IFSC code"
                value={formData.ifscCode}
                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                className="employee-form-input"
              />
            </div>

            {/* Address - Full Width */}
            <div className="col-span-2 space-y-2">
              <label htmlFor="address" className="employee-form-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                placeholder="Enter complete address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                rows={4}
                className="employee-form-textarea"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 border bg-[#6b6ef9] text-white hover:bg-[#5759d6] hover:border-[#5759d6]"
            >
              <span>←</span>
              Back
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-[#6b6ef9] hover:bg-[#5759d6] text-white"
            >
              💾 Save Employee
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancelConfirmation}
          />
          
          {/* Dialog */}
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 z-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <span className="text-2xl">💾</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Registration
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to register <strong>{formData.employeeName || 'this employee'}</strong>? 
                This action will save all the employee details to the system.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancelConfirmation}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 border bg-background text-foreground hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRegistration}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                💾 Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
