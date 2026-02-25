"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuickAddSheet } from "@/components/quick-add-sheet";

export default function QuickAddPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Open immediately on mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Give time for animation to finish before redirecting
    setTimeout(() => {
      router.push("/");
    }, 300);
  };

  return (
    <div className="flex flex-col h-full relative bg-zinc-950">
      <header className="px-6 pt-12 pb-6 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
        <h1 className="text-zinc-400 text-sm font-medium tracking-wider uppercase mb-1">
          Quick Add
        </h1>
        <div className="text-3xl font-light text-white tracking-tight">
          New Expense
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 text-zinc-500 text-sm">
        Opening quick add...
      </div>

      <QuickAddSheet isOpen={isOpen} onClose={handleClose} initialAmount="" />
    </div>
  );
}
