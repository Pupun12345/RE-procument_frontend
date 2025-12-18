import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./scaffolding-order.css";

interface MaterialRow {
  material: string;
  quantity: string;
  provider: string;
}

export default function ScaffoldingOrder() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    supervisor: "",
    employeeId: "",
    issueDate: "",
    location: "",
  });

  const [materials, setMaterials] = useState<MaterialRow[]>([
    { material: "", quantity: "", provider: "Ray Engineering" },
  ]);

  /* ---------------- Handlers ---------------- */

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addMaterial = () => {
    setMaterials([
      ...materials,
      { material: "", quantity: "", provider: "Ray Engineering" },
    ]);
    toast.success("Material row added");
  };

  const removeMaterial = (index: number) => {
    if (materials.length === 1) {
      toast.error("At least one material is required");
      return;
    }
    setMaterials(materials.filter((_, i) => i !== index));
    toast.success("Material removed");
  };

  const updateMaterial = (
    index: number,
    key: keyof MaterialRow,
    value: string
  ) => {
    const updated = [...materials];
    updated[index][key] = value;
    setMaterials(updated);
  };

  const handleCancel = () => {
    setForm({
      supervisor: "",
      employeeId: "",
      issueDate: "",
      location: "",
    });
    setMaterials([{ material: "", quantity: "", provider: "Ray Engineering" }]);
    toast("Form reset", { icon: "↩️" });
  };

  const handleSave = () => {
    // 🔴 Validation
    if (
      !form.supervisor ||
      !form.employeeId ||
      !form.issueDate ||
      !form.location
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    for (const row of materials) {
      if (!row.material || !row.quantity) {
        toast.error("Please complete all material rows");
        return;
      }
    }

    const payload = {
      ...form,
      materials,
    };

    console.log("Scaffolding Order:", payload);

    toast.success("Scaffolding order saved successfully 🎉");

    // Optional redirect
    // navigate("/dashboard");
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="scaffold-card">
      {/* Header */}
      <div className="scaffold-header">
        <h2>Scaffolding Order</h2>
        <button className="close-btn" onClick={() => navigate(-1)}>
          ✕
        </button>
      </div>

      <hr />

      <div className="scaffold-form">
        {/* Row 1 */}
        <div className="form-row">
          <div className="form-group">
            <label>
              Supervisor Name <span>*</span>
            </label>
            <input
              name="supervisor"
              value={form.supervisor}
              onChange={handleFormChange}
              placeholder="Enter supervisor name"
            />
          </div>

          <div className="form-group">
            <label>
              Employee ID <span>*</span>
            </label>
            <input
              name="employeeId"
              value={form.employeeId}
              onChange={handleFormChange}
              placeholder="Enter employee ID"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="form-row">
          <div className="form-group">
            <label>
              Issue Date <span>*</span>
            </label>
            <input
              type="date"
              name="issueDate"
              value={form.issueDate}
              onChange={handleFormChange}
            />
          </div>

          <div className="form-group">
            <label>
              Location <span>*</span>
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleFormChange}
              placeholder="Enter location"
            />
          </div>
        </div>

        {/* Materials */}
        <div className="materials-header">
          <label>
            Materials <span>*</span>
          </label>
          <button className="add-btn" onClick={addMaterial}>
            ＋ Add Material
          </button>
        </div>

        {/* Table */}
        <div className="material-table">
          <div className="table-head">
            <span>#</span>
            <span>Material Name</span>
            <span>Quantity</span>
            <span>Provider</span>
            <span>Action</span>
          </div>

          {materials.map((row, index) => (
            <div className="table-row" key={index}>
              <span>{index + 1}</span>

              <select
                value={row.material}
                onChange={(e) =>
                  updateMaterial(index, "material", e.target.value)
                }
              >
                <option value="">Select Material</option>
                <option>Scaffold Pipe</option>
                <option>Coupler</option>
                <option>Plank</option>
              </select>

              <select
                value={row.quantity}
                onChange={(e) =>
                  updateMaterial(index, "quantity", e.target.value)
                }
              >
                <option value="">Select Quantity</option>
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>

              <input value={row.provider} disabled />

              <button
                className="delete-btn"
                onClick={() => removeMaterial(index)}
                disabled={materials.length === 1}
              >
                🗑
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="form-footer">
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave}>
            💾 Save Order
          </button>
        </div>
      </div>
    </div>
  );
}
