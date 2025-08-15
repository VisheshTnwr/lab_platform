import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Plus, Edit2, Trash2, X } from "lucide-react";

function Eln() {
  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [entryItems, setEntryItems] = useState([]);
  const [newNotebookName, setNewNotebookName] = useState("");
  const [newEntryTitle, setNewEntryTitle] = useState("");
  const [newEntryContent, setNewEntryContent] = useState("");
  const [editEntry, setEditEntry] = useState(null);
  const [showAddEntryForm, setShowAddEntryForm] = useState(false);

  // Inventory linking
  const [inventory, setInventory] = useState([]);
  const [selectedItems, setSelectedItems] = useState([
    { inventory_id: "", quantity_used: "", step_number: "" },
  ]);

  useEffect(() => {
    fetchNotebooks();
    fetchInventory();
  }, []);

  async function fetchNotebooks() {
    const { data, error } = await supabase.from("notebooks").select("*");
    if (!error) setNotebooks(data || []);
  }

  async function fetchEntries(notebookId) {
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("notebook_id", notebookId);
    if (!error) setEntries(data || []);
  }

  async function fetchInventory() {
    const { data, error } = await supabase.from("inventory").select("*");
    if (!error) setInventory(data || []);
  }

  async function fetchEntryItems(entryId) {
    const { data, error } = await supabase
      .from("entry_items")
      .select(
        `
        id,
        quantity_used,
        step_number,
        inventory:inventory_id (id, name)
      `
      )
      .eq("entry_id", entryId);
    if (!error) setEntryItems(data || []);
  }

  async function handleAddNotebook(e) {
    e.preventDefault();
    if (!newNotebookName) return;
    const { data, error } = await supabase
      .from("notebooks")
      .insert([{ name: newNotebookName }])
      .select();
    if (!error && data?.[0]) {
      setNotebooks((prev) => [...prev, data[0]]);
      setNewNotebookName("");
    }
  }

  async function handleDeleteNotebook(id) {
    await supabase.from("notebooks").delete().eq("id", id);
    setNotebooks((prev) => prev.filter((nb) => nb.id !== id));
    if (selectedNotebook?.id === id) {
      setSelectedNotebook(null);
      setEntries([]);
      setSelectedEntry(null);
      setEntryItems([]);
    }
  }

  async function handleAddEntry(e) {
    e.preventDefault();
    if (!newEntryTitle || !selectedNotebook) return;

    // 1) Create the entry
    const { data: entryData, error: entryError } = await supabase
      .from("entries")
      .insert([
        {
          title: newEntryTitle,
          content: newEntryContent,
          notebook_id: selectedNotebook.id,
        },
      ])
      .select();

    if (entryError || !entryData?.[0]) return;

    const entryId = entryData[0].id;

    // 2) Insert linked items + update inventory
    for (const usage of selectedItems) {
      const invId = usage.inventory_id;
      const qty = parseFloat(usage.quantity_used);
      const step = usage.step_number ? parseInt(usage.step_number) : null;

      if (!invId || !qty || Number.isNaN(qty)) continue;

      await supabase.from("entry_items").insert([
        {
          entry_id: entryId,
          inventory_id: invId,
          quantity_used: qty,
          step_number: step,
        },
      ]);

      const invRow = inventory.find((i) => String(i.id) === String(invId));
      const currentQty = invRow?.quantity ?? 0;
      const newQty = Math.max(0, currentQty - qty);

      await supabase
        .from("inventory")
        .update({ quantity: newQty })
        .eq("id", invId);

      setInventory((prev) =>
        prev.map((i) =>
          String(i.id) === String(invId) ? { ...i, quantity: newQty } : i
        )
      );
    }

    // 3) Update UI and load items immediately in entry details
    setEntries((prev) => [...prev, entryData[0]]);
    setSelectedEntry(entryData[0]);
    await fetchEntryItems(entryId);
    setNewEntryTitle("");
    setNewEntryContent("");
    setSelectedItems([
      { inventory_id: "", quantity_used: "", step_number: "" },
    ]);
    setShowAddEntryForm(false);
  }

  async function handleDeleteEntry(id) {
    await supabase.from("entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
      setEntryItems([]);
    }
  }

  async function handleEditEntry(e) {
    e.preventDefault();
    const { error } = await supabase
      .from("entries")
      .update({
        title: editEntry.title,
        content: editEntry.content,
      })
      .eq("id", editEntry.id);
    if (!error) {
      setEntries((prev) =>
        prev.map((en) =>
          en.id === editEntry.id ? { ...en, ...editEntry } : en
        )
      );
      setEditEntry(null);
    }
  }

  const handleAddItemUsage = () => {
    setSelectedItems((prev) => [
      ...prev,
      { inventory_id: "", quantity_used: "", step_number: "" },
    ]);
  };

  const handleUsageChange = (index, field, value) => {
    const updated = [...selectedItems];
    updated[index][field] = value;
    setSelectedItems(updated);
  };

  return (
    <div className="grid grid-cols-3 gap-4 h-full text-black">
      {/* Left Pane - Notebooks */}
      <div className="bg-white p-4 rounded shadow overflow-y-auto">
        <h2 className="font-bold mb-2">Notebooks</h2>
        <form onSubmit={handleAddNotebook} className="mb-4 flex">
          <input
            type="text"
            value={newNotebookName}
            onChange={(e) => setNewNotebookName(e.target.value)}
            placeholder="New notebook"
            className="border p-1 flex-1 rounded-l text-black"
          />
          <button className="bg-blue-500 text-white px-2 rounded-r">
            <Plus size={16} />
          </button>
        </form>
        {notebooks.map((nb) => (
          <div
            key={nb.id}
            className={`group h-11 p-2 mb-1 rounded flex justify-between items-center cursor-pointer hover:bg-gray-100 ${
              selectedNotebook?.id === nb.id ? "bg-gray-200" : ""
            }`}
            onClick={() => {
              setSelectedNotebook(nb);
              fetchEntries(nb.id);
              setSelectedEntry(null);
              setEntryItems([]);
            }}
          >
            <span>{nb.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteNotebook(nb.id);
              }}
              className="hidden group-hover:inline-flex text-gray-400 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Middle Pane - Entries */}
      <div className="bg-white p-4 rounded shadow flex flex-col justify-between overflow-y-auto">
        <div>
          <h2 className="font-bold mb-2">Entries</h2>
          {selectedNotebook ? (
            <>
              {entries
                .filter((e) => e.notebook_id === selectedNotebook.id)
                .map((entry) => (
                  <div
                    key={entry.id}
                    className={`group p-2 mb-1 rounded flex justify-between items-center cursor-pointer hover:bg-gray-100 ${
                      selectedEntry?.id === entry.id ? "bg-gray-200" : ""
                    }`}
                    onClick={() => {
                      setSelectedEntry(entry);
                      fetchEntryItems(entry.id);
                    }}
                  >
                    <div>
                      <p className="font-medium">{entry.title}</p>
                      <p className="text-xs">{entry.date}</p>
                    </div>
                    <div className="hidden group-hover:flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditEntry(entry);
                        }}
                        className="text-gray-400 hover:text-blue-500"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEntry(entry.id);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
            </>
          ) : (
            <p>Select a notebook</p>
          )}
        </div>

        {/* Add Entry Button & Form */}
        {selectedNotebook && !showAddEntryForm && (
          <button
            onClick={() => setShowAddEntryForm(true)}
            className="mt-2 p-2 rounded-full bg-blue-500 text-white self-center hover:bg-blue-600"
          >
            <Plus size={20} />
          </button>
        )}

        {showAddEntryForm && (
          <form
            onSubmit={handleAddEntry}
            className="mt-2 bg-gray-50 p-3 rounded shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Add Entry</h3>
              <button
                type="button"
                onClick={() => setShowAddEntryForm(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
            <input
              type="text"
              value={newEntryTitle}
              onChange={(e) => setNewEntryTitle(e.target.value)}
              placeholder="Title"
              className="border p-1 w-full mb-2"
            />
            <textarea
              value={newEntryContent}
              onChange={(e) => setNewEntryContent(e.target.value)}
              placeholder="Content"
              className="border p-1 w-full mb-2"
            />

            {/* Inventory Usage Section */}
            <h4 className="font-semibold mt-4 mb-2">Items Used</h4>
            {selectedItems.map((usage, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select
                  value={usage.inventory_id}
                  onChange={(e) =>
                    handleUsageChange(idx, "inventory_id", e.target.value)
                  }
                  className="border p-1 flex-1"
                >
                  <option value="">Select Item</option>
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} (Stock: {inv.quantity})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Qty"
                  value={usage.quantity_used}
                  onChange={(e) =>
                    handleUsageChange(idx, "quantity_used", e.target.value)
                  }
                  className="border p-1 w-20"
                />
                <input
                  type="number"
                  placeholder="Step"
                  value={usage.step_number}
                  onChange={(e) =>
                    handleUsageChange(idx, "step_number", e.target.value)
                  }
                  className="border p-1 w-20"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddItemUsage}
              className="text-blue-500 text-sm mb-4"
            >
              + Add Item
            </button>

            <button
              type="submit"
              className="px-3 py-1 bg-blue-500 text-white rounded w-full"
            >
              Save Entry
            </button>
          </form>
        )}
      </div>

      {/* Right Pane - Entry Details */}
      <div className="bg-white p-4 rounded shadow overflow-y-auto">
        {selectedEntry ? (
          <>
            <h2 className="font-bold text-lg mb-2">{selectedEntry.title}</h2>
            <p className="text-sm mb-4">{selectedEntry.date}</p>
            <p>{selectedEntry.content}</p>

            {entryItems.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Items Used</h3>
                <ul className="list-disc pl-5">
                  {entryItems.map((item) => (
                    <li key={item.id}>
                      {item.inventory?.name || "Unknown Item"} —{" "}
                      {item.quantity_used}
                      {item.step_number ? ` (Step ${item.step_number})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p>Select an entry to view</p>
        )}
      </div>

      {/* Edit Entry Modal */}
      {editEntry && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <form
            onSubmit={handleEditEntry}
            className="bg-white p-4 rounded shadow w-96"
          >
            <h2 className="font-bold mb-2">Edit Entry</h2>
            <input
              type="text"
              value={editEntry.title}
              onChange={(e) =>
                setEditEntry({ ...editEntry, title: e.target.value })
              }
              className="border p-1 w-full mb-2"
            />
            <textarea
              value={editEntry.content}
              onChange={(e) =>
                setEditEntry({ ...editEntry, content: e.target.value })
              }
              className="border p-1 w-full mb-2"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditEntry(null)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Eln;
