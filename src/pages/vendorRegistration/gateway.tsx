import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, Edit, Trash2, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './gateway.css';

interface Party {
  id: string;
  name: string;
  address: string;
  gst: string;
  contact: string;
  publishedDate?: string;
}

export function VendorGateway() {
  const navigate = useNavigate();
  const [parties, setParties] = useState<Party[]>([]);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Filter states
  const [gstFilter, setGstFilter] = useState<string>("");
  const [contactFilter, setContactFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    gst: "",
    contact: "",
    start: null as Date | null,
    end: null as Date | null,
  });

  const url = "http://localhost:5000"; // Replace with your API URL

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      const token = localStorage.getItem("token");
      
      try {
        const res = await fetch(`${url}/api/vendors`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        
        if (!res.ok) {
          console.error("Failed to fetch vendors");
          return;
        }

        const data = await res.json();
        const vendorList = Array.isArray(data) ? data : data.vendors || [];

        setParties(
          vendorList.map((v) => ({
            id: v._id,
            name: v.partyName,
            address: v.address,
            gst: v.gstNumber,
            contact: v.contactNumber,
            publishedDate: v.publishedDate
              ? new Date(v.publishedDate).toISOString().split("T")[0]
              : "",
          }))
        );
      } catch (err) {
        console.error("Error fetching vendors:", err);
      }
    };

    fetchVendors();
  }, []);

  // Delete vendor
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${url}/api/vendors/${id}`, {
        method: "DELETE",
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      
      if (!res.ok) {
        alert("Delete failed");
        return;
      }
      
      alert("Vendor deleted successfully!");
      setParties((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting vendor:", error);
      alert("Server Error");
    }
  };

  // Edit handlers
  const handleEdit = (party: Party) => setEditingParty({ ...party });

  const handleSaveEdit = async () => {
    if (!editingParty) return;
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`${url}/api/vendors/${editingParty.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          partyName: editingParty.name,
          address: editingParty.address,
          gstNumber: editingParty.gst,
          contactNumber: editingParty.contact,
        }),
      });
      
      if (!res.ok) {
        alert("Update failed");
        return;
      }
      
      alert("Vendor updated successfully!");
      setParties((prev) =>
        prev.map((p) => (p.id === editingParty.id ? { ...editingParty } : p))
      );
      setEditingParty(null);
    } catch (error) {
      console.error("Error updating vendor:", error);
      alert("Server Error");
    }
  };

  // CSV Download
  const handleDownloadCSV = () => {
    const headers = ["Party Name", "Address", "GST", "Contact", "Published Date"];
    const rows = filteredParties.map((p) => [
      p.name,
      p.address,
      p.gst,
      p.contact,
      p.publishedDate || "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "vendors.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logic
  const handlePreset = (days: number) => {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - days);
    setStartDate(past);
    setEndDate(today);
  };

  const handleSubmitFilter = () => {
    setAppliedFilters({
      gst: gstFilter,
      contact: contactFilter,
      start: startDate,
      end: endDate,
    });
    setShowFilter(false);
  };

  const handleClearFilters = () => {
    setGstFilter("");
    setContactFilter("");
    setStartDate(null);
    setEndDate(null);
    setAppliedFilters({
      gst: "",
      contact: "",
      start: null,
      end: null,
    });
  };

  const filteredParties = parties.filter((party) => {
    const matchesSearch = party.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesGst = appliedFilters.gst
      ? party.gst.toLowerCase().includes(appliedFilters.gst.toLowerCase())
      : true;
    const matchesContact = appliedFilters.contact
      ? party.contact.includes(appliedFilters.contact)
      : true;
    let matchesDate = true;
    if (appliedFilters.start && appliedFilters.end && party.publishedDate) {
      const pubDate = new Date(party.publishedDate);
      matchesDate =
        pubDate >= appliedFilters.start && pubDate <= appliedFilters.end;
    }
    return matchesSearch && matchesGst && matchesContact && matchesDate;
  });

  const handleVendorRegistration = () => {
    navigate('/dashboard/registration/vendor');
  };

  const handleFilter = () => {
    setShowFilter(true);
  };

  return (
    <div className="gateway-container">
      <div className="gateway-content">
        {/* Header */}
        <div className="gateway-header">
          <h1 className="gateway-title">VENDOR GATEWAY</h1>
        </div>

        {/* Search and Actions Bar */}
        <div className="gateway-actions-bar">
          <div className="gateway-search-wrapper">
            <span className="gateway-search-icon"><Search /></span>
            <input
              type="text"
              placeholder="Search by party name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="gateway-search-input"
            />
          </div>
          <button
            onClick={handleVendorRegistration}
            className="gateway-action-btn"
          >
            Vendor Registration
          </button>
          <button
            onClick={handleDownloadCSV}
            className="gateway-action-btn"
          >
            <span className="gateway-action-icon"><Download /></span>
            Download CSV
          </button>
          <button
            onClick={handleFilter}
            className="gateway-action-btn"
          >
            <span className="gateway-action-icon"><Filter /></span>
            Filter
          </button>
        </div>

        {/* Party List Section */}
        <div className="gateway-list-section">
          <h2 className="gateway-list-title">PARTY LIST</h2>
          {filteredParties.length > 0 ? (
            <div className="gateway-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Party Name</th>
                    <th>Address</th>
                    <th>GST</th>
                    <th>Contact</th>
                    <th>Published Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParties.map((party) => (
                    <tr key={party.id}>
                      <td>{party.name}</td>
                      <td>{party.address}</td>
                      <td>{party.gst}</td>
                      <td>{party.contact}</td>
                      <td>{party.publishedDate}</td>
                      <td className="gateway-actions-cell">
                        <button
                          onClick={() => handleEdit(party)}
                          title="Edit"
                        >
                          <Edit />
                        </button>
                        <button
                          onClick={() => handleDelete(party.id)}
                          title="Delete"
                        >
                          <Trash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="gateway-empty">No vendors found</p>
          )}
        </div>

        {/* Edit Modal */}
        {editingParty && (
          <div
            className="gateway-modal-overlay"
            onClick={() => setEditingParty(null)}
          >
            <div
              className="gateway-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <span className="gateway-modal-title">Edit Vendor Details</span>
                <button onClick={() => setEditingParty(null)}>
                  <X />
                </button>
              </div>
              <div>
                <label>Party Name</label>
                <input
                  type="text"
                  value={editingParty.name}
                  onChange={(e) => setEditingParty({ ...editingParty, name: e.target.value })}
                />
              </div>
              <div>
                <label>Address</label>
                <input
                  type="text"
                  value={editingParty.address}
                  onChange={(e) => setEditingParty({ ...editingParty, address: e.target.value })}
                />
              </div>
              <div>
                <label>GST</label>
                <input
                  type="text"
                  value={editingParty.gst}
                  onChange={(e) => setEditingParty({ ...editingParty, gst: e.target.value })}
                />
              </div>
              <div>
                <label>Contact</label>
                <input
                  type="text"
                  value={editingParty.contact}
                  onChange={(e) => setEditingParty({ ...editingParty, contact: e.target.value })}
                />
              </div>
              <div className="gateway-modal-actions">
                <button className="gateway-modal-btn save" onClick={handleSaveEdit}>Save</button>
                <button className="gateway-modal-btn cancel" onClick={() => setEditingParty(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Modal */}
        {showFilter && (
          <div
            className="gateway-modal-overlay"
            onClick={() => setShowFilter(false)}
          >
            <div
              className="gateway-modal-content"
              style={{ maxHeight: '90vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <span className="gateway-modal-title">Advanced Filters</span>
                <button onClick={() => setShowFilter(false)}>
                  <X />
                </button>
              </div>
              <div>
                <label>Filter by GST</label>
                <input
                  type="text"
                  placeholder="Enter GST number..."
                  value={gstFilter}
                  onChange={(e) => setGstFilter(e.target.value)}
                />
              </div>
              <div>
                <label>Filter by Contact</label>
                <input
                  type="text"
                  placeholder="Enter contact number..."
                  value={contactFilter}
                  onChange={(e) => setContactFilter(e.target.value)}
                />
              </div>
              <div>
                <label>Filter by Published Date</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <button type="button" onClick={() => handlePreset(0)} className="gateway-modal-btn cancel" style={{ padding: '4px 12px', fontSize: 13 }}>Today</button>
                  <button type="button" onClick={() => handlePreset(7)} className="gateway-modal-btn cancel" style={{ padding: '4px 12px', fontSize: 13 }}>Last 7 Days</button>
                  <button type="button" onClick={() => handlePreset(30)} className="gateway-modal-btn cancel" style={{ padding: '4px 12px', fontSize: 13 }}>This Month</button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      placeholderText="Start Date"
                      className="gateway-search-input"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate || undefined}
                      placeholderText="End Date"
                      className="gateway-search-input"
                    />
                  </div>
                </div>
              </div>
              <div className="gateway-modal-actions">
                <button className="gateway-modal-btn save" onClick={handleSubmitFilter}>Apply Filter</button>
                <button className="gateway-modal-btn cancel" onClick={handleClearFilters}>Clear</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}