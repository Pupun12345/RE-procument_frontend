import React, { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./mechanical.css";

export default function MechanicalRegistration() {
  const [formData, setFormData] = useState({
    itemName: "",
    unit: "",
    customUnit: "",
  });

  const [items, setItems] = useState<{ itemName: string; unit: string }[]>([]);

  // Load existing mechanical items
  useEffect(() => {
    const loadItems = async () => {
      try {
        const res = await api.get("/items/mechanical");
        setItems(res.data);
      } catch (err) {
        console.error("Error loading mechanical items:", err);
      }
    };
    loadItems();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalUnit =
      formData.unit === "Others (Custom)"
        ? formData.customUnit
        : formData.unit;

    if (!formData.itemName || !finalUnit) {
      toast.error("Please enter item name and select a unit.");
      return;
    }

    try {
      const res = await api.post("/items/mechanical", {
        itemName: formData.itemName,
        unit: finalUnit,
      });

      if (res.data.success) {
        setItems((prev) => [...prev, res.data.item]);
        setFormData({ itemName: "", unit: "", customUnit: "" });
        toast.success(`"${res.data.item.itemName}" added successfully!`);
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error("Item already exists");
      } else {
        console.error("API failed:", err);
        toast.error("Failed to add mechanical item");
      }
    }
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
                placeholder="Enter item name"
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
                  placeholder="Enter custom unit"
                  value={formData.customUnit}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="mechanical-form-actions">
              <button type="submit" className="mechanical-btn">
                Submit
              </button>
              <button
                type="button"
                className="mechanical-btn"
                onClick={() => window.history.back()}
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
