"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PieChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/reports", icon: PieChart, label: "Reports" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-16 bg-zinc-900/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-4 z-40 pb-safe">
      {links.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-full transition-colors",
              isActive
                ? "text-emerald-400"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            <Icon className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
