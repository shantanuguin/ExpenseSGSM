"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { currentUser, login, setExpenses } = useStore();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, `users/${currentUser}/expenses`),
      orderBy("timestamp", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
       
      const exps = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as any);
      setExpenses(exps);
    });
    return () => unsub();
  }, [currentUser, setExpenses]);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-zinc-950 absolute inset-0 z-50">
        <div className="w-16 h-16 bg-emerald-500 rounded-3xl mb-6 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <span className="text-3xl font-bold text-white">Q</span>
        </div>
        <h1 className="text-3xl font-light text-white mb-2">QuickSpense</h1>
        <p className="text-zinc-500 mb-8">Sign in to sync your expenses</p>

        <div className="w-full max-w-sm space-y-4 bg-zinc-900/50 p-6 rounded-3xl border border-white/10">
          <div>
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1 mb-1 block">
              Username
            </label>
            <input
              type="text"
              placeholder="SG or SM"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1 mb-1 block">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (!login(user, pass)) setError("Invalid credentials");
                }
              }}
              className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            onClick={() => {
              if (!login(user, pass)) setError("Invalid credentials");
            }}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors mt-2"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
