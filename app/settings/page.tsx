"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import {
  Trash2,
  Download,
  Upload,
  Plus,
  Edit2,
  X,
  Check,
  Calculator,
} from "lucide-react";

export default function Settings() {
  const {
    expenses,
    categories,
    addCategory,
    editCategory,
    deleteCategory,
    currency,
    setCurrency,
    logout,
    currentUser,
  } = useStore();

  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const [convUSD, setConvUSD] = useState("");
  const [convJOD, setConvJOD] = useState("");
  const [convINR, setConvINR] = useState("");

  // Exchange rates (approximate)
  const rates = {
    USD: 1,
    JOD: 0.71,
    INR: 83.0,
  };

  const handleConvert = (val: string, from: "USD" | "JOD" | "INR") => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      setConvUSD("");
      setConvJOD("");
      setConvINR("");
      return;
    }

    const usdVal = num / rates[from];

    if (from === "USD") setConvUSD(val);
    else setConvUSD(usdVal.toFixed(2));

    if (from === "JOD") setConvJOD(val);
    else setConvJOD((usdVal * rates.JOD).toFixed(3));

    if (from === "INR") setConvINR(val);
    else setConvINR((usdVal * rates.INR).toFixed(2));
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory("");
    }
  };

  const handleEditCategory = (oldCat: string) => {
    if (editValue.trim() && editValue !== oldCat) {
      editCategory(oldCat, editValue.trim());
    }
    setEditingCategory(null);
  };

  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify({ expenses, categories }));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "quickspense_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="flex flex-col h-full">
      <header className="px-6 pt-12 pb-6 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
        <h1 className="text-zinc-400 text-sm font-medium tracking-wider uppercase mb-1">
          Settings
        </h1>
        <div className="text-3xl font-light text-white tracking-tight">
          Preferences
        </div>
      </header>

      <div className="p-6 space-y-8">
        <section>
          <h2 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">
            Account & Currency
          </h2>
          <div className="space-y-4">
            <div className="bg-zinc-900/50 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-zinc-400">Logged in as</div>
                <div className="font-medium text-white">User {currentUser}</div>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Log Out
              </button>
            </div>
            <div className="bg-zinc-900/50 rounded-2xl p-4 flex gap-2">
              {["USD", "JOD", "INR"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c as any)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${currency === c ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">
            Data Management
          </h2>
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full h-14 bg-zinc-900/50 hover:bg-zinc-800 rounded-2xl flex items-center justify-between px-4 transition-colors active:scale-95"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-emerald-400" />
                <span className="text-zinc-100 font-medium">Export Backup</span>
              </div>
              <span className="text-xs text-zinc-500">
                {expenses.length} records
              </span>
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">
            Currency Converter
          </h2>
          <div className="bg-zinc-900/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 text-sm font-medium text-zinc-400">USD</div>
              <input
                type="number"
                value={convUSD}
                onChange={(e) => handleConvert(e.target.value, "USD")}
                placeholder="0.00"
                className="flex-1 bg-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 text-sm font-medium text-zinc-400">JOD</div>
              <input
                type="number"
                value={convJOD}
                onChange={(e) => handleConvert(e.target.value, "JOD")}
                placeholder="0.000"
                className="flex-1 bg-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 text-sm font-medium text-zinc-400">INR</div>
              <input
                type="number"
                value={convINR}
                onChange={(e) => handleConvert(e.target.value, "INR")}
                placeholder="0.00"
                className="flex-1 bg-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">
            Categories
          </h2>
          <div className="bg-zinc-900/50 rounded-2xl p-4 space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                placeholder="New category..."
                className="flex-1 bg-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white p-2 rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between bg-zinc-800/50 p-2 rounded-xl"
                >
                  {editingCategory === cat ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleEditCategory(cat)
                        }
                        className="flex-1 bg-zinc-900 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        autoFocus
                      />
                      <button
                        onClick={() => handleEditCategory(cat)}
                        className="text-emerald-400 p-1"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="text-zinc-500 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm text-zinc-300 px-2">{cat}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setEditValue(cat);
                          }}
                          className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete category "${cat}"?`)) {
                              deleteCategory(cat);
                            }
                          }}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">
            About
          </h2>
          <div className="bg-zinc-900/50 rounded-2xl p-4 text-sm text-zinc-400">
            <p>QuickSpense v1.0</p>
            <p className="mt-2 text-xs text-zinc-500">
              A minimalist, native-feeling web app for 1-tap expense tracking.
              Data is stored locally on your device.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
