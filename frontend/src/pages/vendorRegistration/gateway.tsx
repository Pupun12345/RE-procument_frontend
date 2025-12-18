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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-5xl text-center mb-12 text-black">
          VENDOR GATEWAY
        </h1>

        {/* Search and Actions Bar */}
        <div className="flex items-center gap-4 mb-8">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by party name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 bg-white border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 h-12 shadow-sm px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleVendorRegistration}
            className="bg-[#6b6ef9] hover:bg-[#5759d6] text-white h-12 px-6 shadow-md rounded-md transition-colors font-medium"
          >
            Vendor Registration
          </button>

          <button
            onClick={handleDownloadCSV}
            className="bg-[#6b6ef9] hover:bg-[#5759d6] text-white h-12 px-6 shadow-md rounded-md transition-colors font-medium flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </button>

          <button
            onClick={handleFilter}
            className="bg-[#6b6ef9] hover:bg-[#5759d6] text-white h-12 px-6 shadow-md rounded-md transition-colors font-medium flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>

        {/* Party List Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg">
          <h2 className="text-black mb-4">
            PARTY LIST
          </h2>
          
          {filteredParties.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left p-3 text-gray-900">Party Name</th>
                    <th className="text-left p-3 text-gray-900">Address</th>
                    <th className="text-left p-3 text-gray-900">GST</th>
                    <th className="text-left p-3 text-gray-900">Contact</th>
                    <th className="text-left p-3 text-gray-900">Published Date</th>
                    <th className="text-left p-3 text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParties.map((party) => (
                    <tr key={party.id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                      <td className="p-3 text-gray-800">{party.name}</td>
                      <td className="p-3 text-gray-800">{party.address}</td>
                      <td className="p-3 text-gray-800">{party.gst}</td>
                      <td className="p-3 text-gray-800">{party.contact}</td>
                      <td className="p-3 text-gray-800">{party.publishedDate}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(party)}
                            className="p-2 text-[#6b6ef9] hover:bg-blue-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(party.id)}
                            className="p-2 text-red-600 hover:bg-blue-100 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No vendors found</p>
          )}
        </div>

        {/* Edit Modal */}
        {editingParty && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setEditingParty(null)}
          >
            <div
              className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl text-gray-900">Edit Vendor Details</h3>
                <button
                  onClick={() => setEditingParty(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Party Name</label>
                  <input
                    type="text"
                    value={editingParty.name}
                    onChange={(e) =>
                      setEditingParty({ ...editingParty, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={editingParty.address}
                    onChange={(e) =>
                      setEditingParty({ ...editingParty, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1">GST</label>
                  <input
                    type="text"
                    value={editingParty.gst}
                    onChange={(e) =>
                      setEditingParty({ ...editingParty, gst: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Contact</label>
                  <input
                    type="text"
                    value={editingParty.contact}
                    onChange={(e) =>
                      setEditingParty({ ...editingParty, contact: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md py-2 font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingParty(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md py-2 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Modal */}
        {showFilter && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowFilter(false)}
          >
            <div
              className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl text-gray-900">Advanced Filters</h3>
                <button
                  onClick={() => setShowFilter(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Filter by GST</label>
                  <input
                    type="text"
                    placeholder="Enter GST number..."
                    value={gstFilter}
                    onChange={(e) => setGstFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Filter by Contact</label>
                  <input
                    type="text"
                    placeholder="Enter contact number..."
                    value={contactFilter}
                    onChange={(e) => setContactFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Filter by Published Date</label>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => handlePreset(0)}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm text-gray-700"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => handlePreset(7)}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm text-gray-700"
                    >
                      Last 7 Days
                    </button>
                    <button
                      onClick={() => handlePreset(30)}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm text-gray-700"
                    >
                      This Month
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="Start Date"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate || undefined}
                        placeholderText="End Date"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmitFilter}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md py-2 font-medium transition-colors"
                >
                  Apply Filter
                </button>
                <button
                  onClick={handleClearFilters}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md py-2 font-medium transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}