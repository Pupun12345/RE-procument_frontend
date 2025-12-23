import React, { useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import toast from "react-hot-toast";
import { addItem } from "../services/itemsService";
import "./mechanical.css";

export default function MechanicalRegistration() {
  const [formData, setFormData] = useState({
    itemName: "",
    unit: "",
    customUnit: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // persist item
    const unit = formData.unit === "Others (Custom)" ? formData.customUnit : formData.unit;
    addItem({ itemName: formData.itemName, unit: unit });
    toast.success("Item added successfully!");
    setFormData({ itemName: "", unit: "", customUnit: "" });
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="mechanical-container">
        <div className="mechanical-content">
          <h1 className="mechanical-title">Mechanical Registration</h1>
          <form onSubmit={handleSubmit} className="mechanical-form">
            <div className="mechanical-field">
              <label htmlFor="itemName">Item Name</label>
              <input
                type="text"
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mechanical-field">
              <label htmlFor="unit">Unit</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
              >
                <option value="">Select unit</option>
                <option value="pcs">pcs</option>
                <option value="pair">pair</option>
                <option value="mtr">mtr</option>
                <option value="Others (Custom)">Others (Custom)</option>
              </select>
            </div>
            {formData.unit === "Others (Custom)" && (
              <div className="mechanical-field">
                <label htmlFor="customUnit">Custom Unit</label>
                <input
                  type="text"
                  id="customUnit"
                  name="customUnit"
                  value={formData.customUnit}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div className="mechanical-form-actions">
              <button
                type="submit"
                className="mechanical-btn"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="mechanical-btn"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}