import React, { useState, useEffect } from "react";
import { Trash2, Edit2, Search, Plus } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Supabase config
const supabaseUrl = "https://cfysbejlmhgfgkrivlcy.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeXNiZWpsbWhnZmdrcml2bGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0OTg3NjksImV4cCI6MjA3MDA3NDc2OX0.7b0GxDe5ZAkyDpiwJugm5c4tbyuQjCOMDrM6N9ScmR4";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    location: "",
  });
  const [editItem, setEditItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Load items from Supabase
  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase.from("inventory").select("*");
    if (error) {
      console.error("Error fetching items:", error);
    } else {
      setItems(data);
    }
  }

  // Add new item
  const handleAddItem = async () => {
    if (!newItem.name.trim()) return;
    const itemToAdd = {
      ...newItem,
      quantity: parseFloat(newItem.quantity) || 0,
    };
    const { data, error } = await supabase
      .from("inventory")
      .insert([itemToAdd])
      .select();
    if (error) {
      console.error("Error adding item:", error);
    } else {
      setItems([...items, data[0]]);
      setNewItem({
        name: "",
        category: "",
        quantity: "",
        unit: "",
        location: "",
      });
      setShowAddForm(false);
    }
  };

  // Delete item
  const handleDeleteItem = async (id) => {
    const { error } = await supabase.from("inventory").delete().eq("id", id);
    if (error) {
      console.error("Error deleting item:", error);
    } else {
      setItems(items.filter((i) => i.id !== id));
    }
  };

  // Edit item
  const handleEditItem = async () => {
    if (!editItem.name.trim()) return;
    const { data, error } = await supabase
      .from("inventory")
      .update(editItem)
      .eq("id", editItem.id)
      .select();
    if (error) {
      console.error("Error editing item:", error);
    } else {
      setItems(items.map((i) => (i.id === editItem.id ? data[0] : i)));
      setEditItem(null);
    }
  };

  // Filtered list
  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex justify-center p-8 bg-gray-50 text-gray-900">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={18} /> Add Item
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition"
            >
              <div>
                <p className="font-semibold text-lg">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.category} — {item.quantity} {item.unit} @{" "}
                  {item.location}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditItem(item)}
                  className="text-gray-500 hover:text-blue-600 transition"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-gray-500 hover:text-red-600 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Item Form */}
        {showAddForm && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 animate-fadeIn">
            <h3 className="font-semibold">Add New Item</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Category"
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({ ...newItem, quantity: e.target.value })
                }
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <select
                value={newItem.unit}
                onChange={(e) =>
                  setNewItem({ ...newItem, unit: e.target.value })
                }
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Unit</option>
                <option value="ml">ml</option>
                <option value="L">L</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="pcs">pcs</option>
              </select>
              <input
                type="text"
                placeholder="Location"
                value={newItem.location}
                onChange={(e) =>
                  setNewItem({ ...newItem, location: e.target.value })
                }
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none col-span-2"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddItem}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex-1"
              >
                Save Item
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {editItem && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96">
              <h3 className="font-bold text-lg mb-4">Edit Item</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={editItem.name}
                  onChange={(e) =>
                    setEditItem({ ...editItem, name: e.target.value })
                  }
                  className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={editItem.category}
                  onChange={(e) =>
                    setEditItem({ ...editItem, category: e.target.value })
                  }
                  className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  type="number"
                  value={editItem.quantity}
                  onChange={(e) =>
                    setEditItem({ ...editItem, quantity: e.target.value })
                  }
                  className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <select
                  value={editItem.unit}
                  onChange={(e) =>
                    setEditItem({ ...editItem, unit: e.target.value })
                  }
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Unit</option>
                  <option value="ml">ml</option>
                  <option value="L">L</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="pcs">pcs</option>
                </select>
                <input
                  type="text"
                  value={editItem.location}
                  onChange={(e) =>
                    setEditItem({ ...editItem, location: e.target.value })
                  }
                  className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleEditItem}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex-1"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditItem(null)}
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
