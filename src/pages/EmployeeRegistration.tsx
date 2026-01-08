import { useState } from "react";
import { toast } from "react-hot-toast";
import "./employee-registration.css";
import api from "../api/axios";

interface EmployeeFormData {
  employeeName: string;
  employeeCode: string;
  spNumber: string;
  designation: string;
  customDesignation: string;
  emailId: string;
  mobileNumber: string;
  panCardNumber: string;
  aadharCardNumber: string;
  safetyPassNumber: string;
  emergencyContactNumber: string;
  dateOfJoining: string;
  dateOfBirth: string;
  fatherName: string;
  fatherContactNumber: string;
  bankName: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  epfoNumber: string;
  esiNumber: string;
  address: string;
  employeePhoto: File | null;
}

export default function EmployeeRegistration() {
  const [formData, setFormData] = useState<EmployeeFormData>({
    employeeName: "",
    employeeCode: "",
    spNumber: "",
    designation: "",
    customDesignation: "",
    emailId: "",
    mobileNumber: "",
    panCardNumber: "",
    aadharCardNumber: "",
    safetyPassNumber: "",
    emergencyContactNumber: "",
    dateOfJoining: "",
    dateOfBirth: "",
    fatherName: "",
    fatherContactNumber: "",
    bankName: "",
    bankAccountNumber: "",
    bankIfscCode: "",
    epfoNumber: "",
    esiNumber: "",
    address: "",
    employeePhoto: null,
  });

  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleInputChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "designation" && value !== "Others (Custom)"
        ? { customDesignation: "" }
        : {}),
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, employeePhoto: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEmployee = () => {
    const {
      employeeName,
      employeeCode,
      spNumber,
      emailId,
      mobileNumber,
      dateOfJoining,
      address,
    } = formData;
    if (
      !employeeName ||
      !employeeCode ||
      !spNumber ||
      !emailId ||
      !mobileNumber ||
      !dateOfJoining ||
      !address
    ) {
      toast.error("⚠️ Please fill all required fields.");
      return;
    }
    if (
      formData.designation === "Others (Custom)" &&
      !formData.customDesignation
    ) {
      toast.error("⚠️ Please enter custom designation.");
      return;
    }
    setShowConfirm(true);
  };
  const finalDesignation =
    formData.designation === "Others (Custom)"
      ? formData.customDesignation
      : formData.designation;

  const handleConfirmSave = async () => {
    try {
      const fd = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "customDesignation") return; // ❌ do not send separately
        if (value === null || value === "") return;

        if (value instanceof File) {
          fd.append(key, value);
        } else {
          fd.append(key, String(value));
        }
      });

      // ✅ force correct designation value
      if (finalDesignation) {
        fd.set("designation", finalDesignation);
      }

      await api.post("/employees", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Employee registered successfully!");
      setShowConfirm(false);
    } catch {
      toast.error("Failed to register employee");
    }
  };
  const DESIGNATIONS = [
    "Manager",
    "Engineer",
    "Supervisor",
    "Technician",
    "Operator",
    "Others (Custom)",
  ];

  const handleCancelConfirm = () => {
    setShowConfirm(false);
  };

  const handleBack = () => {
    console.log("Going back");
  };
  return (
    <div className="employee-reg-container">
      <div className="employee-reg-content">
        <h1 className="employee-reg-title">Employee Registration Form</h1>

        <div className="employee-reg-form">
          {/* Left Column */}
          <div className="employee-reg-left-column">
            <div className="employee-reg-field">
              <label>
                Employee Name{" "}
                <span className="required" style={{ color: "red" }}>
                  *
                </span>
              </label>
              <input
                type="text"
                placeholder="Enter employee name"
                value={formData.employeeName}
                onChange={(e) =>
                  handleInputChange("employeeName", e.target.value)
                }
              />
            </div>

            <div className="employee-reg-field">
              <label>
                Employee Code{" "}
                <span className="required" style={{ color: "red" }}>
                  *
                </span>
              </label>
              <input
                type="text"
                placeholder="Enter employee code"
                value={formData.employeeCode}
                onChange={(e) =>
                  handleInputChange("employeeCode", e.target.value)
                }
              />
            </div>
            <div className="employee-reg-field">
              <label>
                SP Number{" "}
                <span className="required" style={{ color: "red" }}>
                  *
                </span>
              </label>
              <input
                type="text"
                placeholder="Enter SP number"
                value={formData.spNumber}
                onChange={(e) => handleInputChange("spNumber", e.target.value)}
              />
            </div>

            <div className="employee-reg-field">
              <label>
                Designation{" "}
                <span className="required" style={{ color: "red" }}>
                  *
                </span>
              </label>
              <select
                value={formData.designation}
                onChange={(e) =>
                  handleInputChange("designation", e.target.value)
                }
              >
                <option value="">Select designation</option>

                {DESIGNATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            {formData.designation === "Others (Custom)" && (
              <div className="employee-reg-field">
                <label>
                  Custom Designation{" "}
                  <span className="required" style={{ color: "red" }}>
                    *
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Enter custom designation"
                  value={formData.customDesignation}
                  onChange={(e) =>
                    handleInputChange("customDesignation", e.target.value)
                  }
                />
              </div>
            )}

            <div className="employee-reg-field">
              <label>
                Mobile Number{" "}
                <span className="required" style={{ color: "red" }}>
                  *
                </span>
              </label>
              <input
                type="tel"
                placeholder="Enter 10 digit mobile number"
                value={formData.mobileNumber}
                onChange={(e) =>
                  handleInputChange("mobileNumber", e.target.value)
                }
                maxLength={10}
              />
            </div>

            <div className="employee-reg-field">
              <label>Aadhar Card Number</label>
              <input
                type="text"
                placeholder="Enter 12 digit Aadhar number"
                value={formData.aadharCardNumber}
                onChange={(e) =>
                  handleInputChange("aadharCardNumber", e.target.value)
                }
                maxLength={12}
              />
            </div>

            <div className="employee-reg-field">
              <label>Emergency Contact Number</label>
              <input
                type="tel"
                placeholder="Enter 10 digit emergency contact"
                value={formData.emergencyContactNumber}
                onChange={(e) =>
                  handleInputChange("emergencyContactNumber", e.target.value)
                }
                maxLength={10}
              />
            </div>

            <div className="employee-reg-field">
              <label>Date of Birth</label>
              <input
                type="date"
                placeholder="mm/dd/yyyy"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  handleInputChange("dateOfBirth", e.target.value)
                }
              />
            </div>
            <div className="employee-reg-field">
              <label>Father's Name</label>
              <input
                type="text"
                placeholder="Enter father's name"
                value={formData.fatherName}
                onChange={(e) =>
                  handleInputChange("fatherName", e.target.value)
                }
              />
            </div>

            <div className="employee-reg-field">
              <label>Father's Contact Number</label>
              <input
                type="tel"
                placeholder="Enter 10 digit father's contact"
                value={formData.fatherContactNumber}
                onChange={(e) =>
                  handleInputChange("fatherContactNumber", e.target.value)
                }
                maxLength={10}
              />
            </div>

            <div className="employee-reg-field employee-reg-address">
              <label>
                Address{" "}
                <span className="required" style={{ color: "red" }}>
                  *
                </span>
              </label>
              <textarea
                placeholder="Enter complete address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="employee-reg-right-column">
            <div className="employee-reg-photo-section">
              <label>Employee Photo</label>
              <div className="employee-reg-photo-upload">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Employee"
                    className="employee-reg-photo-preview"
                  />
                ) : (
                  <div className="employee-reg-photo-placeholder">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  id="photo-upload"
                  className="employee-reg-photo-input"
                />
                <label
                  htmlFor="photo-upload"
                  className="employee-reg-photo-label"
                >
                  Click to upload photo
                </label>
              </div>
            </div>

            <div className="employee-reg-field">
              <label>
                Email ID{" "}
                <span className="required" style={{ color: "red" }}>
                  *
                </span>
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                value={formData.emailId}
                onChange={(e) => handleInputChange("emailId", e.target.value)}
              />
            </div>

            <div className="employee-reg-field">
              <label>PAN Card Number</label>
              <input
                type="text"
                placeholder="Enter PAN number (e.g., ABCDE1234F)"
                value={formData.panCardNumber}
                onChange={(e) =>
                  handleInputChange("panCardNumber", e.target.value)
                }
                maxLength={10}
              />
            </div>

            <div className="employee-reg-field">
              <label>Safety Pass Number</label>
              <input
                type="text"
                placeholder="Enter safety pass number"
                value={formData.safetyPassNumber}
                onChange={(e) =>
                  handleInputChange("safetyPassNumber", e.target.value)
                }
              />
            </div>

            <div className="employee-reg-field">
              <label>
                Date of Joining{" "}
                <span className="required" style={{ color: "red" }}>
                  *
                </span>
              </label>
              <input
                type="date"
                placeholder="mm/dd/yyyy"
                value={formData.dateOfJoining}
                onChange={(e) =>
                  handleInputChange("dateOfJoining", e.target.value)
                }
              />
            </div>
            <div className="employee-reg-field">
              <label>Bank Name</label>
              <input
                type="text"
                placeholder="Enter bank name"
                value={formData.bankName}
                onChange={(e) => handleInputChange("bankName", e.target.value)}
              />
            </div>

            <div className="employee-reg-field">
              <label>Bank A/C Number</label>
              <input
                type="text"
                placeholder="Enter bank account number"
                value={formData.bankAccountNumber}
                onChange={(e) =>
                  handleInputChange("bankAccountNumber", e.target.value)
                }
              />
            </div>

            <div className="employee-reg-field">
              <label>Bank IFSC Code</label>
              <input
                type="text"
                placeholder="Enter IFSC code"
                value={formData.bankIfscCode}
                onChange={(e) =>
                  handleInputChange("bankIfscCode", e.target.value)
                }
                maxLength={11}
              />
            </div>
            <div className="employee-reg-field">
              <label>EPFO Number</label>
              <input
                type="text"
                placeholder="Enter EPFO number (optional)"
                value={formData.epfoNumber}
                onChange={(e) =>
                  handleInputChange("epfoNumber", e.target.value)
                }
              />
            </div>
            <div className="employee-reg-field">
              <label>ESI Number</label>
              <input
                type="text"
                placeholder="Enter ESI number (optional)"
                value={formData.esiNumber}
                onChange={(e) => handleInputChange("esiNumber", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="employee-reg-buttons">
          <button
            className="employee-reg-back-btn"
            onClick={handleBack}
            type="button"
          >
            Back
          </button>
          <button
            className="employee-reg-save-btn"
            onClick={handleSaveEmployee}
            type="button"
          >
            Save Employee
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 8,
              padding: 32,
              minWidth: 320,
              boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginBottom: 16 }}>Confirm Registration</h2>
            <p style={{ marginBottom: 24 }}>
              Are you sure you want to register{" "}
              <b>{formData.employeeName || "this employee"}</b>?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              <button
                onClick={handleCancelConfirm}
                style={{
                  padding: "8px 20px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  background: "#f3f4f6",
                  color: "#374151",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                style={{
                  padding: "8px 20px",
                  borderRadius: 4,
                  border: "none",
                  background: "#6366F1",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
