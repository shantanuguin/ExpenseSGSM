"use client";

import { useState } from "react";
import { useStore, Expense } from "@/lib/store";
import { format } from "date-fns";
import { getCurrencySymbol } from "@/lib/utils";
import { Plus, RotateCw, Edit2, Trash2, MapPin, Clock } from "lucide-react";
import { QuickAddSheet } from "@/components/quick-add-sheet";
import { motion } from "motion/react";

export default function Home() {
  const { expenses, addExpense, deleteExpense, getSmartCategory, currency } =
    useStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [initialAmount, setInitialAmount] = useState("");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const today = new Date();
  const todayExpenses = expenses.filter(
    (e) => new Date(e.timestamp).toDateString() === today.toDateString(),
  );
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const quickAmounts = [5, 10, 20, 50];

  const handleQuickAdd = (amount: number) => {
    const category = getSmartCategory(amount, new Date().getHours());
    addExpense({ amount, category });
  };

  const handleRepeat = (expense: any) => {
    addExpense({
      amount: expense.amount,
      category: expense.category,
      location: expense.location,
      timeOfDay: expense.timeOfDay,
      expenseDate: new Date().getTime(),
    });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpense(id);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <header className="px-6 pt-12 pb-6 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
        <h1 className="text-zinc-400 text-sm font-medium tracking-wider uppercase mb-1">
          Today
        </h1>
        <div className="text-5xl font-light text-white tracking-tight">
          <span className="text-zinc-500 mr-1">
            {getCurrencySymbol(currency)}
          </span>
          {todayTotal.toFixed(currency === "JOD" ? 3 : 2)}
        </div>
      </header>

      <div className="p-6 space-y-8">
        <section>
          <h2 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">
            Quick Add
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleQuickAdd(amount)}
                className="h-16 bg-zinc-800/50 hover:bg-zinc-700 rounded-2xl flex flex-col items-center justify-center transition-colors active:scale-95"
              >
                <span className="text-lg font-medium text-white">
                  {getCurrencySymbol(currency)}
                  {amount}
                </span>
              </button>
            ))}
            <button
              onClick={() => {
                setInitialAmount("");
                setIsSheetOpen(true);
              }}
              className="h-16 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-2xl flex flex-col items-center justify-center transition-colors active:scale-95"
            >
              <span className="text-sm font-medium">Custom</span>
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">
            Recent
          </h2>
          {expenses.length === 0 ? (
            <div className="text-center py-10 text-zinc-600 text-sm">
              No expenses yet.
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 10).map((expense) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={expense.id}
                  className="bg-zinc-900/50 p-4 rounded-2xl flex flex-col gap-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                        {expense.category.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-100">
                          {expense.category}
                        </div>
                        <div className="text-xs text-zinc-500 flex items-center gap-2">
                          <span>
                            {format(
                              expense.expenseDate || expense.timestamp,
                              "MMM d, yyyy",
                            )}
                          </span>
                          {expense.timeOfDay && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />{" "}
                                {expense.timeOfDay}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="font-medium text-white">
                        {getCurrencySymbol(currency)}
                        {expense.amount.toFixed(currency === "JOD" ? 3 : 2)}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleRepeat(expense)}
                          className="p-1.5 text-zinc-500 hover:text-emerald-400 transition-colors"
                          title="Repeat"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-1.5 text-zinc-500 hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {expense.location && (
                    <div className="text-xs text-zinc-400 flex items-center gap-1 ml-14">
                      <MapPin className="w-3 h-3" /> {expense.location}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>

      <button
        onClick={() => {
          setInitialAmount("");
          setEditingExpense(null);
          setIsSheetOpen(true);
        }}
        className="absolute bottom-24 right-6 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/20 flex items-center justify-center transition-transform active:scale-90 z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      <QuickAddSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setTimeout(() => setEditingExpense(null), 300);
        }}
        initialAmount={initialAmount}
        existingExpense={editingExpense}
      />
    </div>
  );
}
