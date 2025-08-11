import React, { useState, useEffect } from "react";
import { Trash2, Edit2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// 🔹 Replace with your Supabase credentials
const supabase = createClient(
  "https://cfysbejlmhgfgkrivlcy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeXNiZWpsbWhnZmdrcml2bGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0OTg3NjksImV4cCI6MjA3MDA3NDc2OX0.7b0GxDe5ZAkyDpiwJugm5c4tbyuQjCOMDrM6N9ScmR4"
);

export default function ELN() {
  const [notebooks, setNotebooks] = useState([]);
  const [entries, setEntries] = useState([]);

  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({ title: "", content: "" });
  const [newNotebookName, setNewNotebookName] = useState("");
  const [editEntry, setEditEntry] = useState(null);

  // 🔹 Fetch data from Supabase on mount
  useEffect(() => {
    fetchNotebooks();
    fetchEntries();
  }, []);

  const fetchNotebooks = async () => {
    let { data, error } = await supabase.from("notebooks").select("*");
    if (!error) setNotebooks(data);
  };

  const fetchEntries = async () => {
    let { data, error } = await supabase.from("entries").select("*");
    if (!error) setEntries(data);
  };

  // 🔹 Add notebook
  const handleAddNotebook = async () => {
    if (!newNotebookName.trim()) return;
    const { data, error } = await supabase
      .from("notebooks")
      .insert([{ name: newNotebookName }])
      .select();
    if (!error) {
      setNotebooks([...notebooks, ...data]);
      setNewNotebookName("");
    }
  };

  // 🔹 Delete notebook
  const handleDeleteNotebook = async (id) => {
    await supabase.from("entries").delete().eq("notebook_id", id);
    await supabase.from("notebooks").delete().eq("id", id);
    setNotebooks(notebooks.filter((nb) => nb.id !== id));
    setEntries(entries.filter((e) => e.notebook_id !== id));
    if (selectedNotebook?.id === id) {
      setSelectedNotebook(null);
      setSelectedEntry(null);
    }
  };

  // 🔹 Add entry
  const handleAddEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim() || !selectedNotebook)
      return;
    const entryData = {
      notebook_id: selectedNotebook.id,
      title: newEntry.title,
      content: newEntry.content,
      date: new Date().toISOString().split("T")[0],
    };
    const { data, error } = await supabase
      .from("entries")
      .insert([entryData])
      .select();
    if (!error) {
      setEntries([...entries, ...data]);
      setNewEntry({ title: "", content: "" });
    }
  };

  // 🔹 Delete entry
  const handleDeleteEntry = async (id) => {
    await supabase.from("entries").delete().eq("id", id);
    setEntries(entries.filter((e) => e.id !== id));
    if (selectedEntry?.id === id) setSelectedEntry(null);
  };

  // 🔹 Edit entry
  const handleEditEntry = async () => {
    if (!editEntry.title.trim() || !editEntry.content.trim()) return;
    const { data, error } = await supabase
      .from("entries")
      .update({
        title: editEntry.title,
        content: editEntry.content,
      })
      .eq("id", editEntry.id)
      .select();
    if (!error) {
      setEntries(entries.map((e) => (e.id === editEntry.id ? data[0] : e)));
      setEditEntry(null);
    }
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
            .filter((e) => e.notebook_id === selectedNotebook.id)
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
