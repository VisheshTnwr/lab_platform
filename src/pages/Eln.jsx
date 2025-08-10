import React, { useState } from "react";
import { Trash2, Edit2 } from "lucide-react";
import { Plus } from "lucide-react";

export default function ELN() {
  const [notebooks, setNotebooks] = useState([
    { id: 1, name: "Chemistry Experiments" },
    { id: 2, name: "Biology Notes" },
  ]);

  const [entries, setEntries] = useState([
    {
      id: 1,
      notebookId: 1,
      title: "Acid-Base Reaction",
      content: "Mixed HCl with NaOH...",
      date: "2025-08-09",
    },
    {
      id: 2,
      notebookId: 2,
      title: "Cell Observation",
      content: "Observed onion cells under microscope...",
      date: "2025-08-08",
    },
  ]);

  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({ title: "", content: "" });
  const [newNotebookName, setNewNotebookName] = useState("");
  const [editEntry, setEditEntry] = useState(null);

  // Add notebook
  const handleAddNotebook = () => {
    if (!newNotebookName.trim()) return;
    const newNotebook = {
      id: notebooks.length + 1,
      name: newNotebookName,
    };
    setNotebooks([...notebooks, newNotebook]);
    setNewNotebookName("");
  };

  // Delete notebook
  const handleDeleteNotebook = (id) => {
    setNotebooks(notebooks.filter((nb) => nb.id !== id));
    setEntries(entries.filter((e) => e.notebookId !== id));
    if (selectedNotebook?.id === id) {
      setSelectedNotebook(null);
      setSelectedEntry(null);
    }
  };

  // Add entry
  const handleAddEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim() || !selectedNotebook)
      return;
    const entry = {
      id: entries.length + 1,
      notebookId: selectedNotebook.id,
      title: newEntry.title,
      content: newEntry.content,
      date: new Date().toISOString().split("T")[0],
    };
    setEntries([...entries, entry]);
    setNewEntry({ title: "", content: "" });
  };

  // Delete entry
  const handleDeleteEntry = (id) => {
    setEntries(entries.filter((e) => e.id !== id));
    if (selectedEntry?.id === id) setSelectedEntry(null);
  };

  // Edit entry
  const handleEditEntry = () => {
    if (!editEntry.title.trim() || !editEntry.content.trim()) return;
    setEntries(entries.map((e) => (e.id === editEntry.id ? editEntry : e)));
    setEditEntry(null);
  };

  return (
    <div className="flex h-screen p-4 bg-gray-100 text-black">
      {/* Notebook List */}
      <div className="w-1/4 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-2">Notebooks</h2>
        <div className="mb-2 flex items-center gap-2">
          <input
            type="text"
            placeholder="New Notebook"
            value={newNotebookName}
            onChange={(e) => setNewNotebookName(e.target.value)}
            className="flex-1 min-w-0 p-2 border rounded text-black"
          />
          <button
  onClick={handleAddNotebook}
  className="w-10 h-10 bg-black text-white rounded flex items-center justify-center hover:bg-gray-800 text-xl font-bold"
>
  +
</button>

        </div>
        {notebooks.map((nb) => (
          <div
            key={nb.id}
            className={`p-2 mb-1 rounded flex justify-between items-center cursor-pointer hover:bg-gray-200 ${
              selectedNotebook?.id === nb.id ? "bg-gray-300" : ""
            }`}
            onClick={() => {
              setSelectedNotebook(nb);
              setSelectedEntry(null);
            }}
          >
            <span>{nb.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteNotebook(nb.id);
              }}
              className="text-gray-400 hover:text-red-500 transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Entry List */}
      <div className="w-1/3 bg-white p-4 mx-4 rounded shadow">
        <h2 className="text-lg font-bold mb-2">
          {selectedNotebook
            ? `Entries in "${selectedNotebook.name}"`
            : "Select a Notebook"}
        </h2>
        {selectedNotebook &&
          entries
            .filter((e) => e.notebookId === selectedNotebook.id)
            .map((entry) => (
              <div
                key={entry.id}
                className={`p-2 mb-1 rounded flex justify-between items-center cursor-pointer hover:bg-gray-200 ${
                  selectedEntry?.id === entry.id ? "bg-gray-300" : ""
                }`}
                onClick={() => setSelectedEntry(entry)}
              >
                <div>
                  <p className="font-semibold">{entry.title}</p>
                  <p className="text-sm text-gray-500">{entry.date}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditEntry(entry);
                    }}
                    className="text-gray-400 hover:text-blue-500 transition"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEntry(entry.id);
                    }}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

        {/* New Entry Form */}
        {selectedNotebook && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Entry Title"
              value={newEntry.title}
              onChange={(e) =>
                setNewEntry({ ...newEntry, title: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              placeholder="Entry Content"
              value={newEntry.content}
              onChange={(e) =>
                setNewEntry({ ...newEntry, content: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
              rows="3"
            />
            <button
              onClick={handleAddEntry}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Add Entry
            </button>
          </div>
        )}
      </div>

      {/* Entry View */}
      <div className="flex-1 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-2">Entry View</h2>
        {editEntry ? (
          <div>
            <input
              type="text"
              value={editEntry.title}
              onChange={(e) =>
                setEditEntry({ ...editEntry, title: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              value={editEntry.content}
              onChange={(e) =>
                setEditEntry({ ...editEntry, content: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
              rows="5"
            />
            <button
              onClick={handleEditEntry}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Save Changes
            </button>
          </div>
        ) : selectedEntry ? (
          <>
            <h3 className="text-xl font-semibold">{selectedEntry.title}</h3>
            <p className="text-gray-500 mb-2">{selectedEntry.date}</p>
            <p>{selectedEntry.content}</p>
          </>
        ) : (
          <p>Select an entry to view details</p>
        )}
      </div>
    </div>
  );
}
