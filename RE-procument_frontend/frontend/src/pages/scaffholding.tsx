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
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-10">
        <h1 className="text-2xl font-bold mb-6 text-center">Scaffolding Item Registration</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ...existing form fields... */}
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
            <label htmlFor="puw" className="block font-medium mb-1">Per Unit Weight (PUW)</label>
            <input
              type="text"
              id="puw"
              name="puw"
              placeholder="Enter weight per unit"
              value={formData.puw}
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
              <option value="">Select unit</option>
              <option value="pcs">pcs</option>
              <option value="pair">pair</option>
              <option value="mtr">mtr</option>
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

        {/* --- Materials Section --- */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4">Registered Materials</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Item Name</th>
                  <th className="px-4 py-2 text-left">PUW</th>
                  <th className="px-4 py-2 text-left">Unit</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">No items registered.</td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2">{idx + 1}</td>
                      <td className="px-4 py-2">{item.itemName}</td>
                      <td className="px-4 py-2">{item.puw}</td>
                      <td className="px-4 py-2">{item.unit}</td>
                      <td className="px-4 py-2">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2"
                          onClick={() => alert('Edit functionality to be implemented')}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
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
    </ProtectedRoute>
  );
}