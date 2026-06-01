"use client";

interface ActivityHeatmapProps {
  data: Array<{ date: string; amount: number }>;
}

const COLORS = ["#F1F5F9", "#DBEAFE", "#93C5FD", "#4F6EF7", "#1E40AF"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const WEEK_COUNT = 16;
const CELL_SIZE = 18;
const CELL_GAP = 5;

function getColorIndex(amount: number): number {
  if (amount <= 0) return 0;
  if (amount === 1) return 1;
  if (amount <= 3) return 2;
  if (amount <= 6) return 3;
  return 4;
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const dayMap = new Map<string, number>();
  data.forEach((d) => {
    dayMap.set(d.date, (dayMap.get(d.date) || 0) + 1);
  });

  const activityValues = Array.from(dayMap.values());
  const activeDays = activityValues.filter((amount) => amount > 0).length;
  const totalActivity = activityValues.reduce((sum, amount) => sum + amount, 0);
  const mostActiveDay = Array.from(dayMap.entries()).sort(([, a], [, b]) => b - a)[0];

  const totalDays = WEEK_COUNT * 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() - endDate.getDay());

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - (totalDays - 1));

  const days: Array<{
    date: string;
    amount: number;
    colorIndex: number;
    weekday: number;
    weekIndex: number;
    month: string;
  }> = [];
  const monthLabels: Array<{ weekIndex: number; label: string }> = [];

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const amount = dayMap.get(dateStr) || 0;
    const weekday = d.getDay();
    const weekIndex = Math.floor(i / 7);
    const currentMonth = d.toLocaleString("en-US", { month: "short" });

    if (weekday === 0) {
      const prevDate = new Date(d);
      prevDate.setDate(prevDate.getDate() - 7);
      const prevMonth = prevDate.toLocaleString("en-US", { month: "short" });
      if (currentMonth !== prevMonth) {
        monthLabels.push({ weekIndex, label: currentMonth });
      }
    }

    days.push({
      date: dateStr,
      amount,
      colorIndex: getColorIndex(amount),
      weekday,
      weekIndex,
      month: currentMonth,
    });
  }

  if (monthLabels.length === 0 || monthLabels[0].weekIndex > 0) {
    monthLabels.unshift({ weekIndex: 0, label: days[0]?.month || "" });
  }

  const rowOrder = [0, 1, 2, 3, 4, 5, 6];

  return (
    <div className="rounded-[26px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C7D2FE]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94A3B8]">Activity</p>
          <h3 className="mt-1 text-lg font-black text-[#111827]">Daily Activity</h3>
        </div>
        <div className="rounded-full bg-[#EEF2FF] px-3 py-1.5 text-xs font-black text-[#3B5BDB]">
          {totalActivity} records
        </div>
      </div>

      <div className="rounded-[22px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <div className="overflow-x-auto pb-1">
          <div className="inline-block min-w-full">
            <div className="mb-2 flex" style={{ paddingLeft: "38px" }}>
              {Array.from({ length: WEEK_COUNT }, (_, wi) => {
                const label = monthLabels.find((m) => m.weekIndex === wi);
                return (
                  <div
                    key={wi}
                    className="text-[11px] font-bold leading-none text-[#94A3B8]"
                    style={{ width: `${CELL_SIZE}px`, marginRight: `${CELL_GAP}px` }}
                  >
                    {label ? label.label : ""}
                  </div>
                );
              })}
            </div>

            <div className="flex">
              <div className="mr-2 flex flex-col" style={{ gap: `${CELL_GAP}px` }}>
                {rowOrder.map((dow) => (
                  <div
                    key={dow}
                    className="flex items-center text-[11px] font-bold leading-none text-[#94A3B8]"
                    style={{ height: `${CELL_SIZE}px` }}
                  >
                    {DAY_LABELS[dow]}
                  </div>
                ))}
              </div>

              <div className="flex" style={{ gap: `${CELL_GAP}px` }}>
                {Array.from({ length: WEEK_COUNT }, (_, wi) => (
                  <div key={wi} className="flex flex-col" style={{ gap: `${CELL_GAP}px` }}>
                    {rowOrder.map((dow) => {
                      const day = days.find((d) => d.weekIndex === wi && d.weekday === dow);
                      if (!day) {
                        return (
                          <div
                            key={dow}
                            className="rounded-[6px]"
                            style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px`, backgroundColor: COLORS[0] }}
                          />
                        );
                      }

                      return (
                        <div key={`${wi}-${dow}`} className="group relative">
                          <div
                            className="cursor-pointer rounded-[6px] transition-all duration-150 hover:scale-125 hover:ring-2 hover:ring-[#111827]/20 hover:ring-offset-1"
                            style={{
                              width: `${CELL_SIZE}px`,
                              height: `${CELL_SIZE}px`,
                              backgroundColor: COLORS[day.colorIndex],
                            }}
                          />
                          <div className="absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-[10px] bg-[#111827] px-2 py-1 text-[11px] leading-tight text-white opacity-0 shadow-lg transition-opacity pointer-events-none group-hover:opacity-100">
                            {day.amount > 0
                              ? `${day.date}: ${day.amount} transaction${day.amount !== 1 ? "s" : ""}`
                              : `${day.date}: No activity`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-1.5">
              <span className="text-[11px] font-bold text-[#94A3B8]">Less</span>
              {COLORS.map((color, i) => (
                <div
                  key={i}
                  className="rounded-[4px]"
                  style={{ width: "14px", height: "14px", backgroundColor: color }}
                />
              ))}
              <span className="text-[11px] font-bold text-[#94A3B8]">More</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#94A3B8]">Active days</p>
          <p className="mt-1 text-xl font-black text-[#111827]">{activeDays}</p>
        </div>
        <div className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#94A3B8]">Avg / active</p>
          <p className="mt-1 text-xl font-black text-[#111827]">
            {activeDays > 0 ? (totalActivity / activeDays).toFixed(1) : "0"}
          </p>
        </div>
        <div className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#94A3B8]">Peak day</p>
          <p className="mt-1 truncate text-sm font-black text-[#111827]">
            {mostActiveDay ? mostActiveDay[0].slice(5) : "None"}
          </p>
        </div>
      </div>
    </div>
  );
}
