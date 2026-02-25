"use client";

import { useStore } from "@/lib/store";
import { getCurrencySymbol } from "@/lib/utils";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

export default function Reports() {
  const { expenses, currency } = useStore();

  const today = new Date();
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);

  const currentMonthExpenses = expenses.filter((e) =>
    isWithinInterval(new Date(e.timestamp), {
      start: currentMonthStart,
      end: currentMonthEnd,
    }),
  );

  const totalThisMonth = currentMonthExpenses.reduce(
    (sum, e) => sum + e.amount,
    0,
  );

  // Category breakdown
  const categoryData = currentMonthExpenses
    .reduce(
      (acc, e) => {
        const existing = acc.find((item) => item.name === e.category);
        if (existing) {
          existing.value += e.amount;
        } else {
          acc.push({ name: e.category, value: e.amount });
        }
        return acc;
      },
      [] as { name: string; value: number }[],
    )
    .sort((a, b) => b.value - a.value);

  const COLORS = [
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#64748b",
  ];

  // Last 7 days trend
  const trendData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(today, 6 - i);
    const dayExpenses = expenses.filter(
      (e) => new Date(e.timestamp).toDateString() === date.toDateString(),
    );
    return {
      day: format(date, "EEE"),
      amount: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
    };
  });

  return (
    <div className="flex flex-col h-full">
      <header className="px-6 pt-12 pb-6 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
        <h1 className="text-zinc-400 text-sm font-medium tracking-wider uppercase mb-1">
          This Month
        </h1>
        <div className="text-5xl font-light text-white tracking-tight">
          <span className="text-zinc-500 mr-1">
            {getCurrencySymbol(currency)}
          </span>
          {totalThisMonth.toFixed(currency === "JOD" ? 3 : 2)}
        </div>
      </header>

      <div className="p-6 space-y-8">
        {expenses.length === 0 ? (
          <div className="text-center py-10 text-zinc-600 text-sm">
            No data to display.
          </div>
        ) : (
          <>
            <section>
              <h2 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">
                7-Day Trend
              </h2>
              <div className="h-40 bg-zinc-900/50 rounded-2xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#10b981" }}
                      formatter={(value: any) => [
                        `${getCurrencySymbol(currency)}${Number(value).toFixed(currency === "JOD" ? 3 : 2)}`,
                        "Spent",
                      ]}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">
                Top Categories
              </h2>
              <div className="bg-zinc-900/50 rounded-2xl p-4 flex items-center">
                <div className="w-1/2 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-3 pl-4">
                  {categoryData.slice(0, 4).map((cat, index) => (
                    <div
                      key={cat.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="text-sm text-zinc-300 truncate max-w-[80px]">
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {getCurrencySymbol(currency)}
                        {cat.value.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
