import React, { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./ppe.css";

export default function OldRegistrationRegistration() {
  const [formData, setFormData] = useState({
    itemName: "",
    unit: "",
    customUnit: "",
  });
  const [items, setItems] = useState<{ itemName: string; unit: string }[]>([]);
  const [selectedItem, setSelectedItem] = useState("");

  // Load existing items (optional - can be removed if not needed)
  useEffect(() => {
    const loadItems = async () => {
      try {
        const res = await api.get("/old-items");
        setItems(res.data);
      } catch (err) {
        // Silently fail for now
        console.error("Error loading items:", err);
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
      formData.unit === "Others (Custom)" ? formData.customUnit : formData.unit;

    if (!formData.itemName || !finalUnit) {
      toast.error("Please enter item name and select a unit.");
      return;
    }

    try {
      const res = await api.post("/old-items", {
        itemName: formData.itemName,
        unit: finalUnit,
      });

      if (res.data.success) {
        setItems((prev) => [...prev, res.data.item]);
        setFormData({ itemName: "", unit: "", customUnit: "" });
        setSelectedItem("");
        toast.success(`"${res.data.item.itemName}" added successfully!`);
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error("Item already exists");
      } else {
        console.error("API failed:", err);
        toast.error("Failed to add old registration item");
      }
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="ppe-container">
        <div className="ppe-content">
          <h1 className="ppe-title">Old Registration</h1>
          <form onSubmit={handleSubmit} className="ppe-form">
            <div className="ppe-field">
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
            <div className="ppe-field">
              <label htmlFor="unit">Unit</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
              >
                <option value="">Select a unit</option>
                <option value="Pieces">Pieces</option>
                <option value="Pairs">Pairs</option>
                <option value="Kg">Kg</option>
                <option value="Liters">Liters</option>
                <option value="Others (Custom)">Others (Custom)</option>
              </select>
            </div>
            {formData.unit === "Others (Custom)" && (
              <div className="ppe-field">
                <label htmlFor="customUnit">Custom Unit</label>
                <input
                  type="text"
                  id="customUnit"
                  name="customUnit"
                  placeholder="Enter your custom unit"
                  value={formData.customUnit}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div className="ppe-form-actions">
              <button type="submit" className="ppe-btn">
                Submit
              </button>
              <button
                type="button"
                className="ppe-btn"
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
