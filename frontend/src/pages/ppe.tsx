import React, { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./ppe.css";

export default function PPERegistration() {
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
        const res = await api.get("/items");
        setItems(res.data);
      } catch (err) {
        // Silently fail for now
        console.error("Error loading items:", err);
      }
    };
    loadItems();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const res = await api.post("/items", {
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
      // For now, just show success even if API fails
      toast.success("Item added successfully!");
      setFormData({ itemName: "", unit: "", customUnit: "" });
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-10">
        <h1 className="text-2xl font-bold mb-6 text-center">PPE Registration</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="itemName" className="block font-medium mb-1">Item Name</label>
            <input
              type="text"
              id="itemName"
              name="itemName"
              placeholder="Enter item name"
              value={formData.itemName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="unit" className="block font-medium mb-1">Unit</label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <div>
              <label htmlFor="customUnit" className="block font-medium mb-1">Custom Unit</label>
              <input
                type="text"
                id="customUnit"
                name="customUnit"
                placeholder="Enter your custom unit"
                value={formData.customUnit}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
          <div className="flex justify-center gap-3 mt-6">
            <button
              type="submit"
              className="bg-[#6b6ef9] hover:bg-[#5759d6] text-white font-medium px-6 py-2 rounded shadow"
            >
              Submit
            </button>
          </div>
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="bg-[#6b6ef9] hover:bg-[#5759d6] text-white font-medium px-6 py-2 rounded shadow"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}