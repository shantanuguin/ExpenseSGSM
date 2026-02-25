"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Check,
  Delete,
  MapPin,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useStore, Expense, TimeOfDay } from "@/lib/store";
import { cn, getCurrencySymbol } from "@/lib/utils";
import { format } from "date-fns";

export function QuickAddSheet({
  isOpen,
  onClose,
  initialAmount = "",
  existingExpense,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: string;
  existingExpense?: Expense | null;
}) {
  const [amount, setAmount] = useState(initialAmount);
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("Morning");
  const [expenseDate, setExpenseDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [showMore, setShowMore] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const { categories, addExpense, editExpense, getSmartCategory, currency } =
    useStore();

  useEffect(() => {
    if (isOpen) {
      if (existingExpense) {
         
        setAmount(existingExpense.amount.toString());
         
        setCategory(existingExpense.category);
         
        setLocation(existingExpense.location || "");
         
        setTimeOfDay(existingExpense.timeOfDay || "Morning");
         
        setExpenseDate(
          format(existingExpense.expenseDate || Date.now(), "yyyy-MM-dd"),
        );
         
        setShowMore(!!existingExpense.location || !!existingExpense.timeOfDay);
      } else {
         
        setAmount(initialAmount);
        const smartCat = getSmartCategory(
          Number(initialAmount) || 0,
          new Date().getHours(),
        );
         
        setCategory(smartCat);
         
        setLocation("");

        const hour = new Date().getHours();
        let tod: TimeOfDay = "Morning";
        if (hour >= 12 && hour < 17) tod = "Noon";
        else if (hour >= 17 && hour < 21) tod = "Evening";
        else if (hour >= 21 || hour < 5) tod = "Night";

         
        setTimeOfDay(tod);
         
        setExpenseDate(format(new Date(), "yyyy-MM-dd"));
         
        setShowMore(false);
      }
    }
  }, [isOpen, initialAmount, existingExpense, getSmartCategory]);

  const handleKeypad = (val: string) => {
    if (val === "del") {
      setAmount((prev) => prev.slice(0, -1));
    } else if (val === ".") {
      if (!amount.includes(".")) setAmount((prev) => prev + ".");
    } else {
      if (amount === "0" && val !== ".") {
        setAmount(val);
      } else {
        const parts = amount.split(".");
        if (parts[1] && parts[1].length >= 2) return; // Max 2 decimal places
        setAmount((prev) => prev + val);
      }
    }
  };

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const payload = {
      amount: numAmount,
      category: category || categories[0],
      location: location.trim(),
      timeOfDay,
      expenseDate: new Date(expenseDate).getTime(),
    };

    if (existingExpense) {
      editExpense(existingExpense.id, payload);
    } else {
      addExpense(payload);
    }

    onClose();
    setAmount("");
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
          );
          const data = await res.json();
          const locality =
            data.address.suburb ||
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "Unknown Location";
          setLocation(locality);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLocating(false);
        }
      },
      () => setIsLocating(false),
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl border-t border-white/10 p-6 z-50 pb-safe"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-zinc-100">
                {existingExpense ? "Edit Expense" : "Add Expense"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 text-center">
              <div className="text-5xl font-light text-white tracking-tight mb-2">
                <span className="text-zinc-500 mr-1">
                  {getCurrencySymbol(currency)}
                </span>
                {amount || "0"}
              </div>
            </div>

            <div className="mb-6 overflow-x-auto scrollbar-hide flex gap-2 pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                    category === cat
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <button
                onClick={() => setShowMore(!showMore)}
                className="flex items-center justify-center w-full gap-2 text-sm text-zinc-400 hover:text-zinc-300 py-2"
              >
                {showMore ? (
                  <>
                    Less Details <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    More Details <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {showMore && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-6 space-y-4"
                >
                  <div className="flex gap-2">
                    <div className="flex-1 bg-zinc-800/50 rounded-xl flex items-center pr-2 focus-within:ring-2 focus-within:ring-emerald-500/50 transition-shadow">
                      <div className="pl-3 py-3 h-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-zinc-500" />
                      </div>
                      <input
                        type="text"
                        placeholder="Where did you spend?"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-transparent px-3 py-3 text-sm text-white focus:outline-none placeholder:text-zinc-600"
                      />
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={isLocating}
                        className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-zinc-700/50 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                        title="Get Current Location"
                      >
                        <MapPin className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 bg-zinc-800/50 rounded-xl flex items-center px-3 focus-within:ring-2 focus-within:ring-emerald-500/50">
                      <Calendar className="w-4 h-4 text-zinc-500 mr-2" />
                      <input
                        type="date"
                        value={expenseDate}
                        onChange={(e) => setExpenseDate(e.target.value)}
                        className="w-full bg-transparent py-3 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 bg-zinc-800/50 p-1 rounded-xl">
                    {(
                      ["Morning", "Noon", "Evening", "Night"] as TimeOfDay[]
                    ).map((tod) => (
                      <button
                        key={tod}
                        onClick={() => setTimeOfDay(tod)}
                        className={cn(
                          "flex-1 py-2 text-xs font-medium rounded-lg transition-colors",
                          timeOfDay === tod
                            ? "bg-zinc-700 text-white shadow-sm"
                            : "text-zinc-400 hover:text-zinc-300",
                        )}
                      >
                        {tod}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                ".",
                "0",
                "del",
              ].map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeypad(key)}
                  className="h-14 bg-zinc-800/50 hover:bg-zinc-700 rounded-2xl flex items-center justify-center text-2xl font-medium text-white transition-colors active:scale-95"
                >
                  {key === "del" ? <Delete className="w-6 h-6" /> : key}
                </button>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              <Check className="w-6 h-6" />
              Save Expense
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
