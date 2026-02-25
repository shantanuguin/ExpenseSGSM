import { create } from "zustand";
import { persist } from "zustand/middleware";
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 11);
};
import { db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  writeBatch,
} from "firebase/firestore";

export type Currency = "USD" | "JOD" | "INR";
export type TimeOfDay = "Morning" | "Noon" | "Evening" | "Night";

export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  JOD: 0.71,
  INR: 83.0,
};

export interface Expense {
  id: string;
  amount: number;
  category: string;
  timestamp: number;
  expenseDate?: number;
  timeOfDay?: TimeOfDay;
  location?: string;
  note?: string;
}

export interface AppState {
  currentUser: "SG" | "SM" | null;
  currency: Currency;
  expenses: Expense[];
  categories: string[];
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  setCurrency: (c: Currency) => void;
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (
    expense: Omit<Expense, "id" | "timestamp"> & { timestamp?: number },
  ) => Promise<void>;
  editExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getSmartCategory: (amount: number, hourOfDay: number) => string;
  addCategory: (category: string) => void;
  editCategory: (oldCategory: string, newCategory: string) => Promise<void>;
  deleteCategory: (category: string) => void;
}

const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Coffee",
  "Groceries",
  "Entertainment",
  "Shopping",
  "Bills",
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      currency: "USD",
      expenses: [],
      categories: DEFAULT_CATEGORIES,
      login: (user, pass) => {
        if (user === "SG" && pass === "SG@2026") {
          set({ currentUser: "SG" });
          return true;
        }
        if (user === "SM" && pass === "SM@2026") {
          set({ currentUser: "SM" });
          return true;
        }
        return false;
      },
      logout: () => set({ currentUser: null, expenses: [] }),
      setCurrency: async (newCurrency) => {
        const { currency: oldCurrency, expenses, currentUser } = get();
        if (oldCurrency === newCurrency) return;

        const rate = EXCHANGE_RATES[newCurrency] / EXCHANGE_RATES[oldCurrency];

        const updatedExpenses = expenses.map(e => ({
          ...e,
          amount: Number((e.amount * rate).toFixed(2))
        }));

        set({ currency: newCurrency, expenses: updatedExpenses });

        if (currentUser && updatedExpenses.length > 0) {
          try {
            const batch = writeBatch(db);
            updatedExpenses.forEach((e) => {
              const ref = doc(db, `users/${currentUser}/expenses`, e.id);
              batch.update(ref, { amount: e.amount });
            });
            await batch.commit();
          } catch (error) {
            console.error("Error converting currencies in Firestore:", error);
          }
        }
      },
      setExpenses: (expenses) => set({ expenses }),
      addExpense: async (expense) => {
        const { currentUser } = get();
        if (!currentUser) return;
        try {
          await addDoc(collection(db, `users/${currentUser}/expenses`), {
            ...expense,
            timestamp: expense.timestamp || Date.now(),
            expenseDate: expense.expenseDate || Date.now(),
            timeOfDay: expense.timeOfDay || "Morning",
          });
        } catch (error) {
          console.error("Error adding expense:", error);
        }
      },
      editExpense: async (id, updates) => {
        const { currentUser } = get();
        if (!currentUser) return;
        try {
          const ref = doc(db, `users/${currentUser}/expenses`, id);
          await writeBatch(db).update(ref, updates).commit();
        } catch (error) {
          console.error("Error editing expense:", error);
        }
      },
      deleteExpense: async (id) => {
        const { currentUser } = get();
        if (!currentUser) return;
        try {
          await deleteDoc(doc(db, `users/${currentUser}/expenses`, id));
        } catch (error) {
          console.error("Error deleting expense:", error);
        }
      },
      addCategory: (category) =>
        set((state) => ({
          categories: state.categories.includes(category)
            ? state.categories
            : [...state.categories, category],
        })),
      editCategory: async (oldCategory, newCategory) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c === oldCategory ? newCategory : c,
          ),
        }));
        const { currentUser, expenses } = get();
        if (!currentUser) return;
        try {
          const batch = writeBatch(db);
          expenses.forEach((e) => {
            if (e.category === oldCategory) {
              const ref = doc(db, `users/${currentUser}/expenses`, e.id);
              batch.update(ref, { category: newCategory });
            }
          });
          await batch.commit();
        } catch (error) {
          console.error("Error updating expenses category:", error);
        }
      },
      deleteCategory: (category) =>
        set((state) => ({
          categories: state.categories.filter((c) => c !== category),
        })),
      getSmartCategory: (amount, hourOfDay) => {
        const { expenses, categories } = get();
        if (expenses.length === 0) return categories[0];

        const similarTimeExpenses = expenses.filter((e) => {
          const eHour = new Date(e.timestamp).getHours();
          return (
            Math.abs(eHour - hourOfDay) <= 2 ||
            Math.abs(eHour - hourOfDay) >= 22
          );
        });

        let amountRange = "small";
        if (amount >= 10 && amount < 50) amountRange = "medium";
        if (amount >= 50) amountRange = "large";

        const similarAmountExpenses = expenses.filter((e) => {
          if (amountRange === "small") return e.amount < 10;
          if (amountRange === "medium") return e.amount >= 10 && e.amount < 50;
          return e.amount >= 50;
        });

        const combined = [...similarTimeExpenses, ...similarAmountExpenses];
        if (combined.length === 0) return categories[0];

        const categoryCounts = combined.reduce(
          (acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        const sortedCategories = Object.entries(categoryCounts).sort(
          (a, b) => b[1] - a[1],
        );
        return sortedCategories[0][0];
      },
    }),
    {
      name: "quickspense-storage",
      partialize: (state) => ({
        currentUser: state.currentUser,
        currency: state.currency,
        categories: state.categories,
      }),
    },
  ),
);
