import React, { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./scaffholding.css";

interface Item {
  itemName: string;
  puw: string;
  unit: string;
  customUnit?: string;
}

export default function ScaffoldingRegistration() {
  const [formData, setFormData] = useState<Item>({
    itemName: "",
    puw: "",
    unit: "",
    customUnit: "",
  });
  const [items, setItems] = useState<Item[]>([]);

  // Load scaffolding items
  useEffect(() => {
    const loadItems = async () => {
      try {
        const res = await api.get("/scaffolding-items");
        if (res.data.success) {
          setItems(res.data.items);
        } else {
          toast.error("Failed to load scaffolding items!");
        }
      } catch (err) {
        console.error("Error loading scaffolding items:", err);
        toast.error("Failed to load scaffolding items!");
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
      formData.unit === "Others (Custom)" ? formData.customUnit?.trim() : formData.unit;

    if (!formData.itemName || !formData.puw || !finalUnit) {
      toast.error("Please fill all fields before submitting.");
      return;
    }

    try {
      const res = await api.post("/scaffolding-items", {
        itemName: formData.itemName,
        puw: formData.puw,
        unit: finalUnit,
      });

      if (res.data.success) {
        setItems((prev) => [...prev, res.data.item]);
        setFormData({
          itemName: "",
          puw: "",
          unit: "",
          customUnit: "",
        });
        toast.success(`"${res.data.item.itemName}" added successfully!`);
      } else {
        toast.error("Failed to save item. " + (res.data.message || ""));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error saving item");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="scaffholding-container">
        <div className="scaffholding-content">
          <h1 className="scaffholding-title">Scaffolding Item Registration</h1>
          <form onSubmit={handleSubmit} className="scaffholding-form">
            <div className="scaffholding-field">
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
            <div className="scaffholding-field">
              <label htmlFor="puw">Per Unit Weight (PUW)</label>
              <input
                type="text"
                id="puw"
                name="puw"
                placeholder="Enter weight per unit"
                value={formData.puw}
                onChange={handleChange}
                required
              />
            </div>
            <div className="scaffholding-field">
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
              <div className="scaffholding-field">
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
            <div className="scaffholding-form-actions">
              <button type="submit" className="scaffholding-btn">Submit</button>
              <button type="button" className="scaffholding-btn" onClick={() => window.history.back()}>Back</button>
            </div>
          </form>
          <div className="scaffholding-table-section">
            <h2 className="scaffholding-table-title">Registered Materials</h2>
            <div className="scaffholding-table-wrapper">
              <table className="scaffholding-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item Name</th>
                    <th>PUW</th>
                    <th>Unit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '16px' }}>No items registered.</td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{item.itemName}</td>
                        <td>{item.puw}</td>
                        <td>{item.unit}</td>
                        <td className="scaffholding-actions-cell">
                          <button
                            className="scaffholding-edit-btn"
                            onClick={() => alert('Edit functionality to be implemented')}
                          >
                            Edit
                          </button>
                          <button
                            className="scaffholding-delete-btn"
                            onClick={() => alert('Delete functionality to be implemented')}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}